"""Extra MCP tools: FIND -> SCORE -> LOOP lifecycle registration (build agent A35).

Registers three lifecycle tools on the shared FastMCP instance from
``app.mcp_server`` alongside the built-in measurement/workspace tools:

- ``perfos_find_ads``      -- FIND stage (discovery spy-ad collection + persist)
- ``perfos_score_winners`` -- SCORE stage (rank found ads into winner tiers)
- ``perfos_run_loop``      -- full find -> score -> create -> launch -> track -> double-down

Bodies live in ``app.mcp_tools`` (lazy imports inside each body, so importing
this module never fails while the lifecycle lands additively).
"""

from __future__ import annotations

from typing import Any

from app.mcp_server import mcp
from app.mcp_tools import find_ads, run_loop, score_winners


@mcp.tool()
async def perfos_find_ads(persona: str = "saas") -> Any:
    """FIND stage: collect competitor spy ads for a persona from public ad libraries, score, and persist them."""
    return await find_ads(persona=persona)


@mcp.tool()
async def perfos_score_winners(persona: str = "saas") -> list[dict[str, Any]]:
    """SCORE stage: rank previously discovered spy ads into winner tiers (0-100 score, DNA diff, tier)."""
    return await score_winners(persona=persona)


@mcp.tool()
async def perfos_run_loop(persona: str = "saas", dry_run: bool = True) -> dict[str, Any]:
    """Run the full ad lifecycle once: find -> score -> create -> launch -> track -> double-down. Launches stay draft/paused unless dry_run=False."""
    return await run_loop(persona=persona, dry_run=dry_run)


__all__ = ["perfos_find_ads", "perfos_run_loop", "perfos_score_winners"]
