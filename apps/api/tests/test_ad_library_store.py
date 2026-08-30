"""Tests for the ad-library layer of the discovery spy store.

Covers the additive SQLite migration, save/unsave idempotency, board filtering,
every sort mode, runtime_days derivation, and the competitor union. Each test gets
its own tmp_path SQLite via DISCOVERY_SPY_DB_URL so no shared/seed DB is touched.
"""

import sqlite3
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select

from app.discovery.find import store


@pytest.fixture()
def spy_db(tmp_path, monkeypatch):
    monkeypatch.setenv("DISCOVERY_SPY_DB_URL", f"sqlite:///{tmp_path / 'spy.db'}")
    return tmp_path / "spy.db"


AD = {
    "ad_id": "meta-1",
    "platform": "meta",
    "advertiser": "Supabase",
    "title": "Stop configuring Kubernetes",
    "body": "Build production apps fast",
    "cta": "Learn more",
    "landing_url": "https://www.supabase.com/pricing",
    "media_urls": ["https://cdn.example/1.jpg"],
    "score": 78.4,
    "tier": "high_conf",
    "variant_count": 6,
}


def _seed(**overrides):
    """Insert one ad, then force its stored timestamps so runtime/sort are deterministic."""
    dates = {
        "first_seen_at": overrides.pop("first_seen_at", None),
        "last_seen_at": overrides.pop("last_seen_at", None),
    }
    row, created = store.upsert_ad(dict(AD, **overrides))
    if any(dates.values()):
        store._engine_for(store._db_url())
        with store._sessionmakers[store._db_url()]() as db:
            stored = db.scalars(select(store.SpyAdRow).where(store.SpyAdRow.id == row.id)).one()
            for name, value in dates.items():
                if value is not None:
                    setattr(stored, name, value)
            db.commit()
    return row, created


def test_additive_migration_adds_columns_to_preexisting_table(spy_db, monkeypatch):
    # A pre-1.x table: the original column set only, created outside SQLAlchemy.
    conn = sqlite3.connect(spy_db)
    conn.execute(
        """
        CREATE TABLE discovery_spy_ads (
            id INTEGER NOT NULL PRIMARY KEY,
            workspace_id INTEGER NOT NULL,
            ad_id VARCHAR(255) NOT NULL,
            persona_tag VARCHAR(64) NOT NULL,
            platform VARCHAR(64),
            competitor VARCHAR(255),
            advertiser VARCHAR(255),
            title VARCHAR,
            body VARCHAR,
            landing_url VARCHAR,
            media_urls JSON,
            raw JSON,
            seen_count INTEGER NOT NULL,
            first_seen_at DATETIME NOT NULL,
            last_seen_at DATETIME NOT NULL
        )
        """
    )
    conn.execute(
        "INSERT INTO discovery_spy_ads (workspace_id, ad_id, persona_tag, advertiser, "
        "seen_count, first_seen_at, last_seen_at) VALUES (0, 'legacy-1', '', 'Old Co', 1, "
        "'2026-08-01 00:00:00', '2026-08-11 00:00:00')"
    )
    conn.commit()
    conn.close()

    store._engines.clear()
    store._sessionmakers.clear()
    store._engine_for(store._db_url())

    cols = {row[1] for row in sqlite3.connect(spy_db).execute("PRAGMA table_info(discovery_spy_ads)")}
    assert {"cta", "score", "tier", "start_date", "variant_count"} <= cols

    # The legacy row survives and reads back through the new projection.
    item = store.get_ad("legacy-1")
    assert item is not None
    assert item["advertiser"] == "Old Co"
    assert item["score"] is None
    assert item["runtime_days"] == 10.0


