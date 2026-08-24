"""Pydantic v2 response models mirroring the PerfOS ORM entities.

Field names match the canonical data model in spec/CONTRACTS.md exactly.
All models support ORM mode (from_attributes=True) so FastAPI endpoints can
return SQLAlchemy rows directly.
"""

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class _ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class OrganizationRead(_ORMModel):
    id: int
    name: str
    created_at: datetime


class WorkspaceRead(_ORMModel):
    id: int
    org_id: int
    name: str
    currency: str
    created_at: datetime


class AdAccountRead(_ORMModel):
    id: int
    workspace_id: int
    platform: str
    platform_account_id: str
    name: str
    status: str
    connected_at: datetime


class CampaignRead(_ORMModel):
    id: int
    ad_account_id: int
    platform: str
    platform_campaign_id: str
    name: str
    status: str
    daily_budget: float
    created_at: datetime


class AdSetRead(_ORMModel):
    id: int
    campaign_id: int
    name: str
    status: str


class AdRead(_ORMModel):
    id: int
    ad_set_id: int
    name: str
    creative_id: str | None = None
    status: str


class SpendRead(_ORMModel):
    id: int
    workspace_id: int
    ad_account_id: int | None = None
    campaign_id: int | None = None
    date: date
    impressions: int
    clicks: int
    cost: float
    conversions: float
    conversion_value: float


class RevenueRead(_ORMModel):
    id: int
    workspace_id: int
    source: str
    order_id: str
    date: date
    amount: float
    customer_id: str | None = None
    is_new_customer: bool


class AttributionEventRead(_ORMModel):
    id: int
    workspace_id: int
    date: date
    channel: str
    attributed_revenue: float
    model: str


class RecommendationRead(_ORMModel):
    id: int
    workspace_id: int
    type: str
    reason: str
    evidence_json: dict[str, Any] | None = None
    expected_impact: float | None = None
    confidence: float
    risk: str
    proposed_changes_json: dict[str, Any] | None = None
    rollback_json: dict[str, Any] | None = None
    status: str
    created_at: datetime


class ApprovalRead(_ORMModel):
    id: int
    recommendation_id: int
    actor: str
    decision: str
    note: str | None = None
    created_at: datetime


class ExperimentRead(_ORMModel):
    id: int
    workspace_id: int
    hypothesis: str
    control_json: dict[str, Any] | None = None
    variant_json: dict[str, Any] | None = None
    primary_metric: str
    status: str
    result_json: dict[str, Any] | None = None
    created_at: datetime


class OutcomeRead(_ORMModel):
    id: int
    recommendation_id: int
    metric: str
    before: float
    after: float
    delta: float
    recorded_at: datetime


class ConnectedAgentRead(_ORMModel):
    id: int
    workspace_id: int
    provider: str
    name: str
    status: str
    config_json: dict[str, Any] | None = None
    last_run_at: datetime | None = None


class AuditLogRead(_ORMModel):
    id: int
    workspace_id: int
    actor: str
    action: str
    target: str
    payload_json: dict[str, Any] | None = None
    created_at: datetime
