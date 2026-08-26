"""TikTok Ad Library (Creative Center) spy adapter (AA05).

Mock-safe by default: ``collect_tiktok_ads`` returns deterministic fixture rows
in the same canonical collector row schema as AA04 (``meta_collector``) —
no network, no keys, no LLM calls.

REAL hook: proxy-intell/tiktok-ads-library-mcp
"""

from __future__ import annotations

from typing import Any

PLATFORM = "tiktok"

# Deterministic fixtures in the canonical collector row schema.
_MOCK_ADS: list[dict[str, Any]] = [
    {
        "platform": PLATFORM,
        "advertiser": "Acme Labs",
        "ad_id": "TT-GOOG-001",
        "creative_url": "https://cdn.example.com/acme/demo-cut.mp4",
        "spend_estimate": 9800.0,
        "impressions": 620000,
        "start_date": "2026-06-15",
        "text": "Stop guessing your ROAS. PerfOS shows where every dollar actually went.",
        "hook": "Stop guessing your ROAS",
        "cta": "Learn more",
    },
    {
        "platform": PLATFORM,
        "advertiser": "Nimbus Skin",
        "ad_id": "TT-NIMB-002",
        "creative_url": "https://cdn.example.com/nimbus/glass-hero.jpg",
        "spend_estimate": 3600.0,
        "impressions": 240000,
        "start_date": "2026-05-28",
        "text": "Glass skin in 14 days. Dermatologist-tested routine, free shipping today.",
        "hook": "Glass skin in 14 days",
        "cta": "Shop now",
    },
    {
        "platform": PLATFORM,
        "advertiser": "Ledgerly",
        "ad_id": "TT-LEDG-003",
        "creative_url": "https://cdn.example.com/ledgerly/dashboard.jpg",
        "spend_estimate": 15400.0,
        "impressions": 890000,
        "start_date": "2026-07-08",
        "text": "Attribution without spreadsheets. Reconcile platform claims vs Shopify reality.",
        "hook": "Attribution without spreadsheets",
        "cta": "Get started",
    },
]


def _matches(ad: dict[str, Any], filters: dict[str, Any] | None) -> bool:
    """Case-insensitive substring match on advertiser/text for query-like filters."""
    if not filters:
        return True
    q = str(filters.get("query") or "").strip().lower()
    if not q:
        return True
    haystack = f'{ad["advertiser"]} {ad["text"]}'.lower()
    return q in haystack


async def collect_tiktok_ads(
    page_size: int = 20,
    filters: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Collect competitor TikTok ads.

    Mock mode: deterministic fixtures filtered by ``filters["query"]``
    (substring) and capped at ``page_size``.
    """
    hits = [a for a in _MOCK_ADS if _matches(a, filters)]
    return hits[: max(page_size, 0)]
