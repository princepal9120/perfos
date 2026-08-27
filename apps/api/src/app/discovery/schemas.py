"""Pydantic v2 schemas for the DISCOVERY stage.

Shared wire models used by all find/score agents under ``app.discovery``:
``find`` collectors produce ``AdRecord`` rows, profiles summarize competitors
into ``CompetitorProfile``, and the score engine emits ``WinnerSignal``.

Field names here are the fixed contract between adapters, scoring, storage,
and launch hand-off. Pure data models only — no I/O; mock-safe by default.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.discovery.find.schemas import Platform

# Tier values produced by app.discovery.score.winner_tiers.classify_tier.
Tier = str  # "high_conf" | "winner" | "emerging" | "loser"


class AdRecord(BaseModel):
    """One competitor ad normalized out of a public ad library."""

    model_config = ConfigDict(extra="ignore")

    platform: Platform
    advertiser: str
    ad_id: str = Field(description="Stable id used for dedupe per platform.")
    creative_url: str | None = None
    landing_url: str | None = Field(
        default=None, description="Destination the ad clicks through to."
    )

    spend_estimate: float | None = Field(
        default=None, description="Estimated spend where the library exposes it."
    )
    impressions: int | None = None
    variant_count: int | None = Field(
        default=None,
        description=(
            "Near-duplicate copies of this ad running at once. Public libraries hide "
            "spend/impressions for commercial ads, so this is the only volume signal."
        ),
    )
    start_date: datetime | None = Field(
        default=None, description="Library-reported first-seen date when available."
    )

    text: str | None = None
    hook: str | None = None
    cta: str | None = None


class CompetitorProfile(BaseModel):
    """Aggregate view of one competitor across discovered ads."""

    advertiser: str
    platforms: list[Platform] = Field(default_factory=list)
    ad_count: int = 0

    total_spend_estimate: float | None = None
    total_impressions: int | None = None

    ads: list[AdRecord] = Field(default_factory=list)


class WinnerSignal(BaseModel):
    """A scored ad that crossed the winner-tier bar (or was explicitly classified)."""

    platform: Platform
    advertiser: str
    ad_id: str
    creative_url: str | None = None
    landing_url: str | None = None

    score: float = Field(ge=0.0, le=100.0, description="Deterministic 0-100 ad score.")
    tier: Tier

    # Context kept alongside so consumers don't have to join back to AdRecord.
    start_date: datetime | None = None
    hook: str | None = None
    cta: str | None = None
    text: str | None = Field(default=None, description="Ad body copy, the thing worth cloning.")
    runtime_days: float = Field(default=0.0, description="Observed days live at scoring time.")
