"""LOOP launch stage -- builds the per-channel launch PLAN.

Stage 4 of the loop (find -> score -> create -> LAUNCH -> track). Produces one
plan dict per channel from the scored/created assets. Nothing here touches a
platform: a dry run stops at a plan, and a real run submits that plan to
``app.loop.safety_gate``, which returns a paused draft that only a human can
approve.

# REAL hook: adkit/ads-mcp + markifact + mkt-cli behind PerfOS connectors policy gate.
"""

from __future__ import annotations

from typing import Any
from uuid import uuid4

STAGE = "launch"

__all__ = ["launch_stage"]


def _channel_name(channel: Any) -> str:
    """Accept a bare string or a {"name": ...}-style dict."""
    if isinstance(channel, dict):
        return str(channel.get("name") or "")
    return str(channel or "")


def _submit_to_gate(
    channel: str,
    asset_refs: list[dict],
    workspace_id: int,
    *,
    session: Any = None,
    run_id: str | None = None,
    command_id: str | None = None,
) -> dict:
    """Hand one channel's plan to the safety gate and report the draft it created."""
    action = {
        "type": "launch_campaign",
        "channel": channel,
        "platform": channel,
        "paused": True,
        "assets": [dict(ref) for ref in asset_refs],
    }
    if session is not None:
        from app.agents.policy import evaluate
        from app.models import LaunchDraft
        from app.services.commanding import record_event

        recommendation = {
            "workspace_id": int(workspace_id),
            "confidence": 0.0,
            "proposed_changes_json": {"actions": [action]},
        }
        decision = evaluate(recommendation, workspace_id=int(workspace_id))
        status = "blocked" if decision.get("decision") == "block" else "pending_approval"
        draft = LaunchDraft(
            id=uuid4().hex,
            workspace_id=int(workspace_id),
            run_id=run_id,
            command_id=command_id,
            kind="launch_campaign",
            actions_json=[action],
            policy_json=decision,
            status=status,
            paused=True,
        )
        session.add(draft)
        session.flush()
        record_event(
            session,
            workspace_id,
            "launch.draft_created",
            run_id=run_id,
            command_id=command_id,
            stage="launch",
            payload={"draft_id": draft.id, "status": status, "channel": channel},
        )
        return {
            "status": status,
            "draft_id": draft.id,
            "policy_decision": decision.get("decision"),
        }

    from app.loop.safety_gate import gate
    try:
        draft = gate.submit_write(action, workspace_id, kind="launch_campaign")
    except ValueError as exc:  # empty write -- report rather than kill the loop
        return {"status": "gate_error", "reason": str(exc)}
    return {
        "status": draft["status"],
        "draft_id": draft["id"],
        "policy_decision": draft.get("policy_decision"),
    }


def launch_stage(
    assets: list[dict] | None,
    channels: list[str] | list[dict] | None,
    dry_run: bool = True,
    workspace_id: int = 1,
    session: Any = None,
    run_id: str | None = None,
    command_id: str | None = None,
) -> list[dict]:
    """Build a mock launch plan per channel.

    ``assets`` are the creative/score payloads from earlier stages; only their
    ids/titles are referenced in the plan. Returns one dict per channel::

        {"stage": "launch", "channel": "meta", "dry_run": True,
         "status": "planned", "assets": [...], "steps": [...]}

    A dry run returns ``status: "planned"`` and touches nothing. A real run
    submits each plan to the safety gate, so the returned status is the gate's
    own (``pending_approval``, or ``blocked`` when policy refuses) and carries
    the ``draft_id`` a human must approve. Execution itself still belongs to
    the connectors layer, after approval -- never to this stage.
    """
    asset_refs = [
        {
            "id": a.get("id"),
            "title": a.get("title"),
            "score": a.get("score"),
        }
        for a in (assets or [])
        if isinstance(a, dict)
    ]

    steps = [
        "submit_plan_to_safety_gate",
        "await_human_approval",
        "execute_via_connectors",
    ]

    plans: list[dict] = []
    seen: set[str] = set()
    for channel in channels or []:
        name = _channel_name(channel)
        if not name or name in seen:
            continue
        seen.add(name)
        plan = {
            "stage": STAGE,
            "channel": name,
            "dry_run": dry_run,
            "status": "planned",
            "assets": [dict(ref) for ref in asset_refs],
            "steps": list(steps),
        }
        if not dry_run:
            plan.update(
                _submit_to_gate(
                    name,
                    asset_refs,
                    workspace_id,
                    session=session,
                    run_id=run_id,
                    command_id=command_id,
                )
            )
        plans.append(plan)
    return plans


if __name__ == "__main__":
    # Minimal self-check: one plan per unique channel, assets referenced.
    channels: list[Any] = ["meta", {"name": "google"}, "meta", "", None]
    out = launch_stage(
        [{"id": 1, "title": "hook-a", "score": 0.9}],
        channels,
    )
    assert [p["channel"] for p in out] == ["meta", "google"]
    assert all(p["dry_run"] is True and p["status"] == "planned" for p in out)
    assert out[0]["assets"][0]["id"] == 1
    assert "draft_id" not in out[0], "a dry run must not create drafts"

    # A real run must produce an approvable draft, never an executed launch.
    live = launch_stage([{"id": 1, "title": "hook-a", "score": 0.9}], ["meta"], dry_run=False)
    assert live[0]["status"] in {"pending_approval", "blocked"}, live[0]["status"]
    assert live[0]["draft_id"]
    print("launch_stage OK")
