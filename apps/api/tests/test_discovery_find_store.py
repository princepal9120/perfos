"""Tests for discovery find store (agent A14): SQLite store + dedupe.

Dedupe key is (workspace_id, ad_id, persona_tag); each test uses its own
tmp_path SQLite via DISCOVERY_SPY_DB_URL so no shared/seed DB is touched.
"""

from types import SimpleNamespace

import pytest

from app.discovery.find import store


@pytest.fixture()
def spy_db(tmp_path, monkeypatch):
    monkeypatch.setenv("DISCOVERY_SPY_DB_URL", f"sqlite:///{tmp_path / 'spy.db'}")
    return tmp_path / "spy.db"


AD = {
    "ad_id": "meta-123",
    "platform": "meta_ads_library",
    "competitor": "Acme",
    "advertiser": "Acme Inc",
    "title": "Winning hook",
    "body": "50% off today",
    "landing_url": "https://acme.example",
    "media_urls": ["https://cdn.example/v.mp4"],
}


def test_dedupe_same_ad_and_persona(spy_db):
    row1, created1 = store.upsert_ad(AD, persona_tag="saas")
    row2, created2 = store.upsert_ad(dict(AD), persona_tag="saas")

    assert created1 and not created2
    assert row1.id == row2.id
    assert row2.seen_count == 2
    assert len(store.list_ads()) == 1
    assert store.list_ads()[0]["seen_count"] == 2


def test_same_ad_different_persona_is_separate_row(spy_db):
    _, created_a = store.upsert_ad(AD, persona_tag="saas")
    _, created_b = store.upsert_ad(AD, persona_tag="dropship")

    assert created_a and created_b
    rows = store.list_ads()
    assert {r["persona_tag"] for r in rows} == {"saas", "dropship"}
    assert all(r["ad_id"] == "meta-123" for r in rows)


def test_workspace_scoping(spy_db):
    store.upsert_ad(AD, workspace_id=1, persona_tag="saas")
    store.upsert_ad(AD, workspace_id=2, persona_tag="saas")

    assert len(store.list_ads(workspace_id=1)) == 1
    assert len(store.list_ads(workspace_id=2)) == 1


def test_backfill_empty_fields_on_duplicate(spy_db):
    sparse = {"ad_id": "tt-9", "competitor": "Beta", "platform": "tiktok"}
    full = dict(sparse, body="new copy discovered later", media_urls=["b.mp4"])

    store.upsert_ad(sparse, persona_tag="beauty")
    row, created = store.upsert_ad(full, persona_tag="beauty")

    assert not created
    assert row.body == "new copy discovered later"
    assert row.media_urls == ["b.mp4"]
    assert row.competitor == "Beta"


def test_accepts_pydantic_style_object(spy_db):
    ad = SimpleNamespace(ad_id="g-77", platform="google", text="obj body")
    row, created = store.upsert_ad(ad, persona_tag="b2b")

    assert created
    stored = store.list_ads(persona_tag="b2b")[0]
    assert stored["ad_id"] == "g-77"
    assert stored["body"] == "obj body"
    assert stored["media_urls"] == []


def test_bulk_upsert_idempotent(spy_db):
    res1 = store.upsert_ads([dict(AD), dict(AD)], persona_tag="saas")
    res2 = store.upsert_ads([dict(AD)], persona_tag="saas")

    # Both share ad_id "meta-123" -> the second in the batch is a dedupe (no new row).
    assert [c for _, c in res1] == [True, False]
    assert res2[0][1] is False
    assert len(store.list_ads()) == 1


def test_missing_ad_id_raises(spy_db):
    with pytest.raises(ValueError):
        store.upsert_ad({"platform": "meta"}, persona_tag="saas")


def test_filters_by_competitor(spy_db):
    store.upsert_ad(AD, persona_tag="saas")
    store.upsert_ad(dict(AD, ad_id="x-1", competitor="Other"), persona_tag="saas")

    assert len(store.list_ads(competitor="Acme")) == 1
    assert len(store.list_ads(competitor="Other")) == 1
