"""LOOP score stage -- rank discovered ads into ``WinnerSignal`` winners.

Thin LOOP wrapper over the SCORE pipeline (``app.discovery.score``):
discovered ads + persona in, ranked ``WinnerSignal`` rows out. Scoring stays
inside ``app.discovery.score.winner_engine`` (deterministic 0-100 composite);
the persona trims results to channels where that persona's ads are expected
(``persona_fit``). Unknown personas keep the full ranked field rather than
filtering everything away. Mock-safe by construction -- no DB, no network;
unusable rows are skipped, never fatal to the loop.
"""

from __future__ import annotations

from datetime import UTC
from typing import Any

from app.discovery.schemas import AdRecord, WinnerSignal
from app.discovery.score.persona_fit import rank_by_persona
from app.discovery.score.winner_engine import score_ads

__all__ = ["score_stage"]


def _as_record(ad: Any) -> AdRecord | None:
    """Accept an ``AdRecord``, a mapping, or duck-typed row; None if unusable."""
    if isinstance(ad, AdRecord):
        return ad
    if isinstance(ad, dict):
        try:
            return AdRecord.model_validate(ad)
        except Exception:  # missing required fields etc. -- skip bad row
            return None
    try:
        return AdRecord.model_validate(dict(ad))
    except Exception:
        return None


def score_stage(ads: Any, persona: str = "saas") -> list[WinnerSignal]:
    """Score discovered ads into ranked ``WinnerSignal`` rows, best first.

    Calls ``app.discovery.score.winner_engine.score_ads``, then surfaces the
    persona's own channels first. Nothing is dropped — an off-channel winner is
    still a winner worth seeing.
    """
    records = [rec for ad in (ads or []) if (rec := _as_record(ad)) is not None]
    if not records:
        return []

    return rank_by_persona(score_ads(records), persona)


if __name__ == "__main__":
    from datetime import datetime, timedelta

    now = datetime.now(UTC)

    def _ad(ad_id: str, platform: str) -> AdRecord:
        return AdRecord(
            platform=platform,
            advertiser="acme",
            ad_id=ad_id,
            start_date=now - timedelta(days=100),
        )

    # Known persona filters off-channel platforms.
    meta_only = [_ad("a1", "meta"), _ad("b1", "tiktok")]
    out = score_stage(meta_only, "dropship")  # dropship -> meta/tiktok first
    assert [s.ad_id for s in out] == ["a1", "b1"]  # tie on score -> platform tie-break
    assert all(isinstance(s, WinnerSignal) for s in out)

    # Unknown persona keeps the full ranked field.
    full = score_stage(meta_only, "unknown_persona")
    assert {s.ad_id for s in full} == {"a1", "b1"}

    # Dicts accepted, junk rows skipped.
    mixed = score_stage([{"platform": "meta", "advertiser": "x", "ad_id": "d1"}, "junk"], "")
    assert [s.ad_id for s in mixed] == ["d1"]

    assert score_stage([], "saas") == []
    assert score_stage(None, "saas") == []
    print("ok")
