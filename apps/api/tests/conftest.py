"""Shared pytest fixtures: isolated per-test DB + FastAPI client + exact demo seed.

Seed reproduces the canonical mock scenario from spec/CONTRACTS.md:
  Google: spend 12000, claimed conversions 600, claimed value 60000 (ROAS 5.0)
  Meta:   spend 8000,  claimed conversions 500, claimed value 44000 (ROAS 5.5)
  Shopify actual revenue: 78000 across 950 orders
  => platform claimed sum 104000 vs actual 78000 => over-count 26000 (33%) => FLAG
"""

import os

# Must be set before app.core.config is first imported anywhere.
os.environ.setdefault("MOCK_MODE", "true")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test-perfos.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("DEFAULT_WORKSPACE_API_KEY", "test-workspace-key")

from datetime import date  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.core.db import Base, get_db  # noqa: E402


@pytest.fixture()
def db_engine(tmp_path):
    """Fresh file-backed SQLite DB per test (cross-session visibility)."""
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
        future=True,
    )
    import app.models  # noqa: F401  (registers ORM mappings)

    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(db_engine):
    SessionFactory = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)
    session = SessionFactory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def seeded_db(db_session):
    """Minimal seed matching the canonical mock scenario aggregates exactly."""
    from app.models import (
        AdAccount,
        Campaign,
        Organization,
        Revenue,
        Spend,
        Workspace,
    )

    day = date(2026, 8, 1)

    org = Organization(name="PerfOS Demo Org")
    db_session.add(org)
    db_session.flush()

    workspace = Workspace(org_id=org.id, name="Demo DTC Brand", currency="USD")
    db_session.add(workspace)
    db_session.flush()

    accounts: dict[str, AdAccount] = {}
    campaigns: dict[str, Campaign] = {}
    spend_plan = {
        # platform: (cost, impressions, clicks, conversions, conversion_value, daily_budget)
        "google": (12000, 400_000, 8_000, 600, 60_000, 500),
        "meta": (8000, 350_000, 7_000, 500, 44_000, 400),
    }
    for platform, (cost, impressions, clicks, conv, value, budget) in spend_plan.items():
        account = AdAccount(
            workspace_id=workspace.id,
            platform=platform,
            platform_account_id=f"mock-{platform}-001",
            name=f"{platform.title()} Mock Account",
            status="active",
        )
        db_session.add(account)
        db_session.flush()

        campaign = Campaign(
            ad_account_id=account.id,
            platform=platform,
            platform_campaign_id=f"mock-campaign-{platform}-001",
            name=f"{platform.title()} Always-On",
            status="active",
            daily_budget=budget,
        )
        db_session.add(campaign)
        db_session.flush()

        db_session.add(
            Spend(
                workspace_id=workspace.id,
                ad_account_id=account.id,
                campaign_id=campaign.id,
                date=day,
                impressions=impressions,
                clicks=clicks,
                cost=cost,
                conversions=conv,
                conversion_value=value,
            )
        )
        accounts[platform] = account
        campaigns[platform] = campaign

    db_session.add(
        AdAccount(
            workspace_id=workspace.id,
            platform="shopify",
            platform_account_id="mock-shopify-001",
            name="Shopify Mock Store",
            status="active",
        )
    )

    # Shopify revenue: 950 orders totalling exactly 78000 (source of truth).
    orders = [Revenue(
        workspace_id=workspace.id,
        source="shopify",
        order_id=f"SHOPIFY-{i:04d}",
        date=day,
        amount=80 if i < 900 else 120,
        customer_id=f"c-{i % 300:03d}",
        is_new_customer=i < 200,
    ) for i in range(950)]
    assert sum(o.amount for o in orders) == 78_000
    db_session.add_all(orders)

    db_session.commit()

    return {
        "org_id": org.id,
        "workspace_id": workspace.id,
        "workspace_name": workspace.name,
        "accounts": {p: a.id for p, a in accounts.items()},
        "campaigns": {p: c.id for p, c in campaigns.items()},
    }


def _override_get_db(session):
    def _override():
        yield session

    return _override


@pytest.fixture()
def client(db_session, seeded_db):
    """TestClient bound to the seeded per-test DB. Lazy-imports app.main so
    pure-logic test modules run even before the API layer lands."""
    from app.main import app

    app.dependency_overrides[get_db] = _override_get_db(db_session)
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture()
def auth_headers(seeded_db):
    return {"X-Workspace-Id": str(seeded_db["workspace_id"])}
