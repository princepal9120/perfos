"""TikTok connector tests: OAuth URL, report fetch + normalization, zero spend."""

from __future__ import annotations

from datetime import date
from unittest.mock import MagicMock, patch

import pytest

import app.connectors.tiktok as tt

# ---- OAuth URL generation --------------------------------------------------------


def test_auth_url_contains_app_id_and_redirect():
    url = tt.build_auth_url(client_id="app-123", redirect_uri="https://x/cb", state="st-1")
    assert url.startswith(tt.AUTH_URL)
    assert "app_id=app-123" in url
    assert "redirect_uri=https%3A%2F%2Fx%2Fcb" in url
    assert "state=st-1" in url


def test_auth_url_generates_state_when_missing():
    url = tt.build_auth_url(client_id="a")
    assert "state=" in url
    # two calls -> different states
    assert tt.build_auth_url(client_id="a") != url


def test_token_exchange_success():
    resp = MagicMock()
    resp.json.return_value = {
        "code": 0,
        "data": {"access_token": "tok-9", "expires_in": 86400},
    }
    resp.raise_for_status.return_value = None
    with patch.object(tt.httpx, "post", return_value=resp) as post:
        out = tt.exchange_code_for_token("auth-code", client_id="cid",
                                         client_secret="sec", redirect_uri="r")
    assert out == {"access_token": "tok-9", "expires_in": 86400}
    body = post.call_args.kwargs["json"]
    assert body["auth_code"] == "auth-code"
    assert post.call_args.args[0] == tt.TOKEN_URL


def test_token_exchange_api_error_raises():
    resp = MagicMock()
    resp.json.return_value = {"code": 40105, "message": "invalid auth_code"}
    resp.raise_for_status.return_value = None
    with patch.object(tt.httpx, "post", return_value=resp), pytest.raises(
        RuntimeError, match="token exchange"
    ):
        tt.exchange_code_for_token("bad")


# ---- Report fetch + normalization --------------------------------------------------


def _report_body(items):
    """items: list of {'dimensions': {...}, 'metrics': {...}} -> API-shaped body."""
    return {"code": 0, "data": {"list": [dict(i) for i in items]}}


RAW_ROWS = [
    {
        "dimensions": {"campaign_id": "777", "campaign_name": "Spark", "date": "20260801"},
        "spend": "150.00",
        "impression": "12000",
        "click": "180",
        "complete_payment": "9",
        "payment_conversion_value": "640.50",
    },
]


def test_fetch_report_posts_expected_payload_and_normalizes():
    d0 = RAW_ROWS[0]
    resp = MagicMock()
    resp.json.return_value = _report_body([
        {"dimensions": d0["dimensions"],
         "metrics": {k: v for k, v in d0.items() if k != "dimensions"}},
    ])
    resp.raise_for_status.return_value = None
    with patch.object(tt.httpx, "post", return_value=resp) as post:
        rows = tt.fetch_report("tok", date(2026, 8, 1), date(2026, 8, 31),
                               advertiser_id="adv-1", campaign_ids=["777"])
    assert post.call_args.args[0] == tt.REPORT_URL
    payload = post.call_args.kwargs["json"]
    assert payload["report_type"] == "BASIC"
    assert payload["data_level"] == "CAMPAIGN"
    assert "complete_payment" in payload["metrics"]
    assert payload["start_date"] == "20260801" and payload["end_date"] == "20260831"
    assert payload["filters"]["campaign_ids"] == ["777"]
    assert post.call_args.kwargs["headers"]["Access-Token"] == "tok"
    assert post.call_args.kwargs["headers"]["Advertiser-Id"] == "adv-1"
    norm = tt.normalize_report_rows(rows)
    assert norm == [{
        "campaign_id": "777",
        "name": "Spark",
        "date": "20260801",
        "impressions": 12000,
        "clicks": 180,
        "cost": 150.0,
        "conversions": 9.0,
        "conversion_value": 640.5,
    }]


def test_normalize_zero_spend_row():
    row = {
        "campaign_id": "778",
        "campaign_name": "Idle",
        "date": "20260802",
        "spend": "0",
        "impression": "0",
        "click": "0",
        "complete_payment": "0",
        "payment_conversion_value": "0",
    }
    norm = tt.normalize_report_rows([row])[0]
    assert norm["cost"] == 0 and norm["impressions"] == 0 and norm["clicks"] == 0
    assert norm["conversions"] == 0 and norm["conversion_value"] == 0


def test_report_api_error_raises():
    resp = MagicMock()
    resp.json.return_value = {"code": 40100, "message": "auth failed"}
    resp.raise_for_status.return_value = None
    with patch.object(tt.httpx, "post", return_value=resp), pytest.raises(
        RuntimeError, match="report fetch"
    ):
        tt.fetch_report("tok", "2026-08-01", "2026-08-31")


# ---- Connector: zero-spend / empty-window handling ---------------------------------


@pytest.fixture
def mock_on(monkeypatch):
    monkeypatch.setenv("MOCK_MODE", "true")


def _to_date(s):
    return date.fromisoformat(s)


def test_connector_outside_window_returns_empty(mock_on):
    conn = tt.TikTokConnector(workspace=None)
    assert conn.fetch_metrics(_to_date("2026-07-01"), _to_date("2026-07-10")) == []


def test_connector_in_window_returns_rows_with_positive_spend(mock_on):
    conn = tt.TikTokConnector(workspace=None)
    rows = conn.fetch_metrics(_to_date("2026-08-01"), _to_date("2026-08-31"))
    assert rows
    for s in rows:
        assert s.cost >= 0
        assert s.conversion_value >= 0


def test_real_mode_zero_spend_normalized_to_zero_cost(monkeypatch):
    """Real path: report returns a zero-spend row -> Spend with cost 0."""
    monkeypatch.setenv("MOCK_MODE", "false")
    monkeypatch.setenv("TIKTOK_ACCESS_TOKEN", "tok")
    zero_row = {
        "dimensions": {"campaign_id": "777", "campaign_name": "Spark", "date": "20260801"},
        "metrics": {
            "spend": "0", "impression": "0", "click": "0",
            "complete_payment": "0", "payment_conversion_value": "0",
        },
    }
    resp = MagicMock()
    resp.json.return_value = _report_body([zero_row])
    resp.raise_for_status.return_value = None
    with patch.object(tt.httpx, "post", return_value=resp):
        conn = tt.TikTokConnector(workspace=None)
        spends = conn.fetch_metrics(_to_date("2026-08-01"), _to_date("2026-08-31"))
    assert len(spends) == 1
    assert spends[0].cost == 0.0
    assert spends[0].conversion_value == 0.0


def test_registry_resolves_tiktok(mock_on):
    from app.connectors.registry import get_connector

    conn = get_connector("tiktok", workspace=None)
    assert isinstance(conn, tt.TikTokConnector)
