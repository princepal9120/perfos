"""LOOP double-down stage -- scale winners, kill losers.

Consumes tracking output (per-asset performance) and emits one decision per
asset using simple ROAS thresholds::

    roas >= 2.0 -> scale   (winner: put more budget behind it)
    roas <  1.0 -> kill    (loser: stop spending)
    otherwise   -> hold    (breakeven-to-okay: leave alone)

Pure and mock-safe by construction: no I/O, no network calls -- output is
data only. Executing any scale/kill action still goes through
``loop.safety_gate`` (draft-first, human approval), never from here.
"""

from __future__ import annotations

from typing import Any

SCALE_THRESHOLD = 2.0
KILL_THRESHOLD = 1.0

SCALE = "scale"
KILL = "kill"
HOLD = "hold"

__all__ = ["double_down_stage", "SCALE_THRESHOLD", "KILL_THRESHOLD", "SCALE", "KILL", "HOLD"]


def _normalize_assets(tracking: Any) -> list[dict]:
    """Accept a bare asset dict, a list of assets, or {"assets": [...]}."""
    if isinstance(tracking, dict):
        tracking = tracking.get("assets", tracking)
    if isinstance(tracking, dict):
        tracking = [tracking]
    if not isinstance(tracking, list):
        return []
    return [a for a in tracking if isinstance(a, dict)]


def _asset_roas(asset: dict) -> float | None:
    """Explicit ``roas`` field wins; else compute from revenue/spend."""
    roas = asset.get("roas")
    if isinstance(roas, (int, float)):
        return round(float(roas), 2)
    spend = asset.get("spend")
    revenue = asset.get("revenue")
    if isinstance(spend, (int, float)) and isinstance(revenue, (int, float)) and spend > 0:
        return round(float(revenue) / float(spend), 2)
    return None


def _asset_id(asset: dict) -> Any:
    for key in ("asset_id", "id", "name"):
        if asset.get(key) is not None:
            return asset[key]
    return None


def double_down_stage(tracking: Any) -> list[dict]:
    """Decide scale / kill / hold per tracked asset.

    Args:
        tracking: list of asset dicts (or {"assets": [...]} / single dict).
            Each asset carries its identity (``asset_id`` / ``id`` / ``name``)
            and either a ``roas`` value or ``revenue`` + ``spend`` to compute it.

    Returns:
        List of ``{"asset_id", "roas", "decision", "reason"}`` dicts, one per
        input asset. Assets with no measurable ROAS come back as ``hold``.
    """
    decisions: list[dict] = []
    for asset in _normalize_assets(tracking):
        roas = _asset_roas(asset)
        aid = _asset_id(asset)
        if roas is None:
            decisions.append(
                {"asset_id": aid, "roas": None, "decision": HOLD, "reason": "no measurable roas"}
            )
        elif roas >= SCALE_THRESHOLD:
            decisions.append(
                {
                    "asset_id": aid,
                    "roas": roas,
                    "decision": SCALE,
                    "reason": f"roas {roas} >= {SCALE_THRESHOLD} winner",
                }
            )
        elif roas < KILL_THRESHOLD:
            decisions.append(
                {
                    "asset_id": aid,
                    "roas": roas,
                    "decision": KILL,
                    "reason": f"roas {roas} < {KILL_THRESHOLD} loser",
                }
            )
        else:
            decisions.append(
                {
                    "asset_id": aid,
                    "roas": roas,
                    "decision": HOLD,
                    "reason": f"roas {roas} between thresholds",
                }
            )
    return decisions