def test_normalize_reads_ad_record_field_names(spy_db):
    store.upsert_ad(
        {
            "ad_id": "rec-1",
            "platform": "meta",
            "advertiser": "Linear",
            "hook": "Ship faster",
            "text": "Body copy from AdRecord",
            "cta": "Sign up",
            "creative_url": "https://cdn.example/rec.jpg",
            "score": "66.5",
            "tier": "winner",
            "start_date": "2026-05-11T00:00:00",
            "variant_count": "4",
        }
    )

    item = store.get_ad("rec-1")
    assert item["title"] == "Ship faster"
    assert item["body"] == "Body copy from AdRecord"
    assert item["cta"] == "Sign up"
    assert item["creative_url"] == "https://cdn.example/rec.jpg"
    assert item["media_urls"] == ["https://cdn.example/rec.jpg"]
    assert item["score"] == 66.5
    assert item["tier"] == "winner"
    assert item["start_date"] == "2026-05-11T00:00:00"
    assert item["variant_count"] == 4


def test_resync_without_refresh_keeps_the_stale_score(spy_db):
    """Regression guard on the default dedupe contract: empty-only backfill for everything."""
    store.upsert_ad(dict(AD, score=40.0, tier="loser", variant_count=1))
    store.upsert_ad(dict(AD, score=85.0, tier="high_conf", variant_count=9))

    item = store.get_ad("meta-1")
    assert item["score"] == 40.0
    assert item["tier"] == "loser"
    assert item["variant_count"] == 1


def test_refresh_overwrites_the_scoring_signals(spy_db):
    store.upsert_ad(dict(AD, score=40.0, tier="loser", variant_count=1))
    _, created = store.upsert_ad(
        dict(AD, score=85.0, tier="high_conf", variant_count=9, start_date=datetime(2026, 5, 11)),
        refresh=True,
    )

    item = store.get_ad("meta-1")
    assert created is False
    assert item["score"] == 85.0
    assert item["tier"] == "high_conf"
    assert item["variant_count"] == 9
    assert item["start_date"] == "2026-05-11T00:00:00"
    assert item["seen_count"] == 2


def test_refresh_does_not_clobber_text_with_an_empty_incoming_value(spy_db):
    store.upsert_ad(dict(AD))
    store.upsert_ad(
        {"ad_id": "meta-1", "score": 85.0, "tier": "high_conf"},
        refresh=True,
    )

    item = store.get_ad("meta-1")
    assert item["title"] == AD["title"]
    assert item["body"] == AD["body"]
    assert item["cta"] == AD["cta"]
    assert item["landing_url"] == AD["landing_url"]
    assert item["advertiser"] == AD["advertiser"]
    assert item["platform"] == AD["platform"]
    assert item["media_urls"] == AD["media_urls"]
    assert item["score"] == 85.0


def test_refresh_treats_a_missing_signal_as_not_scored_not_as_cleared(spy_db):
    store.upsert_ad(dict(AD))
    store.upsert_ad({"ad_id": "meta-1", "score": 85.0}, refresh=True)

    item = store.get_ad("meta-1")
    assert item["score"] == 85.0
    # tier/variant_count were absent from the incoming payload, so the stored ones stand.
    assert item["tier"] == AD["tier"]
    assert item["variant_count"] == AD["variant_count"]


def test_refresh_on_a_brand_new_ad_is_a_plain_insert(spy_db):
    _, created = store.upsert_ad(dict(AD, ad_id="fresh-1"), refresh=True)

    assert created is True
    assert store.get_ad("fresh-1")["score"] == AD["score"]


def test_upsert_ads_passes_refresh_through(spy_db):
    store.upsert_ads([dict(AD, score=40.0, tier="loser")])
    store.upsert_ads([dict(AD, score=85.0, tier="high_conf")], refresh=True)

    assert store.get_ad("meta-1")["score"] == 85.0

    store.upsert_ads([dict(AD, score=12.0, tier="loser")])
    assert store.get_ad("meta-1")["score"] == 85.0


