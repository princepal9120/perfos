"""External agent registry (ChatGPT / Claude / opencode) and audit trail."""

from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.db import Base


class ConnectedAgent(Base):
    __tablename__ = "connected_agents"
    __table_args__ = (
        CheckConstraint(
            "provider IN ('chatgpt','claude','opencode','openai','anthropic')",
            name="ck_connected_agent_provider",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    provider: Mapped[str] = mapped_column(String(32))
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(32), default="idle")
    config_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    last_run_at: Mapped[datetime | None] = mapped_column(default=None)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    actor: Mapped[str] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(64))
    target: Mapped[str] = mapped_column(String(255))
    payload_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    command_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    correlation_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())


class MCPServer(Base):
    """Registered Model Context Protocol servers available to the workspace's agents."""

    __tablename__ = "mcp_servers"
    __table_args__ = (
        CheckConstraint(
            "transport IN ('http','sse','stdio')",
            name="ck_mcp_server_transport",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    transport: Mapped[str] = mapped_column(String(16), default="http")
    endpoint: Mapped[str | None] = mapped_column(String(512), default=None)
    enabled: Mapped[bool] = mapped_column(default=True)
    status: Mapped[str] = mapped_column(String(32), default="unknown")
    config_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    last_checked_at: Mapped[datetime | None] = mapped_column(default=None)


class ExternalIntegration(Base):
    """Third-party integration (ads/analytics/crm/creative) registered per workspace."""

    __tablename__ = "external_integrations"
    __table_args__ = (
        CheckConstraint(
            "provider IN ('google_ads','meta_ads','shopify','stripe','slack','linear','github','notion')",
            name="ck_external_integration_provider",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(32), default="ads")
    provider: Mapped[str] = mapped_column(String(32))
    endpoint: Mapped[str | None] = mapped_column(String(512), default=None)
    api_key_encrypted: Mapped[str | None] = mapped_column(String(1024), default=None)
    enabled: Mapped[bool] = mapped_column(default=True)
    status: Mapped[str] = mapped_column(String(32), default="unknown")
    config_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    last_checked_at: Mapped[datetime | None] = mapped_column(default=None)
