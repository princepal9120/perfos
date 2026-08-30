"""Shared bridge for public ad-library backends.

Meta has a first-party Playwright collector in this repo. TikTok Creative Center,
Google Ads Transparency, LinkedIn Ad Library, and X transparency change their
private page protocols frequently, so live access is injected as a small HTTP
JSON adapter instead of copying brittle browser automation into PerfOS.

Configure ``PERFOS_<PLATFORM>_AD_LIBRARY_URL`` with a read-only collector URL.
The bridge sends ``query``, ``country``, and ``limit`` query parameters and
normalizes common public-library response shapes into ``AdRecord`` rows.
"""

from __future__ import annotations

import asyncio
import json
import os
import urllib.parse
import urllib.request
from collections.abc import Mapping
from typing import Any


class PublicLibraryError(RuntimeError):
    """A configured collector returned an unusable response."""


def _first(source: Mapping[str, Any], *keys: str) -> Any:
    for key in keys:
        value = source.get(key)
        if value not in (None, "", []):
            return value
    return None


def _items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]
    if not isinstance(payload, dict):
        raise PublicLibraryError("collector response must be a JSON object or list")
    for key in ("items", "ads", "results", "data"):
        value = payload.get(key)
        if isinstance(value, list):
            return [row for row in value if isinstance(row, dict)]
        if isinstance(value, dict):
            for nested in ("items", "ads", "results", "materials", "list"):
                rows = value.get(nested)
                if isinstance(rows, list):
                    return [row for row in rows if isinstance(row, dict)]
    raise PublicLibraryError("collector response contains no ad list")


def _video_url(raw: Mapping[str, Any]) -> str | None:
    info = raw.get("video_info")
    if not isinstance(info, Mapping):
        return None
    video = info.get("video_url")
    if isinstance(video, Mapping):
        return str(_first(video, "720p", "540p", "url") or "") or None
    return str(_first(info, "video_url", "cover") or "") or None


def normalize_public_ad(platform: str, raw: Mapping[str, Any]) -> dict[str, Any] | None:
    """Normalize common Meta/TikTok/Google/LinkedIn/X library fields."""
    advertiser_obj = raw.get("advertiser")
    advertiser = (
        _first(advertiser_obj, "name", "title")
        if isinstance(advertiser_obj, Mapping)
        else advertiser_obj
    ) or _first(
        raw,
        "advertiser_name",
        "advertiserName",
        "page_name",
        "pageName",
        "brand_name",
        "company_name",
    )
    ad_id = _first(
        raw,
        "ad_id",
        "platform_ad_id",
        "ad_archive_id",
        "creative_id",
        "creativeId",
        "id",
    )
    if not ad_id or not advertiser:
        return None

    body = _first(raw, "body", "text", "description", "ad_text", "ad_title")
    hook = _first(raw, "hook", "headline", "title", "ad_title") or body
    creative = _first(
        raw,
        "creative_url",
        "media_url",
        "preview_url",
        "previewUrl",
        "image_url",
        "thumbnail_url",
    ) or _video_url(raw)
    return {
        "platform": platform,
        "advertiser": str(advertiser),
        "ad_id": str(ad_id),
        "creative_url": str(creative) if creative else None,
        "landing_url": _first(
            raw, "landing_url", "destination_url", "link_url", "creativeUrl"
        ),
        "spend_estimate": _first(raw, "spend_estimate", "spend"),
        "impressions": _first(raw, "impressions", "impression_count"),
        "variant_count": _first(raw, "variant_count", "collation_count"),
        "start_date": _first(
            raw, "start_date", "first_seen_at", "first_shown", "firstShownAt"
        ),
        "text": str(body) if body else None,
        "hook": str(hook)[:200] if hook else None,
        "cta": _first(raw, "cta", "cta_text", "call_to_action"),
    }


def _fetch(platform: str, query: str, country: str, limit: int) -> list[dict[str, Any]]:
    prefix = f"PERFOS_{platform.upper()}_AD_LIBRARY"
    endpoint = os.getenv(f"{prefix}_URL", "").strip()
    if not endpoint:
        return []
    params = urllib.parse.urlencode({"query": query, "country": country, "limit": limit})
    request = urllib.request.Request(
        f"{endpoint}{'&' if '?' in endpoint else '?'}{params}",
        headers={
            "Accept": "application/json",
            **(
                {"Authorization": f"Bearer {os.environ[f'{prefix}_TOKEN']}"}
                if os.getenv(f"{prefix}_TOKEN")
                else {}
            ),
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:  # noqa: S310
            payload = json.load(response)
    except Exception as exc:
        raise PublicLibraryError(f"{platform} collector failed: {exc}") from exc
    return [row for raw in _items(payload) if (row := normalize_public_ad(platform, raw))]


async def collect_public_ads(
    platform: str,
    *,
    page_size: int,
    filters: dict[str, Any] | None,
    fallback: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Use a configured live backend, otherwise return filtered demo rows."""
    limit = max(page_size, 0)
    query = str((filters or {}).get("query") or "").strip()
    country = str((filters or {}).get("country") or "US")
    live = os.getenv("PERFOS_LIVE_DISCOVERY", "1") not in {"0", "false", "False"}
    if live and query and os.getenv(f"PERFOS_{platform.upper()}_AD_LIBRARY_URL"):
        rows = await asyncio.to_thread(_fetch, platform, query, country, limit)
        return rows[:limit]

    # Fixture mode represents a local catalog, not a remote search API. Keep
    # its deterministic rows available for platform selection tests and demos.
    needle = query.lower() if query else ""
    rows = [
        row
        for row in fallback
        if not needle
        or needle in f"{row.get('advertiser', '')} {row.get('text', '')}".lower()
    ]
    return rows[:limit]
