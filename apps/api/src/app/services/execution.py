"""Execution service. Applies approved recommendations via platform connectors
(mock mode: MOCK_MODE=true routes connectors to in-memory mock backends).

Consumed by the approvals flow: policy -> execute_recommendation -> audit.
"""

import json
from typing import Any, Optional

from app.core.db import SessionLocal
from app.models import Campaign, Outcome
from app.services.audit import log_action


def execute_recommendation(rec, workspace_id, session=None) -> dict:
    """Apply ``rec.proposed_changes_json`` through mock connectors.

    Supported actions: set_budget {campaign_id, new_daily_budget}, pause
    {campaign_id}. Each applied action writes an AuditLog entry carrying the
    recommendation's rollback_json. Sets rec.status to "executed" or "failed"
    and returns::

        {
          "recommendation_id": ..., "workspace_id": ...,
          "status": "executed" | "failed" | "blocked",
          "results": [{"action", "campaign_id", "ok", "response"}],
          "errors": [{"campaign_id", "error"}],
        }

    Pass ``session`` to join the caller's transaction; otherwise one is opened.
    """
    if getattr(rec, "workspace_id", None) != workspace_id:
        return {
            "recommendation_id": getattr(rec, "id", None),
            "workspace_id": workspace_id,
            "status": "blocked",
            "reason": "workspace_mismatch",
            "results": [],
            "errors": [],
        }

    own = session is None
    s = session or SessionLocal()
    actions = _normalize(rec.proposed_changes_json)
    results, errors = [], []
    try:
        for act in actions:
            kind = act.get("action") or act.get("type")
            campaign_id = act.get("campaign_id")
            try:
                # Channel-level actions (e.g. reallocate_budget) have no single
                # campaign/connector; handle them without a connector lookup.
                if kind == "reallocate_budget":
                    response = {
                        "kind": "reallocate_budget",
                        "source_platform": act.get("source_platform"),
                        "target_platform": act.get("target_platform"),
                        "budget_shift_pct": act.get("budget_shift_pct"),
                        "shift_amount": act.get("shift_amount"),
                        "requires_holdout_experiment": act.get(
                            "requires_holdout_experiment", False
                        ),
                        "mock": True,
                    }
                else:
                    connector = _connector_for(
                        act.get("platform") or _platform_for(s, campaign_id),
                        workspace_id,
                    )
                    if kind == "set_budget":
                        response = connector.set_budget(
                            campaign_id, float(act["new_daily_budget"])
                        )
                    elif kind == "pause":
                        response = connector.pause_campaign(campaign_id)
                    else:
                        raise ValueError(f"unknown_action:{kind}")
                results.append(
                    {
                        "action": kind,
                        "campaign_id": campaign_id,
                        "ok": True,
                        "response": response,
                    }
                )
            except Exception as exc:  # one bad action must not abort the rest
                results.append({"action": kind, "campaign_id": campaign_id, "ok": False})
                errors.append({"campaign_id": campaign_id, "error": str(exc)})

        for r in results:
            request = next(
                (
                    a
                    for a in actions
                    if a.get("campaign_id") == r["campaign_id"]
                    and (a.get("action") or a.get("type")) == r["action"]
                ),
                None,
            )
            target = (
                f"campaign:{r['campaign_id']}"
                if r["campaign_id"]
                else f"channel:{r['action']}"
            )
            log_action(
                workspace_id=workspace_id,
                actor="system:executor",
                action=r["action"],
                target=target,
                payload={
                    "recommendation_id": rec.id,
                    "request": request,
                    "rollback": rec.rollback_json,
                    "ok": r["ok"],
                },
                session=s,
            )

        status = "executed" if not errors else "failed"
        rec.status = status
        s.add(rec)
        if status == "executed":
            _record_outcome(rec, workspace_id, s)
        if own:
            s.commit()
        else:
            s.flush()

        return {
            "recommendation_id": rec.id,
            "workspace_id": workspace_id,
            "status": status,
            "results": results,
            "errors": errors,
        }
    finally:
        if own:
            s.close()


def _record_outcome(rec, workspace_id, session) -> None:
    """Record a blended_mer Outcome for an executed recommendation.

    Mock-safe: before/after both carry the current blended MER (delta 0.0)
    until real post-execution measurement exists. Failures never abort the
    execution result.
    """
    try:
        from app.agents.orchestrator import run_analysis

        blended = 0.0
        try:
            analysis = run_analysis(workspace_id) or {}
            blended = float(
                ((analysis.get("reconcile") or {}).get("blended_mer")) or 0.0
            )
        except Exception:
            blended = 0.0
        session.add(
            Outcome(
                recommendation_id=rec.id,
                metric="blended_mer",
                before=blended,
                after=blended,
                delta=0.0,
            )
        )
    except Exception:
        pass


def _normalize(proposed_changes) -> list[dict]:
    """Accept a bare list, {"actions": [...]}, or {"set_budget": [...], "pause": [...]}."""
    changes: Any = proposed_changes
    if isinstance(changes, str):
        changes = json.loads(changes)
    if not changes:
        return []
    if isinstance(changes, list):
        return [dict(a) for a in changes]
    if isinstance(changes, dict) and "actions" in changes:
        return [dict(a) for a in changes["actions"]]
    if isinstance(changes, dict):
        if any(k in changes for k in ("set_budget", "pause", "reallocate_budget")):
            merged: list[dict] = []
            for key in ("set_budget", "pause", "reallocate_budget"):
                for a in changes.get(key) or []:
                    merged.append({"action": key, **dict(a)})
            return merged
        # Flat single-action dict (e.g. {"action": "reallocate_budget", ...}) -> one action.
        return [dict(changes)]
    return []


def _platform_for(session, campaign_id) -> Optional[str]:
    if not campaign_id:
        return None
    campaign = session.get(Campaign, campaign_id)
    return getattr(campaign, "platform", None)


def _connector_for(platform, workspace):
    from app.connectors.registry import get_connector

    return get_connector(platform, workspace)
