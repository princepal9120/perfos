"""Meta Ad Library spy adapter (AA04).

Live when a search query is supplied (``meta_live`` drives a headless browser
against the public Ad Library); deterministic fixtures otherwise, and whenever
live collection fails, so the pipeline never hard-fails on a scrape.

Set ``PERFOS_LIVE_DISCOVERY=0`` to force fixtures everywhere.
"""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

PLATFORM = "meta"

# Deterministic fixtures in the canonical collector row schema.
_MOCK_ADS: list[dict[str, Any]] = [
    {
        "platform": PLATFORM,
        "advertiser": "Acme Labs",
        "ad_id": "MT-GOOG-001",
        "creative_url": "https://cdn.example.com/acme/demo-cut.mp4",
        "landing_url": "https://acmelabs.example.com/roas-report",
        "spend_estimate": 12500.0,
        "impressions": 840000,
        "start_date": "2026-06-02",
        "text": "Stop guessing your ROAS. PerfOS shows where every dollar actually went.",
        "hook": "Stop guessing your ROAS",
        "cta": "Learn more",
    },
    {
        "platform": PLATFORM,
        "advertiser": "Nimbus Skin",
        "ad_id": "MT-NIMB-002",
        "creative_url": "https://cdn.example.com/nimbus/glass-hero.jpg",
        "landing_url": "https://nimbusskin.example.com/glass-skin",
        "spend_estimate": 4800.0,
        "impressions": 310000,
        "start_date": "2026-05-11",
        "text": "Glass skin in 14 days. Dermatologist-tested routine, free shipping today.",
        "hook": "Glass skin in 14 days",
        "cta": "Shop now",
    },
    {
        "platform": PLATFORM,
        "advertiser": "Ledgerly",
        "ad_id": "MT-LEDG-003",
        "creative_url": "https://cdn.example.com/ledgerly/dashboard.jpg",
        "landing_url": "https://ledgerly.example.com/attribution",
        "spend_estimate": 21000.0,
        "impressions": 1200000,
        "start_date": "2026-07-01",
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


def live_enabled() -> bool:
    return os.getenv("PERFOS_LIVE_DISCOVERY", "1") not in {"0", "false", "False"}


async def collect_meta_ads(
    page_size: int = 20,
    filters: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Collect competitor Meta ads.

    With a ``filters["query"]`` and live mode on, scrapes the public Ad Library;
    falls back to deterministic fixtures on any failure or with no query.
    """
    query = str((filters or {}).get("query") or "").strip()

    if query and live_enabled():
        from app.discovery.find.meta_live import fetch_meta_ads

        try:
            rows = await fetch_meta_ads(
                query,
                limit=max(page_size, 0),
                country=str((filters or {}).get("country") or "US"),
            )
            if rows:
                return rows
            logger.warning("meta live search returned nothing for %r; using fixtures", query)
        except Exception as exc:  # noqa: BLE001 - a scrape fails in many ways
            logger.warning("meta live search failed for %r (%s); using fixtures", query, exc)

    hits = [a for a in _MOCK_ADS if _matches(a, filters)]
    return hits[: max(page_size, 0)]
