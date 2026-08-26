"""MCP tool bodies for the FIND -> SCORE -> LOOP lifecycle.

Thin delegation layer imported by ``mcp_server_extra``, which registers these
as ``perfos_find_ads`` / ``perfos_score_winners`` / ``perfos_run_loop`` on the
shared FastMCP instance:

- ``find_ads``       -> ``app.discovery.cli.run_discovery``
- ``score_winners``  -> ``app.discovery.score.runner.run_score``
- ``run_loop``       -> ``app.loop.orchestrator.run_loop``

Sibling modules are imported lazily inside each body so registering the MCP
server never fails on import order while the lifecycle lands additively.
"""

from __future__ import annotations

from dataclasses import asdict, is_dataclass
from typing import Any


def _serialize(signal: Any) -> Any:
    """WinnerSignal/dataclass/pydantic/plain-dict -> plain JSON-safe dict."""
    if isinstance(signal, dict):
        return signal
    if is_dataclass(signal) and not isinstance(signal, type):
        return asdict(signal)
    dump = getattr(signal, "model_dump", None)
    if callable(dump):
        return dump()
    return getattr(signal, "__dict__", {"repr": repr(signal)})


async def find_ads(
    persona: str = "saas",
    channels: list[str] | None = None,
) -> Any:
    """FIND stage: collect competitor spy ads for a persona, score, persist."""
    # Lazy import: discovery.cli lands additively (find -> score -> store chain).
    from app.discovery.cli import run_discovery

    return run_discovery(persona=persona, channels=channels)


async def score_winners(persona: str = "saas") -> list[dict[str, Any]]:
    """SCORE stage: rank previously found spy ads into winner tiers."""
    from app.discovery.find.store import list_ads
    from app.discovery.score.runner import run_score

    ads = list_ads(persona_tag=persona)
    if not ads:
        return []
    signals = run_score(ads, persona)
    return [_serialize(s) for s in signals]


async def run_loop(
    persona: str = "saas",
    channels: list[str] | None = None,
    dry_run: bool = True,
) -> dict[str, Any]:
    """LOOP stage: full find -> score -> create -> launch -> track -> double-down."""
    from app.loop.orchestrator import run_loop as _run_loop

    summary: dict[str, Any] = await _run_loop(
        persona=persona,
        channels=channels,
        dry_run=dry_run,
    )
    return summary


__all__ = ["find_ads", "run_loop", "score_winners"]
