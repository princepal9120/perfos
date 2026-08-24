"""Seed the PerfOS SQLite database with the "Demo DTC Brand" mock scenario.

Idempotent: if a workspace named "Demo DTC Brand" already exists, verifies its
aggregates against spec targets and exits without re-inserting.

Usage: python scripts/seed.py [--db sqlite:///./perfos.db]
Requires app.models + sqlalchemy to be installed (agents A/B land first).
"""
from __future__ import annotations

import argparse
import datetime as _dt
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.mock.dataset import TARGETS, WORKSPACE_NAME, compute_aggregates, get_mock_data  # noqa: E402


def _engine(db_url: str):
    from sqlalchemy import create_engine

    kwargs = {"connect_args": {"check_same_thread": False}} if db_url.startswith("sqlite") else {}
    return create_engine(db_url, **kwargs)


def _verify(session, workspace_id) -> tuple[bool, dict]:
    from sqlalchemy import func

    from app.models import AdAccount, Revenue, Spend

    rows = (
        session.query(
            AdAccount.platform,
            func.sum(Spend.cost),
            func.sum(Spend.conversions),
            func.sum(Spend.conversion_value),
        )
        .join(AdAccount, Spend.ad_account_id == AdAccount.id)
        .filter(Spend.workspace_id == workspace_id)
        .group_by(AdAccount.platform)
        .all()
    )
    order_count, revenue_sum = (
        session.query(func.count(Revenue.id), func.coalesce(func.sum(Revenue.amount), 0.0))
        .filter(Revenue.workspace_id == workspace_id, Revenue.source == "shopify")
        .one()
    )

    actual = {p: {"spend": float(c or 0), "conversions": int(cv or 0), "value": float(v or 0)} for p, c, cv, v in rows}
    ok = True
    for platform in ("google", "meta"):
        for key in ("spend", "conversions", "value"):
            if abs(actual.get(platform, {}).get(key, 0) - TARGETS[platform][key]) > 0.01:
                ok = False
    if order_count != TARGETS["shopify"]["orders"] or abs(float(revenue_sum) - TARGETS["shopify"]["revenue"]) > 0.01:
        ok = False
    summary = {
        "platforms": actual,
        "orders": int(order_count),
        "actual_revenue": round(float(revenue_sum), 2),
        "matches_spec": ok,
    }
    return ok, summary


def _seed_integrations(session, workspace_id: int) -> int:
    """Seed demo integrations for a workspace if it has none yet. Returns count added."""
    from app.models import ExternalIntegration

    existing = (
        session.query(ExternalIntegration)
        .filter(ExternalIntegration.workspace_id == workspace_id)
        .first()
    )
    if existing is not None:
        return 0

    demo = [
        ("Google Ads", "google_ads", "ads"),
        ("Meta Ads", "meta_ads", "ads"),
        ("Shopify", "shopify", "ads"),
        ("Stripe", "stripe", "analytics"),
        ("Slack", "slack", "crm"),
    ]
    for name, provider, category in demo:
        session.add(
            ExternalIntegration(
                workspace_id=workspace_id,
                name=name,
                category=category,
                provider=provider,
                enabled=True,
                status="connected",
            )
        )
    session.commit()
    print(f"[seed] inserted {len(demo)} demo integrations for workspace_id={workspace_id}")
    return len(demo)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--db",
        default=os.environ.get("DATABASE_URL", "sqlite:///./perfos.db"),
        help="SQLAlchemy DB URL (default DATABASE_URL or sqlite:///./perfos.db)",
    )
    args = parser.parse_args()

    try:
        from app.models import (
            AdAccount,
            Base,
            Campaign,
            Organization,
            Revenue,
            Spend,
            Workspace,
        )
    except ImportError as exc:
        print(f"[seed] app.models unavailable yet ({exc}); run after agents A+B land.")
        return 2

    from sqlalchemy.orm import sessionmaker

    engine = _engine(args.db)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()

    with session:
        existing = session.query(Workspace).filter_by(name=WORKSPACE_NAME).first()
        if existing is not None:
            ok, summary = _verify(session, existing.id)
            _seed_integrations(session, existing.id)
            print(f"[seed] already seeded (workspace_id={existing.id}): {summary}")
            return 0 if ok else 1

        data = get_mock_data()
        org = Organization(name=data["organization"]["name"])
        session.add(org)
        session.flush()

        ws = Workspace(org_id=org.id, name=data["workspace"]["name"], currency=data["workspace"]["currency"])
        session.add(ws)
        session.flush()
        ws_id = ws.id

        acc_ids: dict[str, object] = {}
        for a in data["accounts"]:
            row = AdAccount(
                workspace_id=ws_id,
                platform=a["platform"],
                platform_account_id=a["platform_account_id"],
                name=a["name"],
                status=a["status"],
            )
            session.add(row)
            session.flush()
            acc_ids[a["id"]] = row.id

        cmp_ids: dict[str, object] = {}
        for c in data["campaigns"]:
            row = Campaign(
                ad_account_id=acc_ids[c["ad_account_id"]],
                platform=c["platform"],
                platform_campaign_id=c["platform_campaign_id"],
                name=c["name"],
                status=c["status"],
                daily_budget=c["daily_budget"],
            )
            session.add(row)
            session.flush()
            cmp_ids[c["id"]] = row.id

        session.add_all(
            Spend(
                workspace_id=ws_id,
                ad_account_id=acc_ids[r["ad_account_id"]],
                campaign_id=cmp_ids[r["campaign_id"]],
                date=_dt.date.fromisoformat(r["date"]),
                impressions=r["impressions"],
                clicks=r["clicks"],
                cost=r["cost"],
                conversions=r["conversions"],
                conversion_value=r["conversion_value"],
            )
            for r in data["spend"]
        )
        session.add_all(
            Revenue(
                workspace_id=ws_id,
                source=r["source"],
                order_id=r["order_id"],
                date=_dt.date.fromisoformat(r["date"]),
                amount=r["amount"],
                customer_id=r["customer_id"],
                is_new_customer=r["is_new_customer"],
            )
            for r in data["revenue"]
        )
        session.commit()

        _seed_integrations(session, ws_id)

        expected = compute_aggregates(data)
        ok, summary = _verify(session, ws_id)
        print(f"[seed] inserted workspace '{WORKSPACE_NAME}' (id={ws_id}): "
              f"{len(data['accounts'])} accounts, {len(data['campaigns'])} campaigns, "
              f"{len(data['spend'])} spend rows, {len(data['revenue'])} revenue rows")
        print(f"[seed] expected aggregates: {expected}")
        print(f"[seed] db aggregates:      {summary}")
        if not ok:
            print("[seed] ERROR: database aggregates do not match spec targets")
            return 1
        print("[seed] OK: exact aggregate match")
        return 0


if __name__ == "__main__":
    sys.exit(main())
