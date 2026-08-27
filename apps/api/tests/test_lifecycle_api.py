"""Lifecycle API surface: discovery, clone, create, loop — all in fixture mode."""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_token
from app.main import app


@pytest.fixture(autouse=True)
def _isolated(monkeypatch, tmp_path):
    """Never hit the live ad library, and never read the repo's real winner store."""
    from app.create import store as create_store
    from app.discovery.store import WinnerStore
    from app.routers import discovery as discovery_router

    monkeypatch.setenv("PERFOS_LIVE_DISCOVERY", "0")
    monkeypatch.setattr(discovery_router, "_store", WinnerStore(tmp_path / "winners.json"))
    monkeypatch.setattr(create_store, "DEFAULT_PATH", str(tmp_path / "assets.json"))


@pytest.fixture
def client():
    with TestClient(app) as c:
        c.headers.update({"Authorization": f"Bearer {create_token(1)}"})
        yield c


def test_lifecycle_requires_workspace_auth():
    with TestClient(app) as unauthenticated:
        assert unauthenticated.post("/api/discovery", json={}).status_code == 401
        assert unauthenticated.post("/api/loop", json={}).status_code == 401


def test_every_lifecycle_route_is_mounted(client):
    paths = client.get("/openapi.json").json()["paths"]
    assert {"/api/discovery", "/api/winners", "/api/clone", "/api/create",
            "/api/assets", "/api/loop", "/api/loop/status"} <= set(paths)


def test_discovery_returns_scored_signals_best_first(client):
    body = client.post("/api/discovery", json={"persona": "saas"}).json()
    assert body, "expected scored signals"
    assert all(a["score"] >= b["score"] for a, b in zip(body, body[1:]))
    assert {"ad_id", "platform", "advertiser", "score", "tier"} <= set(body[0])


def test_discovery_does_not_drop_off_persona_channels(client):
    """A search must return what was searched for, even off the persona's channels."""
    body = client.post("/api/discovery", json={"persona": "b2b"}).json()
    assert body, "b2b persona must not filter the whole field away"


def test_winners_are_persisted_with_advertiser_and_hook(client):
    client.post("/api/discovery", json={"persona": "saas"})
    winners = client.get("/api/winners", params={"limit": 5}).json()
    assert winners
    assert winners[0]["competitor"], "advertiser must persist as competitor"
    assert winners[0]["title"], "hook must persist as title"
    assert winners[0]["runtime_days"] > 0, "observed runtime must persist for the UI"


def test_clone_returns_hook_variants(client):
    client.post("/api/discovery", json={"persona": "saas"})
    ad_id = client.get("/api/winners", params={"limit": 1}).json()[0]["ad_id"]

    body = client.post("/api/clone", json={"ad_id": ad_id}).json()
    assert body["source"]["ad_id"] == ad_id
    assert body["source"]["hook"], "clone must recover the hook from the stored title"
    assert len(body["variants"]) == 3
    assert body["assets"] == [], "assets only render when generate=true"


def test_clone_generates_assets_on_request(client):
    client.post("/api/discovery", json={"persona": "saas"})
    ad_id = client.get("/api/winners", params={"limit": 1}).json()[0]["ad_id"]
    body = client.post("/api/clone", json={"ad_id": ad_id, "generate": True}).json()
    assert body["assets"], "generate=true must render clips"


def test_clone_404s_on_unknown_ad(client):
    assert client.post("/api/clone", json={"ad_id": "nope"}).status_code == 404


def test_create_generates_from_stored_winners(client):
    client.post("/api/discovery", json={"persona": "saas"})
    body = client.post("/api/create", json={"persona": "saas"}).json()
    assert body["winners_used"] > 0
    assert body["assets"]
    assert client.get("/api/assets").json()


def test_loop_runs_all_six_stages(client):
    body = client.post("/api/loop", json={"persona": "saas", "dry_run": True}).json()
    assert set(body["stages"]) == {
        "find", "score", "create", "launch", "track", "double-down"
    }
    assert body["dry_run"] is True
    assert body["stages"]["find"] > 0
    assert body["stages"]["score"] > 0, "persona must not filter every find result away"


def test_loop_status_reflects_the_last_run(client):
    client.post("/api/loop", json={"persona": "beauty", "dry_run": True})
    status = client.get("/api/loop/status").json()
    assert status["persona"] == "beauty"
    assert status["finished_at"]
    assert status["summary"]["stages"]["find"] > 0


def test_dry_run_queues_nothing_for_approval(client):
    body = client.post("/api/loop", json={"persona": "saas", "dry_run": True}).json()
    assert body["pending_approval"] == []


def test_real_run_queues_paused_drafts_instead_of_launching(client):
    """The safety claim: a non-dry run produces approvals, never a live launch."""
    body = client.post("/api/loop", json={"persona": "saas", "dry_run": False}).json()
    assert body["pending_approval"], "a real run must create approvable drafts"
    assert all(
        d["status"] in {"pending_approval", "blocked"} for d in body["pending_approval"]
    ), body["pending_approval"]
