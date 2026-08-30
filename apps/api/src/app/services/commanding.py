"""Command envelopes and append-only lifecycle events.

The HTTP, CLI, and MCP adapters use this module instead of inventing their own
request identifiers.  An idempotency key is scoped to a workspace, while the
command id is the stable correlation id used by every related event and audit
record.
"""

from datetime import UTC, datetime
from uuid import uuid4
from typing import Any

from sqlalchemy.orm import Session

from app.models import AgentCommand, AuditLog, RunEvent


def begin_command(
    session: Session,
    workspace_id: int,
    operation: str,
    *,
    idempotency_key: str | None = None,
    request: dict[str, Any] | None = None,
    actor: str = "agent",
) -> tuple[AgentCommand, bool]:
    """Return ``(command, created)``; repeated keys reuse the original command."""
    key = idempotency_key.strip() if idempotency_key else None
    if key:
        existing = (
            session.query(AgentCommand)
            .filter(
                AgentCommand.workspace_id == int(workspace_id),
                AgentCommand.idempotency_key == key,
            )
            .first()
        )
        if existing is not None:
            return existing, False
    command_id = uuid4().hex
    command = AgentCommand(
        id=command_id,
        workspace_id=int(workspace_id),
        operation=operation,
        idempotency_key=key,
        correlation_id=command_id,
        actor=actor,
        request_json=request or {},
        status="running",
    )
    session.add(command)
    session.flush()
    record_event(
        session,
        workspace_id,
        "command.started",
        command_id=command.id,
        correlation_id=command.correlation_id,
        actor=actor,
        payload={"operation": operation, "idempotency_key": key},
    )
    return command, True


def finish_command(
    session: Session,
    command: AgentCommand,
    *,
    status: str,
    response: dict[str, Any] | None = None,
    error: str | None = None,
) -> AgentCommand:
    command.status = status
    command.response_json = response
    command.error = error
    command.finished_at = datetime.now(UTC).replace(tzinfo=None)
    session.flush()
    record_event(
        session,
        command.workspace_id,
        f"command.{status}",
        command_id=command.id,
        correlation_id=command.correlation_id,
        actor=command.actor,
        payload={"operation": command.operation, "error": error},
    )
    return command


def record_event(
    session: Session,
    workspace_id: int,
    event_type: str,
    *,
    command_id: str | None = None,
    run_id: str | None = None,
    correlation_id: str | None = None,
    stage: str | None = None,
    actor: str = "system",
    payload: dict[str, Any] | None = None,
) -> RunEvent:
    """Append one event; callers never update or delete existing events."""
    event = RunEvent(
        workspace_id=int(workspace_id),
        run_id=run_id,
        command_id=command_id,
        correlation_id=correlation_id or command_id or uuid4().hex,
        event_type=event_type,
        stage=stage,
        actor=actor,
        payload_json=payload or {},
    )
    session.add(event)
    session.flush()
    return event


def command_payload(command: AgentCommand) -> dict[str, Any]:
    """Small stable envelope returned by all command-backed adapters."""
    return {
        "command_id": command.id,
        "correlation_id": command.correlation_id,
        "idempotency_key": command.idempotency_key,
    }


def audit_with_command(
    session: Session,
    *,
    workspace_id: int,
    actor: str,
    action: str,
    target: str,
    payload: Any | None = None,
    command_id: str | None = None,
    correlation_id: str | None = None,
) -> AuditLog:
    """Write a legacy audit row while retaining first-class correlation fields."""
    row = AuditLog(
        workspace_id=int(workspace_id),
        actor=actor,
        action=action,
        target=target,
        payload_json=payload if payload is not None else {},
        command_id=command_id,
        correlation_id=correlation_id or command_id,
    )
    session.add(row)
    session.flush()
    return row
