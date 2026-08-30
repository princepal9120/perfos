"""Google Ads Transparency Center spy adapter (A10).

Wraps the keyless Google Ads Transparency data surfaced through the MIT-licensed
``adkit/ads-mcp`` ``adkit_library`` tool (and equivalent markifact workflows) and
normalizes every record into the shared ``SpyAd`` schema
(``app.discovery.find.schemas``, owned by A6).

Mock-safe by default: with ``MOCK_MODE`` set (repo default) ``search_ads``
returns deterministic fixture records shaped like decoded Transparency Center
creatives — no network, no keys, no LLM calls. The live path is an explicit
NotImplementedError stub wired for ``create/adkit_mcp_client.py`` (A25); the
Transparency Center has no official API, so live fetches must go through adkit.
"""

from __future__ import annotations

import os
from typing import Any

SOURCE_PLATFORM = "google_ads"
PLATFORM = "google"  # SpyAd Platform literal

# Raw fixture records shaped like adkit_library / Transparency Center results:
# decoded text-ad headlines/descriptions, media formats, regions, shown dates.
_MOCK_RECORDS: list[dict[str, Any]] = [
    {
        "creative_id": "CR-GOOG-001",
        "advertiser_id": "AR-acme-labs",
        "advertiser_name": "Acme Labs",
        "format": "video",
        "regions": ["US", "GB"],
        "first_shown": "2026-06-02",
        "last_shown": "2026-08-21",
        "headline": "Stop guessing your ROAS",
        "description": "PerfOS shows where every dollar actually went.",
        "destination_url": "https://acmelabs.example.com/perfos",
        "media_url": "https://cdn.example.com/acme/demo-cut.mp4",
    },
    {
        "creative_id": "CR-GOOG-002",
        "advertiser_id": "AR-acme-labs",
        "advertiser_name": "Acme Labs",
        "format": "text",
        "regions": ["US"],
        "first_shown": "2026-07-01",
        "last_shown": "2026-08-19",
        "headline": "Attribution without spreadsheets",
        "description": "Reconcile platform claims vs Shopify reality in one click.",
        "destination_url": "https://acmelabs.example.com/reconcile",
        "media_url": None,
    },
    {
        "creative_id": "CR-GOOG-003",
        "advertiser_id": "AR-nimbus-skin",
        "advertiser_name": "Nimbus Skin",
        "format": "image",
        "regions": ["US", "CA", "AU"],
        "first_shown": "2026-05-11",
        "last_shown": "2026-08-24",
        "headline": "Glass skin in 14 days",
        "description": "Dermatologist-tested routine, free shipping today.",
        "destination_url": "https://nimbuskin.example.com/routine",
        "media_url": "https://cdn.example.com/nimbus/glass-hero.jpg",
    },
]


def _mock_mode() -> bool:
    return os.getenv("MOCK_MODE", "").strip().lower() in ("1", "true", "yes")


def normalize_transparency_record(raw: dict[str, Any]) -> dict[str, Any]:
    """Map one raw Transparency Center record to canonical ``SpyAd`` kwargs.

    Pure function — tolerant of missing optional fields (adkit/markifact shapes
    vary slightly). Returns plain kwargs so callers construct their own model;
    keeps this module importable and testable before/independent of schemas.py.
    """
    media = raw.get("media_url")
    creatives = []
    if media:
        fmt = str(raw.get("format") or "image").lower()
        # ponytail: text ads have no asset; only image/video become CreativeAsset
        if fmt in ("image", "video"):
            creatives.append({"asset_type": fmt, "url": media})
    return {
        "source": SOURCE_PLATFORM,
        "platform": PLATFORM,
        "platform_ad_id": str(raw.get("creative_id") or raw.get("ad_id") or ""),
        "advertiser": {
            "name": raw.get("advertiser_name") or raw.get("advertiser") or "",
            "platform_page_id": raw.get("advertiser_id"),
            "website_domain": raw.get("advertiser_domain"),
        },
        "body": raw.get("description") or raw.get("body") or "",
        "headline": raw.get("headline") or raw.get("title"),
        "landing_url": raw.get("destination_url") or raw.get("landing_url"),
        "creatives": creatives,
        "first_seen_at": raw.get("first_shown") or raw.get("first_shown_date"),
        "last_seen_at": raw.get("last_shown") or raw.get("last_shown_date"),
        "countries": list(raw.get("regions") or raw.get("countries") or []),
        "raw_json": raw,
    }


def normalize_transparency_ad(raw: dict[str, Any]) -> Any:
    """Normalize one raw record into a shared ``SpyAd`` (A6's schemas.py)."""
    from app.discovery.find.schemas import SpyAd  # integration seam, owned by A6

    return SpyAd(**normalize_transparency_record(raw))


def search_ads(
    query: str,
    *,
    country: str = "anywhere",
    limit: int = 20,
) -> list[Any]:
    """Search competitor ads in the Google Ads Transparency Center.

    Mock mode: substring-match deterministic fixtures (case-insensitive) on
    advertiser name or creative text, capped at ``limit``. Live mode: delegated
    to adkit's ``adkit_library`` tool via the MCP client (A25).
    """
    if not _mock_mode():
        raise NotImplementedError(
            "Live Google Ads Transparency fetch requires adkit_library via "
            "create/adkit_mcp_client.py (no official public API)."
        )

    q = query.strip().lower()
    hits = [
        r
        for r in _MOCK_RECORDS
        if q in r["advertiser_name"].lower()
        or q in f'{r["headline"]} {r["description"]}'.lower()
    ]
    if country != "anywhere":
        hits = [r for r in hits if country.upper() in (c.upper() for c in r["regions"])]
    return [normalize_transparency_ad(r) for r in hits[: max(limit, 0)]]
