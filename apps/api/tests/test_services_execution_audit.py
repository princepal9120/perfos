"""Agent N isolated tests: app/services/execution.py + app/services/audit.py.

Uses the real ORM models on an in-memory SQLite engine; registers a recording
fake connector through the real app.connectors.registry.
"""

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.connectors.base import BaseConnector
from app.connectors.registry import register_connector
from app.core.db import Base
from app.models import Approval, AuditLog, Campaign, Recommendation
from app.services import audit as audit_mod
from app.services import execution as exec_mod
from app.services.audit import log_action
from app.services.execution import execute_recommendation


class RecordingConnector(BaseConnector):
    platform = "fake"

    def __init__(self, workspace=None):
        super().__init__(workspace)
        self.calls = []

    def fetch_campaigns(self):
        return []

    def fetch_metrics(self, date_start, date_end):
        return []

    def set_budget(self, campaign_id, new_daily_budget):
        self.calls.append(("set_budget", campaign_id, new_daily_budget))
        return {"ok": True, "campaign_id": campaign_id, "daily_budget": new_daily_budget}

    def pause_campaign(self, campaign_id):
        self.calls.append(("pause", campaign_id))
        return {"ok": True, "campaign_id": campaign_id, "status": "paused"}


def make_rec(id=10, workspace_id=1, proposed_changes=None, rollback=None, status="approved"):
    return Recommendation(
        id=id,
        workspace_id=workspace_id,
        type="reallocate_budget",
        reason="test",
        confidence=0.7,
        risk="low",
        proposed_changes_json=proposed_changes,
        rollback_json=rollback,
        status=status,
    )


@pytest.fixture()
def env(monkeypatch):
    from types import SimpleNamespace

    ctx = SimpleNamespace(instances=[])
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False, future=True)

    monkeypatch.setattr(audit_mod, "SessionLocal", factory)
    monkeypatch.setattr(exec_mod, "SessionLocal", factory)

    original_get = exec_mod._connector_for

    def capturing(platform, workspace):
        conn = original_get(platform, workspace)
        ctx.instances.append(conn)
        return conn

    monkeypatch.setattr(exec_mod, "_connector_for", capturing)
    register_connector("fake", RecordingConnector)

    s = factory()
    s.add(Campaign(id=1, ad_account_id=1, platform="fake", platform_campaign_id="c-1", name="C1"))
    s.commit()

    ctx.session = s
    ctx.factory = factory
    yield ctx
    s.close()


# ---------------------------------------------------------------- execution


def test_executes_set_budget_and_pause(env):
    rec = make_rec(
        proposed_changes={
            "actions": [
                {"action": "set_budget", "campaign_id": 1, "new_daily_budget": 150.0},
                {"action": "pause", "campaign_id": 1},
            ]
        },
        rollback={"set_budget": [{"campaign_id": 1, "new_daily_budget": 100.0}]},
    )
    result = execute_recommendation(rec, workspace_id=1)

    assert result["status"] == "executed"
    assert len(result["results"]) == 2
    assert all(r["ok"] for r in result["results"])
    assert result["errors"] == []
    assert rec.status == "executed"
    calls = [c for inst in env.instances for c in inst.calls]
    assert ("set_budget", 1, 150.0) in calls
    assert ("pause", 1) in calls


def test_writes_audit_rows_with_rollback_payload(env):
    rec = make_rec(
        proposed_changes=[{"action": "set_budget", "campaign_id": 1, "new_daily_budget": 120.0}],
        rollback={"set_budget": [{"campaign_id": 1, "new_daily_budget": 100.0}]},
    )
    execute_recommendation(rec, workspace_id=1)

    rows = env.factory().execute(select(AuditLog)).scalars().all()
    assert len(rows) == 1
    row = rows[0]
    assert row.workspace_id == 1
    assert row.actor == "system:executor"
    assert row.action == "set_budget"
    assert row.target == "campaign:1"
    assert row.payload_json["rollback"] == rec.rollback_json
    assert row.payload_json["request"]["new_daily_budget"] == 120.0
    assert row.payload_json["ok"] is True


def test_blocks_cross_workspace(env):
    rec = make_rec(workspace_id=99, proposed_changes=[{"action": "pause", "campaign_id": 1}])
    result = execute_recommendation(rec, workspace_id=1)
    assert result["status"] == "blocked"
    assert result["reason"] == "workspace_mismatch"
    assert rec.status == "approved"  # untouched
    assert env.factory().execute(select(AuditLog)).scalars().all() == []


def test_failed_action_marks_failed_and_audits_both(env):
    rec = make_rec(
        proposed_changes=[
            {"action": "set_budget", "campaign_id": 1, "new_daily_budget": 50.0},
            {"action": "teleport", "campaign_id": 1},
        ]
    )
    result = execute_recommendation(rec, workspace_id=1)
    assert result["status"] == "failed"
    assert len(result["errors"]) == 1
    assert "unknown_action" in result["errors"][0]["error"]
    assert rec.status == "failed"
    rows = env.factory().execute(select(AuditLog)).scalars().all()
    assert {r.payload_json["ok"] for r in rows} == {True, False}


