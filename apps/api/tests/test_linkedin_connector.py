"""LinkedIn connector tests: OAuth URL, report fetch + normalization, zero spend."""

from __future__ import annotations

from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from app.connectors.linkedin import (
    OAUTH_AUTHORIZE_URL,
    LinkedInConnector,
    build_authorization_url,
    normalize_report_row,
)
from app.connectors.registry import get_connector

# ---- OAuth URL generation --------------------------------------------------------


def test_auth_url_contains_required_params():
    url = build_authorization_url(
        client_id="li-client-123",
        redirect_uri="https://x/callback",
        state="st-1",
    )
    assert url.startswith(OAUTH_AUTHORIZE_URL)
    assert "response_type=code" in url
    assert "client_id=li-client-123" in url
    assert "redirect_uri=" in url
    assert "state=st-1" in url
    assert "scope=" in url


def test_auth_url_default_scopes():
    url = build_authorization_url(
        client_id="cid", redirect_uri="https://x/cb", state="s"
    )
    assert "r_ads" in url
    assert "rw_ads" in url


def test_auth_url_custom_scopes():
    url = build_authorization_url(
        client_id="cid",
        redirect_uri="https://x/cb",
        state="s",
        scopes="r_ads_reporting",
    )
    assert "scope=r_ads_reporting" in url


# ---- Report normalization --------------------------------------------------------


def test_normalize_report_row_maps_linkedin_fields():
    raw = {
        "campaignId": "camp-1",
        "impressions": "5000",
        "clicks": "120",
        "costInUsd": "450.00",
        "conversions": "15",
        "totalConversionValue": "1200.00",
    }
    norm = normalize_report_row(raw)
    assert norm == {
        "campaign_id": "camp-1",
        "impressions": 5000,
        "clicks": 120,
        "cost": 450.0,
        "conversions": 15.0,
        "conversion_value": 1200.0,
    }


def test_normalize_zero_spend_row():
    raw = {
        "campaignId": "camp-2",
        "impressions": "0",
        "clicks": "0",
        "costInUsd": "0",
        "conversions": "0",
        "totalConversionValue": "0",
    }
    norm = normalize_report_row(raw)
    assert norm["cost"] == 0
    assert norm["impressions"] == 0
    assert norm["clicks"] == 0
    assert norm["conversions"] == 0
    assert norm["conversion_value"] == 0


def test_normalize_missing_fields_default_to_zero():
    raw = {"campaignId": "camp-3"}
    norm = normalize_report_row(raw)
    assert norm["cost"] == 0
    assert norm["impressions"] == 0
    assert norm["clicks"] == 0
    assert norm["conversions"] == 0
    assert norm["conversion_value"] == 0


# ---- Token exchange --------------------------------------------------------------


def test_token_exchange_success(monkeypatch):
    mock_resp = MagicMock()
    mock_resp.read.return_value = b'{"access_token": "tok-123", "expires_in": 5184000}'
    mock_resp.__enter__ = MagicMock(return_value=mock_resp)
    mock_resp.__exit__ = MagicMock(return_value=False)

    with patch("urllib.request.urlopen", return_value=mock_resp) as mock_urlopen:
        from app.connectors.linkedin import exchange_code_for_token

        result = exchange_code_for_token(
            client_id="cid",
            client_secret="secret",
            redirect_uri="https://x/cb",
            code="auth-code-1",
        )
    assert result["access_token"] == "tok-123"
    assert result["expires_in"] == 5184000
    mock_urlopen.assert_called_once()


# ---- Connector: zero-spend / empty-window handling -------------------------------


@pytest.fixture
def mock_on(monkeypatch):
    monkeypatch.setenv("MOCK_MODE", "true")


def _to_date(s):
    return date.fromisoformat(s)


def test_connector_outside_window_returns_empty(mock_on):
    conn = LinkedInConnector(workspace=None)
    assert conn.fetch_metrics(_to_date("2025-07-01"), _to_date("2025-07-10")) == []


def test_connector_in_window_returns_rows(mock_on):
    conn = LinkedInConnector(workspace=None)
    rows = conn.fetch_metrics(_to_date("2026-08-01"), _to_date("2026-08-31"))
    assert rows
    for s in rows:
        assert s.cost >= 0
        assert s.conversion_value >= 0
    # The demo has one zero-spend day (Aug 3)
    zero_spend = [s for s in rows if s.cost == 0]
    assert len(zero_spend) > 0
    for s in zero_spend:
        assert s.conversion_value == 0
        assert s.impressions == 0


def test_connector_campaigns(mock_on):
    conn = LinkedInConnector(workspace=None)
    campaigns = conn.fetch_campaigns()
    assert len(campaigns) == 1
    assert campaigns[0].platform == "linkedin"
    assert campaigns[0].platform_campaign_id == "li-901"
    assert campaigns[0].daily_budget == 300.0


def test_registry_resolves_linkedin(mock_on):
    conn = get_connector("linkedin", workspace=None)
    assert isinstance(conn, LinkedInConnector)


def test_connector_set_budget(mock_on):
    conn = LinkedInConnector(workspace=None)
    result = conn.set_budget("li-901", 150.0)
    assert result["success"] is True
    assert result["previous_daily_budget"] == 300.0
    assert result["daily_budget"] == 150.0


def test_connector_set_budget_not_found(mock_on):
    conn = LinkedInConnector(workspace=None)
    result = conn.set_budget("li-999", 100.0)
    assert result["success"] is False
    assert result["error"] == "campaign_not_found"


def test_connector_pause_campaign(mock_on):
    conn = LinkedInConnector(workspace=None)
    result = conn.pause_campaign("li-901")
    assert result["success"] is True
    assert result["status"] == "paused"
