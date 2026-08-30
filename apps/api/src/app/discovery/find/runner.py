"""FIND orchestrator (AA12): run collectors per channel and merge results.

Mock data only — delegates to ``meta_collector.collect_meta_ads`` and
``tiktok_collector.collect_tiktok_ads`` (deterministic fixtures) and merges
their rows into canonical ``AdRecord`` models (``app.discovery.schemas``).
"""

from __future__ import annotations

import asyncio

from app.discovery.find.meta_collector import collect_meta_ads
from app.discovery.find.tiktok_collector import collect_tiktok_ads
from app.discovery.schemas import AdRecord

_COLLECTORS = {
    "meta": collect_meta_ads,
    "tiktok": collect_tiktok_ads,
}

DEFAULT_PAGE_SIZE = 20


def _dedupe(records: list[AdRecord]) -> list[AdRecord]:
    """Merge across channels, dropping repeats of (platform, ad_id)."""
    seen: set[tuple[str, str]] = set()
    out: list[AdRecord] = []
    for rec in records:
        key = (rec.platform, rec.ad_id)
        if key not in seen:
            seen.add(key)
            out.append(rec)
    return out


async def run_find(
    persona: str | None,
    channels: list[str] | tuple[str, ...] | set[str] | None,
    *,
    page_size: int = DEFAULT_PAGE_SIZE,
) -> list[AdRecord]:
    """Discover competitor ads for ``persona`` across ``channels``.

    Mock-only: calls each requested collector concurrently and returns the
    merged, deduped rows as ``AdRecord`` models. Unknown/disabled channels are
    skipped; ``channels=None`` (or empty) collects every supported channel
    (meta + tiktok). ``persona`` is run context only — tagging happens
    downstream in store/persona_channel_map, not here.
    """
    wanted = [c.lower() for c in channels] if channels else list(_COLLECTORS)
    tasks = [_COLLECTORS[c](page_size=page_size) for c in wanted if c in _COLLECTORS]
    batches = await asyncio.gather(*tasks)

    rows = [dict(row) for batch in batches for row in batch]
    return _dedupe([AdRecord(**row) for row in rows])


if __name__ == "__main__":
    # Self-check: merged fixture set, deduped, valid AdRecords.
    ads = asyncio.run(run_find("demo_persona", ["meta", "tiktok"]))
    assert len(ads) == 6, f"expected 6 merged ads, got {len(ads)}"
    assert len({(a.platform, a.ad_id) for a in ads}) == len(ads), "dupes leaked"
    assert all(isinstance(a, AdRecord) for a in ads)
    single = asyncio.run(run_find(None, ["meta"]))
    assert {a.platform for a in single} == {"meta"}
    print(f"ok: {len(ads)} merged ads, {len(single)} meta-only")
