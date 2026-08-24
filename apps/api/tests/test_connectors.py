"""Connector + registry tests (completion agent 14).

Covers spec/COMPLETION.md task 14:
- registry.get_connector resolves 'google' / 'meta' / 'shopify' to instances
- google/meta connectors fetch_metrics/fetch_campaigns return mock rows
  matching the canonical demo aggregates (Google 12000/60000, Meta 8000/44000)
- revenue connector fetch_actual_revenue rows sum to ~78000 (source of truth)

Runs in MOCK_MODE (set by conftest and the CI command).
"""

from datetime import date

import pytest

from app.connectors.google import GoogleConnector
from app.connectors.meta import MetaConnector
from app.connectors.revenue import RevenueConnector
from app.connectors.registry import get_connector

WIDE_START = date(2000, 1, 1)
WIDE_END = date(2100, 1, 1)


def test_registry_resolves_google():
    conn = get_connector("google", None)
    assert isinstance(conn, GoogleConnector)
    assert isinstance(conn, object) and conn.platform == "google"


def test_registry_resolves_meta():
    conn = get_connector("meta", None)
    assert isinstance(conn, MetaConnector)
    assert conn.platform == "meta"


def test_registry_resolves_shopify():
    conn = get_connector("shopify", None)
    assert isinstance(conn, RevenueConnector)
    assert conn.platform == "shopify"


def test_registry_is_case_insensitive():
    assert isinstance(get_connector("GOOGLE", None), GoogleConnector)
    assert isinstance(get_connector("Meta", None), MetaConnector)


def test_registry_unknown_platform_raises():
    with pytest.raises(LookupError):
        get_connector("tiktok", None)


def test_google_fetch_campaigns_returns_mock_rows():
    campaigns = GoogleConnector().fetch_campaigns()
    assert len(campaigns) == 3
    for c in campaigns:
        assert c.platform == "google"
        assert c.platform_campaign_id.startswith("g-")
        assert c.status == "active"
        assert c.daily_budget > 0


def test_google_fetch_metrics_returns_mock_rows():
    rows = GoogleConnector().fetch_metrics(WIDE_START, WIDE_END)
    assert len(rows) > 0
    for r in rows:
        assert r.cost >= 0
        assert r.conversion_value >= 0
        assert r.workspace_id == 1
        assert r.ad_account_id == 1
    # Canonical demo slice: spend 12000, claimed value 60000.
    assert round(sum(r.cost for r in rows), 2) == pytest.approx(12000.0)
    assert round(sum(r.conversion_value for r in rows), 2) == pytest.approx(60000.0)


def test_meta_fetch_campaigns_returns_mock_rows():
    campaigns = MetaConnector().fetch_campaigns()
    assert len(campaigns) == 2
    for c in campaigns:
        assert c.platform == "meta"
        assert c.platform_campaign_id.startswith("m-")
        assert c.daily_budget > 0


def test_meta_fetch_metrics_returns_mock_rows():
    rows = MetaConnector().fetch_metrics(WIDE_START, WIDE_END)
    assert len(rows) > 0
    for r in rows:
        assert r.cost >= 0
        assert r.workspace_id  # 1 (local) or 'ws_demo' (shared mock backend)
        assert r.ad_account_id
    # Canonical demo slice: spend 8000, claimed value 44000.
    assert round(sum(r.cost for r in rows), 2) == pytest.approx(8000.0)
    assert round(sum(r.conversion_value for r in rows), 2) == pytest.approx(44000.0)


def test_revenue_fetch_actual_revenue_sums_near_78000():
    rows = RevenueConnector().fetch_actual_revenue()
    assert len(rows) > 0
    total = sum(float(r["amount"]) for r in rows)
    assert total == pytest.approx(78000.0)
    for r in rows:
        assert r["source"] == "shopify"
        assert float(r["amount"]) > 0


def test_connectors_expose_base_interface():
    for platform in ("google", "meta"):
        conn = get_connector(platform, None)
        for method in ("fetch_campaigns", "fetch_metrics", "set_budget", "pause_campaign"):
            assert callable(getattr(conn, method))
