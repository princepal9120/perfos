"""Winner-tier classification for discovered competitor ads.

Maps a deterministic ad score (0-100, produced by ``adoracle_port``) plus the
ad's observed runtime (produced by ``longevity``) into one of four actionable
tiers:

* ``high_conf`` — proven winner: high score sustained over a long window.
* ``winner``    — strong score with enough runtime to trust.
* ``emerging``  — promising signal, too new (or too weak) to call a winner.
* ``loser``     — below the bar; ignore or archive.

Input contract: a mapping/object exposing ``score`` (float, 0-100) and
``runtime_days`` (float >= 0). Pure functions only — no DB, no network,
mock-safe by construction. Missing or invalid inputs degrade deterministically
to ``loser`` rather than raising.
"""

from __future__ import annotations

from typing import Any

HIGH_CONF = "high_conf"
WINNER = "winner"
EMERGING = "emerging"
LOSER = "loser"
# Some public libraries (LinkedIn) publish no runtime, spend, or impressions at
# all. Scoring those 0.0 and calling them losers asserts a judgment we have no
# evidence for; they are unmeasured, not underperforming.
UNSCORED = "unscored"

# Gates, checked top-down (first match wins). Exported so downstream callers
# (scoring_api, persona_fit) can surface thresholds without re-deriving them.
HIGH_CONF_MIN_SCORE = 75.0
HIGH_CONF_MIN_RUNTIME_DAYS = 14.0
WINNER_MIN_SCORE = 60.0
WINNER_MIN_RUNTIME_DAYS = 7.0
EMERGING_MIN_SCORE = 45.0

MAX_SCORE = 100.0


# A score built on one disclosed signal is not "high confidence", however high
# it is — Google publishes runtime only, so runtime alone must not top the tier.
HIGH_CONF_MIN_SIGNALS = 2


def classify_tier(
    score: float | None,
    runtime_days: float | None,
    evidence: list[str] | tuple[str, ...] | None = None,
) -> str:
    """Classify one scored ad by score strength and how long it has been running.

    No score and no runtime means the source published nothing to judge on, so
    the ad is ``UNSCORED`` rather than ``LOSER``.
    """
    if not score and not runtime_days:
        return UNSCORED

    # Clamp untrusted numerics into [0, MAX_SCORE] / [0, inf).
    s = min(max(float(score or 0.0), 0.0), MAX_SCORE)
    days = max(float(runtime_days or 0.0), 0.0)

    enough_evidence = evidence is None or len(evidence) >= HIGH_CONF_MIN_SIGNALS
    if s >= HIGH_CONF_MIN_SCORE and days >= HIGH_CONF_MIN_RUNTIME_DAYS and enough_evidence:
        return HIGH_CONF
    if s >= WINNER_MIN_SCORE and days >= WINNER_MIN_RUNTIME_DAYS:
        return WINNER
    if s >= EMERGING_MIN_SCORE:
        return EMERGING
    return LOSER


def classify_ad(ad: Any) -> str:
    """Duck-typed convenience over ``classify_tier``.

    Accepts a dict or an attribute object exposing ``score`` and
    ``runtime_days`` (the canonical Ad shape from ``normalize``).
    """
    if isinstance(ad, dict):
        return classify_tier(ad.get("score"), ad.get("runtime_days"), ad.get("evidence"))
    return classify_tier(
        getattr(ad, "score", None),
        getattr(ad, "runtime_days", None),
        getattr(ad, "evidence", None),
    )
