"""Tests for extra MCP tools registered by app.mcp_server_extra."""

from __future__ import annotations

import pytest
from fastmcp import Client

import app.mcp_server_extra  # noqa: F401  (side effect: registers tools on mcp)
from app.mcp_server import mcp

EXTRA_TOOLS = {"perfos_find_ads", "perfos_score_winners", "perfos_run_loop"}


@pytest.mark.asyncio
async def test_extra_tools_registered():
    async with Client(mcp) as client:
        tools = await client.list_tools()
    names = {t.name for t in tools}
    assert names >= EXTRA_TOOLS
