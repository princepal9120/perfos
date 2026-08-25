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
}


@pytest.mark.asyncio
async def test_lists_all_perfos_tools():
    async with Client(mcp) as client:
        tools = await client.list_tools()
    names = {t.name for t in tools}
    assert EXPECTED_TOOLS <= names


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
