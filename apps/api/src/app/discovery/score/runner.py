"""Score orchestrator: collected ads + persona -> ranked, persisted winners.

``run_score`` composes the SCORE pipeline in one call:

1. ``winner_engine.score_ads`` assigns each ad its deterministic 0-100 score
   and winner tier.
2. Winners are re-ranked by persona channel fit (``persona_fit``), then
   engine score, then dominant persuasion angle (``angles.detect_angles``)
   as a tie-break — on-persona proven winners surface first without altering
   the engine's scores or tiers.
3. Every signal is persisted through ``discovery.store.WinnerStore``
   (in-memory + ``.build/winners.json``) and returned in ranked order as
   ``store.WinnerSignal`` rows.

Pure orchestration: no new scoring policy, no network, mock-safe by
construction (all collaborators are deterministic pure functions).
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from app.discovery.score import angles, persona_fit, winner_engine
from app.discovery.store import WinnerSignal, WinnerStore

__all__ = ["run_score"]


def _field(obj: Any, *names: str) -> Any:
    """First truthy value among ``names`` on a Mapping or attribute object."""
    getter = obj.get if isinstance(obj, Mapping) else (lambda k: getattr(obj, k, None))
    for name in names:
        value = getter(name)
        if value:
            return value
    return None


def _persist_shape(winner: Any) -> dict[str, Any]:
    """Map any scored-winner object onto ``store.WinnerSignal`` fields.

    Tolerates either naming convention a scorer might emit (advertiser/
    competitor, hook/title, creative_url/landing_url) so it works regardless
    of which WinnerSignal schema ``winner_engine`` returns.
    """
    return {
        "ad_id": _field(winner, "ad_id") or "",
        "platform": _field(winner, "platform"),
        "competitor": _field(winner, "advertiser", "competitor"),
        "title": _field(winner, "hook", "title"),
        "landing_url": _field(winner, "creative_url", "landing_url"),
        "score": float(_field(winner, "score") or 0.0),
        "tier": _field(winner, "tier") or "loser",
        "runtime_days": float(_field(winner, "runtime_days") or 0.0),
    }


def run_score(ads: Any, persona: str) -> list[WinnerSignal]:
    """Score ``ads``, rank them for ``persona``, persist, return ranked signals.

    Ranking key (descending): persona fit -> engine score -> dominant angle.
    Ads that fit the persona's channels come first; unknown personas degrade
    to pure score/angle ordering because ``persona_fit`` returns 0.0 for them.
    """
    winners = winner_engine.score_ads(ads)

    ranked = sorted(
        winners,
        key=lambda w: (
            persona_fit.persona_fit(w, persona),
            float(_field(w, "score") or 0.0),
            max((hit.score for hit in angles.detect_angles(w)), default=0),
        ),
        reverse=True,
    )

    store = WinnerStore()
    return [store.add(_persist_shape(w)) for w in ranked]
