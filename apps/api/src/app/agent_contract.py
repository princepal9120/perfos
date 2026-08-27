"""Machine-readable PerfOS contract shared by HTTP, CLI, MCP, and the UI."""

from __future__ import annotations

from typing import Any

CAPABILITIES: tuple[dict[str, Any], ...] = (
    {
        "id": "measurement.summary",
        "description": "Reconcile revenue truth and summarize attribution, iROAS, anomalies, and creative health.",
        "safety": "read",
        "http": {"method": "GET", "path": "/api/pipeline"},
        "cli": "perfos measure reconcile",
        "mcp": "measurement_summary",
    },
    {
        "id": "ads.search",
        "description": "Search public ad libraries and rank competitor creative.",
        "safety": "read",
        "http": {"method": "POST", "path": "/api/discovery"},
        "cli": "perfos search <query>",
        "mcp": "ads_search",
    },
    {
        "id": "ads.clone",
        "description": "Remix a discovered winner into policy-safe creative variants.",
        "safety": "draft",
        "http": {"method": "POST", "path": "/api/clone"},
        "cli": "perfos clone <ad_id>",
        "mcp": "ads_clone",
    },
    {
        "id": "ads.generate",
        "description": "Generate creative assets from ranked winners.",
        "safety": "draft",
        "http": {"method": "POST", "path": "/api/create"},
        "cli": "perfos generate",
        "mcp": "ads_generate",
    },
    {
        "id": "ads.loop",
        "description": "Run find, score, create, launch, track, and double-down as one auditable lifecycle.",
        "safety": "approval_required_for_external_writes",
        "http": {"method": "POST", "path": "/api/loop"},
        "cli": "perfos loop --query <query>",
        "mcp": "ads_loop_run",
    },
    {
        "id": "recommendations.approve",
        "description": "Approve a persisted recommendation after policy evaluation.",
        "safety": "human_approval",
        "http": {"method": "POST", "path": "/api/recommendations/{id}/approve"},
        "cli": None,
        "mcp": None,
    },
)


def build_agent_contract(workspace_id: str | int | None = None) -> dict[str, Any]:
    """Return the stable discovery document for every PerfOS client surface."""
    return {
        "name": "PerfOS",
        "version": "0.1.0",
        "protocol_version": "2026-08-28",
        "workspace_id": str(workspace_id) if workspace_id is not None else None,
        "transports": {
            "rest": {"base_path": "/api", "openapi_path": "/openapi.json"},
            "mcp": {"http_path": "/mcp", "stdio_command": "perfos mcp"},
            "cli": {"command": "perfos", "json_flag": "--json"},
        },
        "safety": {
            "default_mode": "dry_run",
            "external_writes": "policy_gated",
            "human_approval_required": True,
            "audit_log": True,
            "max_budget_change_pct": 25,
        },
        "capabilities": [dict(capability) for capability in CAPABILITIES],
    }


__all__ = ["CAPABILITIES", "build_agent_contract"]
