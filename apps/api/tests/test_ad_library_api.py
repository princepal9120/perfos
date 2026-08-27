"""Ad Library API surface: search, filters, saved boards, competitors — no network."""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_token
from app.main import app

_TIERS = {"high_conf", "winner", "emerging", "loser"}


@pytest.fixture(autouse=True)
def _isolated_spy_db(monkeypatch, tmp_path):
    """Own spy DB file per test, and never reach the live ad library."""
    monkeypatch.setenv("DISCOVERY_SPY_DB_URL", f"sqlite:///{tmp_path / 'spy.db'}")
    monkeypatch.setenv("PERFOS_LIVE_DISCOVERY", "0")


@pytest.fixture
def client():
    with TestClient(app) as c:
        c.headers.update({"Authorization": f"Bearer {create_token(1)}"})
        yield c


@pytest.fixture
def fake_collectors(monkeypatch):
    """Replace the live collector fan-out with two deterministic rows.

    Start dates are relative so runtime, score and tier stay stable over time.
    """
    from app.routers import ad_library

    now = datetime.now(UTC)

    async def _meta(page_size=20, filters=None):
        return [
            {
                "platform": "meta",
                "advertiser": "Supabase",
                "ad_id": "AL-SUPA-001",
                "creative_url": "https://cdn.example.com/supabase/hero.jpg",
                "landing_url": "https://supabase.example.com/pricing",
                "variant_count": 6,
                "start_date": (now - timedelta(days=120)).isoformat(),
                "text": "Build production apps with Auth, Database and Storage.",
                "hook": "Stop configuring Kubernetes",
                "cta": "Learn more",
            }
        ]

    async def _tiktok(page_size=20, filters=None):
        return [
            {
                "platform": "tiktok",
                "advertiser": "Nimbus Skin",
                "ad_id": "AL-NIMB-002",
                "creative_url": "https://cdn.example.com/nimbus/glass.jpg",
                "variant_count": 2,
                "start_date": (now - timedelta(days=5)).isoformat(),
                "text": "Glass skin in 14 days.",
                "hook": "Glass skin in 14 days",
                "cta": "Shop now",
            }
        ]

    monkeypatch.setattr(ad_library, "_COLLECTORS", {"meta": _meta, "tiktok": _tiktok})


@pytest.fixture
def mutable_collector(monkeypatch):
    """A one-ad meta collector whose row the test rewrites between calls.

    A single-ad batch pins reach and concentration at 1.0, so the score moves
    only with runtime — which makes a re-score exactly predictable.
    """
    from app.routers import ad_library

    row = {
        "platform": "meta",
        "advertiser": "Supabase",
        "ad_id": "AL-RESCORE-001",
        "hook": "Stop configuring Kubernetes",
        "variant_count": 1,
    }

    async def _meta(page_size=20, filters=None):
        return [dict(row)]

    monkeypatch.setattr(ad_library, "_COLLECTORS", {"meta": _meta})
    return row


def _age_days(days: int) -> str:
    return (datetime.now(UTC) - timedelta(days=days)).isoformat()


def _search(client, **body) -> dict:
    payload = {"query": "supabase", **body}
    response = client.post("/api/ad-library/search", json=payload)
    assert response.status_code == 200, response.text
    return response.json()


def test_every_ad_library_route_is_mounted(client):
    paths = client.get("/openapi.json").json()["paths"]
    assert {
        "/api/ad-library",
        "/api/ad-library/search",
        "/api/ad-library/saved",
        "/api/ad-library/saved/{ad_id}",
        "/api/ad-library/competitors",
        "/api/ad-library/competitors/{name}",
        "/api/ad-library/competitors/{name}/sync",
        "/api/ad-library/{ad_id}",
    } <= set(paths)


def test_search_scores_and_persists_collected_ads(client, fake_collectors):
    body = _search(client)
    assert body["total"] == 2
    item = next(i for i in body["items"] if i["ad_id"] == "AL-SUPA-001")
    assert item["platform"] == "meta"
    assert item["advertiser"] == "Supabase"
    assert item["title"] == "Stop configuring Kubernetes"
    assert item["body"].startswith("Build production apps")
    assert item["cta"] == "Learn more"
    assert item["creative_url"] == "https://cdn.example.com/supabase/hero.jpg"
    assert item["landing_url"] == "https://supabase.example.com/pricing"
    assert item["variant_count"] == 6
    assert item["tier"] in _TIERS
    assert item["score"] > 0
    assert item["runtime_days"] > 0
    assert item["saved"] is False


def test_search_can_target_google_linkedin_and_x(client, monkeypatch):
    monkeypatch.setenv("PERFOS_LIVE_DISCOVERY", "0")
    body = _search(client, platforms=["google", "linkedin", "x"])
    assert body["total"] == 3
    assert {item["platform"] for item in body["items"]} == {"google", "linkedin", "x"}


