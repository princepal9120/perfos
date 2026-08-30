"""LOOP orchestrator end-to-end test (AA34).

``run_loop`` chains find -> score -> create -> launch -> track ->
double_down and returns a summary dict with a count per stage (spec:
scripts/launch_50_agents.sh A31). In dry-run + mock mode every stage must
report a non-zero count; nothing touches real platforms.

    cd apps/api && MOCK_MODE=true python -m pytest tests/test_loop.py -q
"""

from __future__ import annotations

import pytest

from app.loop.orchestrator import run_loop

STAGE_KEYS = ("find", "score", "create", "launch", "track", "double_down")


@pytest.mark.asyncio
async def test_run_loop_dry_run_counts_every_stage():
    summary = await run_loop(persona="saas", channels=None, dry_run=True)

    assert isinstance(summary, dict)
    assert summary["dry_run"] is True

    # Counts live under summary["stages"]; the implementation spells
    # double-down with a hyphen -- normalize both spellings here.
    counts = {k.replace("-", "_"): v for k, v in summary.get("stages", summary).items()}
    for key in STAGE_KEYS:
        assert key in counts, f"missing stage key {key!r} in {sorted(counts)}"
        assert isinstance(counts[key], int), f"{key} count must be int"
        assert counts[key] > 0, f"{key} stage produced 0 items in dry-run"
