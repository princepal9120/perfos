"""Durable agent dispatch jobs and transport adapters."""

from datetime import UTC, datetime
from uuid import uuid4
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.models import AgentJob, ConnectedAgent
from app.services.commanding import record_event


def dispatch_job(
    session: Session,
    agent: ConnectedAgent,
    workspace_id: int,
    payload: dict[str, Any],
    *,
    command_id: str | None = None,
) -> AgentJob:
    """Create a durable job and execute an explicitly configured HTTP transport.

    Missing transport configuration is a safe queued job, not a fake
    ``connected`` result. A worker can later retry queued jobs after the agent
    is configured.
    """
    now = datetime.now(UTC).replace(tzinfo=None)
    job = AgentJob(
        id=uuid4().hex,
        workspace_id=int(workspace_id),
        agent_id=agent.id,
        command_id=command_id,
        status="queued",
        payload_json=payload,
    )
    session.add(job)
    session.flush()
    endpoint = (agent.config_json or {}).get("endpoint") or (agent.config_json or {}).get("url")
    if not endpoint:
        job.result_json = {"status": "queued", "reason": "transport_not_configured"}
        record_event(
            session,
            workspace_id,
            "agent.job_queued",
            command_id=command_id,
            stage="dispatch",
            payload={"job_id": job.id, "agent_id": agent.id, "reason": "transport_not_configured"},
        )
        return job

    job.status = "running"
    job.started_at = now
    try:
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        token = (agent.config_json or {}).get("token")
        if token:
            headers["Authorization"] = f"Bearer {token}"
        response = httpx.post(
            str(endpoint),
            json={"job_id": job.id, "workspace_id": workspace_id, "payload": payload},
            headers=headers,
            timeout=15.0,
        )
        response.raise_for_status()
        job.status = "completed"
        job.result_json = response.json() if response.content else {"status": "ok"}
    except Exception as exc:
        job.status = "failed"
        job.error = str(exc)
        job.result_json = {"status": "failed"}
    job.finished_at = datetime.now(UTC).replace(tzinfo=None)
    record_event(
        session,
        workspace_id,
        f"agent.job_{job.status}",
        command_id=command_id,
        stage="dispatch",
        payload={"job_id": job.id, "agent_id": agent.id, "error": job.error},
    )
    return job
