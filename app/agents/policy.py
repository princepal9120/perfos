"""Financial safety / policy engine (PerfOS).

Enforced in CODE, not prompts. Every mutation passes through evaluate() before
execution. Rules (spec/CONTRACTS.md + brief Phase 18/27):

  * budget change > 25%            -> decision "block"   (too large, unsafe)
  * recommendation workspace != actor workspace -> decision "block" (tenant breach)
  * confidence < 0.6               -> decision "needs_approval" (stay pending)
  * otherwise                      -> decision "allow"

The approval route in app.api.routes treats "allow" as execute-now, "needs_approval"
as recorded-but-pending (operator must still click approve in the UI), and "block"
as rejected with reasons.
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


def _budget_change_pct(proposed_changes: Any) -> float | None:
    """Extract the largest absolute budget-shift percentage from a rec's changes."""
    if proposed_changes is None:
        return None
    if isinstance(proposed_changes, str):
        try:
            proposed_changes = json.loads(proposed_changes)
        except (ValueError, TypeError):
            return None
    if not isinstance(proposed_changes, dict):
        return None

    # Common shapes: {"budget_shift_pct": 10} or {"pct": 0.10} or {"actions":[...]}
    pct = proposed_changes.get("budget_shift_pct")
    if pct is None:
        pct = proposed_changes.get("pct")
    if pct is None:
        actions = proposed_changes.get("actions") or []
        if isinstance(actions, list):
            pcts = [
                a.get("budget_shift_pct") or a.get("pct")
                for a in actions
                if isinstance(a, dict)
            ]
            pct = max((float(p) for p in pcts if p is not None), default=None)
    if pct is None:
        return None
    try:
        return abs(float(pct))
    except (TypeError, ValueError):
        return None


def evaluate(rec: Any, workspace_id: Any | None = None) -> dict:
    """Evaluate a Recommendation (ORM or dict) against safety policy.

    Returns {"decision": "allow" | "needs_approval" | "block", "reasons": [str]}.
    """
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
        confidence = float(confidence) if confidence is not None else 1.0
    except (TypeError, ValueError):
        confidence = 1.0
    if confidence < CONFIDENCE_APPROVAL_THRESHOLD:
        reasons.append(
            f"low_confidence: {confidence:.2f} < {CONFIDENCE_APPROVAL_THRESHOLD:.2f} "
            "requires human approval"
        )
        return {"decision": "needs_approval", "reasons": reasons}

    reasons.append("passed_policy_checks")
    return {"decision": "allow", "reasons": reasons}


def evaluate_payload(payload: dict, workspace_id: Any | None = None) -> dict:
    """Convenience wrapper for dict inputs (used by tests / external callers)."""
    return evaluate(payload, workspace_id=workspace_id)
