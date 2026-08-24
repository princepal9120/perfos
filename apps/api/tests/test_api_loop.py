"""End-to-end API loop test (completion agent 11).

Mirrors the manual curl loop from docs/REVERSE_ENGINEERING.md against
app.main:app via FastAPI TestClient:

    seed demo workspace -> POST /api/recommendations/generate
    -> POST /api/recommendations/{id}/approve
    -> rec status becomes "executed" and AuditLog rows exist.

Uses a SEPARATE scratch DB (never perfos.db):
    cd PerfOS && . .venv/bin/activate && \
    MOCK_MODE=true DATABASE_URL=sqlite:///./perfos_test.db \
    python -m pytest tests/test_api_loop.py -q
"""

from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.core.db import Base, SessionLocal, engine, init_db
from app.mock.dataset import TARGETS, WORKSPACE_NAME, get_mock_data


def _rebuild_if_needed() -> int:
    """Ensure the exact demo workspace exists in the test DB; return its id."""
    from sqlalchemy import func

    import app.models  # noqa: F401  (registers ORM mappings on Base.metadata)
    from app.models import AdAccount, Campaign, Organization, Revenue, Spend, Workspace

    init_db()
    with SessionLocal() as session:
        ws = session.query(Workspace).filter(Workspace.name == WORKSPACE_NAME).first()
        if ws is not None:
            spend = (
                session.query(func.sum(Spend.cost))
                .filter(Spend.workspace_id == ws.id)
                .scalar()
                or 0.0
            )
            revenue = (
                session.query(func.sum(Revenue.amount))
                .filter(Revenue.workspace_id == ws.id)
                .scalar()
                or 0.0
            )
            expected_spend = TARGETS["google"]["spend"] + TARGETS["meta"]["spend"]
            if (
                abs(float(spend) - expected_spend) < 0.01
                and abs(float(revenue) - TARGETS["shopify"]["revenue"]) < 0.01
            ):
                return ws.id

        # Stale or missing seed -> rebuild from the canonical mock dataset.
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        data = get_mock_data()
        org = Organization(name=data["organization"]["name"])
        session.add(org)
        session.flush()

        ws = Workspace(
            org_id=org.id,
            name=data["workspace"]["name"],
            currency=data["workspace"]["currency"],
        )
        session.add(ws)
        session.flush()

        account_ids: dict[str, int] = {}
        for a in data["accounts"]:
            row = AdAccount(
                workspace_id=ws.id,
                platform=a["platform"],
                platform_account_id=a["platform_account_id"],
                name=a["name"],
                status=a["status"],
            )
            session.add(row)
            session.flush()
            account_ids[a["id"]] = row.id

        campaign_ids: dict[str, int] = {}
        for c in data["campaigns"]:
            row = Campaign(
                ad_account_id=account_ids[c["ad_account_id"]],
                platform=c["platform"],
                platform_campaign_id=c["platform_campaign_id"],
                name=c["name"],
                status=c["status"],
                daily_budget=c["daily_budget"],
            )
            session.add(row)
            session.flush()
            campaign_ids[c["id"]] = row.id

        session.add_all(
            Spend(
                workspace_id=ws.id,
                ad_account_id=account_ids[r["ad_account_id"]],
                campaign_id=campaign_ids[r["campaign_id"]],
                date=date.fromisoformat(r["date"]),
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
                workspace_id=ws.id,
                source=r["source"],
                order_id=r["order_id"],
                date=date.fromisoformat(r["date"]),
                amount=r["amount"],
                customer_id=r["customer_id"],
                is_new_customer=r["is_new_customer"],
            )
            for r in data["revenue"]
        )
        session.commit()
        return ws.id


@pytest.fixture(scope="module")
def api():
    """TestClient on app.main:app hitting the seeded perfos_test.db."""
    from app.main import app

    headers = {"X-Workspace-Id": str(_rebuild_if_needed())}
    with TestClient(app) as client:
        yield client, headers


def test_full_loop_generate_approve_executes_and_audits(api):
    client, headers = api

    assert client.get("/api/health").json() == {"status": "ok"}

    resp = client.post("/api/recommendations/generate", headers=headers)
    assert resp.status_code == 201, resp.text
    recs = resp.json()
    assert recs, "demo dataset must produce at least one recommendation"
    rec = recs[0]
    assert rec["type"] == "reallocate_budget"
    assert rec["status"] == "pending"
    rec_id = rec["id"]

    resp = client.post(
        f"/api/recommendations/{rec_id}/approve",
        headers=headers,
        json={"actor": "e2e-test"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["decision"] == "allow"
    assert body["recommendation_id"] == rec_id
    assert body["status"] == "executed"

    with SessionLocal() as session:
        from app.models import AuditLog, Recommendation

        row = session.get(Recommendation, rec_id)
        assert row is not None
        assert row.status == "executed"

        audits = (
            session.query(AuditLog)
            .filter(AuditLog.workspace_id == row.workspace_id)
            .all()
        )
        assert audits, "approval loop must leave AuditLog rows behind"
        actions = {a.action for a in audits}
        targets = {a.target for a in audits}
        assert "reallocate_budget" in actions  # written by system:executor
        assert f"recommendation:{rec_id}" in targets  # written by the API route
