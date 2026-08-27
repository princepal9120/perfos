"""PerfOS MCP server (FastMCP).

Exposes measurement + workspace tools over stdio or HTTP.

Stdio (Claude Desktop / Cursor):
    python -m app.mcp_server

HTTP (mounted on FastAPI at /mcp when API runs):
    PERFOS_API_URL=http://127.0.0.1:8000

Env:
    PERFOS_API_URL=http://localhost:8000
    PERFOS_API_TOKEN=
    PERFOS_API_KEY=perfos-demo-key
    PERFOS_WORKSPACE_ID=1
"""

from __future__ import annotations

import asyncio
import os
from typing import Any

import httpx
from fastmcp import FastMCP

from app.agent_contract import build_agent_contract

DEFAULT_API_URL = os.environ.get("PERFOS_API_URL", "http://127.0.0.1:8000")
DEFAULT_WORKSPACE_ID = os.environ.get("PERFOS_WORKSPACE_ID", "1")
API_TOKEN = os.environ.get("PERFOS_API_TOKEN", "")
# Measurement routes are workspace-scoped; the demo key matches the backend default.
API_KEY = os.environ.get("PERFOS_API_KEY", "perfos-demo-key")
# A live ad-library search drives a headless browser: 15-40s, well past the default.
LIVE_TIMEOUT = 300.0

mcp = FastMCP(
    "perfos-mcp",
    instructions=(
        "PerfOS ad tools. Measurement: reconcile platform revenue vs bank truth, "
        "attribution, iROAS, creatives, anomalies, incrementality, budget optimize. "
        "Lifecycle: ads_search (spy on competitor ad libraries), ads_winners, "
        "ads_clone, ads_generate, ads_loop_run."
    ),
)


def _ws(workspace_id: str | None) -> str:
    return str(workspace_id or DEFAULT_WORKSPACE_ID)


async def api_request(
    endpoint: str,
    *,
    method: str = "GET",
    params: dict[str, Any] | None = None,
    body: dict[str, Any] | None = None,
    workspace_id: str | None = None,
    timeout: float = 30.0,
) -> Any:
    """Call PerfOS REST API (/api/...)."""
    url = f"{DEFAULT_API_URL.rstrip('/')}/api{endpoint}"
    headers: dict[str, str] = {"Accept": "application/json", "X-API-Key": API_KEY}
    if API_TOKEN:
        headers["Authorization"] = f"Bearer {API_TOKEN}"
    ws = _ws(workspace_id)
    if ws:
        headers["X-Workspace-Id"] = ws

    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.request(method, url, params=params, json=body, headers=headers)
        if resp.status_code >= 400:
            raise RuntimeError(f"API {resp.status_code}: {resp.text[:500]}")
        if not resp.content:
            return {}
        return resp.json()


@mcp.tool
async def measurement_reconcile(workspace_id: str | None = None) -> Any:
    """Compare platform-claimed revenue vs actual bank revenue; flag attribution gaps."""
    ws = _ws(workspace_id)
    return await api_request("/reconcile", params={"workspace_id": int(ws)}, workspace_id=ws)


@mcp.tool
async def measurement_attribution(workspace_id: str | None = None) -> Any:
    """Map revenue to channels: spend, conversions, claimed ROAS, CPA."""
    return await api_request("/attribution", workspace_id=_ws(workspace_id))


