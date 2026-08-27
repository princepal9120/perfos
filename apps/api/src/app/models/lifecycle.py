"""Durable records for the agent-native advertising lifecycle.

These tables deliberately contain the state that used to live in process memory
or in ``.build/*.json``.  Every row is workspace scoped and every state change
can be related back to a command and an append-only run event.
"""

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, CheckConstraint, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Winner(Base):
    __tablename__ = "lifecycle_winners"
    __table_args__ = (UniqueConstraint("workspace_id", "ad_id", name="uq_winner_workspace_ad"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    ad_id: Mapped[str] = mapped_column(String(255), index=True)
    platform: Mapped[str | None] = mapped_column(String(64), default=None)
    competitor: Mapped[str | None] = mapped_column(String(255), default=None)
    title: Mapped[str | None] = mapped_column(String(1024), default=None)
    landing_url: Mapped[str | None] = mapped_column(String(2048), default=None)
    score: Mapped[float] = mapped_column(default=0.0)
    tier: Mapped[str] = mapped_column(String(32), default="loser")
    runtime_days: Mapped[float] = mapped_column(default=0.0)
    source_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)


class CreativeAsset(Base):
    __tablename__ = "lifecycle_assets"
    __table_args__ = (Index("ix_lifecycle_assets_workspace_source", "workspace_id", "source_ad_id"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    source_ad_id: Mapped[str] = mapped_column(String(255), index=True)
    brief_text: Mapped[str | None] = mapped_column(String(4096), default=None)
    asset_url: Mapped[str] = mapped_column(String(2048))
    duration_s: Mapped[float | None] = mapped_column(default=None)
    provider: Mapped[str | None] = mapped_column(String(64), default=None)
    run_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


class LoopRun(Base):
    __tablename__ = "lifecycle_runs"
    __table_args__ = (
        CheckConstraint("status IN ('running','completed','failed')", name="ck_lifecycle_run_status"),
        Index("ix_lifecycle_runs_workspace_created", "workspace_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    command_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    persona: Mapped[str] = mapped_column(String(64), default="saas")
    query: Mapped[str | None] = mapped_column(String(255), default=None)
    channels_json: Mapped[list[str] | None] = mapped_column(JSON, default=None)
    dry_run: Mapped[bool] = mapped_column(default=True)
    status: Mapped[str] = mapped_column(String(16), default="running")
    summary_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    started_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(default=None)


class LaunchDraft(Base):
    __tablename__ = "lifecycle_launch_drafts"
    __table_args__ = (
        CheckConstraint(
            "status IN ('blocked','pending_approval','approved','rejected','executed','failed')",
            name="ck_lifecycle_launch_status",
        ),
        Index("ix_lifecycle_launch_workspace_status", "workspace_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    run_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    command_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    kind: Mapped[str] = mapped_column(String(64), default="launch_campaign")
    actions_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    policy_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(24), default="pending_approval")
    paused: Mapped[bool] = mapped_column(default=True)
    actor: Mapped[str] = mapped_column(String(255), default="loop")
    decided_by: Mapped[str | None] = mapped_column(String(255), default=None)
    reason: Mapped[str | None] = mapped_column(String(1024), default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)


class AgentCommand(Base):
    """Idempotent command envelope shared by HTTP, CLI and MCP adapters."""

    __tablename__ = "agent_commands"
    __table_args__ = (
        UniqueConstraint("workspace_id", "idempotency_key", name="uq_agent_command_idempotency"),
        Index("ix_agent_commands_workspace_created", "workspace_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    operation: Mapped[str] = mapped_column(String(128))
    idempotency_key: Mapped[str | None] = mapped_column(String(255), default=None)
    correlation_id: Mapped[str] = mapped_column(String(64), index=True)
    actor: Mapped[str] = mapped_column(String(255), default="agent")
    status: Mapped[str] = mapped_column(String(24), default="running")
    request_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    response_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    error: Mapped[str | None] = mapped_column(String(2048), default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(default=None)


class RunEvent(Base):
    """Append-only event stream for lifecycle and command state transitions."""

    __tablename__ = "run_events"
    __table_args__ = (Index("ix_run_events_workspace_created", "workspace_id", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    run_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    command_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    correlation_id: Mapped[str] = mapped_column(String(64), index=True)
    event_type: Mapped[str] = mapped_column(String(128))
    stage: Mapped[str | None] = mapped_column(String(64), default=None)
    actor: Mapped[str] = mapped_column(String(255), default="system")
    payload_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


__all__ = ["AgentCommand", "CreativeAsset", "LaunchDraft", "LoopRun", "RunEvent", "Winner"]
