"""Deterministic demo seed for PerfOS.

Usage:
    cd apps/api && .venv/bin/python scripts/seed.py [--reset]

Seeds (MOCK_MODE, SQLite by default):
  - Org + workspace "Demo DTC Brand"
  - 13 ad accounts (one per channel)
  - Google + Meta campaigns with canonical Spend rows
    (12000/60000 claimed google, 8000/44000 meta) and Shopify revenue
    of exactly 78000 across 950 orders => the 33% over-count demo story
  - CreativePerformance rows across channels
  - 2 completed IncrementalityTest rows
  - ExternalIntegration + ConnectedAgent rows
"""

import os
import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

os.environ.setdefault("MOCK_MODE", "true")

from app.core.config import settings  # noqa: E402
from app.core.db import Base, SessionLocal, engine, init_db  # noqa: E402

PLATFORMS = [
    "google",
    "meta",
    "shopify",
    "tiktok",
    "linkedin",
    "pinterest",
    "snapchat",
    "amazon",
    "reddit",
    "twitter",
    "youtube",
    "amazon_ads",
    "x_ads",
]

SPEND_PLAN = {
    # platform: (impressions, clicks, cost, conversions, conversion_value)
    "google": (400_000, 8_000, 12_000.0, 600.0, 60_000.0),
    "meta": (350_000, 7_000, 8_000.0, 500.0, 44_000.0),
}

DAY = date(2026, 8, 1)


def seed(reset: bool = False) -> None:
    from app.models import (
        AdAccount,
        Campaign,
        ConnectedAgent,
        CreativePerformance,
        ExternalIntegration,
        IncrementalityTest,
        Organization,
        Revenue,
        Spend,
        Workspace,
    )

    if reset:
        Base.metadata.drop_all(bind=engine)
    init_db()

    db = SessionLocal()
    try:
        existing = db.query(Workspace).filter_by(name="Demo DTC Brand").first()
        if existing is not None:
            print("Seed already present; nothing to do (use --reset to reseed).")
            return

        org = Organization(name="PerfOS Demo Org")
        db.add(org)
        db.flush()
        ws = Workspace(org_id=org.id, name="Demo DTC Brand", currency="USD")
        db.add(ws)
        db.flush()

        accounts = {}
        campaigns = {}
        for platform in PLATFORMS:
            account = AdAccount(
                workspace_id=ws.id,
                platform=platform,
                platform_account_id=f"mock-{platform}-001",
                name=f"{platform.replace('_', ' ').title()} Mock Account",
                status="active",
            )
            db.add(account)
            db.flush()
            accounts[platform] = account

            if platform in SPEND_PLAN:
                impressions, clicks, cost, conv, value = SPEND_PLAN[platform]
                campaign = Campaign(
                    ad_account_id=account.id,
                    platform=platform,
                    platform_campaign_id=f"mock-campaign-{platform}-001",
                    name=f"{platform.replace('_', ' ').title()} Always-On",
                    status="active",
                    daily_budget=500.0 if platform == "google" else 400.0,
                )
                db.add(campaign)
                db.flush()
                db.add(
                    Spend(
                        workspace_id=ws.id,
                        ad_account_id=account.id,
                        campaign_id=campaign.id,
                        date=DAY,
                        impressions=impressions,
                        clicks=clicks,
                        cost=cost,
                        conversions=conv,
                        conversion_value=value,
                    )
                )
                campaigns[platform] = campaign

        orders = [
            Revenue(
                workspace_id=ws.id,
                source="shopify",
                order_id=f"SHOPIFY-{i:04d}",
                date=DAY,
                amount=80.0 if i < 900 else 120.0,
                customer_id=f"c-{i % 300:03d}",
                is_new_customer=i < 200,
            )
            for i in range(950)
        ]
        assert sum(o.amount for o in orders) == 78_000
        db.add_all(orders)

        creatives = [
            ("meta", "META-UGC-001", 1_250_000, 42_000.0, 1850.0, 0.81, 0.34),
            ("google", "GOOG-SHOP-002", 980_000, 31_500.0, 1410.0, 0.62, 0.41),
            ("tiktok", "TikTok-Creator-003", 2_100_000, 18_900.0, 620.0, 0.55, 0.52),
            ("meta", "META-STATIC-004", 540_000, 15_200.0, 480.0, 0.48, 0.29),
            ("youtube", "YT-PRE-005", 720_000, 22_400.0, 510.0, 0.37, 0.61),
            ("google", "GOOG-DISPLAY-006", 310_000, 6_800.0, 130.0, 0.21, 0.24),
        ]
        for platform, creative_id, impressions, spend_amt, conv, fatigue, hook in creatives:
            db.add(
                CreativePerformance(
                    workspace_id=ws.id,
                    platform=platform,
                    creative_id=creative_id,
                    impressions=impressions,
                    spend=spend_amt,
                    conversions=conv,
                    fatigue_score=fatigue,
                    hook_rate=hook,
                )
            )

        started_at = datetime(2026, 7, 14, 9, 0, 0)
        completed_at = datetime(2026, 7, 28, 17, 0, 0)
        db.add_all([
            IncrementalityTest(
                workspace_id=ws.id,
                platform="meta",
                test_type="geo_holdout",
                status="completed",
                markets_treated=["CA", "TX"],
                markets_control=["NY", "FL"],
                spend_treated=40_000.0,
                spend_control=38_000.0,
                conversions_treated=2100.0,
                conversions_control=1900.0,
                lift_pct=round(((2100 / 1900) / (40_000 / 38_000) - 1) * 100, 2),
                started_at=started_at,
                completed_at=completed_at,
            ),
            IncrementalityTest(
                workspace_id=ws.id,
                platform="google",
                test_type="conversion_lift",
                status="completed",
                markets_treated=["US-Midwest"],
                markets_control=["US-South"],
                spend_treated=45_000.0,
                spend_control=40_500.0,
                conversions_treated=3100.0,
                conversions_control=2500.0,
                lift_pct=round(((3100 / 2500) / (45_000 / 40_500) - 1) * 100, 2),
                started_at=started_at,
                completed_at=completed_at,
            ),
        ])

        integrations = [
            ("Google Ads", "ads", "google_ads"),
            ("Meta Ads", "ads", "meta_ads"),
            ("Shopify", "analytics", "shopify"),
            ("Stripe", "analytics", "stripe"),
            ("Slack", "crm", "slack"),
        ]
        for name, category, provider in integrations:
            db.add(
                ExternalIntegration(
                    workspace_id=ws.id,
                    name=name,
                    provider=provider,
                    category=category,
                    enabled=True,
                    status="connected",
                    config_json={"mock": True},
                    last_checked_at=datetime(2026, 8, 1, 8, 0, 0),
                )
            )

        db.add_all([
            ConnectedAgent(
                workspace_id=ws.id,
                provider="opencode",
                name="PerfOS Optimizer Agent",
                status="idle",
                config_json={"role": "budget_analysis"},
            ),
            ConnectedAgent(
                workspace_id=ws.id,
                provider="claude",
                name="Briefing Writer",
                status="idle",
                config_json={"role": "daily_briefing"},
            ),
        ])

        db.commit()
        print(
            f"Seeded workspace '{ws.name}' (id={ws.id}): "
            f"{len(accounts)} ad accounts, {len(campaigns)} funded campaigns, "
            f"{len(creatives)} creatives, 2 incrementality tests, "
            f"{len(integrations)} integrations."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
