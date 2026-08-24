"""Command Center orchestrator.

One-click pipeline runner + mock tool-calling surface for the dashboard's
Command Center page:

  reconcile -> analysis -> (persist recommendations when none are pending)
  -> collect agent / MCP server / integration statuses.

Tool calls are mocked in demo mode (MOCK_MODE=true): every supported tool
returns realistic-shaped data without touching real provider APIs.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.agents.orchestrator import run_analysis
from app.attribution.reconcile import reconcile as run_reconcile
from app.models import (
    AdAccount,
    ConnectedAgent,
    ExternalIntegration,
    MCPServer,
    Recommendation,
    Revenue,
    Spend,
)
from app.services.audit import log_action

__all__ = ["OrchestratorService"]

_REC_FIELDS = (
    "type",
    "reason",
    "evidence_json",
    "expected_impact",
    "confidence",
    "risk",
    "proposed_changes_json",
    "rollback_json",
    "status",
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _rec_dict(rec: Recommendation) -> dict:
    out = {"id": rec.id}
    for field in _REC_FIELDS:
        value = getattr(rec, field, None)
        if value is not None:
            out[field] = value
    return out


class OrchestratorService:
    """Stateless service behind the Command Center API surface."""

    # ------------------------------------------------------------------ #
    # full pipeline
    # ------------------------------------------------------------------ #

    @staticmethod
    def run_full_pipeline(workspace_id: int, session: Session) -> dict:
        """Run reconcile -> analysis -> recommend, then gather stack statuses."""
        reconciliation = OrchestratorService._reconcile_from_db(
            session, workspace_id
        )

        analysis = run_analysis(workspace_id) or {}
        if not (
            float(reconciliation.get("spend") or 0)
            or float(reconciliation.get("actual") or 0)
        ):
            # Empty DB (pure mock mode): fall back to the orchestrator's own
            # reconcile output, which loads the canonical mock dataset.
            fallback = analysis.get("reconcile") or {}
            if fallback:
                reconciliation = {
                    "spend": float(fallback.get("total_spend") or 0),
                    "claimed": float(fallback.get("platform_claimed_value") or 0),
                    "actual": float(fallback.get("actual_revenue") or 0),
                    "over_count_pct": float(fallback.get("over_count_pct") or 0),
                    "mer": float(fallback.get("blended_mer") or 0),
                }

        recommendations = OrchestratorService._ensure_recommendations(
            workspace_id, session, analysis
        )
        session.commit()

        agents = [
            {"name": a.name, "status": a.status}
            for a in session.query(ConnectedAgent)
            .filter(ConnectedAgent.workspace_id == workspace_id)
            .order_by(ConnectedAgent.id)
            .all()
        ]
        servers = [
            {"name": m.name, "status": m.status}
            for m in session.query(MCPServer)
            .filter(MCPServer.workspace_id == workspace_id)
            .order_by(MCPServer.id)
            .all()
        ]
        integrations = [
            {"name": i.name, "status": i.status}
            for i in session.query(ExternalIntegration)
            .filter(ExternalIntegration.workspace_id == workspace_id)
            .order_by(ExternalIntegration.id)
            .all()
        ]

        return {
            "reconcile_summary": reconciliation,
            "recommendations": recommendations,
            "agents_status": agents,
            "mcp_servers": servers,
            "integrations": integrations,
            "pipeline_run_at": _now_iso(),
        }

    @staticmethod
    def _reconcile_from_db(session: Session, workspace_id: int) -> dict:
        spend_rows = (
            session.query(Spend, AdAccount.platform)
            .outerjoin(AdAccount, Spend.ad_account_id == AdAccount.id)
            .filter(Spend.workspace_id == workspace_id)
            .all()
        )
        spends = [
            {
                "platform": platform or "unknown",
                "cost": float(spend.cost or 0),
                "conversions": float(spend.conversions or 0),
                "conversion_value": float(spend.conversion_value or 0),
            }
            for spend, platform in spend_rows
        ]
        revenues = [
            {"amount": float(rev.amount or 0)}
            for rev in session.query(Revenue)
            .filter(Revenue.workspace_id == workspace_id)
            .all()
        ]
        result = run_reconcile(spends, revenues) if (spends or revenues) else {}
        return {
            "spend": float(result.get("total_spend") or 0),
            "claimed": float(result.get("platform_claimed_value") or 0),
            "actual": float(result.get("actual_revenue") or 0),
            "over_count_pct": float(result.get("over_count_pct") or 0),
            "mer": float(result.get("blended_mer") or 0),
        }

    @staticmethod
    def _ensure_recommendations(
        workspace_id: int, session: Session, analysis: dict
    ) -> list[dict]:
        pending = (
            session.query(Recommendation)
            .filter(
                Recommendation.workspace_id == workspace_id,
                Recommendation.status == "pending",
            )
            .order_by(Recommendation.created_at.desc(), Recommendation.id.desc())
            .all()
        )
        if pending:
            return [_rec_dict(r) for r in pending]

        created: list[Recommendation] = []
        for r in analysis.get("recommendations") or []:
            rec = Recommendation(
                workspace_id=workspace_id,
                type=r.get("type", "unknown"),
                reason=r.get("reason", ""),
                evidence_json=r.get("evidence_json"),
                expected_impact=r.get("expected_impact"),
                confidence=float(r.get("confidence") or 0.0),
                risk=r.get("risk", "medium"),
                proposed_changes_json=r.get("proposed_changes_json"),
                rollback_json=r.get("rollback_json"),
                status=r.get("status", "pending"),
            )
            session.add(rec)
            created.append(rec)
        if created:
            session.flush()
            for rec in created:
                session.refresh(rec)
        return [_rec_dict(r) for r in created]

    # ------------------------------------------------------------------ #
    # mock tool calling
    # ------------------------------------------------------------------ #

    SUPPORTED_TOOLS = (
        "google_ads.fetch_campaigns",
        "meta_ads.fetch_adsets",
        "shopify.fetch_orders",
        "slack.send_message",
        "linear.create_issue",
        "github.create_pr",
    )

    @staticmethod
    def call_tool(
        workspace_id: int, tool_name: str, params: dict | None = None
    ) -> dict:
        """Execute a supported tool against its mock backend."""
        params = params or {}
        echo = dict(params)
        base = {
            "tool": tool_name,
            "params_echo": echo,
            "called_at": _now_iso(),
        }
        if tool_name not in OrchestratorService.SUPPORTED_TOOLS:
            return {
                **base,
                "status": "error",
                "result": {
                    "error": f"Unsupported tool '{tool_name}'.",
                    "supported": list(OrchestratorService.SUPPORTED_TOOLS),
                },
            }

        handler = getattr(
            OrchestratorService, f"_tool_{tool_name.split('.')[0]}", None
        )
        result = (
            handler(echo) if handler else {"note": f"{tool_name} executed (mock)."}
        )
        return {**base, "status": "ok", "result": result}

    @staticmethod
    def _tool_google_ads(params: dict) -> Any:
        del params  # mock mode ignores credentials/targeting params
        return [
            {
                "id": "camp-goo-001",
                "name": "Search - Brand Defense",
                "status": "ENABLED",
                "daily_budget": 500.0,
                "spend": 12000.0,
                "impressions": 400000,
                "clicks": 8000,
                "conversions": 600.0,
                "conversion_value": 60000.0,
                "ctr": 2.0,
                "cpc": 1.5,
            },
            {
                "id": "camp-goo-002",
                "name": "Performance Max - Catalog",
                "status": "ENABLED",
                "daily_budget": 350.0,
                "spend": 7350.0,
                "impressions": 285000,
                "clicks": 5130,
                "conversions": 342.0,
                "conversion_value": 34200.0,
                "ctr": 1.8,
                "cpc": 1.43,
            },
        ]

    @staticmethod
    def _tool_meta_ads(params: dict) -> Any:
        del params
        return [
            {
                "id": "adset-meta-001",
                "campaign_name": "Prospecting - Broad",
                "name": "Broad US 25-54",
                "status": "ACTIVE",
                "daily_budget": 400.0,
                "spend": 8000.0,
                "impressions": 350000,
                "clicks": 7000,
                "conversions": 500.0,
                "conversion_value": 44000.0,
                "ctr": 2.0,
                "cpc": 1.14,
            },
            {
                "id": "adset-meta-002",
                "campaign_name": "Retargeting - Cart",
                "name": "Cart Abandoners 14d",
                "status": "ACTIVE",
                "daily_budget": 250.0,
                "spend": 4125.0,
                "impressions": 160000,
                "clicks": 3840,
                "conversions": 330.0,
                "conversion_value": 29700.0,
                "ctr": 2.4,
                "cpc": 1.07,
            },
        ]

    @staticmethod
    def _tool_shopify(params: dict) -> Any:
        limit = int(params.get("limit") or 5)
        orders = [
            {
                "order_id": f"SHOPIFY-{1000 + i}",
                "total": [80.0, 120.0, 240.0][i % 3],
                "currency": "USD",
                "financial_status": "paid",
                "customer_id": f"c-{i:03d}",
                "is_new_customer": i % 5 == 0,
            }
            for i in range(max(1, min(limit, 50)))
        ]
        return {
            "count": len(orders),
            "total_value": round(sum(o["total"] for o in orders), 2),
            "orders": orders,
        }

    @staticmethod
    def _tool_slack(params: dict) -> Any:
        channel = params.get("channel") or "#growth"
        text = params.get("text") or "PerfOS daily digest: MER 6.5x, over-count 33%."
        return {
            "ok": True,
            "channel": channel,
            "text": text,
            "ts": "1756000000.000100",
        }

    @staticmethod
    def _tool_linear(params: dict) -> Any:
        title = params.get("title") or "Audit Meta attribution windows"
        team = params.get("team") or "Growth"
        return {
            "id": "issue-perfos-142",
            "key": "PERFOS-142",
            "title": title,
            "team": team,
            "state": "Todo",
            "url": "https://linear.app/perfos/issue/PERFOS-142",
        }

    @staticmethod
    def _tool_github(params: dict) -> Any:
        title = params.get("title") or "chore: shift budget per PerfOS rec"
        head = params.get("head") or "perfos/budget-shift"
        return {
            "number": 42,
            "title": title,
            "state": "open",
            "head": head,
            "base": params.get("base") or "main",
            "url": "https://github.com/demo-dtc/store/pull/42",
        }

    # ------------------------------------------------------------------ #
    # agents
    # ------------------------------------------------------------------ #

    @staticmethod
    def dispatch_all_agents(workspace_id: int, session: Session) -> dict:
        agents = (
            session.query(ConnectedAgent)
            .filter(ConnectedAgent.workspace_id == workspace_id)
            .order_by(ConnectedAgent.id)
            .all()
        )
        dispatched: list[str] = []
        now = datetime.now(timezone.utc)
        for agent in agents:
            agent.last_run_at = now
            log_action(
                workspace_id=workspace_id,
                actor="system",
                action="agent.dispatch",
                target=f"agent:{agent.id}",
                payload={"source": "command_center"},
                session=session,
            )
            dispatched.append(agent.name)
        session.commit()
        return {
            "dispatched_agents": dispatched,
            "count": len(dispatched),
            "called_at": _now_iso(),
        }
