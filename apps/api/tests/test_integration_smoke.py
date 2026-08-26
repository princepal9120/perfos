"""Integration smoke test (AA48): full dry-run chain across the three new lanes.

    discovery.cli  (FIND -> SCORE -> STORE)      app.discovery.cli.run_discovery
    create.runner  (winners -> creative assets)  app.create.runner.run_create
    loop.orchestrator (find->score->create->launch->track->double-down)

Everything runs mock-safe/offline (conftest sets MOCK_MODE=true); no external
calls, no platform writes -- the loop only emits paused launch plans.

Run: cd apps/api && python -m pytest tests/test_integration_smoke.py -q
"""

import asyncio

from app.create import runner as create_runner
from app.discovery import cli as discovery_cli
from app.discovery.schemas import WinnerSignal
from app.loop import orchestrator as loop_orchestrator

LOOP_STAGES = {"find", "score", "create", "launch", "track", "double-down"}


def _signals_from_discovery(summary: dict) -> list[WinnerSignal]:
    """Map discovery winners onto WinnerSignals for the create stage."""
    signals = [
        WinnerSignal(
            platform=w["platform"],
            advertiser=w["competitor"],
            ad_id=w["ad_id"],
            score=float(w["score"]),
            tier=w["tier"],
            hook=w.get("title") or w.get("body"),
            cta=w.get("title"),
        )
        for w in summary["winners"]
    ]
    if not signals:
        # Mock fixtures can score below the winner-tier bar; still exercise
        # the create lane with one deterministic fallback signal.
        signals.append(
            WinnerSignal(
                platform="google",
                advertiser="Smoke Advertiser",
                ad_id="smoke-winner-1",
                score=82.0,
                tier="winner",
                hook="Stop guessing which ads work.",
                cta="See your real ROAS",
            )
        )
    return signals


def test_discovery_cli_dry_run():
    """FIND -> SCORE -> STORE chain returns a well-formed summary offline."""
    summary = discovery_cli.run_discovery(persona="saas")
    assert isinstance(summary, dict)
    assert summary["persona"] == "saas"
    assert isinstance(summary["channels"], list)
    assert summary["found"] >= 1, "mock ad-library fixture must yield at least one ad"
    assert set(summary["stored"]) == {"created", "updated"}
    assert summary["stored"]["created"] + summary["stored"]["updated"] >= 1
    assert isinstance(summary["winners"], list)


def test_create_runner_dry_run():
    """run_create turns discovery winners into mock creative assets."""
    signals = _signals_from_discovery(discovery_cli.run_discovery(persona="saas"))
    assets = create_runner.run_create(signals)
    assert len(assets) >= 1
    assert all(a.provider == "mock" for a in assets)
    assert all(a.asset_url for a in assets)


def test_loop_orchestrator_dry_run():
    """Full find->score->create->launch->track->double-down pass, no errors."""
    result = asyncio.run(loop_orchestrator.run_loop(persona="saas", dry_run=True))
    assert isinstance(result, dict)
    assert result["dry_run"] is True
    assert set(result["stages"]) == LOOP_STAGES
    assert all(isinstance(n, int) and n >= 0 for n in result["stages"].values())
    assert isinstance(result["decisions"], list)
