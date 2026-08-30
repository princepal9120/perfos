"""Multi-platform public ad-library bridge tests — no network."""

import io
import urllib.parse

import pytest

from app.discovery.find.platform_collectors import (
    collect_google_ads,
    collect_linkedin_ads,
    collect_x_ads,
)
from app.discovery.find.public_library_collector import (
    collect_public_ads,
    normalize_public_ad,
)
from app.discovery.schemas import AdRecord


def test_normalize_tiktok_creative_center_shape():
    row = normalize_public_ad(
        "tiktok",
        {
            "id": "7559593149158670352",
            "brand_name": "Starbucks",
            "ad_title": "apple is back",
            "landing_page": "https://starbucks.example.com/fall",
            "video_info": {
                "video_url": {"720p": "https://cdn.example.com/fall.mp4"}
            },
        },
    )
    ad = AdRecord(**row)
    assert ad.platform == "tiktok"
    assert ad.advertiser == "Starbucks"
    assert ad.creative_url == "https://cdn.example.com/fall.mp4"
    assert ad.hook == "apple is back"


def test_normalize_google_transparency_shape():
    row = normalize_public_ad(
        "google",
        {
            "creativeId": "CR-1",
            "advertiserName": "Acme Labs",
            "previewUrl": "https://cdn.example.com/ad.png",
            "creativeUrl": "https://adstransparency.google.com/creative/CR-1",
            "firstShownAt": "2026-08-01T00:00:00Z",
        },
    )
    ad = AdRecord(**row)
    assert ad.platform == "google"
    assert ad.ad_id == "CR-1"
    assert ad.start_date is not None


@pytest.mark.asyncio
async def test_configured_json_bridge_sends_query_country_limit_and_token(monkeypatch):
    seen = {}

    class Response(io.BytesIO):
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            self.close()

    def fake_open(request, timeout):
        seen["url"] = request.full_url
        seen["authorization"] = request.get_header("Authorization")
        seen["timeout"] = timeout
        return Response(
            b'{"data":{"materials":[{"id":"TT-1","brand_name":"Acme",'
            b'"ad_title":"Know real ROAS"}]}}'
        )

    monkeypatch.setenv("PERFOS_LIVE_DISCOVERY", "1")
    monkeypatch.setenv("PERFOS_TIKTOK_AD_LIBRARY_URL", "https://collector.test/ads")
    monkeypatch.setenv("PERFOS_TIKTOK_AD_LIBRARY_TOKEN", "secret")
    monkeypatch.setattr("urllib.request.urlopen", fake_open)

    rows = await collect_public_ads(
        "tiktok", page_size=7, filters={"query": "acme", "country": "IN"}, fallback=[]
    )
    query = urllib.parse.parse_qs(urllib.parse.urlparse(seen["url"]).query)
    assert query == {"query": ["acme"], "country": ["IN"], "limit": ["7"]}
    assert seen["authorization"] == "Bearer secret"
    assert rows[0]["ad_id"] == "TT-1"


@pytest.mark.parametrize(
    ("collector", "platform"),
    [
        (collect_google_ads, "google"),
        (collect_linkedin_ads, "linkedin"),
        (collect_x_ads, "x"),
    ],
)
@pytest.mark.asyncio
async def test_platform_collectors_have_canonical_fixture_fallback(
    collector, platform, monkeypatch
):
    monkeypatch.setenv("PERFOS_LIVE_DISCOVERY", "0")
    rows = await collector(filters={"query": "Acme"})
    assert rows
    assert all(AdRecord(**row).platform == platform for row in rows)