def test_fixture_mode_still_yields_a_landing_url(client):
    """The real (fixture-backed) collectors must fill landing_url too, not just live rows."""
    items = client.post("/api/ad-library/search", json={"query": "glass skin"}).json()["items"]
    assert items
    assert all(i["landing_url"] for i in items)


def test_search_results_are_best_score_first(client, fake_collectors):
    items = _search(client)["items"]
    assert all(a["score"] >= b["score"] for a, b in zip(items, items[1:]))


def test_search_is_idempotent_and_feeds_the_library_listing(client, fake_collectors):
    _search(client)
    _search(client)
    body = client.get("/api/ad-library").json()
    assert body["total"] == 2, "re-searching the same ads must dedupe, not duplicate"
    assert {i["ad_id"] for i in body["items"]} == {"AL-SUPA-001", "AL-NIMB-002"}


def test_ad_library_routes_are_workspace_scoped(client, fake_collectors):
    _search(client)
    client.post("/api/ad-library/saved", json={"ad_id": "AL-SUPA-001"})
    client.post("/api/ad-library/competitors", json={"name": "Supabase"})

    other = TestClient(app)
    other.headers.update({"Authorization": f"Bearer {create_token(2)}"})
    assert other.get("/api/ad-library").json()["total"] == 0
    assert other.get("/api/ad-library/saved").json()["total"] == 0
    assert other.get("/api/ad-library/competitors").json()["items"] == []


def test_search_survives_a_failing_collector(client, monkeypatch):
    """One dead platform must not fail the whole search."""
    from app.routers import ad_library

    async def _boom(page_size=20, filters=None):
        raise RuntimeError("headless browser died")

    async def _ok(page_size=20, filters=None):
        return [
            {
                "platform": "tiktok",
                "advertiser": "Nimbus Skin",
                "ad_id": "AL-NIMB-002",
                "hook": "Glass skin in 14 days",
                "start_date": "2026-05-11",
            }
        ]

    monkeypatch.setattr(ad_library, "_COLLECTORS", {"meta": _boom, "tiktok": _ok})

    body = _search(client)
    assert [i["ad_id"] for i in body["items"]] == ["AL-NIMB-002"]


def test_library_listing_filters_and_sorts(client, fake_collectors):
    _search(client)

    assert client.get("/api/ad-library", params={"platform": "meta"}).json()["total"] == 1
    assert client.get("/api/ad-library", params={"q": "kubernetes"}).json()["total"] == 1
    assert client.get("/api/ad-library", params={"competitor": "Supabase"}).json()["total"] == 1
    assert client.get("/api/ad-library", params={"min_runtime_days": 100}).json()["total"] == 1

    by_score = client.get("/api/ad-library", params={"sort": "score"}).json()["items"]
    assert [i["ad_id"] for i in by_score] == ["AL-SUPA-001", "AL-NIMB-002"]


def test_library_listing_paginates(client, fake_collectors):
    _search(client)
    body = client.get("/api/ad-library", params={"limit": 1, "offset": 1}).json()
    assert body["total"] == 2, "total counts the whole match, not the page"
    assert len(body["items"]) == 1


def test_saved_route_is_not_shadowed_by_the_ad_lookup(client):
    """/ad-library/saved must resolve to the boards payload, not an ad_id lookup."""
    response = client.get("/api/ad-library/saved")
    assert response.status_code == 200, response.text
    assert {"total", "items", "boards"} <= set(response.json())


def test_competitors_route_is_not_shadowed_by_the_ad_lookup(client):
    response = client.get("/api/ad-library/competitors")
    assert response.status_code == 200, response.text
    assert "items" in response.json()


def test_save_then_unsave_an_ad(client, fake_collectors):
    _search(client)

    saved = client.post("/api/ad-library/saved", json={"ad_id": "AL-SUPA-001"}).json()
    assert saved["ad_id"] == "AL-SUPA-001"
    assert saved["saved"] is True

    board = client.get("/api/ad-library/saved").json()
    assert [i["ad_id"] for i in board["items"]] == ["AL-SUPA-001"]
    assert {"board": "default", "count": 1} in board["boards"]

    only_saved = client.get("/api/ad-library", params={"saved_only": True}).json()
    assert [i["ad_id"] for i in only_saved["items"]] == ["AL-SUPA-001"]

    assert client.delete("/api/ad-library/saved/AL-SUPA-001").json() == {"removed": True}
    assert client.get("/api/ad-library/saved").json()["total"] == 0


def test_saving_the_same_ad_twice_is_idempotent(client, fake_collectors):
    _search(client)
    client.post("/api/ad-library/saved", json={"ad_id": "AL-SUPA-001"})
    client.post("/api/ad-library/saved", json={"ad_id": "AL-SUPA-001"})
    assert client.get("/api/ad-library/saved").json()["total"] == 1


