"""Discovery CLI (AA14): chain FIND -> SCORE -> STORE, return top winners.

One-call entry point for the discovery pipeline::

    result = run_discovery(persona="saas")          # full pipeline
    result = run_discovery(channels=["google"])     # explicit channel subset

* FIND: keyless public-ad-library adapters (mock fixtures under repo-default
  ``MOCK_MODE=true``); every hit is normalized to the shared ``SpyAd`` schema.
* SCORE: deterministic, no-LLM winner proxy — persuasion-angle strength
  (``score.angles``) blended with angle spread, paired with the ad's observed
  runtime, bucketed via ``score.winner_tiers``.
* STORE: bulk idempotent upsert into the isolated spy DB
  (``discovery.find.store``), deduped per (workspace, ad id, persona).

Pure stdlib + sibling ``app.*`` modules. When the dedicated ``adoracle_port``
/ ``longevity`` modules land they can replace :func:`_score_ad` behind the
same enriched-dict seam without touching callers.
"""

from __future__ import annotations

import os
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from app.discovery.find.google_ads_transparency import search_ads
from app.discovery.find.store import upsert_ads
from app.discovery.score.angles import detect_angles
from app.discovery.score.winner_tiers import EMERGING, HIGH_CONF, WINNER, classify_ad

# Persona -> default channels + search terms (single term per substring probe).
PERSONA_DEFAULTS: dict[str, dict[str, Any]] = {
    "saas": {"channels": ["google"], "queries": ["roas", "attribution"]},
}

# Channel -> FIND adapter. One adapter ships today; new sources plug in here.
_CHANNEL_ADAPTERS = {
    "google": search_ads,
}

WINNER_TIERS = frozenset({HIGH_CONF, WINNER, EMERGING})
TOP_WINNERS_LIMIT = 10


def _runtime_days(ad: Any) -> float:
    """Observed days between library-reported first/last shown (0 if unknown)."""
    if ad.first_seen_at and ad.last_seen_at:
        delta = (ad.last_seen_at - ad.first_seen_at).total_seconds()
        return max(round(delta / 86400.0, 1), 0.0)
    return 0.0


def _score_ad(ad: Any) -> float:
    """Deterministic 0-100 winner proxy: strongest angle scaled by coverage.

    ponytail: heuristic stand-in for the adoracle port; swap in behind the
    same enriched-dict seam when score/adoracle lands.
    """
    hits = detect_angles(ad)
    if not hits:
        return 0.0
    primary = float(max(hit.score for hit in hits))
    return round(min(primary * 1.6 + len(hits) * 10.0, 100.0), 1)


def _to_store_dict(ad: Any, score: float, runtime_days: float) -> dict[str, Any]:
    """Flatten a SpyAd into the store-compatible shape (+ scoring fields)."""
    return {
        "ad_id": ad.platform_ad_id,
        "platform": ad.platform,
        "competitor": ad.advertiser.name,
        "advertiser": ad.advertiser.name,
        "title": ad.headline,
        "body": ad.body,
        "landing_url": ad.landing_url,
        "media_urls": [creative.url for creative in ad.creatives],
        "raw": ad.raw_json or {},
        # Extra keys are ignored by store._normalize but drive classify_ad.
        "score": score,
        "runtime_days": runtime_days,
    }


@contextmanager
def _repo_mock_default() -> Iterator[None]:
    """Align the adapter's raw-env check with the repo default (MOCK_MODE=true).

    Only fills an *unset* env var; an explicit MOCK_MODE=false is respected so
    the live path still surfaces its NotImplementedError as a skipped channel.
    """
    missing = "MOCK_MODE" not in os.environ
    if missing:
        os.environ["MOCK_MODE"] = "true"
    try:
        yield
    finally:
        if missing:
            del os.environ["MOCK_MODE"]


