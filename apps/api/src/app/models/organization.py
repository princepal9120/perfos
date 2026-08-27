"""Organization, Workspace, and workspace API-key entities."""

from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())


class WorkspaceApiKey(Base):
    """Hashed workspace credential. The plaintext key is shown once, at creation."""

    __tablename__ = "workspace_api_keys"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    name: Mapped[str] = mapped_column(String(255), default="default")
    key_hash: Mapped[str] = mapped_column(String(64), index=True)
    # Access level, ascending: read < draft < publish (see docs/FEATURE_REFERENCE.md §7).
    scope: Mapped[str] = mapped_column(String(16), default="publish")
    prefix: Mapped[str] = mapped_column(String(16), default="")
    revoked: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())
    last_used_at: Mapped[datetime | None] = mapped_column(default=None)
