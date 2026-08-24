"""Spend (platform-claimed), Revenue (source of truth) and AttributionEvent."""

from datetime import date

from sqlalchemy import CheckConstraint, Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Spend(Base):
    """Platform-CLAIMED performance numbers, one row per campaign per day."""

    __tablename__ = "spends"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    ad_account_id: Mapped[int | None] = mapped_column(ForeignKey("ad_accounts.id"), index=True)
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("campaigns.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    impressions: Mapped[int] = mapped_column(default=0)
    clicks: Mapped[int] = mapped_column(default=0)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    conversions: Mapped[float] = mapped_column(Float, default=0.0)
    conversion_value: Mapped[float] = mapped_column(Float, default=0.0)


class Revenue(Base):
    """Actual revenue — the SOURCE OF TRUTH for reconciliation."""

    __tablename__ = "revenues"
    __table_args__ = (CheckConstraint("source IN ('shopify','stripe')", name="ck_revenue_source"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    source: Mapped[str] = mapped_column(String(32))
    order_id: Mapped[str] = mapped_column(String(255))
    date: Mapped[date] = mapped_column(Date, index=True)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    customer_id: Mapped[str | None] = mapped_column(String(255), default=None)
    is_new_customer: Mapped[bool] = mapped_column(default=False)


class AttributionEvent(Base):
    __tablename__ = "attribution_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    channel: Mapped[str] = mapped_column(String(64))
    attributed_revenue: Mapped[float] = mapped_column(Float, default=0.0)
    model: Mapped[str] = mapped_column(String(64), default="last_touch_blended")
