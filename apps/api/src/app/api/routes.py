import base64
import hashlib
import hmac
import json
import os
import time
from datetime import datetime, timezone
from typing import Annotated, Any, Literal, Optional, TypeAlias

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.agents.policy import evaluate as evaluate_policy
from app.attribution.reconcile import reconcile as run_reconcile
from app.core.db import get_db
from app.models import (
    AdAccount,
    Approval,
    ConnectedAgent,
    Experiment,
    ExternalIntegration,
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
from app.services.orchestrator import OrchestratorService

router = APIRouter()

PLATFORMS = Literal["google", "meta", "shopify"]
AGENT_PROVIDERS = Literal["chatgpt", "claude", "opencode", "openai", "anthropic"]
TOKEN_SECRET = os.environ.get("PERFOS_TOKEN_SECRET", "perfos-dev-secret")
TOKEN_TTL_SECONDS = 86400


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _sign(raw: bytes) -> str:
    return hmac.new(TOKEN_SECRET.encode(), raw, hashlib.sha256).hexdigest()


def issue_token(workspace_id: int) -> str:
    payload = base64.urlsafe_b64encode(
        json.dumps(
            {"workspace_id": workspace_id, "exp": int(time.time()) + TOKEN_TTL_SECONDS}
        ).encode()
    ).decode()
    return f"{payload}.{_sign(payload.encode())}"


def verify_token(token: str) -> Optional[int]:
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
    x_workspace_id: Annotated[Optional[str], Header(alias="X-Workspace-Id")] = None,
) -> int:
    if not x_workspace_id:
        raise HTTPException(status_code=400, detail="Missing X-Workspace-Id header")
    try:
        return int(x_workspace_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail="X-Workspace-Id must be an integer"
        ) from exc


async def optional_workspace_id(
    x_workspace_id: Annotated[Optional[str], Header(alias="X-Workspace-Id")] = None,
) -> Optional[int]:
    if not x_workspace_id:
        return None
    try:
        return int(x_workspace_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail="X-Workspace-Id must be an integer"
        ) from exc


DbDep: TypeAlias = Annotated[Session, Depends(get_db)]
WorkspaceId: TypeAlias = Annotated[int, Depends(workspace_from_header)]
OptionalWorkspaceId: TypeAlias = Annotated[
    Optional[int], Depends(optional_workspace_id)
]


class _ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TokenRequest(BaseModel):
    api_key: Optional[str] = None
    password: Optional[str] = None
    workspace_id: Optional[int] = None
    workspace: Optional[str] = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str
    workspace_id: int


class WorkspaceOut(_ORMModel):
    id: int
    org_id: Optional[int] = None
    name: str
    currency: str = "USD"
    created_at: Optional[datetime] = None


class AccountCreate(BaseModel):
    platform: PLATFORMS
    platform_account_id: Optional[str] = None
    name: Optional[str] = None


class AccountOut(_ORMModel):
    id: int
    workspace_id: int
    platform: str
    platform_account_id: Optional[str] = None
    name: str
    status: str
    connected_at: Optional[datetime] = None


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
    evidence_json: Optional[Any] = None
    expected_impact: Optional[str] = None
    confidence: float
    risk: str
    proposed_changes_json: Optional[Any] = None
    rollback_json: Optional[Any] = None
    status: str
    created_at: Optional[datetime] = None


class DecisionRequest(BaseModel):
    actor: str = "user"
    note: Optional[str] = None


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
    control_json: Optional[Any] = None
    variant_json: Optional[Any] = None
    primary_metric: str
    status: str
    result_json: Optional[Any] = None
    created_at: Optional[datetime] = None


class OutcomeOut(_ORMModel):
    id: int
    recommendation_id: int
    metric: str
    before: float
    after: float
    delta: float
    recorded_at: Optional[datetime] = None


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
    config_json: Optional[Any] = None
    last_run_at: Optional[datetime] = None


class DispatchRequest(BaseModel):
    payload: dict = {}


class MCPServerCreate(BaseModel):
    name: str
    transport: Literal["http", "sse", "stdio"] = "http"
    endpoint: Optional[str] = None
    enabled: bool = True
    config_json: Optional[dict[str, Any]] = None


class MCPServerOut(_ORMModel):
    id: int
    workspace_id: int
    name: str
    transport: str
    endpoint: Optional[str] = None
    enabled: bool
    status: str
    config_json: Optional[dict[str, Any]] = None
    last_checked_at: Optional[datetime] = None


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
    endpoint: Optional[str] = None
    api_key: Optional[str] = None
    config_json: Optional[dict[str, Any]] = None


class IntegrationOut(_ORMModel):
    id: int
    workspace_id: int
    name: str
    category: str
    provider: str
    endpoint: Optional[str] = None
    api_key_encrypted: Optional[str] = None
    enabled: bool
    status: str
    config_json: Optional[dict[str, Any]] = None
    last_checked_at: Optional[datetime] = None


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
    workspace_id: Annotated[Optional[int], Query()] = None,
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
def list_recommendations(
    db: DbDep, workspace_id: WorkspaceId
) -> list[Recommendation]:
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
def register_mcp_server(
    body: MCPServerCreate, db: DbDep, workspace_id: WorkspaceId
) -> MCPServer:
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
def toggle_mcp_server(
    server_id: int, db: DbDep, workspace_id: WorkspaceId
) -> MCPServer:
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
    return OrchestratorService.call_tool(
        workspace_id, body.tool_name.strip(), body.params
    )


@router.post("/agents/dispatch-all")
def dispatch_all_agents(db: DbDep, workspace_id: WorkspaceId) -> dict:
    """Set last_run_at on every connected agent and report who was dispatched."""
    return OrchestratorService.dispatch_all_agents(workspace_id, db)
