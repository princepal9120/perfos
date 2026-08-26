"""LOOP orchestrator -- chains all 6 stages into one closed-loop run.

``run_loop`` drives find -> score -> create -> launch -> track -> double-down
(see ``app.loop.config.LOOP_STAGES``) and returns a summary dict with counts
per stage plus the final double-down decisions.

Dry-run by default (BUILD_PLAN_50): every stage below is mock-safe data
transformation only; the launch stage emits paused *plans* whose execution
must pass ``app.loop.safety_gate`` + human approval -- never triggered here.

Stage signatures consumed::

    find_stage(persona, channels)            -> list[AdRecord]
    score_stage(ads, persona)                -> list[WinnerSignal]
    create_stage(winners)                    -> list[GeneratedAsset]
    launch_stage(assets, channels, dry_run)  -> list[dict]   # paused plans
    track_stage(launches)                    -> list[dict]   # perf rows
    double_down_stage(tracking)              -> list[dict]   # scale/kill/hold

# REAL hook: swap track_stage rows for connector metrics and route
# double-down scale/kill actions back through loop.safety_gate.submit_write.
"""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

__all__ = ["run_loop"]


async def run_loop(persona: str = "saas", channels: list[str] | None = None, dry_run: bool = True) -> dict:
    """Run one full lifecycle pass for ``persona`` and summarize it.

    Args:
        persona: audience/product persona tag driving discovery.
        channels: launch channels; when None, derived from the platforms
            actually observed in the find results.
        dry_run: passed to the launch stage; True (default) records the flag
            without executing anything external.

    Returns:
        Summary dict::

            {"persona", "channels", "dry_run",
             "stages": {"find": n, "score": n, "create": n,
                        "launch": n, "track": n, "double-down": n},
             "decisions": [...]}
    """
    # Lazy imports: sibling stage modules may be landing in parallel build steps.
    from app.loop.stages.create_stage import create_stage
    from app.loop.stages.double_down_stage import double_down_stage
    from app.loop.stages.find_stage import find_stage
    from app.loop.stages.launch_stage import launch_stage
    from app.loop.stages.score_stage import score_stage
    from app.loop.stages.track_stage import track_stage

    ads = find_stage(persona=persona, channels=channels)
    winners = score_stage(ads=ads, persona=persona)
    assets = create_stage(winners)
    # launch_stage consumes plain dicts; assets are dataclasses.
    asset_dicts: list[dict[str, Any]] = [asdict(a) for a in assets]
    create_count = len(asset_dicts)

    if channels is None:
        channels = sorted({ad.platform for ad in ads if getattr(ad, "platform", None)})
    plans = launch_stage(assets=asset_dicts, channels=channels, dry_run=dry_run)

    tracking = track_stage(plans)
    decisions = double_down_stage(tracking)

    return {
        "persona": persona,
        "channels": channels,
        "dry_run": bool(dry_run),
        "stages": {
            "find": len(ads),
            "score": len(winners),
            "create": create_count,
            "launch": len(plans),
            "track": len(tracking),
            "double-down": len(decisions),
        },
        "decisions": decisions,
    }


if __name__ == "__main__":
    # Self-check: the full dry-run chain executes and reports all six counts.
    import asyncio

    async def _demo() -> None:
        summary = await run_loop()
        assert set(summary["stages"]) == {
            "find", "score", "create", "launch", "track", "double-down"
        }, summary["stages"]
        assert all(isinstance(v, int) and v >= 0 for v in summary["stages"].values())
        assert summary["dry_run"] is True
        assert isinstance(summary["decisions"], list)
        print("orchestrator OK:", summary["stages"])

    asyncio.run(_demo())
