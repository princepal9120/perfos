"""Live Meta Ad Library collector.

Meta serves the public Ad Library search result set as a JSON blob inside the
page HTML, but rejects plain HTTP clients with "403 Client challenge" — so a
real browser (Playwright chromium) is the only reliable transport.

Read-only: this reads the same public library page a person can open. No login,
no API key, no writes.
"""

from __future__ import annotations

import asyncio
import json
from datetime import UTC, datetime
from typing import Any

PLATFORM = "meta"
_SEARCH_KEY = '"search_results_connection":'
_BASE = "https://www.facebook.com/ads/library/"
_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


class LiveFetchError(RuntimeError):
    """Live collection failed; callers fall back to fixtures."""


def _search_url(query: str, country: str, active_only: bool) -> str:
    from urllib.parse import urlencode

    return _BASE + "?" + urlencode(
        {
            "active_status": "active" if active_only else "all",
            "ad_type": "all",
            "country": country,
            "q": query,
            "search_type": "keyword_unordered",
            "media_type": "all",
        }
    )


def _extract_connection(html: str) -> dict[str, Any]:
    """Brace-match the search_results_connection object out of the page HTML.

    A plain regex cannot survive nested braces inside ad copy, so this walks the
    string and skips over quoted spans (including escapes) while counting depth.
    """
    start = html.find(_SEARCH_KEY)
    if start < 0:
        raise LiveFetchError("no search_results_connection in page")

    i = html.index("{", start + len(_SEARCH_KEY))
    depth, k = 0, i
    while k < len(html):
        c = html[k]
        if c == '"':
            k += 1
            while k < len(html) and html[k] != '"':
                k += 2 if html[k] == "\\" else 1
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return json.loads(html[i : k + 1])
        k += 1
    raise LiveFetchError("unterminated search_results_connection object")


def _creative_url(snapshot: dict[str, Any], card: dict[str, Any]) -> str | None:
    for src in (card, snapshot):
        for key in ("video_hd_url", "video_sd_url", "original_image_url", "resized_image_url"):
            if src.get(key):
                return str(src[key])
    for key in ("videos", "images"):
        items = snapshot.get(key) or []
        if items and isinstance(items[0], dict):
            for sub in ("video_hd_url", "video_sd_url", "original_image_url", "resized_image_url"):
                if items[0].get(sub):
                    return str(items[0][sub])
    return snapshot.get("page_profile_picture_url")


def _landing_url(snapshot: dict[str, Any], card: dict[str, Any]) -> str | None:
    """Destination the ad clicks through to.

    Carousel/DCO ads carry a per-card ``link_url``; single-creative ads only fill
    the snapshot, so the card is an override and the snapshot the reliable source.
    Values are returned raw: Meta serves the advertiser's ad setup, so a URL can
    still contain unresolved ``{{campaign.name}}``-style macros.
    """
    for src in (card, snapshot):
        if src.get("link_url"):
            return str(src["link_url"])
    return None


_MULTIPLIER = {"k": 1_000.0, "m": 1_000_000.0, "b": 1_000_000_000.0}


def _money(token: str) -> float | None:
    token = token.strip().lstrip("<>≤≥~").strip("$€£ ").replace(",", "")
    if not token:
        return None
    mult = _MULTIPLIER.get(token[-1:].lower(), 1.0)
    if mult != 1.0:
        token = token[:-1]
    try:
        return float(token) * mult
    except ValueError:
        return None


def _spend(value: Any) -> float | None:
    """Meta reports spend as a number, a bounded range ('$4K-$4.5K'), or a dict."""
    if value is None or isinstance(value, (int, float)):
        return float(value) if value is not None else None
    if isinstance(value, dict):
        bounds = [_money(str(value[k])) for k in ("lower_bound", "upper_bound") if value.get(k)]
        bounds = [b for b in bounds if b is not None]
        return sum(bounds) / len(bounds) if bounds else None
    parts = [p for p in (_money(p) for p in str(value).split("-")) if p is not None]
    return sum(parts) / len(parts) if parts else None


def _epoch(value: Any) -> datetime | None:
    try:
        return datetime.fromtimestamp(int(value), tz=UTC).replace(tzinfo=None)
    except (TypeError, ValueError, OSError):
        return None


def _to_row(node: dict[str, Any]) -> dict[str, Any] | None:
    snapshot = node.get("snapshot") or {}
    cards = snapshot.get("cards") or []
    card = cards[0] if cards and isinstance(cards[0], dict) else {}

    ad_id = node.get("ad_archive_id")
    if not ad_id:
        return None

    body = card.get("body") or (snapshot.get("body") or {}).get("text") or ""
    title = card.get("title") or snapshot.get("title") or None

    return {
        "platform": PLATFORM,
        "advertiser": node.get("page_name") or snapshot.get("page_name") or "unknown",
        "ad_id": str(ad_id),
        "creative_url": _creative_url(snapshot, card),
        "landing_url": _landing_url(snapshot, card),
        # Meta only exposes spend/impressions for political ads; leave null otherwise
        # and let collation_count (duplicate variants running) carry the volume signal.
        "spend_estimate": _spend(node.get("spend")),
        "impressions": None,
        "variant_count": node.get("collation_count"),
        "start_date": _epoch(node.get("start_date")),
        "text": body.strip() or None,
        "hook": (title or body[:80]).strip() or None,
        "cta": card.get("cta_text") or snapshot.get("cta_text") or None,
    }


async def fetch_meta_ads(
    query: str,
    *,
    limit: int = 30,
    country: str = "US",
    active_only: bool = True,
    settle_ms: int = 8000,
) -> list[dict[str, Any]]:
    """Search the public Meta Ad Library and return AdRecord-shaped rows."""
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:  # pragma: no cover - environment guard
        raise LiveFetchError("playwright not installed") from exc

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            ctx = await browser.new_context(
                user_agent=_UA, locale="en-US", viewport={"width": 1440, "height": 900}
            )
            page = await ctx.new_page()
            await page.goto(
                _search_url(query, country, active_only),
                wait_until="domcontentloaded",
                timeout=60_000,
            )
            # The result JSON is streamed in after first paint; no stable selector to await.
            await page.wait_for_timeout(settle_ms)
            html = await page.content()
        finally:
            await browser.close()

    conn = _extract_connection(html)
    rows: list[dict[str, Any]] = []
    for edge in conn.get("edges") or []:
        for node in (edge.get("node") or {}).get("collated_results") or []:
            row = _to_row(node)
            if row:
                rows.append(row)
            if len(rows) >= limit:
                return rows
    return rows


if __name__ == "__main__":
    assert _spend("$4K-$4.5K") == 4250.0
    assert _spend({"lower_bound": "100", "upper_bound": "$200"}) == 150.0
    assert _spend(None) is None and _spend("n/a") is None
    ads = asyncio.run(fetch_meta_ads("Notion", limit=5))
    assert ads, "expected live meta ads"
    assert all(a["platform"] == PLATFORM and a["ad_id"] for a in ads)
    print(f"ok: {len(ads)} live ads, first advertiser={ads[0]['advertiser']!r}")