def test_refresh_is_scoped_to_the_matching_persona_row(spy_db):
    store.upsert_ad(dict(AD, score=40.0), persona_tag="saas")
    store.upsert_ad(dict(AD, score=40.0), persona_tag="dropship")
    store.upsert_ad(dict(AD, score=85.0), persona_tag="saas", refresh=True)

    rows = {row["persona_tag"]: row["score"] for row in store.list_ads()}
    assert rows == {"saas": 85.0, "dropship": 40.0}


def test_item_shape_is_the_contract(spy_db):
    _seed()

    item = store.get_ad("meta-1")
    assert set(item) == {
        "ad_id",
        "platform",
        "advertiser",
        "title",
        "body",
        "cta",
        "landing_url",
        "media_urls",
        "creative_url",
        "score",
        "tier",
        "start_date",
        "first_seen_at",
        "last_seen_at",
        "runtime_days",
        "variant_count",
        "seen_count",
        "saved",
        "boards",
    }
    assert item["creative_url"] == "https://cdn.example/1.jpg"
    assert item["saved"] is False
    assert item["boards"] == []


def test_get_ad_unknown_returns_none(spy_db):
    _seed()
    assert store.get_ad("nope") is None


def test_runtime_days_prefers_start_date(spy_db):
    now = datetime(2026, 8, 27, tzinfo=UTC).replace(tzinfo=None)
    _seed(
        ad_id="with-start",
        start_date=datetime(2026, 5, 11),
        first_seen_at=now - timedelta(days=3),
        last_seen_at=now,
    )

    assert store.get_ad("with-start")["runtime_days"] == 108.0


def test_runtime_days_falls_back_to_first_seen_and_never_goes_negative(spy_db):
    now = datetime(2026, 8, 27)
    _seed(ad_id="no-start", first_seen_at=now - timedelta(days=5), last_seen_at=now)
    # start_date in the future of last_seen_at must clamp to 0, not report negative days.
    _seed(ad_id="bad-start", start_date=now + timedelta(days=30), last_seen_at=now)

    assert store.get_ad("no-start")["runtime_days"] == 5.0
    assert store.get_ad("bad-start")["runtime_days"] == 0.0


def test_save_ad_is_idempotent(spy_db):
    _seed()

    first = store.save_ad("meta-1")
    second = store.save_ad("meta-1", note="second pass")

    assert first["saved"] is True
    assert first["boards"] == ["default"]
    assert second["boards"] == ["default"]
    assert store.list_saved_ads()["total"] == 1


def test_save_ad_across_boards_then_unsave(spy_db):
    _seed()
    store.save_ad("meta-1", board="hooks")
    store.save_ad("meta-1", board="pricing")

    assert store.get_ad("meta-1")["boards"] == ["hooks", "pricing"]
    assert store.unsave_ad("meta-1", board="hooks") is True
    assert store.unsave_ad("meta-1", board="hooks") is False
    assert store.get_ad("meta-1")["boards"] == ["pricing"]


def test_saved_ads_board_filtering_and_counts(spy_db):
    _seed()
    _seed(ad_id="meta-2", title="Second ad")
    store.save_ad("meta-1", board="hooks")
    store.save_ad("meta-2", board="pricing")

    page = store.list_saved_ads()
    assert page["total"] == 2
    assert page["boards"] == [{"board": "hooks", "count": 1}, {"board": "pricing", "count": 1}]

    hooks = store.list_saved_ads(board="hooks")
    assert [item["ad_id"] for item in hooks["items"]] == ["meta-1"]
    # Board counts stay global so the sidebar does not collapse to the active board.
    assert len(hooks["boards"]) == 2


def test_search_board_and_saved_only_filters(spy_db):
    _seed()
    _seed(ad_id="meta-2", title="Second ad")
    store.save_ad("meta-2", board="hooks")

    assert store.search_ads()["total"] == 2
    assert [i["ad_id"] for i in store.search_ads(saved_only=True)["items"]] == ["meta-2"]
    assert [i["ad_id"] for i in store.search_ads(board="hooks")["items"]] == ["meta-2"]
    assert store.search_ads(board="empty-board")["total"] == 0


