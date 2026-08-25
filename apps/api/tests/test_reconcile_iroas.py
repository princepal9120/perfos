"""Regression tests: iROAS division-by-zero and null/missing-data handling."""

import pytest

from app.services.reconciliation_iroas import compute_iroas


def _seed_spend(session, platform, cost, value):
    """Insert one workspace + account + campaign + spend row for `platform`."""
    from datetime import date

    from app.models import AdAccount, Campaign, Organization, Spend, Workspace

    org = Organization(name=f"org-{platform}")
    session.add(org)
    session.flush()
    ws = Workspace(org_id=org.id, name="ws", currency="USD")
    session.add(ws)
    session.flush()
    account = AdAccount(
        workspace_id=ws.id,
        platform=platform,
        platform_account_id=f"acc-{platform}",
        name=platform,
        status="active",
    )
    session.add(account)
    session.flush()
    campaign = Campaign(
        ad_account_id=account.id,
        platform=platform,
        platform_campaign_id=f"cmp-{platform}",
        name=platform,
        status="active",
        daily_budget=100,
    )
    session.add(campaign)
    session.flush()
    session.add(
        Spend(
            workspace_id=ws.id,
            ad_account_id=account.id,
            campaign_id=campaign.id,
            date=date(2026, 8, 1),
            impressions=0,
            clicks=0,
            conversions=0,
            cost=cost,
            conversion_value=value,
        )
    )
    session.commit()
    return ws.id


def rows_by_platform(out):
    return {r["platform"]: r for r in out}


def test_zero_spend_yields_zero_iroas(db_session):
    # Spend rows exist but cost is 0: iROAS must be 0, never a fabricated fallback.
    ws = _seed_spend(db_session, "google", cost=0, value=500)
    out = rows_by_platform(compute_iroas(ws, db_session))

    assert out["google"]["reported_roas"] == 0.0
    assert out["google"]["iroas"] == 0.0
    assert out["google"]["calibration"] == 0.82


def test_zero_value_positive_spend_yields_zero_iroas(db_session):
    ws = _seed_spend(db_session, "meta", cost=1000, value=0)
    out = rows_by_platform(compute_iroas(ws, db_session))

    assert out["meta"]["reported_roas"] == 0.0
    assert out["meta"]["iroas"] == 0.0


def test_normal_computation_uses_real_data(db_session):
    ws = _seed_spend(db_session, "tiktok", cost=2000, value=8000)
    out = rows_by_platform(compute_iroas(ws, db_session))

    assert out["tiktok"]["reported_roas"] == 4.0
    assert out["tiktok"]["iroas"] == round(4.0 * 0.88, 2)


def test_no_data_falls_back_deterministically(db_session):
    import app.models  # noqa: F401
    from app.core.db import Base

    Base.metadata.create_all(bind=db_session.get_bind())
    from app.models import Organization, Workspace

    org = Organization(name="empty-org")
    db_session.add(org)
    db_session.commit()
    ws_row = Workspace(org_id=org.id, name="empty-ws", currency="USD")
    db_session.add(ws_row)
    db_session.commit()

    out = rows_by_platform(compute_iroas(ws_row.id, db_session))
    # No spend anywhere -> every channel uses its deterministic fallback.
    for platform in ("linkedin", "reddit", "youtube"):
        assert out[platform]["reported_roas"] > 0


def test_missing_fallback_raises_graceful_error(db_session):
    import app.services.reconciliation_iroas as mod

    # A calibrated channel without a fallback entry must raise a clear error,
    # not an opaque KeyError.
    mod.IROAS_CALIBRATION["newchannel"] = 0.9
    mod.CHANNELS.append("newchannel")
    try:
        with pytest.raises(ValueError, match="newchannel"):
            compute_iroas(99999999, db_session)  # no spend data anywhere
    finally:
        del mod.IROAS_CALIBRATION["newchannel"]
        mod.CHANNELS.remove("newchannel")


def test_reconcile_zero_spend_channel_roas_is_none():
    from app.attribution.reconcile import reconcile

    out = reconcile(
        [{"platform": "organic", "spend": 0, "conversion_value": 250}],
        [{"amount": 100}],
    )
    channel = out["per_channel"][0]
    assert channel["claimed_roas"] is None  # no ZeroDivisionError
