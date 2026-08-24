"""Audit trail service. Every state-changing action gets an immutable AuditLog row."""

from typing import Any, Optional

from app.core.db import SessionLocal
from app.models import AuditLog


def log_action(
    workspace_id,
    actor: str,
    action: str,
    target: str,
    payload: Optional[Any] = None,
    session=None,
):
    """Write one AuditLog row and return it.

    Pass ``session`` to join the caller's transaction (no commit); otherwise a
    SessionLocal is opened and committed.
    """
    own = session is None
    s = session or SessionLocal()
    try:
        row = AuditLog(
            workspace_id=workspace_id,
            actor=actor,
            action=action,
            target=target,
            payload_json=payload if payload is not None else {},
        )
        s.add(row)
        if own:
            s.commit()
            s.refresh(row)
        else:
            s.flush()
        return row
    finally:
        if own:
            s.close()