def run_discovery(
    persona: str = "saas",
    channels: list[str] | None = None,
) -> dict[str, Any]:
    """Run the FIND -> SCORE -> STORE chain for one persona.

    Args:
        persona: Persona tag used for channel/query defaults and spy-db rows.
        channels: Optional subset of channels to search; defaults to the
            persona's channels. Unimplemented channels are reported as skipped.

    Returns:
        Summary dict with ``found`` / ``stored`` counts, ``skipped`` channels,
        and ``winners`` — top scored competitor ads in a non-loser tier
        (high_conf/winner/emerging), best score first.
    """
    config = PERSONA_DEFAULTS.get(persona)
    if config is None:
        raise ValueError(f"unknown persona {persona!r}; supported: {sorted(PERSONA_DEFAULTS)}")

    requested = list(channels) if channels else list(config["channels"])
    active, skipped = [], []
    for channel in requested:
        adapter = _CHANNEL_ADAPTERS.get(channel)
        if adapter is None:
            skipped.append({"channel": channel, "reason": "no adapter"})
        else:
            active.append((channel, adapter))

    # FIND — dedupe hits across queries/channels by platform ad id.
    found: dict[tuple[str, str], Any] = {}
    with _repo_mock_default():
        for channel, adapter in active:
            for query in config["queries"]:
                try:
                    for spy_ad in adapter(query):
                        found[(spy_ad.platform, spy_ad.platform_ad_id)] = spy_ad
                except NotImplementedError as exc:
                    skipped.append({"channel": channel, "reason": str(exc)})

        # Mock mode fallback: the demo queries may match no fixture, but the
        # discovery/loop pipeline still needs deterministic data to score. Pull
        # the full fixture set once so dry-run loops report non-zero counts.
        if not found:
            for _channel, adapter in active:
                try:
                    for spy_ad in adapter(""):
                        found[(spy_ad.platform, spy_ad.platform_ad_id)] = spy_ad
                except NotImplementedError:
                    continue

    # SCORE + STORE — one enriched dict per ad drives both steps.
    enriched: list[dict[str, Any]] = []
    for spy_ad in found.values():
        hits = detect_angles(spy_ad)
        score = _score_ad(spy_ad)
        row = _to_store_dict(spy_ad, score, _runtime_days(spy_ad))
        row["tier"] = classify_ad(row)
        row["_primary_angle"] = hits[0].angle if hits else None
        enriched.append(row)

    created = updated = 0
    if enriched:
        results = upsert_ads(
            [_strip_scoring(row) for row in enriched], persona_tag=persona
        )
        created = sum(1 for _, was_created in results if was_created)
        updated = len(results) - created

    winners = sorted(
        (row for row in enriched if row["tier"] in WINNER_TIERS),
        key=lambda row: (-row["score"], row["ad_id"]),
    )[:TOP_WINNERS_LIMIT]

    return {
        "persona": persona,
        "channels": requested,
        "queries": list(config["queries"]),
        "found": len(found),
        "stored": {"created": created, "updated": updated},
        "skipped": skipped,
        "ads": [
            {
                "ad_id": row["ad_id"],
                "platform": row["platform"],
                "competitor": row["competitor"],
                "advertiser": row["advertiser"],
                "title": row["title"],
                "body": row["body"],
                "score": row["score"],
                "runtime_days": row["runtime_days"],
                "tier": row["tier"],
            }
            for row in enriched
        ],
        "winners": [
            {
                "ad_id": row["ad_id"],
                "platform": row["platform"],
                "competitor": row["competitor"],
                "title": row["title"],
                "body": row["body"],
                "score": row["score"],
                "runtime_days": row["runtime_days"],
                "tier": row["tier"],
                "primary_angle": row.pop("_primary_angle", None),
            }
            for row in winners
        ],
    }


def channel_of(adapter: Any) -> str:
    """Reverse lookup of a channel's display name from its adapter."""
    return next(name for name, fn in _CHANNEL_ADAPTERS.items() if fn is adapter)


def _strip_scoring(row: dict[str, Any]) -> dict[str, Any]:
    """Drop score/tier keys before persistence; store keeps only its columns."""
    return {
        k: v for k, v in row.items() if k not in ("score", "runtime_days", "tier", "_primary_angle")
    }


if __name__ == "__main__":  # smoke check: python -m app.discovery.cli [persona]
    import json
    import sys

    _persona = sys.argv[1] if len(sys.argv) > 1 else "saas"
    print(json.dumps(run_discovery(persona=_persona), indent=2, default=str))
