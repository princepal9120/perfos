"""Durable LOOP API: find -> score -> create -> launch -> track -> double-down."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated, TypeAlias
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_workspace
from app.models import LaunchDraft, LoopRun
from app.services.audit import log_action
from app.services.commanding import begin_command, command_payload, finish_command, record_event

router = APIRouter(tags=["lifecycle"], dependencies=[Depends(get_current_workspace)])
DbDep: TypeAlias = Annotated[Session, Depends(get_db)]
WorkspaceId: TypeAlias = Annotated[int, Depends(get_current_workspace)]


class LoopRequest(BaseModel):
    persona: str = "saas"
    dry_run: bool = True
    query: str | None = None


def _summary(run: LoopRun) -> dict:
    return run.summary_json or {"run_id": run.id, "status": run.status}


@router.post("/loop")
async def trigger_loop(
    body: LoopRequest,
    db: DbDep,
    workspace_id: WorkspaceId,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict:
    """Run one lifecycle pass and persist its run, drafts, assets, and events."""
    command, created = begin_command(
        db,
        workspace_id,
        "ads.loop",
        idempotency_key=idempotency_key,
        request=body.model_dump(),
    )
    if not created:
        if command.response_json is not None:
            return command.response_json
        raise HTTPException(status_code=409, detail="command is already running")

    run = LoopRun(
        id=uuid4().hex,
        workspace_id=workspace_id,
        command_id=command.id,
        persona=body.persona,
        query=body.query,
        dry_run=body.dry_run,
        status="running",
    )
    db.add(run)
    db.flush()
    record_event(
        db,
        workspace_id,
        "loop.started",
        run_id=run.id,
        command_id=command.id,
        stage="find",
        payload=body.model_dump(),
    )
    try:
        from app.loop.orchestrator import run_loop

        result = await run_loop(
            persona=body.persona,
            dry_run=body.dry_run,
            query=body.query,
            workspace_id=workspace_id,
            run_id=run.id,
            command_id=command.id,
            session=db,
        )
        result = {**result, "run_id": run.id, **command_payload(command)}
        run.status = "completed"
        run.channels_json = result.get("channels")
        run.summary_json = result
        run.finished_at = datetime.now(UTC).replace(tzinfo=None)
        finish_command(db, command, status="completed", response=result)
        record_event(
            db,
            workspace_id,
            "loop.completed",
            run_id=run.id,
            command_id=command.id,
            stage="double-down",
            payload={"stages": result.get("stages", {})},
        )
        db.commit()
        return result
    except Exception as exc:
        run.status = "failed"
        run.summary_json = {"run_id": run.id, "error": str(exc)}
        run.finished_at = datetime.now(UTC).replace(tzinfo=None)
        finish_command(db, command, status="failed", error=str(exc))
        record_event(
            db,
            workspace_id,
            "loop.failed",
            run_id=run.id,
            command_id=command.id,
            payload={"error": str(exc)},
        )
        db.commit()
        raise HTTPException(status_code=503, detail=f"loop failed: {exc}") from exc


@router.get("/loop/status")
def get_loop_status(db: DbDep, workspace_id: WorkspaceId) -> dict:
    run = (
        db.query(LoopRun)
        .filter(LoopRun.workspace_id == workspace_id)
        .order_by(LoopRun.started_at.desc())
        .first()
    )
    if run is None:
        return {"last_run": None}
    return {
        "last_run": {
            "run_id": run.id,
            "status": run.status,
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "finished_at": run.finished_at.isoformat() if run.finished_at else None,
        },
        **_summary(run),
    }


@router.get("/loop/drafts")
def list_loop_drafts(db: DbDep, workspace_id: WorkspaceId) -> list[dict]:
    """List durable launch proposals awaiting (or having received) approval."""
    drafts = (
        db.query(LaunchDraft)
        .filter(LaunchDraft.workspace_id == workspace_id)
        .order_by(LaunchDraft.created_at.desc())
        .all()
    )
    return [_draft_dict(draft) for draft in drafts]


def _draft_dict(draft: LaunchDraft) -> dict:
    return {
        "draft_id": draft.id,
        "workspace_id": draft.workspace_id,
        "run_id": draft.run_id,
        "command_id": draft.command_id,
        "kind": draft.kind,
        "actions": draft.actions_json,
        "policy_decision": draft.policy_json.get("decision"),
        "policy": draft.policy_json,
        "status": draft.status,
        "paused": draft.paused,
        "actor": draft.actor,
        "decided_by": draft.decided_by,
        "reason": draft.reason,
        "created_at": draft.created_at.isoformat() if draft.created_at else None,
    }


@router.post("/loop/drafts/{draft_id}/approve")
def approve_loop_draft(
    draft_id: str,
    db: DbDep,
    workspace_id: WorkspaceId,
    actor: str = "human",
) -> dict:
    draft = (
        db.query(LaunchDraft)
        .filter(LaunchDraft.id == draft_id, LaunchDraft.workspace_id == workspace_id)
        .first()
    )
    if draft is None:
        raise HTTPException(status_code=404, detail="launch draft not found")
    if draft.status != "pending_approval":
        raise HTTPException(status_code=409, detail=f"draft is {draft.status}, not pending_approval")
    if draft.policy_json.get("decision") == "block":
        raise HTTPException(status_code=409, detail="policy-blocked drafts cannot be approved")
    draft.status = "approved"
    draft.decided_by = actor
    log_action(
        workspace_id=workspace_id,
        actor=actor,
        action="launch.approved",
        target=f"draft:{draft.id}",
        payload={"run_id": draft.run_id},
        command_id=draft.command_id,
        session=db,
    )
    record_event(
        db,
        workspace_id,
        "launch.approved",
        run_id=draft.run_id,
        command_id=draft.command_id,
        stage="launch",
        actor=actor,
        payload={"draft_id": draft.id},
    )
    db.commit()
    db.refresh(draft)
    return _draft_dict(draft)


@router.post("/loop/drafts/{draft_id}/reject")
def reject_loop_draft(
    draft_id: str,
    db: DbDep,
    workspace_id: WorkspaceId,
    actor: str = "human",
    reason: str | None = None,
) -> dict:
    draft = (
        db.query(LaunchDraft)
        .filter(LaunchDraft.id == draft_id, LaunchDraft.workspace_id == workspace_id)
        .first()
    )
    if draft is None:
        raise HTTPException(status_code=404, detail="launch draft not found")
    if draft.status != "pending_approval":
        raise HTTPException(status_code=409, detail=f"draft is {draft.status}, not pending_approval")
    draft.status = "rejected"
    draft.decided_by = actor
    draft.reason = reason
    log_action(
        workspace_id=workspace_id,
        actor=actor,
        action="launch.rejected",
        target=f"draft:{draft.id}",
        payload={"run_id": draft.run_id, "reason": reason},
        command_id=draft.command_id,
        session=db,
    )
    record_event(
        db,
        workspace_id,
        "launch.rejected",
        run_id=draft.run_id,
        command_id=draft.command_id,
        stage="launch",
        actor=actor,
        payload={"draft_id": draft.id, "reason": reason},
    )
    db.commit()
    db.refresh(draft)
    return _draft_dict(draft)
