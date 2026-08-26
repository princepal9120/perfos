"""LOOP CLI (build agent A33): one-shot ``perfos_loop`` entry point.

Calls ``app.loop.orchestrator.run_loop`` for one full find -> score -> create
-> launch -> track -> double-down pass, prints a short per-stage summary, and
returns the orchestrator's dict unchanged. Importable on its own; also
runnable as ``python -m app.loop.cli``.
"""

from __future__ import annotations

import asyncio
import inspect
from collections.abc import Sized

__all__ = ["perfos_loop"]

_STAGES = ("find", "score", "create", "launch", "track", "double-down")


def _count(value: object) -> int | None:
    """Stage count from an int count, a list of items, or a dict payload."""
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, Sized):
        return len(value)
    return None


def _stage_counts(result: dict) -> dict[str, int | None]:
    """Read per-stage counts: ``result["stages"]`` first, top-level fallback."""
    nested = result.get("stages")
    source = nested if isinstance(nested, dict) else result
    counts: dict[str, int | None] = {}
    for stage in _STAGES:
        value = source.get(stage)
        if value is None:  # tolerate underscore spellings ("double_down")
            value = source.get(stage.replace("-", "_"))
        counts[stage] = _count(value)
    return counts


def perfos_loop(persona: str = "saas", dry_run: bool = True) -> dict:
    """Run one LOOP pass via the loop orchestrator and print a short summary."""
    # Lazy import: keeps this module importable before/without the orchestrator.
    from app.loop.orchestrator import run_loop

    result = run_loop(persona=persona, dry_run=dry_run)
    if inspect.isawaitable(result):  # tolerate a sync implementation too
        result = asyncio.run(result)
    if not isinstance(result, dict):
        result = {"summary": result}

    print(f"perfos_loop persona={persona!r} dry_run={dry_run}")
    for stage, count in _stage_counts(result).items():
        print(f"  {stage:<11} {'-' if count is None else count}")
    print("perfos_loop done")
    return result


if __name__ == "__main__":  # smoke: real dry-run pass once the orchestrator lands
    perfos_loop()
