"""LOOP launch stage -- builds the per-channel launch PLAN (mock by default).

Stage 4 of the loop (find -> score -> create -> LAUNCH -> track). Produces one
plan dict per channel from the scored/created assets. Nothing here touches a
platform: every returned plan is a draft proposal that must flow through
``app.loop.safety_gate`` before any external write happens.

# REAL hook: adkit/ads-mcp + markifact + mkt-cli behind PerfOS connectors policy gate.
"""

from __future__ import annotations

from typing import Any

STAGE = "launch"

__all__ = ["launch_stage"]


def _channel_name(channel: Any) -> str:
    """Accept a bare string or a {"name": ...}-style dict."""
    if isinstance(channel, dict):
        return str(channel.get("name") or "")
    return str(channel or "")


def launch_stage(
    assets: list[dict] | None,
    channels: list[str] | list[dict] | None,
    dry_run: bool = True,
) -> list[dict]:
    """Build a mock launch plan per channel.

    ``assets`` are the creative/score payloads from earlier stages; only their
    ids/titles are referenced in the plan. Returns one dict per channel::

        {"stage": "launch", "channel": "meta", "dry_run": True,
         "status": "planned", "assets": [...], "steps": [...]}

    Mock-safe: pure function, no I/O, no network. ``dry_run=False`` only flips
    the recorded flag -- actual execution belongs to the connectors layer
    behind the policy gate (see module note), not this stage.
    """
    asset_refs = [
        {
            "id": a.get("id"),
            "title": a.get("title"),
            "score": a.get("score"),
        }
        for a in (assets or [])
        if isinstance(a, dict)
    ]

    steps = [
        "submit_plan_to_safety_gate",
        "await_human_approval",
        "execute_via_connectors",
    ]

    plans: list[dict] = []
    seen: set[str] = set()
    for channel in channels or []:
        name = _channel_name(channel)
        if not name or name in seen:
            continue
        seen.add(name)
        plans.append(
            {
                "stage": STAGE,
                "channel": name,
                "dry_run": dry_run,
                "status": "planned",
                "assets": [dict(ref) for ref in asset_refs],
                "steps": list(steps),
            }
        )
    return plans


if __name__ == "__main__":
    # Minimal self-check: one plan per unique channel, assets referenced.
    channels: list[Any] = ["meta", {"name": "google"}, "meta", "", None]
    out = launch_stage(
        [{"id": 1, "title": "hook-a", "score": 0.9}],
        channels,
    )
    assert [p["channel"] for p in out] == ["meta", "google"]
    assert all(p["dry_run"] is True and p["status"] == "planned" for p in out)
    assert out[0]["assets"][0]["id"] == 1
    print("launch_stage OK")
