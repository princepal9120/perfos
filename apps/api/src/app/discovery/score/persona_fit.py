"""Persona fit: how well an ad's platform matches a persona's channel mix.

Each persona has a fixed set of channels where its ads are expected to run.
``persona_fit`` checks the ad's observed ``platform`` against that mix and
returns a 0..1 fit score. Pure functions only -- no DB, no network,
mock-safe by construction. Missing/unknown inputs degrade deterministically
to 0.0 rather than raising.

Usage:
    persona_fit({"platform": "tiktok"}, "saas")   # -> 1.0
    persona_fit({"platform": "google"}, "saas")   # -> 0.0
"""

from __future__ import annotations

from typing import Any

__all__ = ["PERSONA_MAP", "persona_fit", "rank_by_persona"]

# persona id -> channels where its winning ads are expected to run.
PERSONA_MAP: dict[str, tuple[str, ...]] = {
    "saas": ("google", "meta", "tiktok", "instagram", "linkedin", "x"),
    "dropship": ("meta", "tiktok"),
    "beauty": ("instagram", "tiktok", "snap"),
    "b2b": ("linkedin", "x"),
}


def persona_fit(ad: str | dict[str, Any] | Any, persona: str) -> float:
    """Fit of one ad to a persona's channels: 1.0 on-channel, else 0.0."""
    channels = PERSONA_MAP.get(persona)
    if not channels or ad is None:
        return 0.0
    platform = ad.get("platform") if isinstance(ad, dict) else getattr(ad, "platform", None)
    return 1.0 if isinstance(platform, str) and platform in channels else 0.0


def rank_by_persona(signals: list[Any], persona: str) -> list[Any]:
    """Sort on-persona channels first, then by score.

    Re-ranks rather than filters: a search must always return what the user
    asked for, even when the winner runs off the persona's usual channels.
    """
    if persona not in PERSONA_MAP:
        return list(signals)
    return sorted(
        signals,
        key=lambda s: (persona_fit(s, persona), float(getattr(s, "score", 0.0) or 0.0)),
        reverse=True,
    )