def test_search_text_platform_and_tier_filters(spy_db):
    _seed()
    _seed(ad_id="tt-1", platform="tiktok", advertiser="Ramp", title="Corporate cards", tier="loser")

    assert [i["ad_id"] for i in store.search_ads(q="kubernetes")["items"]] == ["meta-1"]
    assert [i["ad_id"] for i in store.search_ads(q="ramp")["items"]] == ["tt-1"]
    assert [i["ad_id"] for i in store.search_ads(platform="tiktok")["items"]] == ["tt-1"]
    assert [i["ad_id"] for i in store.search_ads(tier="high_conf")["items"]] == ["meta-1"]
    assert [i["ad_id"] for i in store.search_ads(competitor="supabase")["items"]] == ["meta-1"]


def test_search_sort_modes(spy_db):
    now = datetime(2026, 8, 27)
    _seed(
        ad_id="a",
        score=40.0,
        variant_count=1,
        first_seen_at=now - timedelta(days=30),
        last_seen_at=now - timedelta(days=2),
    )
    _seed(
        ad_id="b",
        score=90.0,
        variant_count=9,
        first_seen_at=now - timedelta(days=1),
        last_seen_at=now,
    )

    order = lambda page: [i["ad_id"] for i in page["items"]]  # noqa: E731

    assert order(store.search_ads(sort="recent")) == ["b", "a"]
    assert order(store.search_ads(sort="score")) == ["b", "a"]
    assert order(store.search_ads(sort="runtime")) == ["a", "b"]
    assert order(store.search_ads(sort="variants")) == ["b", "a"]
    # Unknown sort degrades to "recent" rather than raising.
    assert order(store.search_ads(sort="bogus")) == ["b", "a"]


def test_search_min_runtime_days_and_pagination(spy_db):
    now = datetime(2026, 8, 27)
    _seed(ad_id="old", first_seen_at=now - timedelta(days=30), last_seen_at=now)
    _seed(ad_id="new", first_seen_at=now - timedelta(days=1), last_seen_at=now)

    assert [i["ad_id"] for i in store.search_ads(min_runtime_days=10)["items"]] == ["old"]

    page = store.search_ads(sort="runtime", limit=1, offset=1)
    assert page["total"] == 2
    assert [i["ad_id"] for i in page["items"]] == ["new"]


def test_search_dedupes_the_same_ad_across_personas(spy_db):
    store.upsert_ad(dict(AD), persona_tag="saas")
    store.upsert_ad(dict(AD), persona_tag="dropship")

    page = store.search_ads()
    assert page["total"] == 1
    assert page["items"][0]["ad_id"] == "meta-1"


def test_competitor_union_of_tracked_and_observed(spy_db):
    now = datetime(2026, 8, 27)
    _seed(last_seen_at=now)
    _seed(ad_id="meta-2", score=60.0, tier="winner", last_seen_at=now - timedelta(days=1))
    store.track_competitor("Ramp", platform="tiktok", domain="ramp.com")

    roster = store.list_competitors()
    by_name = {entry["name"]: entry for entry in roster}

    observed = by_name["Supabase"]
    assert observed["tracked"] is False
    assert observed["ad_count"] == 2
    assert observed["avg_score"] == 69.2
    assert observed["top_tier"] == "high_conf"
    assert observed["domain"] == "supabase.com"
    assert observed["last_seen_at"] == now.isoformat()

    tracked = by_name["Ramp"]
    assert tracked["tracked"] is True
    assert tracked["ad_count"] == 0
    assert tracked["avg_score"] is None
    assert tracked["tracked_at"] is not None
    assert tracked["last_synced_at"] is None
    # Most ads first.
    assert [entry["name"] for entry in roster] == ["Supabase", "Ramp"]


