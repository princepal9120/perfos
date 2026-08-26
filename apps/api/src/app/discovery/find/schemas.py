"""Pydantic v2 schemas for the FIND / spy stage.

These are the canonical wire models every collector adapter
(``meta_ads_collector``, ``meta_ads_scraper``, ``tiktok_ads_library``,
``google_ads_transparency``, ``linkedin``, ``x``) normalizes into before
handing rows to ``ingest`` / ``store``. Field names are fixed so adapters,
the score engine, and storage stay decoupled.

Pure data models only — no I/O, no external calls; mock-safe by default.
"""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

Platform = Literal["meta", "tiktok", "google", "linkedin", "x"]
AssetType = Literal["image", "video"]


class CreativeAsset(BaseModel):
    """A single media asset attached to a spy ad."""

    asset_type: AssetType
    url: str
    thumbnail_url: str | None = None
    width: int | None = None
    height: int | None = None
    duration_s: float | None = None  # videos only


class Advertiser(BaseModel):
    """The competitor page / advertiser behind a spy ad."""

    name: str
    platform_page_id: str | None = None
    handle: str | None = None
    website_domain: str | None = None


class SpyAd(BaseModel):
    """One competitor ad as observed on a public ad library."""

    model_config = ConfigDict(extra="ignore")

    source: str = Field(
        description="Collector that produced this row, e.g. 'meta_ads_collector'."
    )
    platform: Platform
    platform_ad_id: str = Field(description="Stable id used for dedupe per platform.")
    advertiser: Advertiser

    body: str = ""
    headline: str | None = None
    cta: str | None = None
    landing_url: str | None = None

    creatives: list[CreativeAsset] = Field(default_factory=list)

    first_seen_at: datetime | None = Field(
        default=None, description="Library-reported start date when available."
    )
    last_seen_at: datetime | None = None
    is_active: bool = True

    countries: list[str] = Field(default_factory=list)

    persona_tag: str | None = Field(
        default=None,
        description="Set downstream by persona_channel_map / store, not by adapters.",
    )
    raw_json: dict[str, Any] | None = Field(
        default=None, description="Original library payload preserved for normalization."
    )