def test_saved_ads_are_scoped_to_a_board(client, fake_collectors):
    _search(client)
    client.post("/api/ad-library/saved", json={"ad_id": "AL-SUPA-001", "board": "hooks"})
    client.post("/api/ad-library/saved", json={"ad_id": "AL-NIMB-002", "board": "default"})

    hooks = client.get("/api/ad-library/saved", params={"board": "hooks"}).json()
    assert [i["ad_id"] for i in hooks["items"]] == ["AL-SUPA-001"]
    assert client.get("/api/ad-library/saved").json()["total"] == 2


def test_unsaving_an_ad_that_was_never_saved_reports_false(client):
    assert client.delete("/api/ad-library/saved/nope").json() == {"removed": False}


def test_competitors_union_tracked_rows_and_seen_advertisers(client, fake_collectors):
    _search(client)

    seen = client.get("/api/ad-library/competitors").json()["items"]
    assert {c["name"] for c in seen} == {"Supabase", "Nimbus Skin"}
    assert all(c["tracked"] is False for c in seen), "collected != watchlisted"
    supabase = next(c for c in seen if c["name"] == "Supabase")
    assert supabase["ad_count"] == 1
    assert supabase["avg_score"] > 0
    assert supabase["top_tier"] in _TIERS

    tracked = client.post(
        "/api/ad-library/competitors",
        json={"name": "Supabase", "platform": "meta", "domain": "supabase.com"},
    ).json()
    assert tracked["name"] == "Supabase"
    assert tracked["tracked"] is True
    assert tracked["domain"] == "supabase.com"

    after = client.get("/api/ad-library/competitors").json()["items"]
    assert len(after) == 2, "tracking an already-seen advertiser must not duplicate it"
    assert next(c for c in after if c["name"] == "Supabase")["tracked"] is True


def test_untracking_a_competitor(client):
    client.post("/api/ad-library/competitors", json={"name": "Linear"})
    assert client.delete("/api/ad-library/competitors/Linear").json() == {"removed": True}
    assert client.delete("/api/ad-library/competitors/Linear").json() == {"removed": False}
    assert client.get("/api/ad-library/competitors").json()["items"] == []


def test_competitor_sync_persists_and_reports_new_ads(client, fake_collectors):
    first = client.post("/api/ad-library/competitors/Supabase/sync", json={"limit": 10})
    assert first.status_code == 200, first.text
    body = first.json()
    assert body["added"] == 2
    assert body["total"] == 2
    assert {i["ad_id"] for i in body["items"]} == {"AL-SUPA-001", "AL-NIMB-002"}

    again = client.post("/api/ad-library/competitors/Supabase/sync", json={"limit": 10}).json()
    assert again["added"] == 0, "a re-sync of known ads adds nothing"
    assert again["total"] == 2


def test_competitor_sync_accepts_an_empty_body(client, fake_collectors):
    response = client.post("/api/ad-library/competitors/Supabase/sync")
    assert response.status_code == 200, response.text
    assert response.json()["total"] == 2


@pytest.mark.parametrize("ad_id", ["", "   "])
def test_blank_ad_id_is_a_400_not_a_500(client, ad_id):
    """The store raises ValueError on an empty key; that must not surface as a 500."""
    response = client.post("/api/ad-library/saved", json={"ad_id": ad_id})
    assert response.status_code == 400, response.text


@pytest.mark.parametrize("name", ["", "   "])
def test_blank_competitor_name_is_a_400_not_a_500(client, name):
    response = client.post("/api/ad-library/competitors", json={"name": name})
    assert response.status_code == 400, response.text


def test_blank_competitor_name_on_sync_is_a_400_not_a_500(client):
    response = client.post("/api/ad-library/competitors/%20/sync")
    assert response.status_code == 400, response.text


def test_sync_tracks_a_new_competitor_and_stamps_the_sync(client, fake_collectors):
    """The ordering trap: mark_competitor_synced no-ops unless the row exists first."""
    assert client.get("/api/ad-library/competitors").json()["items"] == []

    competitor = client.post("/api/ad-library/competitors/Supabase/sync").json()["competitor"]
    assert competitor["name"] == "Supabase"
    assert competitor["tracked"] is True, "sync must add a never-seen competitor to the watchlist"
    assert competitor["last_synced_at"], "a first sync must still stamp last_synced_at"

    roster = client.get("/api/ad-library/competitors").json()["items"]
    tracked = next(c for c in roster if c["name"] == "Supabase")
    assert tracked["tracked"] is True
    assert tracked["last_synced_at"] == competitor["last_synced_at"]


