"""Google, LinkedIn, and X public ad-library adapters."""

from __future__ import annotations

from typing import Any

from app.discovery.find.public_library_collector import collect_public_ads


_FIXTURES: dict[str, list[dict[str, Any]]] = {
    "google": [
        {
            "platform": "google",
            "advertiser": "Acme Labs",
            "ad_id": "CR-GOOG-001",
            "creative_url": "https://cdn.example.com/acme/demo-cut.mp4",
            "landing_url": "https://acmelabs.example.com/perfos",
            "start_date": "2026-06-02",
            "text": "PerfOS shows where every dollar actually went.",
            "hook": "Stop guessing your ROAS",
            "cta": "Learn more",
        }
    ],
    "linkedin": [
        {
            "platform": "linkedin",
            "advertiser": "Acme Labs",
            "ad_id": "LI-ACME-001",
            "creative_url": "https://cdn.example.com/acme/linkedin-roas.jpg",
            "landing_url": "https://acmelabs.example.com/b2b-roas",
            "start_date": "2026-07-12",
            "text": "Reconcile paid media before the board asks why revenue moved.",
            "hook": "Your ROAS report should match finance",
            "cta": "Download",
        }
    ],
    "x": [
        {
            "platform": "x",
            "advertiser": "Acme Labs",
            "ad_id": "X-ACME-001",
            "creative_url": "https://cdn.example.com/acme/x-roas.jpg",
            "landing_url": "https://acmelabs.example.com/roas",
            "start_date": "2026-08-01",
            "text": "One dashboard for spend, revenue, and incrementality.",
            "hook": "Platforms grade their own homework",
            "cta": "Learn more",
        }
    ],
}


async def collect_google_ads(
    page_size: int = 20, filters: dict[str, Any] | None = None
) -> list[dict[str, Any]]:
    return await collect_public_ads(
        "google", page_size=page_size, filters=filters, fallback=_FIXTURES["google"]
    )


async def collect_linkedin_ads(
    page_size: int = 20, filters: dict[str, Any] | None = None
) -> list[dict[str, Any]]:
    return await collect_public_ads(
        "linkedin", page_size=page_size, filters=filters, fallback=_FIXTURES["linkedin"]
    )


async def collect_x_ads(
    page_size: int = 20, filters: dict[str, Any] | None = None
) -> list[dict[str, Any]]:
    return await collect_public_ads(
        "x", page_size=page_size, filters=filters, fallback=_FIXTURES["x"]
    )

