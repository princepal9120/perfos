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
# MCP is an agent client, not a browser. Require an explicitly configured
# credential rather than shipping a demo key fallback.
API_KEY = os.environ.get("PERFOS_API_KEY", "")
# A live ad-library search drives a headless browser: 15-40s, well past the default.
LIVE_TIMEOUT = 300.0

mcp = FastMCP(
    "perfos-mcp",
    instructions=(
        "PerfOS ad tools. Measurement: reconcile platform revenue vs bank truth, "
        "attribution, iROAS, creatives, anomalies, incrementality, budget optimize. "
        "Lifecycle: ads_search (spy on competitor ad libraries), ads_winners, "
        "ads_clone, ads_generate, ads_loop_run. "
        "Ad Library: adlib_search/browse/save, competitor watchlist + sync."
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


@mcp.tool
async def adlib_search(
    query: str,
    platforms: list[str] | None = None,
    country: str = "US",
    limit: int = 30,
    workspace_id: str | None = None,
) -> Any:
    """Search public ad libraries live, score the ads, and persist them.

    Meta is scraped from its public Ad Library; the other platforms serve
    fixtures until their keys are connected. Slow (15-40s) — it drives a browser.
    """
    return await api_request(
        "/ad-library/search",
        method="POST",
        body={"query": query, "platforms": platforms, "country": country, "limit": limit},
        workspace_id=_ws(workspace_id),
        timeout=LIVE_TIMEOUT,
    )


@mcp.tool
async def adlib_browse(
    q: str | None = None,
    platform: str | None = None,
    competitor: str | None = None,
    tier: str | None = None,
    board: str | None = None,
    saved_only: bool = False,
    min_runtime_days: float | None = None,
    sort: str = "recent",
    limit: int = 60,
    offset: int = 0,
    workspace_id: str | None = None,
) -> Any:
    """Filter, sort, and page through ads already in the library.

    Reads storage only — no scraping. ``tier`` is high_conf/winner/emerging/loser
    (the Ad Library scores with winner_tiers, not the longevity tiers /api/discovery
    returns); ``sort`` is recent/score/runtime.
    """
    params = {
        "q": q,
        "platform": platform,
        "competitor": competitor,
        "tier": tier,
        "board": board,
        "saved_only": saved_only,
        "min_runtime_days": min_runtime_days,
        "sort": sort,
        "limit": limit,
        "offset": offset,
    }
    return await api_request(
        "/ad-library",
        params={k: v for k, v in params.items() if v is not None},
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def adlib_get_ad(ad_id: str, workspace_id: str | None = None) -> Any:
    """One stored ad by its library id, with creative, copy, score, and runtime."""
    return await api_request(f"/ad-library/{ad_id}", workspace_id=_ws(workspace_id))


@mcp.tool
async def adlib_saved(
    board: str | None = None, limit: int = 200, workspace_id: str | None = None
) -> Any:
    """Ads saved to swipe-file boards."""
    params: dict[str, Any] = {"limit": limit}
    if board:
        params["board"] = board
    return await api_request("/ad-library/saved", params=params, workspace_id=_ws(workspace_id))


@mcp.tool
async def adlib_save_ad(
    ad_id: str,
    board: str = "default",
    note: str | None = None,
    workspace_id: str | None = None,
) -> Any:
    """Save an ad to a swipe-file board."""
    return await api_request(
        "/ad-library/saved",
        method="POST",
        body={"ad_id": ad_id, "board": board, "note": note},
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def adlib_unsave_ad(
    ad_id: str, board: str = "default", workspace_id: str | None = None
) -> Any:
    """Remove an ad from a swipe-file board."""
    return await api_request(
        f"/ad-library/saved/{ad_id}",
        method="DELETE",
        params={"board": board},
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def adlib_alerts(
    unread_only: bool = True, limit: int = 100, workspace_id: str | None = None
) -> Any:
    """Competitor ads seen for the first time — the "they just launched" feed.

    Raised during a search or competitor sync, so re-syncing ads already held
    never re-alerts. Newest first.
    """
    return await api_request(
        "/ad-library/alerts",
        params={"unread_only": unread_only, "limit": limit},
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def adlib_ack_alerts(
    ad_ids: list[str] | None = None, workspace_id: str | None = None
) -> Any:
    """Mark launch alerts read. Omit ``ad_ids`` to acknowledge everything unread."""
    return await api_request(
        "/ad-library/alerts/ack",
        method="POST",
        body={"ad_ids": ad_ids},
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def adlib_competitors(workspace_id: str | None = None) -> Any:
    """Competitors on the watchlist."""
    return await api_request("/ad-library/competitors", workspace_id=_ws(workspace_id))


@mcp.tool
async def adlib_track_competitor(
    name: str,
    platform: str | None = None,
    domain: str | None = None,
    workspace_id: str | None = None,
) -> Any:
    """Add a competitor to the watchlist so their ads can be synced."""
    return await api_request(
        "/ad-library/competitors",
        method="POST",
        body={"name": name, "platform": platform, "domain": domain},
        workspace_id=_ws(workspace_id),
    )


@mcp.tool
async def adlib_untrack_competitor(name: str, workspace_id: str | None = None) -> Any:
    """Remove a competitor from the watchlist. Collected ads are kept."""
    return await api_request(
        f"/ad-library/competitors/{name}", method="DELETE", workspace_id=_ws(workspace_id)
    )


@mcp.tool
async def adlib_sync_competitor(
    name: str, country: str = "US", limit: int = 30, workspace_id: str | None = None
) -> Any:
    """Re-scrape one tracked competitor and re-score their whole ad set.

    Scores are relative to the batch, so a competitor-scoped pass is what makes
    reach and concentration meaningful. Slow — it drives a browser.
    """
    return await api_request(
        f"/ad-library/competitors/{name}/sync",
        method="POST",
        body={"country": country, "limit": limit},
        workspace_id=_ws(workspace_id),
        timeout=LIVE_TIMEOUT,
    )


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
