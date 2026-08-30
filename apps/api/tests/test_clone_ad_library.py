"""POST /api/clone must resolve ads from BOTH stores — no network."""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_token
from app.main import app
from app.routers.create import _from_ad_library


@pytest.fixture(autouse=True)
def _isolated(monkeypatch, tmp_path):
    """Own spy DB per test, fixtures instead of the live ad library."""
    monkeypatch.setenv("DISCOVERY_SPY_DB_URL", f"sqlite:///{tmp_path / 'spy.db'}")
    monkeypatch.setenv("PERFOS_LIVE_DISCOVERY", "0")


@pytest.fixture
def winner_store(monkeypatch, tmp_path):
    """A WinnerStore on a tmp file, returned wherever create.py constructs one.

    create.py imports WinnerStore inside the request handler, so patching the
    module attribute is what reaches it. Without this the router would read the
    repo's real .build/winners.json and a stale row could satisfy the lookup that
    these tests need to miss.
    """
    from app.discovery import store as winner_store_module

    isolated = winner_store_module.WinnerStore(tmp_path / "winners.json")
    monkeypatch.setattr(winner_store_module, "WinnerStore", lambda *_a, **_kw: isolated)
    return isolated


@pytest.fixture
def client():
    with TestClient(app) as c:
        c.headers.update({"Authorization": f"Bearer {create_token(1)}"})
        yield c


def _library_ad(client) -> dict:
    body = client.post("/api/ad-library/search", json={"query": "glass skin"})
    assert body.status_code == 200, body.text
    items = body.json()["items"]
    assert items, "fixture-backed search must persist at least one ad"
    return items[0]


def test_clone_resolves_an_ad_library_only_ad(client, winner_store):
    """The whole point: an ad no /api/discovery scan ever surfaced is still clonable."""
    ad = _library_ad(client)
    assert winner_store.all() == [], "the fallback is only proven with an empty WinnerStore"

    response = client.post("/api/clone", json={"ad_id": ad["ad_id"]})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["source"]["ad_id"] == ad["ad_id"]
    assert body["source"]["advertiser"] == ad["advertiser"]
    assert body["source"]["hook"] == ad["title"]
    assert body["source"]["cta"] == ad["cta"]
    assert body["source"]["tier"] == ad["tier"]
    assert len(body["variants"]) == 3
    assert body["assets"] == [], "assets only render when generate=true"


def test_clone_cannot_resolve_another_workspaces_library_ad(client, winner_store):
    ad = _library_ad(client)
    other = TestClient(app)
    other.headers.update({"Authorization": f"Bearer {create_token(2)}"})

    response = other.post("/api/clone", json={"ad_id": ad["ad_id"]})
    assert response.status_code == 404


def test_clone_of_a_winner_store_ad_is_unchanged(client, winner_store):
    """The pre-existing path must not regress: WinnerStore overloads title/landing_url."""
    winner_store.add(
        {
            "ad_id": "WS-ONLY-001",
            "platform": "meta",
            "competitor": "Ledgerly",
            "title": "Attribution without spreadsheets",
            "landing_url": "https://cdn.example.com/ledgerly/dashboard.jpg",
            "score": 71.5,
            "tier": "winner",
            "runtime_days": 44.0,
        }
    )

    body = client.post("/api/clone", json={"ad_id": "WS-ONLY-001"}).json()
    assert body["source"]["advertiser"] == "Ledgerly"
    assert body["source"]["hook"] == "Attribution without spreadsheets"
    assert body["source"]["score"] == 71.5
    assert body["source"]["tier"] == "winner"
    assert len(body["variants"]) == 3


def test_winner_store_wins_when_an_ad_is_in_both(client, winner_store):
    ad = _library_ad(client)
    winner_store.add({"ad_id": ad["ad_id"], "title": "Seeded by a discovery scan"})

    body = client.post("/api/clone", json={"ad_id": ad["ad_id"]}).json()
    assert body["source"]["hook"] == "Seeded by a discovery scan"


def test_clone_404s_when_the_ad_is_in_neither_store(client, winner_store):
    assert client.post("/api/clone", json={"ad_id": "nowhere-at-all"}).status_code == 404


def test_ad_library_mapping_keeps_the_creative_and_the_destination_apart():
    """The trap: mapping through WinnerStore's overloading would clone a landing page."""
    signal = _from_ad_library(
        {
            "ad_id": "AL-1",
            "platform": "meta",
            "advertiser": "Supabase",
            "title": "Stop configuring Kubernetes",
            "body": "Build production apps with Auth and Database.",
            "cta": "Learn more",
            "creative_url": "https://cdn.example.com/supabase/hero.jpg",
            "media_urls": ["https://cdn.example.com/supabase/hero.jpg"],
            "landing_url": "https://supabase.example.com/pricing",
            "score": 78.4,
            "tier": "high_conf",
            "runtime_days": 108.0,
        }
    )
    assert signal.creative_url == "https://cdn.example.com/supabase/hero.jpg"
    assert signal.landing_url == "https://supabase.example.com/pricing"
    assert signal.hook == "Stop configuring Kubernetes"
    assert signal.text == "Build production apps with Auth and Database."
    assert signal.advertiser == "Supabase"
    assert signal.tier == "high_conf"


def test_ad_library_mapping_falls_back_to_media_urls_for_the_creative():
    signal = _from_ad_library(
        {
            "ad_id": "AL-2",
            "advertiser": "Nimbus Skin",
            "media_urls": ["https://cdn.example.com/nimbus/glass.jpg"],
            "landing_url": "https://nimbusskin.example.com/glass-skin",
        }
    )
    assert signal.creative_url == "https://cdn.example.com/nimbus/glass.jpg"
    assert signal.platform == "meta", "platform defaults rather than failing validation"
    assert signal.score == 0.0
    assert signal.tier == "loser"
