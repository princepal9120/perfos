"""Competitor launch alerts: raised once per genuinely new ad, never on re-sync."""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_token
from app.main import app


@pytest.fixture(autouse=True)
def _isolated_spy_db(monkeypatch, tmp_path):
    monkeypatch.setenv("DISCOVERY_SPY_DB_URL", f"sqlite:///{tmp_path / 'spy.db'}")
    monkeypatch.setenv("PERFOS_LIVE_DISCOVERY", "0")


@pytest.fixture
def client():
    with TestClient(app) as c:
        c.headers.update({"Authorization": f"Bearer {create_token(1)}"})
        yield c


def _ad(ad_id: str, advertiser: str = "Acme", days: int = 120) -> dict:
    start = datetime.now(UTC) - timedelta(days=days)
    return {
        "platform": "meta",
        "advertiser": advertiser,
        "ad_id": ad_id,
        "creative_url": f"https://cdn.test/{ad_id}.mp4",
        "start_date": start.replace(tzinfo=None).isoformat(),
        "text": "body copy",
        "hook": f"hook for {ad_id}",
        "cta": "Sign up",
        "variant_count": 3,
    }


@pytest.fixture
def collectors(monkeypatch):
    """Drive the collector fan-out from a mutable list so a 'new launch' is scriptable."""
    from app.routers import ad_library

    state: dict[str, list[dict]] = {"ads": [_ad("A1"), _ad("A2")]}

    async def _meta(page_size=20, filters=None):
        return list(state["ads"])

    async def _none(page_size=20, filters=None):
        return []

    monkeypatch.setattr(
        ad_library, "_COLLECTORS", {"meta": _meta, "tiktok": _none}, raising=True
    )
    return state


def test_first_search_alerts_on_every_ad(client, collectors):
    body = client.post("/api/ad-library/search", json={"query": "acme"}).json()
    assert body["total"] == 2
    assert {a["ad_id"] for a in body["alerts"]} == {"A1", "A2"}


def test_resync_of_known_ads_raises_no_alerts(client, collectors):
    """The whole point: only genuinely new creative should notify."""
    client.post("/api/ad-library/search", json={"query": "acme"})
    second = client.post("/api/ad-library/search", json={"query": "acme"}).json()
    assert second["total"] == 2, "the ads are still there"
    assert second["alerts"] == [], "but nothing is newly launched"


def test_a_new_competitor_ad_raises_exactly_one_alert(client, collectors):
    client.post("/api/ad-library/search", json={"query": "acme"})
    collectors["ads"].append(_ad("A3", days=2))

    body = client.post("/api/ad-library/search", json={"query": "acme"}).json()
    assert [a["ad_id"] for a in body["alerts"]] == ["A3"]


def test_alerts_feed_lists_unread_newest_first(client, collectors):
    client.post("/api/ad-library/search", json={"query": "acme"})
    feed = client.get("/api/ad-library/alerts").json()

    assert feed["unread"] == 2
    assert {i["ad_id"] for i in feed["items"]} == {"A1", "A2"}
    assert all(i["competitor"] == "Acme" for i in feed["items"])
    assert all(i["acknowledged_at"] is None for i in feed["items"])


def test_acknowledging_clears_the_unread_count(client, collectors):
    client.post("/api/ad-library/search", json={"query": "acme"})

    acked = client.post("/api/ad-library/alerts/ack", json={"ad_ids": None}).json()
    assert acked["acknowledged"] == 2

    assert client.get("/api/ad-library/alerts").json()["unread"] == 0
    # Acknowledged alerts are history, not deleted.
    assert client.get("/api/ad-library/alerts", params={"unread_only": False}).json()["total"] == 2


def test_acknowledging_one_ad_leaves_the_rest_unread(client, collectors):
    client.post("/api/ad-library/search", json={"query": "acme"})
    client.post("/api/ad-library/alerts/ack", json={"ad_ids": ["A1"]})

    feed = client.get("/api/ad-library/alerts").json()
    assert feed["unread"] == 1
    assert [i["ad_id"] for i in feed["items"]] == ["A2"]


def test_acknowledging_twice_is_idempotent(client, collectors):
    client.post("/api/ad-library/search", json={"query": "acme"})
    client.post("/api/ad-library/alerts/ack", json={"ad_ids": None})
    again = client.post("/api/ad-library/alerts/ack", json={"ad_ids": None}).json()
    assert again["acknowledged"] == 0


def test_alerts_are_workspace_scoped(client, collectors):
    client.post("/api/ad-library/search", json={"query": "acme"})

    with TestClient(app) as other:
        other.headers.update({"Authorization": f"Bearer {create_token(2)}"})
        assert other.get("/api/ad-library/alerts").json()["unread"] == 0


def test_competitor_sync_also_raises_alerts(client, collectors):
    body = client.post(
        "/api/ad-library/competitors/Acme/sync", json={"country": "US", "limit": 10}
    ).json()
    assert {a["ad_id"] for a in body["alerts"]} == {"A1", "A2"}
