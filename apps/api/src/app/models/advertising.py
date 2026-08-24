"""Advertising hierarchy: AdAccount -> Campaign -> AdSet -> Ad."""

from datetime import datetime

from sqlalchemy import CheckConstraint, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class AdAccount(Base):
    __tablename__ = "ad_accounts"
    __table_args__ = (
        CheckConstraint(
            "platform IN ('google','meta','shopify','tiktok','linkedin','pinterest',"
            "'snapchat','amazon','reddit','twitter','youtube','amazon_ads','x_ads')",
            name="ck_adaccount_platform",
        ),
        CheckConstraint("status IN ('active','paused')", name="ck_adaccount_status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id"), index=True)
    platform: Mapped[str] = mapped_column(String(32))
    platform_account_id: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(16), default="active")
    connected_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(primary_key=True)
    ad_account_id: Mapped[int] = mapped_column(ForeignKey("ad_accounts.id"), index=True)
    platform: Mapped[str] = mapped_column(String(32))
    platform_campaign_id: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(32), default="active")
    daily_budget: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now())


class AdSet(Base):
    __tablename__ = "ad_sets"

    id: Mapped[int] = mapped_column(primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(32), default="active")


class Ad(Base):
    __tablename__ = "ads"

    id: Mapped[int] = mapped_column(primary_key=True)
    ad_set_id: Mapped[int] = mapped_column(ForeignKey("ad_sets.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    creative_id: Mapped[str | None] = mapped_column(String(255), default=None)
    status: Mapped[str] = mapped_column(String(32), default="active")
