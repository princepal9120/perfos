"""Live Google Ads Transparency Center collector.

Two public RPCs behind the Transparency Center UI, called in sequence:

    SearchService/SearchSuggestions  query        -> advertisers (+ ad counts)
    SearchService/SearchCreatives    advertiserId -> creatives (+ first/last shown)

Both are same-origin POSTs that need the page's cookies, so they are issued from
inside a Playwright page rather than a bare HTTP client. Request and response
field names are protobuf indices, not words — the mapping is documented inline
because there is no published schema.

Read-only: this reads the same public pages a person can open. No login, no API
key, no writes.
"""

from __future__ import annotations

import asyncio
import json
import re
from datetime import UTC, datetime
from typing import Any

PLATFORM = "google"
_ORIGIN = "https://adstransparency.google.com"
_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

# Region codes are 2000 + the ISO-3166 numeric country code (US 840 -> 2840).
_ISO_NUMERIC = {"US": 840, "GB": 826, "CA": 124, "AU": 36, "IN": 356, "DE": 276, "FR": 250}
_DEFAULT_REGION = 2840

_IMG_SRC = re.compile(r'src\s*=\s*"([^"]+)"')


class LiveFetchError(RuntimeError):
    """Live collection failed; callers fall back to fixtures."""


def region_code(country: str) -> int:
    iso = _ISO_NUMERIC.get((country or "US").upper())
    return 2000 + iso if iso else _DEFAULT_REGION


_RPC_JS = """
async ({query, region, limit}) => {
  const post = async (method, payload) => {
    const body = new URLSearchParams();
    body.set('f.req', JSON.stringify(payload));
    const r = await fetch(`/anji/_/rpc/SearchService/${method}?authuser=`, {
      method: 'POST',
      headers: {'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      body: body.toString(),
    });
    if (!r.ok) throw new Error(method + ' ' + r.status);
    return JSON.parse(await r.text());
  };

  // 1 = query text, 4 = [region]. Response 1[].1 = {1: name, 2: advertiserId, 3: region}
  const sugg = await post('SearchSuggestions',
    {"1": query, "2": 10, "3": 10, "4": [region], "5": {"1": 1}});
  const advertisers = (sugg["1"] || [])
    .map(e => e["1"])
    .filter(a => a && a["2"])
    .map(a => ({id: a["2"], name: a["1"], region: a["3"]}));
  if (!advertisers.length) return {advertisers: [], creatives: []};

  // 3.8 = [region], 3.13.1 = [advertiserId], 2 = page size.
  const creatives = [];
  for (const adv of advertisers.slice(0, 3)) {
    if (creatives.length >= limit) break;
    let page;
    try {
      page = await post('SearchCreatives', {
        "2": Math.min(limit, 40),
        "3": {"8": [region], "12": {"1": "", "2": true}, "13": {"1": [adv.id]}},
        "7": {"1": 1, "2": 0, "3": region},
      });
    } catch (e) { continue; }
    for (const c of (page["1"] || [])) {
      creatives.push({...c, _advertiser: adv.name});
      if (creatives.length >= limit) break;
    }
  }
  return {advertisers, creatives};
}
"""


def _epoch(value: Any) -> datetime | None:
    try:
        return datetime.fromtimestamp(int(value), tz=UTC).replace(tzinfo=None)
    except (TypeError, ValueError, OSError):
        return None


def _creative_url(node: dict[str, Any]) -> str | None:
    """Creative payload is either an inline <img> tag or an iframe preview URL."""
    fmt = node.get("3") or {}
    inline = ((fmt.get("3") or {}).get("2")) or ""
    if inline:
        found = _IMG_SRC.search(inline)
        if found:
            return found.group(1)
    iframe = (fmt.get("1") or {}).get("4")
    return str(iframe) if iframe else None


def _to_row(node: dict[str, Any]) -> dict[str, Any] | None:
    """One SearchCreatives entry -> AdRecord shape.

    Indices: 2 = creative id, 6.1 = first shown epoch, 7.1 = last shown epoch,
    12 = advertiser name.
    """
    creative_id = node.get("2")
    if not creative_id:
        return None

    advertiser = node.get("12") or node.get("_advertiser") or "unknown"
    first_shown = _epoch((node.get("6") or {}).get("1"))

    return {
        "platform": PLATFORM,
        "advertiser": str(advertiser),
        "ad_id": str(creative_id),
        "creative_url": _creative_url(node),
        "landing_url": None,
        # The Transparency Center publishes no spend or impressions for
        # commercial ads, only the shown-date window.
        "spend_estimate": None,
        "impressions": None,
        "variant_count": None,
        "start_date": first_shown,
        "text": None,
        "hook": str(advertiser),
        "cta": None,
    }


async def fetch_google_ads(
    query: str,
    *,
    limit: int = 30,
    country: str = "US",
    settle_ms: int = 4000,
) -> list[dict[str, Any]]:
    """Search the public Ads Transparency Center and return AdRecord-shaped rows."""
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:  # pragma: no cover - environment guard
        raise LiveFetchError("playwright not installed") from exc

    region = region_code(country)
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            ctx = await browser.new_context(user_agent=_UA, locale="en-US")
            page = await ctx.new_page()
            # Load the origin first: the RPCs are same-origin and cookie-gated.
            await page.goto(
                f"{_ORIGIN}/?region={country.upper()}",
                wait_until="domcontentloaded",
                timeout=60_000,
            )
            await page.wait_for_timeout(settle_ms)
            result = await page.evaluate(
                _RPC_JS, {"query": query, "region": region, "limit": max(int(limit), 0)}
            )
        except Exception as exc:  # noqa: BLE001 - a scrape fails in many ways
            raise LiveFetchError(f"google transparency call failed: {exc}") from exc
        finally:
            await browser.close()

    rows = [row for node in (result.get("creatives") or []) if (row := _to_row(node))]
    if not rows:
        raise LiveFetchError(f"no google creatives for {query!r}")
    return rows[:limit]


if __name__ == "__main__":
    assert region_code("US") == 2840
    assert region_code("IN") == 2356
    assert region_code("zz") == _DEFAULT_REGION

    node = json.loads(
        '{"1":"AR1","2":"CR9","3":{"3":{"2":"<img src=\\"https://cdn.test/a.png\\" '
        'height=\\"600\\">"}},"6":{"1":"1784718667"},"12":"Notion Labs, Inc"}'
    )
    row = _to_row(node)
    assert row["ad_id"] == "CR9" and row["advertiser"] == "Notion Labs, Inc"
    assert row["creative_url"] == "https://cdn.test/a.png"
    assert row["start_date"] is not None
    assert _to_row({"1": "AR1"}) is None

    ads = asyncio.run(fetch_google_ads("Notion", limit=5))
    assert ads and all(a["platform"] == PLATFORM and a["ad_id"] for a in ads)
    dated = sum(1 for a in ads if a["start_date"])
    print(f"ok: {len(ads)} live google ads ({dated} dated), first={ads[0]['advertiser']!r}")
