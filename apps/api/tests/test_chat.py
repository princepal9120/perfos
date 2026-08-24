"""Tests for the /chat natural-language agent endpoint."""


def test_chat_reconcile_intent(client, auth_headers):
    resp = client.post(
        "/api/chat",
        headers=auth_headers,
        json={"message": "How much are my platforms over-claiming?"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["intent"] == "reconcile"
    assert "%" in body["reply"]
    assert any(a["href"] == "/recommendations" for a in body["actions"])


def test_chat_optimize_intent(client, auth_headers):
    resp = client.post(
        "/api/chat",
        headers=auth_headers,
        json={"message": "Optimize my budget"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["intent"] == "optimize"
    assert isinstance(body["reply"], str) and body["reply"]


def test_chat_creative_intent_no_data(client, auth_headers):
    resp = client.post(
        "/api/chat",
        headers=auth_headers,
        json={"message": "Which creative is fatigued?"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["intent"] == "creative"
    assert "No creative performance data" in body["reply"]


def test_chat_agent_intent(client, auth_headers):
    resp = client.post(
        "/api/chat",
        headers=auth_headers,
        json={"message": "Can you dispatch an agent for me?"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["intent"] == "agent"
    assert body["actions"][0]["href"] == "/command-center"


def test_chat_fallback_intent(client, auth_headers):
    resp = client.post(
        "/api/chat",
        headers=auth_headers,
        json={"message": "hello there"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["intent"] == "explain"
    assert "PerfOS agent" in body["reply"]


def test_chat_requires_workspace_header(client):
    resp = client.post("/api/chat", json={"message": "hi"})
    assert resp.status_code in (400, 401, 422)
