"""Financial safety / policy engine (PerfOS).

Every mutation passes through evaluate() before execution.
"""

from __future__ import annotations

import json
from typing import Any

BUDGET_CHANGE_LIMIT_PCT = 25.0
CONFIDENCE_APPROVAL_THRESHOLD = 0.6

__all__ = ["evaluate", "evaluate_payload"]


def _get(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _as_percent(raw: Any) -> float | None:
    try:
        value = abs(float(raw))
    except (TypeError, ValueError):
        return None
    if 0 < value <= 1:
        return value * 100.0
    return value


def _iter_actions(proposed_changes: dict) -> list[dict]:
    actions: list[dict] = []
    for item in proposed_changes.get("actions") or []:
        if isinstance(item, dict):
            actions.append(item)
    for key in ("set_budget", "pause", "reallocate_budget"):
        for item in proposed_changes.get(key) or []:
            if isinstance(item, dict):
                actions.append({"action": key, **item})
    if proposed_changes.get("action") or proposed_changes.get("type"):
        actions.append(proposed_changes)
    return actions


def _budget_change_pct(proposed_changes: Any) -> float | None:
    """Largest absolute budget-shift percent, or 100 if a set_budget has no baseline."""
    if proposed_changes is None:
        return None
    if isinstance(proposed_changes, str):
        try:
            proposed_changes = json.loads(proposed_changes)
        except (ValueError, TypeError):
            return None
    if isinstance(proposed_changes, list):
        proposed_changes = {"actions": proposed_changes}
    if not isinstance(proposed_changes, dict):
        return None

    pcts: list[float] = []
    for key in ("budget_shift_pct", "pct"):
        parsed = _as_percent(proposed_changes[key]) if proposed_changes.get(key) is not None else None
        if parsed is not None:
            pcts.append(parsed)

    for action in _iter_actions(proposed_changes):
        for key in ("budget_shift_pct", "pct"):
            parsed = _as_percent(action[key]) if action.get(key) is not None else None
            if parsed is not None:
                pcts.append(parsed)
        kind = action.get("action") or action.get("type")
        if kind == "set_budget" and action.get("new_daily_budget") is not None:
            old = action.get("previous_daily_budget") or action.get("current_daily_budget")
            new = float(action["new_daily_budget"])
            if old in (None, 0, 0.0):
                return 100.0
            pcts.append(abs(new - float(old)) / float(old) * 100.0)

    return max(pcts) if pcts else None


def evaluate(rec: Any, workspace_id: Any | None = None) -> dict:
    reasons: list[str] = []

    rec_ws = _get(rec, "workspace_id")
    if workspace_id is not None and rec_ws is not None and int(rec_ws) != int(workspace_id):
        reasons.append("workspace_mismatch: recommendation does not belong to this workspace")
        return {"decision": "block", "reasons": reasons}

    proposed = _get(rec, "proposed_changes_json")
    pct = _budget_change_pct(proposed)
    if pct is not None and pct > BUDGET_CHANGE_LIMIT_PCT:
        reasons.append(
            f"budget_change_exceeds_limit: {pct:.1f}% > {BUDGET_CHANGE_LIMIT_PCT:.0f}% limit"
        )
        return {"decision": "block", "reasons": reasons}

    confidence = _get(rec, "confidence")
    try:
        confidence = float(confidence) if confidence is not None else 0.0
    except (TypeError, ValueError):
        confidence = 0.0
    if confidence < CONFIDENCE_APPROVAL_THRESHOLD:
        reasons.append(
            f"low_confidence: {confidence:.2f} < {CONFIDENCE_APPROVAL_THRESHOLD:.2f} "
            "requires human approval"
        )
        return {"decision": "needs_approval", "reasons": reasons}

    reasons.append("passed_policy_checks")
    return {"decision": "allow", "reasons": reasons}


def evaluate_payload(payload: dict, workspace_id: Any | None = None) -> dict:
    return evaluate(payload, workspace_id=workspace_id)
