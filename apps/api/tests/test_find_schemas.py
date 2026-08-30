"""Tests for discovery/find/schemas.py — fixed-field contract for spy adapters."""

from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from app.discovery.find.schemas import CreativeAsset, SpyAd


def _spy_ad(**overrides):
    data = {
        "source": "meta_ads_collector",
        "platform": "meta",
        "platform_ad_id": "123",
        "advertiser": {"name": "Acme"},
        "creatives": [{"asset_type": "video", "url": "https://cdn/x.mp4"}],
        "first_seen_at": datetime(2026, 1, 1, tzinfo=UTC),
        "countries": ["US"],
    }
    data.update(overrides)
    return SpyAd.model_validate(data)


def test_spy_ad_roundtrip_with_defaults():
    ad = _spy_ad()
    assert ad.advertiser.name == "Acme"
    assert ad.creatives[0].asset_type == "video"
    # defaults applied
    assert ad.body == ""
    assert ad.is_active is True
    assert ad.persona_tag is None
    assert ad.raw_json is None


def test_platform_and_asset_type_are_fixed_enums():
    with pytest.raises(ValidationError):
        _spy_ad(platform="pinterest")
    with pytest.raises(ValidationError):
        CreativeAsset(asset_type="gif", url="x")


def test_extra_fields_ignored_for_adapter_tolerance():
    ad = _spy_ad(some_future_library_field="whatever")
    assert ad.platform_ad_id == "123"


def test_model_dump_shape_stable():
    payload = _spy_ad().model_dump()
    expected_keys = {
        "source", "platform", "platform_ad_id", "advertiser", "body", "headline",
        "cta", "landing_url", "creatives", "first_seen_at", "last_seen_at",
        "is_active", "countries", "persona_tag", "raw_json",
    }
    assert set(payload) == expected_keys
