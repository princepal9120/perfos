"""Isolated unit tests for app/connectors/meta.py (agent E)."""

from datetime import date

import pytest

from app.connectors.meta import (
    ACCOUNT_ID,
    DAYS,
    META_DATE_START,
    WORKSPACE_ID,
    MetaConnector,
)
from app.connectors.registry import get_connector

FULL_START = META_DATE_START
FULL_END = date.fromordinal(META_DATE_START.toordinal() + DAYS - 1)


@pytest.fixture
def connector():
    return MetaConnector()


def test_platform_and_mock_default(connector):
    assert connector.platform == "meta"
    assert connector._mock_mode() if hasattr(connector, "_mock_mode") else True
    from app.connectors.meta import _mock_mode

    assert _mock_mode() is True


def test_registry_integration():
    conn = get_connector("meta", None)
    assert isinstance(conn, MetaConnector)
    assert conn.platform == "meta"


def test_fetch_campaigns_shape(connector):
    campaigns = connector.fetch_campaigns()
    assert len(campaigns) == 2
    names = {c.name for c in campaigns}
    assert names == {"Prospecting - Broad", "Retargeting - Dynamic"}
    for c in campaigns:
        assert c.platform == "meta"
        assert c.status == "active"
        assert c.daily_budget > 0
        assert c.platform_campaign_id.startswith("m-")


def test_fetch_metrics_canonical_totals(connector):
    rows = connector.fetch_metrics(FULL_START, FULL_END)
    assert len(rows) == 14  # 7 days x 2 campaigns
    assert round(sum(r.cost for r in rows), 2) == pytest.approx(8000.0)
    assert sum(r.conversions for r in rows) == pytest.approx(500)
    assert round(sum(r.conversion_value for r in rows), 2) == pytest.approx(44000.0)
    claimed_roas = sum(r.conversion_value for r in rows) / sum(r.cost for r in rows)
    assert round(claimed_roas, 1) == 5.5
    for r in rows:
        assert r.workspace_id
        assert r.ad_account_id
        assert FULL_START <= date.fromisoformat(str(r.date)) <= FULL_END


def test_fetch_metrics_date_filtering(connector):
    mid_a = date.fromordinal(META_DATE_START.toordinal() + 2)
    mid_b = date.fromordinal(META_DATE_START.toordinal() + 3)
    rows = connector.fetch_metrics(mid_a, mid_b)
    assert len(rows) == 4
    expected_cost = 780.0 + 420.0 + 676.0 + 364.0
    assert round(sum(r.cost for r in rows), 2) == pytest.approx(expected_cost)
    outside = connector.fetch_metrics(date(2025, 1, 1), date(2025, 1, 31))
    assert outside == []


def test_set_budget_updates_in_memory(connector):
    result = connector.set_budget("m-444", 900.0)
    assert result["success"] is True
    assert result["previous_daily_budget"] == 750.0
    assert result["daily_budget"] == 900.0
    refreshed = {c.platform_campaign_id: c for c in connector.fetch_campaigns()}
    assert float(refreshed["m-444"].daily_budget) == 900.0
    bad = connector.set_budget("nope", 10.0)
    assert bad["success"] is False
    assert bad["error"] == "campaign_not_found"


def test_set_budget_roundtrip_via_fetched_id(connector):
    target = connector.fetch_campaigns()[0]
    result = connector.set_budget(target.id, 1234.0)
    assert result["success"] is True
    refreshed = {c.id: c for c in connector.fetch_campaigns()}
    assert float(refreshed[target.id].daily_budget) == 1234.0


def test_pause_campaign_updates_status(connector):
    result = connector.pause_campaign("m-555")
    assert result == {"success": True, "campaign_id": "m-555", "status": "paused"}
    refreshed = {c.platform_campaign_id: c for c in connector.fetch_campaigns()}
    assert refreshed["m-555"].status == "paused"
    bad = connector.pause_campaign("ghost")
    assert bad["success"] is False


def test_real_adapter_stub_raises(connector, monkeypatch):
    monkeypatch.setenv("MOCK_MODE", "false")
    with pytest.raises(NotImplementedError):
        connector.fetch_campaigns()
    with pytest.raises(NotImplementedError):
        connector.fetch_metrics(FULL_START, FULL_END)
    with pytest.raises(NotImplementedError):
        connector.set_budget("m-444", 100)
    with pytest.raises(NotImplementedError):
        connector.pause_campaign("m-444")


def test_mock_backend_isolated_per_instance():
    a, b = MetaConnector(), MetaConnector()
    a.set_budget("m-444", 999.0)
    refreshed = {c.platform_campaign_id: c for c in b.fetch_campaigns()}
    assert float(refreshed["m-444"].daily_budget) == 750.0


def test_module_constants_contract():
    assert WORKSPACE_ID == 1
    assert ACCOUNT_ID == 2
