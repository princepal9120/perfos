"""Measurement models: creative performance + incrementality (geo/lift) tests."""

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import CheckConstraint, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.db import Base


class CreativePerformance(Base):
    """Per-creative performance rollup with fatigue + hook-rate diagnostics."""

    __tablename__ = "creative_performance"
    __table_args__ = (
        CheckConstraint(
            "fatigue_score >= 0 AND fatigue_score <= 1", name="ck_creative_fatigue_range"
        ),
        CheckConstraint(
            "hook_rate >= 0 AND hook_rate <= 1", name="ck_creative_hook_rate_range"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    platform: Mapped[str] = mapped_column(String(32), index=True)
    creative_id: Mapped[str] = mapped_column(String(255))
    impressions: Mapped[int] = mapped_column(default=0)
    spend: Mapped[float] = mapped_column(Float, default=0.0)
    conversions: Mapped[float] = mapped_column(Float, default=0.0)
    fatigue_score: Mapped[float] = mapped_column(Float, default=0.0)
    hook_rate: Mapped[float] = mapped_column(Float, default=0.0)


class IncrementalityTest(Base):
    """Geo-holdout / conversion-lift / A-B incrementality test."""

    __tablename__ = "incrementality_tests"
    __table_args__ = (
        CheckConstraint(
            "test_type IN ('geo_holdout','conversion_lift','ab')",
            name="ck_incrementality_test_type",
        ),
        CheckConstraint(
            "status IN ('draft','running','completed')",
            name="ck_incrementality_test_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    platform: Mapped[str] = mapped_column(String(32), index=True)
    test_type: Mapped[str] = mapped_column(String(32), default="geo_holdout")
    status: Mapped[str] = mapped_column(String(16), default="draft")
    markets_treated: Mapped[Optional[list[Any]]] = mapped_column(JSON, default=None)
    markets_control: Mapped[Optional[list[Any]]] = mapped_column(JSON, default=None)
    spend_treated: Mapped[float] = mapped_column(Float, default=0.0)
    spend_control: Mapped[float] = mapped_column(Float, default=0.0)
    conversions_treated: Mapped[float] = mapped_column(Float, default=0.0)
    conversions_control: Mapped[float] = mapped_column(Float, default=0.0)
    lift_pct: Mapped[Optional[float]] = mapped_column(Float, default=None)
    started_at: Mapped[Optional[datetime]] = mapped_column(default=None)
    completed_at: Mapped[Optional[datetime]] = mapped_column(default=None)


def compute_lift_pct(
    conversions_treated: float,
    conversions_control: float,
    spend_treated: float,
    spend_control: float,
) -> Optional[float]:
    """Deterministic lift: ((conv_t/conv_c)/(spend_t/spend_c) - 1) * 100.

    Returns None when the ratio is undefined (zero denominators).
    """
    if not conversions_control or not spend_control or not spend_treated:
        return None
    return round(
        ((conversions_treated / conversions_control) / (spend_treated / spend_control) - 1)
        * 100,
        2,
    )
