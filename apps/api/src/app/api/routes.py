import base64
import hashlib
import hmac
import json
import os
import time
from datetime import UTC, datetime
from typing import Annotated, Any, Literal, TypeAlias

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.agents.policy import evaluate as evaluate_policy
from app.agents.orchestrator import run_analysis
from app.attribution.reconcile import reconcile as run_reconcile
from app.core.db import get_db
from app.models import (
    AdAccount,
    Approval,
    ConnectedAgent,
    CreativePerformance,
    Experiment,
    ExternalIntegration,
    IncrementalityTest,
    MCPServer,
    Outcome,
    Recommendation,
    Revenue,
    Spend,
    Workspace,
)
from app.services.audit import log_action
from app.services.briefing import build_briefing
from app.services.execution import execute_recommendation
from app.services.optimizer import recommend_reallocation
from app.services.orchestrator import OrchestratorService
from app.services.reconciliation_iroas import compute_iroas

router = APIRouter()

PLATFORMS = Literal[
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
AGENT_PROVIDERS = Literal["chatgpt", "claude", "opencode", "openai", "anthropic"]
TOKEN_SECRET = os.environ.get("PERFOS_TOKEN_SECRET", "perfos-dev-secret")
TOKEN_TTL_SECONDS = 86400


def _now() -> datetime:
    return datetime.now(UTC)


def _sign(raw: bytes) -> str:
    return hmac.new(TOKEN_SECRET.encode(), raw, hashlib.sha256).hexdigest()


def issue_token(workspace_id: int) -> str:
    payload = base64.urlsafe_b64encode(
        json.dumps(
            {"workspace_id": workspace_id, "exp": int(time.time()) + TOKEN_TTL_SECONDS}
        ).encode()
    ).decode()
    return f"{payload}.{_sign(payload.encode())}"


def verify_token(token: str) -> int | None:
    try:
        payload, sig = token.rsplit(".", 1)
        if not hmac.compare_digest(sig, _sign(payload.encode())):
            return None
        data = json.loads(base64.urlsafe_b64decode(payload))
        if data.get("exp", 0) < time.time():
            return None
        return int(data["workspace_id"])
    except Exception:
        return None


async def workspace_from_header(
    x_workspace_id: Annotated[str | None, Header(alias="X-Workspace-Id")] = None,
) -> int:
    if not x_workspace_id:
        raise HTTPException(status_code=400, detail="Missing X-Workspace-Id header")
    try:
        return int(x_workspace_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="X-Workspace-Id must be an integer") from exc


async def optional_workspace_id(
    x_workspace_id: Annotated[str | None, Header(alias="X-Workspace-Id")] = None,
) -> int | None:
    if not x_workspace_id:
        return None
    try:
        return int(x_workspace_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="X-Workspace-Id must be an integer") from exc


DbDep: TypeAlias = Annotated[Session, Depends(get_db)]
WorkspaceId: TypeAlias = Annotated[int, Depends(workspace_from_header)]
OptionalWorkspaceId: TypeAlias = Annotated[int | None, Depends(optional_workspace_id)]


class _ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TokenRequest(BaseModel):
    api_key: str | None = None
    password: str | None = None
    workspace_id: int | None = None
    workspace: str | None = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str
    workspace_id: int


class WorkspaceOut(_ORMModel):
    id: int
    org_id: int | None = None
    name: str
    currency: str = "USD"
    created_at: datetime | None = None


class AccountCreate(BaseModel):
    platform: PLATFORMS
    platform_account_id: str | None = None
    name: str | None = None


class AccountOut(_ORMModel):
    id: int
    workspace_id: int
    platform: str
    platform_account_id: str | None = None
    name: str
    status: str
    connected_at: datetime | None = None


class ChannelStat(BaseModel):
    platform: str
    spend: float
    claimed_value: float
    claimed_roas: float


class ReconcileOut(BaseModel):
    total_spend: float
    platform_claimed_value: float
    actual_revenue: float
    blended_mer: float
    per_channel: list[ChannelStat]
    over_count_value: float
    over_count_pct: float
    tracking_integrity_flag: bool


class BriefingOut(BaseModel):
    kpis: dict
    changes: list[Any]
    recommendations: list[Any]
    narrative: str


class RecommendationOut(_ORMModel):
    id: int
    workspace_id: int
    type: str
    reason: str
    evidence_json: Any | None = None
    expected_impact: str | None = None
    confidence: float
    risk: str
    proposed_changes_json: Any | None = None
    rollback_json: Any | None = None
    status: str
    created_at: datetime | None = None


class DecisionRequest(BaseModel):
    actor: str = "user"
    note: str | None = None


class DecisionResult(BaseModel):
    recommendation_id: int
    status: str
    decision: str
    reasons: list[str]


class ExperimentCreate(BaseModel):
    hypothesis: str
    primary_metric: str = "blended_mer"
    control_json: dict = {}
    variant_json: dict = {}


class ExperimentOut(_ORMModel):
    id: int
    workspace_id: int
    hypothesis: str
    control_json: Any | None = None
    variant_json: Any | None = None
    primary_metric: str
    status: str
    result_json: Any | None = None
    created_at: datetime | None = None


class OutcomeOut(_ORMModel):
    id: int
    recommendation_id: int
    metric: str
    before: float
    after: float
    delta: float
    recorded_at: datetime | None = None


class AgentCreate(BaseModel):
    provider: AGENT_PROVIDERS
    name: str
    config_json: dict = {}


class AgentOut(_ORMModel):
    id: int
    workspace_id: int
    provider: str
    name: str
    status: str
    config_json: Any | None = None
    last_run_at: datetime | None = None


class DispatchRequest(BaseModel):
    payload: dict = {}


class MCPServerCreate(BaseModel):
    name: str
    transport: Literal["http", "sse", "stdio"] = "http"
    endpoint: str | None = None
    enabled: bool = True
    config_json: dict[str, Any] | None = None


class MCPServerOut(_ORMModel):
    id: int
    workspace_id: int
    name: str
    transport: str
    endpoint: str | None = None
    enabled: bool
    status: str
    config_json: dict[str, Any] | None = None
    last_checked_at: datetime | None = None


INTEGRATION_PROVIDERS = Literal[
    "google_ads",
    "meta_ads",
    "shopify",
    "stripe",
    "slack",
    "linear",
    "github",
    "notion",
]
INTEGRATION_CATEGORIES = Literal["ads", "analytics", "crm", "creative"]


class IntegrationCreate(BaseModel):
    name: str
    provider: INTEGRATION_PROVIDERS
    category: INTEGRATION_CATEGORIES = "ads"
    endpoint: str | None = None
    api_key: str | None = None
    config_json: dict[str, Any] | None = None


class IntegrationOut(_ORMModel):
    id: int
    workspace_id: int
    name: str
    category: str
    provider: str
    endpoint: str | None = None
    api_key_encrypted: str | None = None
    enabled: bool
    status: str
    config_json: dict[str, Any] | None = None
    last_checked_at: datetime | None = None


def _audit(
    db: Session,
    workspace_id: int,
    actor: str,
    action: str,
    target: str,
    payload: dict,
) -> None:
    log_action(
        workspace_id=workspace_id,
        actor=actor,
        action=action,
        target=target,
        payload=payload,
        session=db,
    )


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.post("/auth/token", response_model=TokenOut)
def create_token(body: TokenRequest, db: DbDep) -> TokenOut:
    if not body.api_key and not body.password:
        raise HTTPException(status_code=401, detail="api_key or password required")
    query = db.query(Workspace)
    workspace = None
    if body.workspace_id is not None:
        workspace = query.filter(Workspace.id == body.workspace_id).first()
    elif body.workspace is not None:
        workspace = query.filter(Workspace.name == body.workspace).first()
    else:
        workspace = query.first()
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return TokenOut(
        access_token=issue_token(workspace.id),
        token_type="bearer",
        workspace_id=workspace.id,
    )


@router.get("/workspaces", response_model=list[WorkspaceOut])
def list_workspaces(db: DbDep) -> list[Workspace]:
    return db.query(Workspace).order_by(Workspace.id).all()


@router.get("/accounts", response_model=list[AccountOut])
def list_accounts(db: DbDep, workspace_id: WorkspaceId) -> list[AdAccount]:
    return (
        db.query(AdAccount)
        .filter(AdAccount.workspace_id == workspace_id)
        .order_by(AdAccount.id)
        .all()
    )


@router.post("/accounts", response_model=AccountOut, status_code=201)
def connect_account(body: AccountCreate, db: DbDep, workspace_id: WorkspaceId) -> AdAccount:
    account = AdAccount(
        workspace_id=workspace_id,
        platform=body.platform,
        platform_account_id=body.platform_account_id or body.platform,
        name=body.name or f"{body.platform} (mock)",
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/reconcile", response_model=ReconcileOut)
def get_reconcile(
    db: DbDep,
    header_workspace_id: OptionalWorkspaceId = None,
    workspace_id: Annotated[int | None, Query()] = None,
) -> dict:
    ws = workspace_id or header_workspace_id
    if ws is None:
        raise HTTPException(
            status_code=400, detail="workspace_id required via query or X-Workspace-Id"
        )
    spend_rows = (
        db.query(Spend, AdAccount.platform)
        .outerjoin(AdAccount, Spend.ad_account_id == AdAccount.id)
        .filter(Spend.workspace_id == ws)
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
        for rev in db.query(Revenue).filter(Revenue.workspace_id == ws).all()
    ]
    return run_reconcile(spends, revenues)


@router.get("/attribution")
def get_attribution(workspace_id: WorkspaceId) -> dict:
    from app.agents.orchestrator import run_analysis

    return run_analysis(workspace_id)["attribution"]


@router.get("/briefing", response_model=BriefingOut)
def get_briefing(db: DbDep, workspace_id: WorkspaceId) -> dict:
    return build_briefing(workspace_id)


@router.get("/recommendations", response_model=list[RecommendationOut])
def list_recommendations(db: DbDep, workspace_id: WorkspaceId) -> list[Recommendation]:
    return (
        db.query(Recommendation)
        .filter(Recommendation.workspace_id == workspace_id)
        .order_by(Recommendation.created_at.desc(), Recommendation.id.desc())
        .all()
    )


@router.post(
    "/recommendations/generate",
    response_model=list[RecommendationOut],
    status_code=201,
)
def generate_recommendations(db: DbDep, workspace_id: WorkspaceId) -> list[Recommendation]:
    """Run the analysis pipeline and persist fresh recommendations for the workspace.

    The reconciliation/recommendation engines run on the mock dataset (or DB) and
    emit Recommendation-shaped dicts; this endpoint persists them so the approve
    flow (policy -> execution -> audit) operates on durable rows. Idempotent per
    call: it appends a new batch each invocation (re-run to refresh).
    """
    from app.agents.orchestrator import run_analysis

    analysis = run_analysis(workspace_id)
    recs = analysis.get("recommendations") or []
    persisted: list[Recommendation] = []
    for r in recs:
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
        db.add(rec)
        persisted.append(rec)
    db.commit()
    for rec in persisted:
        db.refresh(rec)
    return persisted


@router.post("/recommendations/{recommendation_id}/approve", response_model=DecisionResult)
def approve_recommendation(
    recommendation_id: int, body: DecisionRequest, db: DbDep, workspace_id: WorkspaceId
) -> DecisionResult:
    rec = db.get(Recommendation, recommendation_id)
    if rec is None or rec.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    decision = evaluate_policy(rec, workspace_id=workspace_id)
    outcome = decision.get("decision", "block")
    reasons = decision.get("reasons", [])
    if outcome == "block":
        return DecisionResult(
            recommendation_id=rec.id,
            status=rec.status,
            decision="block",
            reasons=reasons,
        )
    db.add(
        Approval(
            recommendation_id=rec.id,
            actor=body.actor,
            decision="approved",
            note=body.note,
        )
    )
    if outcome == "allow":
        execute_recommendation(rec, workspace_id, session=db)
    _audit(
        db,
        workspace_id,
        body.actor,
        f"recommendation.{outcome}",
        f"recommendation:{rec.id}",
        {"reasons": reasons},
    )
    db.commit()
    db.refresh(rec)
    return DecisionResult(
        recommendation_id=rec.id,
        status=rec.status,
        decision=outcome,
        reasons=reasons,
    )


@router.post("/recommendations/{recommendation_id}/reject", response_model=DecisionResult)
def reject_recommendation(
    recommendation_id: int, body: DecisionRequest, db: DbDep, workspace_id: WorkspaceId
) -> DecisionResult:
    rec = db.get(Recommendation, recommendation_id)
    if rec is None or rec.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.status = "rejected"
    db.add(
        Approval(
            recommendation_id=rec.id,
            actor=body.actor,
            decision="rejected",
            note=body.note,
        )
    )
    _audit(
        db,
        workspace_id,
        body.actor,
        "recommendation.rejected",
        f"recommendation:{rec.id}",
        {"note": body.note},
    )
    db.commit()
    db.refresh(rec)
    return DecisionResult(
        recommendation_id=rec.id,
        status=rec.status,
        decision="rejected",
        reasons=[],
    )


@router.get("/experiments", response_model=list[ExperimentOut])
def list_experiments(db: DbDep, workspace_id: WorkspaceId) -> list[Experiment]:
    return (
        db.query(Experiment)
        .filter(Experiment.workspace_id == workspace_id)
        .order_by(Experiment.created_at.desc(), Experiment.id.desc())
        .all()
    )


@router.post("/experiments", response_model=ExperimentOut, status_code=201)
def create_experiment(body: ExperimentCreate, db: DbDep, workspace_id: WorkspaceId) -> Experiment:
    experiment = Experiment(
        workspace_id=workspace_id,
        hypothesis=body.hypothesis,
        control_json=body.control_json,
        variant_json=body.variant_json,
        primary_metric=body.primary_metric,
    )
    db.add(experiment)
    db.commit()
    db.refresh(experiment)
    return experiment


@router.get("/outcomes", response_model=list[OutcomeOut])
def list_outcomes(db: DbDep, workspace_id: WorkspaceId) -> list[Outcome]:
    return (
        db.query(Outcome)
        .join(Recommendation, Outcome.recommendation_id == Recommendation.id)
        .filter(Recommendation.workspace_id == workspace_id)
        .order_by(Outcome.recorded_at.desc(), Outcome.id.desc())
        .all()
    )


@router.get("/agents", response_model=list[AgentOut])
def list_agents(db: DbDep, workspace_id: WorkspaceId) -> list[ConnectedAgent]:
    return (
        db.query(ConnectedAgent)
        .filter(ConnectedAgent.workspace_id == workspace_id)
        .order_by(ConnectedAgent.id)
        .all()
    )


@router.post("/agents", response_model=AgentOut, status_code=201)
def register_agent(body: AgentCreate, db: DbDep, workspace_id: WorkspaceId) -> ConnectedAgent:
    agent = ConnectedAgent(
        workspace_id=workspace_id,
        provider=body.provider,
        name=body.name,
        config_json=body.config_json,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.post("/agents/{agent_id}/dispatch", response_model=AgentOut)
def dispatch_agent(
    agent_id: int, body: DispatchRequest, db: DbDep, workspace_id: WorkspaceId
) -> ConnectedAgent:
    agent = db.get(ConnectedAgent, agent_id)
    if agent is None or agent.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.last_run_at = _now()
    _audit(
        db,
        workspace_id,
        "system",
        "agent.dispatch",
        f"agent:{agent.id}",
        body.payload,
    )
    db.commit()
    db.refresh(agent)
    return agent


# ---- MCP servers (manage the tools your agents can call) ----


@router.get("/mcp", response_model=list[MCPServerOut])
def list_mcp_servers(db: DbDep, workspace_id: WorkspaceId) -> list[MCPServer]:
    return (
        db.query(MCPServer)
        .filter(MCPServer.workspace_id == workspace_id)
        .order_by(MCPServer.id)
        .all()
    )


@router.post("/mcp", response_model=MCPServerOut, status_code=201)
def register_mcp_server(body: MCPServerCreate, db: DbDep, workspace_id: WorkspaceId) -> MCPServer:
    """Register an MCP server (http/sse/stdio). Status is mocked in demo mode."""
    server = MCPServer(
        workspace_id=workspace_id,
        name=body.name,
        transport=body.transport,
        endpoint=body.endpoint,
        enabled=body.enabled,
        config_json=body.config_json,
        status="connected" if body.enabled else "disabled",
    )
    db.add(server)
    db.commit()
    db.refresh(server)
    _audit(
        db,
        workspace_id,
        "system",
        "mcp.register",
        f"mcp:{server.id}",
        {"transport": body.transport, "endpoint": body.endpoint},
    )
    return server


@router.post("/mcp/{server_id}/toggle", response_model=MCPServerOut)
def toggle_mcp_server(server_id: int, db: DbDep, workspace_id: WorkspaceId) -> MCPServer:
    server = db.get(MCPServer, server_id)
    if server is None or server.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="MCP server not found")
    server.enabled = not server.enabled
    server.status = "connected" if server.enabled else "disabled"
    server.last_checked_at = _now()
    _audit(
        db,
        workspace_id,
        "system",
        "mcp.toggle",
        f"mcp:{server.id}",
        {"enabled": server.enabled},
    )
    db.commit()
    db.refresh(server)
    return server


# ---- External integrations (ads/analytics/crm/creative providers) ----


@router.get("/integrations", response_model=list[IntegrationOut])
def list_integrations(db: DbDep, workspace_id: WorkspaceId) -> list[ExternalIntegration]:
    return (
        db.query(ExternalIntegration)
        .filter(ExternalIntegration.workspace_id == workspace_id)
        .order_by(ExternalIntegration.id)
        .all()
    )


@router.post("/integrations", response_model=IntegrationOut, status_code=201)
def register_integration(
    body: IntegrationCreate, db: DbDep, workspace_id: WorkspaceId
) -> ExternalIntegration:
    """Register an external integration. Status is mocked in demo mode."""
    integration = ExternalIntegration(
        workspace_id=workspace_id,
        name=body.name,
        category=body.category,
        provider=body.provider,
        endpoint=body.endpoint,
        api_key_encrypted=body.api_key,
        enabled=True,
        config_json=body.config_json,
        status="connected",
    )
    db.add(integration)
    db.commit()
    db.refresh(integration)
    _audit(
        db,
        workspace_id,
        "system",
        "integrations.register",
        f"integration:{integration.id}",
        {"provider": body.provider, "category": body.category, "endpoint": body.endpoint},
    )
    return integration


@router.post("/integrations/{integration_id}/toggle", response_model=IntegrationOut)
def toggle_integration(
    integration_id: int, db: DbDep, workspace_id: WorkspaceId
) -> ExternalIntegration:
    integration = db.get(ExternalIntegration, integration_id)
    if integration is None or integration.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Integration not found")
    integration.enabled = not integration.enabled
    integration.status = "connected" if integration.enabled else "disabled"
    integration.last_checked_at = _now()
    _audit(
        db,
        workspace_id,
        "system",
        "integrations.toggle",
        f"integration:{integration.id}",
        {"enabled": integration.enabled},
    )
    db.commit()
    db.refresh(integration)
    return integration


# ---- Command Center (pipeline / tool calls / agent dispatch) ----


class ToolCallRequest(BaseModel):
    tool_name: str
    params: dict = {}


@router.get("/pipeline")
def run_full_pipeline(db: DbDep, workspace_id: WorkspaceId) -> dict:
    """Run reconcile -> analysis -> recommend and gather stack statuses."""
    return OrchestratorService.run_full_pipeline(workspace_id, db)


@router.post("/tools/call")
def call_tool(body: ToolCallRequest, db: DbDep, workspace_id: WorkspaceId) -> dict:
    """Call a supported integration tool (mock backends in demo mode)."""
    if not body.tool_name.strip():
        raise HTTPException(status_code=400, detail="tool_name is required")
    return OrchestratorService.call_tool(workspace_id, body.tool_name.strip(), body.params)


@router.post("/agents/dispatch-all")
def dispatch_all_agents(db: DbDep, workspace_id: WorkspaceId) -> dict:
    """Set last_run_at on every connected agent and report who was dispatched."""
    return OrchestratorService.dispatch_all_agents(workspace_id, db)


# ---- Measurement: iROAS / creatives / anomalies / optimizer / incrementality ----

TEST_TYPES = Literal["geo_holdout", "conversion_lift", "ab"]

ANOMALIES_MOCK = [
    {
        "platform": "meta",
        "metric": "spend",
        "severity": "high",
        "detected_at": "2026-08-24T09:00:00Z",
        "detail": "meta spend +38% vs 7d avg",
    },
    {
        "platform": "tiktok",
        "metric": "cpa",
        "severity": "medium",
        "detected_at": "2026-08-24T09:00:00Z",
        "detail": "tiktok CPA +22% vs 7d avg on Prospecting",
    },
    {
        "platform": "google",
        "metric": "ctr",
        "severity": "low",
        "detected_at": "2026-08-24T09:00:00Z",
        "detail": "google CTR down 12% week over week on brand search",
    },
]


class IroasRow(BaseModel):
    platform: str
    reported_roas: float
    iroas: float
    calibration: float


class CreativeOut(_ORMModel):
    id: int
    workspace_id: int
    platform: str
    creative_id: str
    impressions: int
    spend: float
    conversions: float
    fatigue_score: float
    hook_rate: float


class AnomalyOut(BaseModel):
    platform: str
    metric: str
    severity: str
    detected_at: str
    detail: str


class OptimizerPlanRow(BaseModel):
    platform: str
    current_spend: float
    recommended_spend: float
    delta: float
    expected_iroas: float


class OptimizerPlan(BaseModel):
    total_current_spend: float
    total_recommended_spend: float
    plan: list[OptimizerPlanRow]


class IncrementalityCreate(BaseModel):
    platform: PLATFORMS
    test_type: TEST_TYPES = "geo_holdout"
    markets_treated: list[str] = []
    markets_control: list[str] = []
    spend_treated: float = 0.0
    spend_control: float = 0.0
    conversions_treated: float = 0.0
    conversions_control: float = 0.0
    spend_treated: float = 0.0
    spend_control: float = 0.0
    conversions_treated: float = 0.0
    conversions_control: float = 0.0
    spend_treated: float = 0.0
    spend_control: float = 0.0
    conversions_treated: float = 0.0
    conversions_control: float = 0.0


class IncrementalityOut(_ORMModel):
    id: int
    workspace_id: int
    platform: str
    test_type: str
    status: str
    markets_treated: Any | None = None
    markets_control: Any | None = None
    spend_treated: float
    spend_control: float
    conversions_treated: float
    conversions_control: float
    lift_pct: float | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None


@router.get("/iroas", response_model=list[IroasRow])
def get_iroas(db: DbDep, workspace_id: WorkspaceId) -> list[IroasRow]:
    """Incrementality-corrected ROAS per channel (deterministic mock calibration)."""
    return [IroasRow(**row) for row in compute_iroas(workspace_id, db)]


@router.get("/creatives", response_model=list[CreativeOut])
def list_creatives(db: DbDep, workspace_id: WorkspaceId) -> list[CreativePerformance]:
    return (
        db.query(CreativePerformance)
        .filter(CreativePerformance.workspace_id == workspace_id)
        .order_by(CreativePerformance.fatigue_score.desc(), CreativePerformance.id)
        .all()
    )


@router.get("/anomalies", response_model=list[AnomalyOut])
def list_anomalies() -> list[AnomalyOut]:
    """Deterministic mock anomaly feed (spend/CPA/CTR deviations)."""
    return [AnomalyOut(**row) for row in ANOMALIES_MOCK]


@router.post("/optimizer/reallocate", response_model=OptimizerPlan)
def run_optimizer(db: DbDep, workspace_id: WorkspaceId) -> OptimizerPlan:
    """Deterministic what-if reallocation plan. Plan only; nothing executes."""
    return OptimizerPlan(**recommend_reallocation(workspace_id, db))


def _incrementality_or_404(db: Session, workspace_id: int, test_id: int) -> IncrementalityTest:
    test = (
        db.query(IncrementalityTest)
        .filter(
            IncrementalityTest.id == test_id,
            IncrementalityTest.workspace_id == workspace_id,
        )
        .first()
    )
    if test is None:
        raise HTTPException(status_code=404, detail="Incrementality test not found")
    return test


@router.get("/incrementality", response_model=list[IncrementalityOut])
def list_incrementality(db: DbDep, workspace_id: WorkspaceId) -> list[IncrementalityTest]:
    return (
        db.query(IncrementalityTest)
        .filter(IncrementalityTest.workspace_id == workspace_id)
        .order_by(IncrementalityTest.id)
        .all()
    )


@router.post("/incrementality", response_model=IncrementalityOut, status_code=201)
def create_incrementality_test(
    body: IncrementalityCreate, db: DbDep, workspace_id: WorkspaceId
) -> IncrementalityTest:
    test = IncrementalityTest(
        workspace_id=workspace_id,
        platform=body.platform,
        test_type=body.test_type,
        status="draft",
        markets_treated=body.markets_treated or None,
        markets_control=body.markets_control or None,
        spend_treated=body.spend_treated,
        spend_control=body.spend_control,
        conversions_treated=body.conversions_treated,
        conversions_control=body.conversions_control,
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return test


@router.post("/incrementality/{test_id}/run", response_model=IncrementalityOut)
def run_incrementality_test(
    test_id: int, db: DbDep, workspace_id: WorkspaceId
) -> IncrementalityTest:
    """Mark running and compute lift deterministically when numbers allow."""
    test = _incrementality_or_404(db, workspace_id, test_id)
    if test.status == "draft":
        test.status = "running"
    if test.started_at is None:
        test.started_at = _now()
    try:
        lift = (
            (test.conversions_treated / test.conversions_control)
            / (test.spend_treated / test.spend_control)
            - 1
        ) * 100
        test.lift_pct = round(lift, 2)
    except ZeroDivisionError:
        pass
    db.commit()
    db.refresh(test)
    return test


@router.post("/incrementality/{test_id}/complete", response_model=IncrementalityOut)
def complete_incrementality_test(
    test_id: int, db: DbDep, workspace_id: WorkspaceId
) -> IncrementalityTest:
    test = _incrementality_or_404(db, workspace_id, test_id)
    test.status = "completed"
    test.completed_at = _now()
    db.commit()
    db.refresh(test)
    return test


# ---------------------------------------------------------------------------
# Chat agent (plain-language interface to the PerfOS engine)
# ---------------------------------------------------------------------------


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class ChatAction(BaseModel):
    label: str
    href: str | None = None
    pending_approval: bool = False


class ChatResponse(BaseModel):
    reply: str
    intent: str
    actions: list[ChatAction] = []


def _classify_intent(message: str) -> str:
    msg = message.lower()
    if any(k in msg for k in ("reconcile", "roas", "over-claim", "inflation", "discrepancy", "real number", "truth")):
        return "reconcile"
    if any(k in msg for k in ("optimi", "reallocate", "budget", "shift spend", "where should")):
        return "optimize"
    if any(k in msg for k in ("creative", "fatigue", "hook", "ad fatigue", "which creative")):
        return "creative"
    if any(k in msg for k in ("experiment", "incrementality", "geo test", "holdout", "lift test")):
        return "experiment"
    if any(k in msg for k in ("agent", "mcp", "tool", "launch", "dispatch")):
        return "agent"
    return "explain"


def _fmt_money(v: float) -> str:
    return f"${v:,.0f}"


@router.post("/chat", response_model=ChatResponse)
def chat_agent(body: ChatRequest, db: DbDep, workspace_id: WorkspaceId) -> ChatResponse:
    """Natural-language entry point. Routes intent to the real engine and
    returns a human reply plus any approval-gated actions."""
    intent = _classify_intent(body.message)
    actions: list[ChatAction] = []

    if intent == "reconcile":
        result = run_analysis(workspace_id)
        recon = result.get("reconcile") or {}
        over_claim = float(recon.get("over_claim_pct", 0.0) or 0.0)
        flag = recon.get("flag", False)
        reply = (
            f"Ran reconciliation across your connected ad accounts. "
            f"Platforms are over-claiming by about {over_claim:.0f}% "
            f"versus your actual store revenue. "
            f"{'I flagged the discrepancy.' if flag else 'No major discrepancy found.'} "
            f"Open Recommendations to review the specific actions."
        )
        actions.append(ChatAction(label="View recommendations", href="/recommendations", pending_approval=False))
        return ChatResponse(reply=reply, intent=intent, actions=actions)

    if intent == "optimize":
        plan = recommend_reallocation(workspace_id, db)
        movers = [p for p in plan.get("plan", []) if abs(p.get("delta", 0.0)) > 1.0]
        if movers:
            lines = ", ".join(
                f"{m['platform']} {'+' if m['delta'] > 0 else ''}{_fmt_money(m['delta'])}"
                for m in movers[:4]
            )
            reply = (
                f"Built a budget reallocation that preserves your total spend. "
                f"Top moves: {lines}. Because these change live spend, each move "
                f"needs your approval before it executes."
            )
            actions.append(ChatAction(label="Approve in Command Center", href="/command-center", pending_approval=True))
        else:
            reply = "Your current allocation is already near-optimal against calibrated iROAS. No reallocation needed right now."
        return ChatResponse(reply=reply, intent=intent, actions=actions)

    if intent == "creative":
        creatives = (
            db.query(CreativePerformance)
            .filter(CreativePerformance.workspace_id == workspace_id)
            .order_by(CreativePerformance.fatigue_score.desc())
            .all()
        )
        if creatives:
            top = creatives[0]
            reply = (
                f"Your most fatigued creative is on {top.platform} "
                f"({top.creative_id}) with a fatigue score of {top.fatigue_score:.2f}. "
                f"Consider pausing or refreshing it. I can draft a replacement if you want."
            )
            actions.append(ChatAction(label="See creative analytics", href="/creative", pending_approval=False))
        else:
            reply = "No creative performance data yet. Connect an ad account to start tracking fatigue."
        return ChatResponse(reply=reply, intent=intent, actions=actions)

    if intent == "experiment":
        reply = (
            "You can run a geo-holdout or conversion-lift test to calibrate the model. "
            "Pick a platform and treated vs control markets, then hit Run. "
            "Lift is computed automatically."
        )
        actions.append(ChatAction(label="Open Experiments", href="/experiments", pending_approval=False))
        return ChatResponse(reply=reply, intent=intent, actions=actions)

    if intent == "agent":
        reply = (
            "I can dispatch connected AI agents (ChatGPT, Claude, opencode) and call "
            "external tools through MCP, all from the Command Center. Tell me what you "
            "want done and I will plan it, then ask for approval before anything touches "
            "your accounts."
        )
        actions.append(ChatAction(label="Open Command Center", href="/command-center", pending_approval=False))
        return ChatResponse(reply=reply, intent=intent, actions=actions)

    # explain / fallback
    reply = (
        "I'm the PerfOS agent. I reconcile your ad platforms against actual revenue, "
        "score creative fatigue, plan budget reallocation, and run incrementality tests. "
        "Try: \"How much are my platforms over-claiming?\", \"Optimize my budget\", or "
        "\"Which creative is fatigued?\". Every action that changes spend needs your approval first."
    )
    actions.append(ChatAction(label="See Measurement", href="/measurement", pending_approval=False))
    return ChatResponse(reply=reply, intent=intent, actions=actions)
