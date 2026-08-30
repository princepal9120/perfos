"""FastMCP server smoke tests (in-process Client, no live API)."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from fastmcp import Client

from app.mcp_server import mcp

EXPECTED_TOOLS = {
    "measurement_reconcile",
    "measurement_attribution",
    "measurement_iroas",
    "measurement_optimize",
    "measurement_creatives",
    "measurement_anomalies",
    "measurement_incrementality",
    "measurement_summary",
    "list_workspaces",
    "list_ad_accounts",
    "list_recommendations",
    "generate_recommendations",
    "platform_capabilities",
    "ads_search",
    "ads_winners",
    "ads_clone",
    "ads_generate",
    "ads_assets",
    "ads_loop_run",
    "ads_loop_status",
    "perfos_find_ads",
    "perfos_score_winners",
    "perfos_run_loop",
}


@pytest.mark.asyncio
async def test_lists_all_perfos_tools():
    async with Client(mcp) as client:
        tools = await client.list_tools()
    names = {t.name for t in tools}
    assert names >= EXPECTED_TOOLS


@pytest.mark.asyncio
async def test_measurement_reconcile_calls_api():
    fake = {"platform_claimed": 104000, "actual": 78000, "over_count": 26000}
    with patch("app.mcp_server.api_request", new_callable=AsyncMock, return_value=fake) as req:
        async with Client(mcp) as client:
            result = await client.call_tool(
                "measurement_reconcile",
                {"workspace_id": "1"},
            )
    req.assert_awaited()
    assert result.data == fake or fake in str(result)


@pytest.mark.asyncio
async def test_mcp_http_mounted_on_app(client):
    # Streamable HTTP endpoint should exist (method may vary by FastMCP version).
    resp = client.get("/mcp")
    assert resp.status_code != 404


@pytest.mark.asyncio
async def test_platform_capabilities_is_machine_readable():
    async with Client(mcp) as client:
        result = await client.call_tool("platform_capabilities", {"workspace_id": "1"})
    assert result.data["workspace_id"] == "1"
    assert any(item["id"] == "ads.loop" for item in result.data["capabilities"])