@mcp.tool
async def measurement_iroas(
    workspace_id: str | None = None,
    min_sample: int | None = None,
) -> Any:
    """Incrementality-corrected ROAS (iROAS) per channel."""
    params: dict[str, Any] = {}
    if min_sample is not None:
        params["min_sample_usd"] = min_sample
    return await api_request(
        "/iroas",
        params=params or None,
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def measurement_optimize(
    workspace_id: str | None = None,
    max_change_pct: float | None = None,
    dry_run: bool = True,
) -> Any:
    """Budget reallocation plan that maximizes iROAS (plan only; nothing executes)."""
    body: dict[str, Any] = {"dry_run": dry_run}
    if max_change_pct is not None:
        body["max_change_pct"] = max_change_pct
    return await api_request(
        "/optimizer/reallocate",
        method="POST",
        body=body,
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def measurement_creatives(workspace_id: str | None = None) -> Any:
    """Per-creative CTR, CPC, ROAS, and fatigue scores."""
    return await api_request("/creatives", workspace_id=_ws(workspace_id))


@mcp.tool
async def measurement_anomalies(workspace_id: str | None = None) -> Any:
    """Detect spend/CPA/CTR spikes and drops."""
    return await api_request("/anomalies", workspace_id=_ws(workspace_id))


@mcp.tool
async def measurement_incrementality(workspace_id: str | None = None) -> Any:
    """List incrementality tests and lifecycle status."""
    return await api_request("/incrementality", workspace_id=_ws(workspace_id))


@mcp.tool
async def measurement_summary(workspace_id: str | None = None) -> Any:
    """One-shot bundle: reconcile, attribution, iROAS, anomalies, creatives, incrementality."""
    ws = _ws(workspace_id)
    keys = (
        "reconcile",
        "attribution",
        "iroas",
        "anomalies",
        "creatives",
        "incrementality",
    )
    calls = [
        api_request("/reconcile", params={"workspace_id": int(ws)}, workspace_id=ws),
        api_request("/attribution", workspace_id=ws),
        api_request("/iroas", workspace_id=ws),
        api_request("/anomalies", workspace_id=ws),
        api_request("/creatives", workspace_id=ws),
        api_request("/incrementality", workspace_id=ws),
    ]
    done = await asyncio.gather(*calls, return_exceptions=True)
    out: dict[str, Any] = {}
    for key, val in zip(keys, done, strict=True):
        out[key] = {"error": str(val)} if isinstance(val, Exception) else val
    return out


@mcp.tool
async def list_workspaces() -> Any:
    """List workspaces for the authenticated PerfOS account."""
    return await api_request("/workspaces")


@mcp.tool
async def list_ad_accounts(workspace_id: str | None = None) -> Any:
    """List connected ad accounts across platforms."""
    return await api_request("/accounts", workspace_id=_ws(workspace_id))


@mcp.tool
async def list_recommendations(workspace_id: str | None = None) -> Any:
    """List persisted recommendations for a workspace."""
    return await api_request("/recommendations", workspace_id=_ws(workspace_id))


@mcp.tool
async def generate_recommendations(workspace_id: str | None = None) -> Any:
    """Run analysis pipeline and generate fresh recommendations."""
    return await api_request(
        "/recommendations/generate",
        method="POST",
        body={},
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def platform_capabilities(workspace_id: str | None = None) -> Any:
    """Discover every supported PerfOS REST, CLI, and MCP capability and its safety level."""
    return build_agent_contract(_ws(workspace_id))


@mcp.tool
async def ads_search(
    query: str,
    persona: str = "saas",
    channels: list[str] | None = None,
    country: str = "US",
    limit: int = 30,
) -> Any:
    """Search public ad libraries for a competitor's live ads and score them.

    Meta is collected live from the public Ad Library; other channels return
    deterministic fixtures until their keys are connected.
    """
    return await api_request(
        "/discovery",
        method="POST",
        body={
            "query": query,
            "persona": persona,
            "channels": channels,
            "country": country,
            "limit": limit,
        },
        timeout=LIVE_TIMEOUT,
    )


@mcp.tool
async def ads_winners(limit: int = 20) -> Any:
    """Top scored competitor winners discovered so far, best first."""
    return await api_request("/winners", params={"limit": limit})


@mcp.tool
async def ads_clone(ad_id: str, generate: bool = False) -> Any:
    """Clone one discovered winner into your own hook variants (and optional clips)."""
    return await api_request(
        "/clone", method="POST", body={"ad_id": ad_id, "generate": generate}
    )


@mcp.tool
async def ads_generate(persona: str = "saas") -> Any:
    """Generate creative assets from the top discovered winners."""
    return await api_request("/create", method="POST", body={"persona": persona})


@mcp.tool
async def ads_assets() -> Any:
    """List every creative asset the CREATE stage has produced."""
    return await api_request("/assets")


@mcp.tool
async def ads_loop_run(
    persona: str = "saas", dry_run: bool = True, query: str | None = None
) -> Any:
    """Run one full lifecycle: find -> score -> create -> launch -> track -> double-down.

    Launch stays draft/paused behind the policy gate; ``dry_run=False`` still
    requires human approval before anything reaches a live ad account.
    """
    return await api_request(
        "/loop",
        method="POST",
        body={"persona": persona, "dry_run": dry_run, "query": query},
        timeout=LIVE_TIMEOUT,
    )


@mcp.tool
async def ads_loop_status() -> Any:
    """State of the most recent lifecycle run."""
    return await api_request("/loop/status")


# Register the lifecycle-native tools on the production server too. Previously
# this side effect only happened in tests that imported mcp_server_extra.
from app import mcp_server_extra as _mcp_server_extra  # noqa: E402,F401

# ASGI app for mounting on FastAPI (streamable HTTP at /mcp).
mcp_http_app = mcp.http_app(path="/")


def main() -> None:
    """Stdio transport for desktop MCP hosts."""
    mcp.run()


if __name__ == "__main__":
    main()