def test_syncing_twice_does_not_duplicate_the_watchlist_row(client, fake_collectors):
    client.post("/api/ad-library/competitors/Supabase/sync")
    first = client.get("/api/ad-library/competitors").json()["items"]
    client.post("/api/ad-library/competitors/Supabase/sync")
    second = client.get("/api/ad-library/competitors").json()["items"]

    assert [c["name"] for c in first] == [c["name"] for c in second]
    assert sum(1 for c in second if c["name"] == "Supabase") == 1


def test_sync_keeps_an_already_tracked_competitors_details(client, fake_collectors):
    """Tracking inside sync is idempotent: it must not blank platform/domain."""
    client.post(
        "/api/ad-library/competitors",
        json={"name": "Supabase", "platform": "meta", "domain": "supabase.com"},
    )
    competitor = client.post("/api/ad-library/competitors/Supabase/sync").json()["competitor"]
    assert competitor["domain"] == "supabase.com"
    assert competitor["platform"] == "meta"
    assert competitor["last_synced_at"]


def test_sync_rescores_an_already_stored_ad(client, mutable_collector):
    """The bug this closes: a re-sync used to report the score from the first sighting."""
    mutable_collector["start_date"] = _age_days(5)
    first = client.post("/api/ad-library/competitors/Supabase/sync").json()["items"][0]
    assert first["score"] == pytest.approx(52.22, abs=0.05)
    assert first["tier"] == "emerging"

    # Same ad, observed much later: the re-score must land, not the stale value.
    mutable_collector["start_date"] = _age_days(120)
    second = client.post("/api/ad-library/competitors/Supabase/sync").json()
    assert second["added"] == 0, "already stored, so this is a re-score and not an insert"

    item = second["items"][0]
    assert item["ad_id"] == "AL-RESCORE-001"
    assert item["score"] == pytest.approx(90.0, abs=0.05)
    assert item["tier"] == "high_conf"
    assert item["runtime_days"] > first["runtime_days"]

    stored = client.get("/api/ad-library").json()["items"][0]
    assert stored["score"] == pytest.approx(90.0, abs=0.05), "the re-score must persist"
    assert stored["tier"] == "high_conf"


def test_sync_does_not_blank_copy_it_did_not_re_observe(client, mutable_collector):
    """Refresh replaces scoring signals only; text stays backfill-only."""
    mutable_collector["start_date"] = _age_days(5)
    mutable_collector["text"] = "Build production apps with Auth and Database."
    client.post("/api/ad-library/competitors/Supabase/sync")

    del mutable_collector["text"]
    mutable_collector["start_date"] = _age_days(120)
    item = client.post("/api/ad-library/competitors/Supabase/sync").json()["items"][0]
    assert item["body"] == "Build production apps with Auth and Database."
    assert item["score"] == pytest.approx(90.0, abs=0.05)


def test_refresh_is_visible_despite_a_persona_tagged_copy(client, mutable_collector):
    """The same ad_id exists once per persona_tag and the store returns the freshest copy.

    Refresh only touches the "" row this router writes, so a stale persona-tagged copy
    from a FIND run could in principle mask it — but a sync bumps last_seen_at on our
    row, which is what _freshest_ad orders by, so the re-score is what the API serves.
    """
    from app.discovery.find import store

    store.upsert_ads(
        [
            {
                "ad_id": "AL-RESCORE-001",
                "platform": "meta",
                "advertiser": "Supabase",
                "title": "Captured by a persona-tagged FIND run",
                "score": 12.0,
                "tier": "loser",
            }
        ],
        persona_tag="saas",
    )

    mutable_collector["start_date"] = _age_days(120)
    item = client.post("/api/ad-library/competitors/Supabase/sync").json()["items"][0]
    assert item["score"] == pytest.approx(90.0, abs=0.05)
    assert item["tier"] == "high_conf"


def test_search_does_not_overwrite_stored_scores(client, mutable_collector):
    """Search stays on refresh=False: its batch is keyword-shaped, not competitor-shaped."""
    mutable_collector["start_date"] = _age_days(120)
    client.post("/api/ad-library/competitors/Supabase/sync")

    mutable_collector["start_date"] = _age_days(5)
    searched = client.post("/api/ad-library/search", json={"query": "supabase"}).json()
    assert searched["items"][0]["score"] == pytest.approx(90.0, abs=0.05)
    assert searched["items"][0]["tier"] == "high_conf"


def test_get_one_ad_by_id(client, fake_collectors):
    _search(client)
    body = client.get("/api/ad-library/AL-SUPA-001").json()
    assert body["ad_id"] == "AL-SUPA-001"
    assert body["advertiser"] == "Supabase"
    assert body["media_urls"] == ["https://cdn.example.com/supabase/hero.jpg"]


def test_unknown_ad_id_404s(client):
    assert client.get("/api/ad-library/does-not-exist").status_code == 404