def test_competitor_shape_is_the_contract(spy_db):
    _seed()
    store.track_competitor("Ramp")

    for entry in store.list_competitors():
        assert set(entry) == {
            "name",
            "platform",
            "domain",
            "tracked",
            "ad_count",
            "avg_score",
            "top_tier",
            "last_seen_at",
            "tracked_at",
            "last_synced_at",
        }


def test_mark_competitor_synced_stamps_last_synced_at(spy_db):
    store.track_competitor("Ramp")
    assert store.list_competitors()[0]["last_synced_at"] is None

    assert store.mark_competitor_synced("ramp") is True

    entry = store.list_competitors()[0]
    assert entry["last_synced_at"] is not None
    assert datetime.fromisoformat(entry["last_synced_at"]) > datetime.fromisoformat(
        entry["tracked_at"]
    ) - timedelta(seconds=1)


def test_mark_competitor_synced_advances_on_each_sync(spy_db):
    store.track_competitor("Ramp")
    store.mark_competitor_synced("Ramp")
    first = store.list_competitors()[0]["last_synced_at"]

    store.mark_competitor_synced("Ramp")
    second = store.list_competitors()[0]["last_synced_at"]

    assert second >= first


def test_mark_competitor_synced_false_when_not_tracked(spy_db):
    # Observed in the spy DB but never tracked, so there is no row to stamp.
    _seed()
    assert store.mark_competitor_synced("Supabase") is False
    assert store.mark_competitor_synced("Nobody") is False
    assert store.list_competitors()[0]["last_synced_at"] is None


def test_mark_competitor_synced_is_workspace_scoped(spy_db):
    store.track_competitor("Ramp", workspace_id=1)

    assert store.mark_competitor_synced("Ramp", workspace_id=2) is False
    assert store.mark_competitor_synced("Ramp", workspace_id=1) is True
    assert store.list_competitors(workspace_id=1)[0]["last_synced_at"] is not None


def test_untracking_then_retracking_clears_the_sync_stamp(spy_db):
    store.track_competitor("Ramp")
    store.mark_competitor_synced("Ramp")
    store.untrack_competitor("Ramp")
    store.track_competitor("Ramp")

    assert store.list_competitors()[0]["last_synced_at"] is None


def test_tracking_an_observed_competitor_merges_into_one_entry(spy_db):
    _seed()
    entry = store.track_competitor("supabase")

    roster = store.list_competitors()
    assert len(roster) == 1
    assert entry["tracked"] is True
    assert entry["ad_count"] == 1
    assert roster[0]["name"] == "supabase"


def test_track_competitor_is_idempotent_and_backfills(spy_db):
    store.track_competitor("Ramp")
    store.track_competitor("Ramp", platform="meta", domain="ramp.com")

    roster = store.list_competitors()
    assert len(roster) == 1
    assert roster[0]["platform"] == "meta"
    assert roster[0]["domain"] == "ramp.com"


def test_untrack_competitor(spy_db):
    store.track_competitor("Ramp")

    assert store.untrack_competitor("ramp") is True
    assert store.untrack_competitor("ramp") is False
    assert store.list_competitors() == []


def test_workspace_scoping_of_saves_and_tracking(spy_db):
    _seed()
    store.save_ad("meta-1", workspace_id=1)
    store.track_competitor("Ramp", workspace_id=1)

    assert store.list_saved_ads(workspace_id=1)["total"] == 1
    assert store.list_saved_ads(workspace_id=2)["total"] == 0
    # The ad itself lives in workspace 0, so only that workspace sees the advertiser.
    assert [e["name"] for e in store.list_competitors()] == ["Supabase"]
    assert [e["name"] for e in store.list_competitors(workspace_id=1)] == ["Ramp"]
    assert store.list_competitors(workspace_id=2) == []
    assert store.get_ad("meta-1")["saved"] is False


def test_save_ad_requires_an_ad_id(spy_db):
    with pytest.raises(ValueError):
        store.save_ad("  ")
    with pytest.raises(ValueError):
        store.track_competitor("  ")
