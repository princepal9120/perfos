"""FIND collectors — meta_collector + tiktok_collector mock-mode tests."""

from typing import Any

import pytest

from app.discovery.find.meta_collector import collect_meta_ads
from app.discovery.find.tiktok_collector import collect_tiktok_ads

REQUIRED_KEYS = {
    "platform",
    "advertiser",
    "ad_id",
    "creative_url",
    "spend_estimate",
    "impressions",
    "start_date",
    "text",
    "hook",
    "cta",
}

COLLECTORS = [
    collect_meta_ads,
    collect_tiktok_ads,
]


@pytest.mark.parametrize("collect", COLLECTORS)
@pytest.mark.asyncio
async def test_collector_returns_at_least_one_ad(collect) -> None:
    ads = await collect()
    assert isinstance(ads, list)
    assert len(ads) >= 1


@pytest.mark.parametrize("collect", COLLECTORS)
@pytest.mark.asyncio
async def test_ads_have_required_schema_keys(collect) -> None:
    for ad in await collect():
        assert REQUIRED_KEYS <= set(ad), f"missing keys: {REQUIRED_KEYS - set(ad)}"


@pytest.mark.parametrize("collect", COLLECTORS)
@pytest.mark.asyncio
async def test_rows_are_well_formed(collect, request) -> None:
    expected_platform = "meta" if "meta" in request.node.name else "tiktok"
    for ad in await collect():
        assert ad["platform"] == expected_platform
        assert isinstance(ad["spend_estimate"], (int, float))
        assert isinstance(ad["impressions"], int)
        assert all(isinstance(ad[k], str) and ad[k] for k in ("advertiser", "ad_id", "creative_url", "text"))


@pytest.mark.parametrize("collect", COLLECTORS)
@pytest.mark.asyncio
async def test_query_filter_and_page_size(collect) -> None:
    filtered = await collect(filters={"query": "nimbus"})
    assert len(filtered) >= 1
    assert all("nimbus" in f'{a["advertiser"]} {a["text"]}'.lower() for a in filtered)
    assert len(await collect(page_size=2)) <= 2
