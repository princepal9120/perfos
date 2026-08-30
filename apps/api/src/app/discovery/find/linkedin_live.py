"""Live LinkedIn Ad Library collector.

LinkedIn renders its public ad library server-side rather than shipping a JSON
blob, so ads are read from the DOM: each card links to /ad-library/detail/{id}
and carries the advertiser name, promoted copy, and a creative image.

Read-only: this reads the same public page a person can open. No login, no API
key, no writes. Fields LinkedIn does not publish (start date, spend, variant
count) stay ``None`` rather than being invented — the scorer already degrades
deterministically on missing signals.
"""

from __future__ import annotations

import asyncio
from typing import Any
from urllib.parse import urlencode

PLATFORM = "linkedin"
_BASE = "https://www.linkedin.com/ad-library/search"
_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# Card text arrives as newline-joined blocks; these are chrome, not ad copy.
_NOISE = {"promoted", "view details", "sponsored", "follow", "•"}

_EXTRACT_JS = """
(limit) => {
  const cards = [...document.querySelectorAll('div,article,li')].filter(el => {
    const a = el.querySelector('a[href*="/ad-library/detail/"]');
    return a && el.innerText && el.innerText.length > 40
      && el.querySelectorAll('a[href*="/ad-library/detail/"]').length <= 3;
  });
  const seen = new Set();
  const out = [];
  for (const el of cards) {
    const href = el.querySelector('a[href*="/ad-library/detail/"]').getAttribute('href') || '';
    const id = (href.match(/detail\\/(\\d+)/) || [])[1];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const img = el.querySelector('img');
    out.push({
      id,
      text: el.innerText,
      img: img ? img.getAttribute('src') : null,
      detail: href.split('?')[0],
    });
    if (out.length >= limit) break;
  }
  return out;
}
"""


class LiveFetchError(RuntimeError):
    """Live collection failed; callers fall back to fixtures."""


def _search_url(query: str, country: str) -> str:
    params = {"keyword": query}
    if country:
        params["countries"] = country
    return f"{_BASE}?{urlencode(params)}"


def _lines(text: str) -> list[str]:
    out = []
    for raw in (text or "").split("\n"):
        line = raw.strip()
        if line and line.lower() not in _NOISE:
            out.append(line)
    return out


def _to_row(card: dict[str, Any]) -> dict[str, Any] | None:
    """Card DOM text -> AdRecord shape.

    Layout is: advertiser, [advertiser tagline], then the promoted copy. The
    "Promoted" marker is the reliable separator, so copy is taken after it when
    present and falls back to the longest remaining line.
    """
    ad_id = card.get("id")
    if not ad_id:
        return None

    raw = card.get("text") or ""
    lines = _lines(raw)
    if not lines:
        return None

    advertiser = lines[0]
    marker = raw.lower().find("promoted")
    body_lines = _lines(raw[marker + len("promoted"):]) if marker >= 0 else lines[1:]

    body = max(body_lines, key=len, default="")
    return {
        "platform": PLATFORM,
        "advertiser": advertiser,
        "ad_id": str(ad_id),
        "creative_url": card.get("img"),
        "landing_url": (
            f"https://www.linkedin.com{card['detail']}" if card.get("detail") else None
        ),
        # LinkedIn's public library publishes no spend, impressions, start date,
        # or variant count. Leaving them null keeps the score honest.
        "spend_estimate": None,
        "impressions": None,
        "variant_count": None,
        "start_date": None,
        "text": body or None,
        "hook": (body[:80] or advertiser).strip() or None,
        "cta": None,
    }


async def fetch_linkedin_ads(
    query: str,
    *,
    limit: int = 30,
    country: str = "US",
    settle_ms: int = 8000,
) -> list[dict[str, Any]]:
    """Search the public LinkedIn Ad Library and return AdRecord-shaped rows."""
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:  # pragma: no cover - environment guard
        raise LiveFetchError("playwright not installed") from exc

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            ctx = await browser.new_context(
                user_agent=_UA, locale="en-US", viewport={"width": 1440, "height": 1200}
            )
            page = await ctx.new_page()
            await page.goto(
                _search_url(query, country), wait_until="domcontentloaded", timeout=60_000
            )
            # Cards stream in after first paint; no stable selector to await on.
            await page.wait_for_timeout(settle_ms)
            cards = await page.evaluate(_EXTRACT_JS, max(int(limit), 0))
        except Exception as exc:  # noqa: BLE001 - a scrape fails in many ways
            raise LiveFetchError(f"linkedin scrape failed: {exc}") from exc
        finally:
            await browser.close()

    rows = [row for card in cards if (row := _to_row(card)) is not None]
    if not rows:
        raise LiveFetchError("no linkedin ad cards found")
    return rows[:limit]


if __name__ == "__main__":
    sample = {
        "id": "123",
        "text": "Notion\nPromoted\nTransform the way you work. Get a Free Notion Trial.\nView details",
        "img": "https://media.licdn.com/x.png",
        "detail": "/ad-library/detail/123",
    }
    row = _to_row(sample)
    assert row["advertiser"] == "Notion", row
    assert row["ad_id"] == "123"
    assert "Transform the way you work" in row["text"]
    assert row["landing_url"].endswith("/ad-library/detail/123")
    assert _to_row({"id": None}) is None

    ads = asyncio.run(fetch_linkedin_ads("Notion", limit=5))
    assert ads and all(a["platform"] == PLATFORM and a["ad_id"] for a in ads)
    print(f"ok: {len(ads)} live linkedin ads, first advertiser={ads[0]['advertiser']!r}")
