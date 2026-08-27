"""Decision workflow: Recommendation, Approval, Experiment, Outcome."""

from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.db import Base


class Recommendation(Base):
    __tablename__ = "recommendations"
    __table_args__ = (
        CheckConstraint("risk IN ('low','medium','high')", name="ck_recommendation_risk"),
        CheckConstraint(
            "status IN ('pending','approved','rejected','executed','failed')",
            name="ck_recommendation_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    type: Mapped[str] = mapped_column(String(64))
    reason: Mapped[str] = mapped_column(String(1024))
    evidence_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    expected_impact: Mapped[str | None] = mapped_column(String(1024), default=None)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    risk: Mapped[str] = mapped_column(String(16), default="medium")
    proposed_changes_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    rollback_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    status: Mapped[str] = mapped_column(String(16), default="pending")
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[int] = mapped_column(primary_key=True)
    recommendation_id: Mapped[int] = mapped_column(ForeignKey("recommendations.id"), index=True)
    actor: Mapped[str] = mapped_column(String(255))
    decision: Mapped[str] = mapped_column(String(16))
    note: Mapped[str | None] = mapped_column(String(1024), default=None)
    command_id: Mapped[str | None] = mapped_column(String(64), index=True, default=None)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    hypothesis: Mapped[str] = mapped_column(String(1024))
    control_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    variant_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    primary_metric: Mapped[str] = mapped_column(String(64), default="blended_mer")
    status: Mapped[str] = mapped_column(String(32), default="running")
    result_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())


class Outcome(Base):
    __tablename__ = "outcomes"

    id: Mapped[int] = mapped_column(primary_key=True)
    recommendation_id: Mapped[int] = mapped_column(ForeignKey("recommendations.id"), index=True)
    metric: Mapped[str] = mapped_column(String(64))
    before: Mapped[float] = mapped_column(Float, default=0.0)
    after: Mapped[float] = mapped_column(Float, default=0.0)
    delta: Mapped[float] = mapped_column(Float, default=0.0)
    recorded_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())
