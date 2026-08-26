"""A10 — Google Ads Transparency adapter tests (pure normalization + mock search)."""

import pytest

from app.discovery.find.google_ads_transparency import (
    SOURCE_PLATFORM,
    _MOCK_RECORDS,
    normalize_transparency_record,
    normalize_transparency_ad,
    search_ads,
)

RAW = {
    "creative_id": "CR-1",
    "advertiser_id": "AR-1",
    "advertiser_name": "Acme Labs",
    "format": "Video",
    "headline": "Stop guessing",
    "description": "Know your ROAS.",
    "destination_url": "https://acme.example.com/x",
    "media_url": "https://cdn.example.com/a.mp4",
    "regions": ["US", "GB"],
    "first_shown": "2026-06-02",
    "last_shown": "2026-08-21",
}


def test_normalize_maps_all_fields() -> None:
    kwargs = normalize_transparency_record(RAW)
    assert kwargs["source"] == SOURCE_PLATFORM
    assert kwargs["platform"] == "google"
    assert kwargs["platform_ad_id"] == "CR-1"
    assert kwargs["advertiser"] == {
        "name": "Acme Labs",
        "platform_page_id": "AR-1",
        "website_domain": None,
    }
    assert kwargs["body"] == "Know your ROAS."
    assert kwargs["headline"] == "Stop guessing"
    assert kwargs["creatives"] == [
        {"asset_type": "video", "url": "https://cdn.example.com/a.mp4"}
    ]
    assert kwargs["landing_url"] == "https://acme.example.com/x"
    assert kwargs["countries"] == ["US", "GB"]
    assert kwargs["first_seen_at"] == "2026-06-02"
    assert kwargs["last_seen_at"] == "2026-08-21"
    assert kwargs["raw_json"] is RAW


def test_normalize_tolerates_missing_optionals() -> None:
    kwargs = normalize_transparency_record({"creative_id": "CR-2"})
    assert kwargs["platform_ad_id"] == "CR-2"
    assert kwargs["headline"] is None
    assert kwargs["body"] == ""
    assert kwargs["creatives"] == []
    assert kwargs["landing_url"] is None
    assert kwargs["countries"] == []
    assert kwargs["first_seen_at"] is None
    assert kwargs["last_seen_at"] is None


def test_normalize_text_ad_has_no_creative_asset() -> None:
    kwargs = normalize_transparency_record(
        {"creative_id": "CR-3", "format": "text", "media_url": "ignored"}
    )
    assert kwargs["creatives"] == []


def test_normalize_builds_spyad() -> None:
    pytest.importorskip("app.discovery.find.schemas")
    ad = normalize_transparency_ad(RAW)
    assert ad.platform_ad_id == "CR-1"
    assert ad.source == "google_ads"
    assert ad.platform == "google"
    assert ad.advertiser.name == "Acme Labs"


def test_search_mock_filters_and_limits() -> None:
    ads = search_ads("acme labs", limit=10)
    assert len(ads) == 2
    assert all(a.advertiser.name == "Acme Labs" for a in ads)
    assert search_ads("glass skin")[0].platform_ad_id == "CR-GOOG-003"
    # deterministic
    again = [a.platform_ad_id for a in search_ads("acme")]
    assert again == [a.platform_ad_id for a in search_ads("ACME")]


def test_search_country_filter_and_empty() -> None:
    us_only = search_ads("nimbus", country="us")
    assert [a.platform_ad_id for a in us_only] == ["CR-GOOG-003"]
    assert search_ads("nonexistent-brand-xyz") == []
    assert search_ads("acme", limit=0) == []


def test_mock_fixture_count_is_stable() -> None:
    assert len(_MOCK_RECORDS) == 3