def test_platform_resolved_from_campaign_when_omitted(env):
    rec = make_rec(proposed_changes={"set_budget": [{"campaign_id": 1, "new_daily_budget": 80.0}]})
    result = execute_recommendation(rec, workspace_id=1)
    assert result["status"] == "executed"
    assert ("set_budget", 1, 80.0) in [c for i in env.instances for c in i.calls]


def test_empty_changes_leaves_pending_style_status_as_executed(env):
    rec = make_rec(proposed_changes=None)
    result = execute_recommendation(rec, workspace_id=1)
    assert result["status"] == "executed"
    assert result["results"] == []


# ------------------------------------------- reallocate_budget approve flow


def test_approving_reallocate_budget_writes_audit_with_rollback_and_executes(env):
    """Approve flow on the seeded demo workspace (id 1): a reallocate_budget
    recommendation shaped like the engine's google->meta 10% shift passes
    policy, the executor writes an AuditLog row carrying rollback_json, and
    Recommendation.status becomes 'executed'."""
    from app.agents.policy import evaluate as evaluate_policy

    rollback = {
        "action": "reverse_budget_transfer",
        "source_platform": "meta",
        "target_platform": "google",
        "budget_shift_pct": 10,
    }
    rec = make_rec(
        proposed_changes={
            "action": "reallocate_budget",
            "source_platform": "google",
            "target_platform": "meta",
            "budget_shift_pct": 10,
            "shift_amount": 1200.0,
            "requires_holdout_experiment": True,
        },
        rollback=rollback,
    )

    decision = evaluate_policy(rec, workspace_id=1)
    assert decision["decision"] == "allow"

    result = execute_recommendation(rec, workspace_id=1)

    assert result["status"] == "executed"
    assert len(result["results"]) == 1
    assert result["results"][0]["ok"] is True
    assert result["results"][0]["response"]["kind"] == "reallocate_budget"
    assert result["errors"] == []
    assert rec.id is not None

    stored = env.factory().get(Recommendation, rec.id)
    assert stored is not None
    assert stored.status == "executed"

    rows = env.factory().execute(select(AuditLog)).scalars().all()
    exec_rows = [r for r in rows if r.action == "reallocate_budget"]
    assert len(exec_rows) == 1
    row = exec_rows[0]
    assert row.workspace_id == 1
    assert row.actor == "system:executor"
    assert row.target == "channel:reallocate_budget"
    assert row.payload_json["recommendation_id"] == rec.id
    assert row.payload_json["rollback"] == rollback
    assert row.payload_json["ok"] is True

    # Channel-level action: no per-campaign connector call was made.
    assert [c for i in env.instances for c in i.calls] == []


def test_approval_decision_recorded_alongside_execution_audit(env):
    """The human approval itself is auditable: an Approval row plus a
    recommendation.allow AuditLog row sit next to the executor's row."""
    from app.agents.policy import evaluate as evaluate_policy

    rec = make_rec(
        proposed_changes={
            "action": "reallocate_budget",
            "source_platform": "meta",
            "target_platform": "google",
            "budget_shift_pct": 10,
        },
        rollback={"action": "reverse_budget_transfer", "budget_shift_pct": 10},
    )
    decision = evaluate_policy(rec, workspace_id=1)
    execute_recommendation(rec, workspace_id=1)

    s = env.factory()
    s.add(
        Approval(
            recommendation_id=rec.id,
            actor="operator:test",
            decision="approved",
            note="approve flow test",
        )
    )
    log_action(
        workspace_id=1,
        actor="operator:test",
        action="recommendation.allow",
        target=f"recommendation:{rec.id}",
        payload={"reasons": decision["reasons"]},
        session=s,
    )
    s.commit()

    approval = s.execute(select(Approval)).scalars().one()
    assert approval.recommendation_id == rec.id
    assert approval.decision == "approved"

    actions = {r.action for r in s.execute(select(AuditLog)).scalars()}
    assert {"reallocate_budget", "recommendation.allow"} <= actions


# ------------------------------------------------------------------- audit


def test_log_action_standalone_commit(env):
    row = log_action(
        workspace_id=1,
        actor="agent:test",
        action="approve",
        target="recommendation:10",
        payload={"decision": "approve"},
    )
    assert row.id is not None
    stored = env.factory().get(AuditLog, row.id)
    assert stored.actor == "agent:test"
    assert stored.action == "approve"
    assert stored.target == "recommendation:10"
    assert stored.payload_json["decision"] == "approve"


def test_log_action_joins_caller_session_without_commit(env):
    s = env.session
    log_action(1, "a", "reject", "recommendation:10", {"note": "no"}, session=s)
    s.commit()
    stored = env.factory().execute(select(AuditLog)).scalars().one()
    assert stored.action == "reject"
