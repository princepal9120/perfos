"""Launch bridge -- one entry point from loop plans into the connectors layer (A39).

``LaunchBridge.launch_creative(asset, channel, ...)`` wraps the existing
PerfOS connector interface (app.connectors.registry / launch_from_winner):

* ``dry_run=True`` (default): returns a PLAN dict (same shape as
  ``app.loop.stages.launch_stage``) and touches nothing.
* ``dry_run=False``: runs the financial policy engine (``app.agents.policy``)
  first; only an ``allow`` decision reaches the channel connector path
  (``launch_from_winner``), which always creates PAUSED drafts.

# REAL hook: adkit/ads-mcp + markifact + mkt-cli behind PerfOS connectors policy gate.
# (Live sends go through create/adkit_mcp_client.py once keys are connected;
# markifact workflows and mkt-cli local launches plug into the same seam.)

Mock-safe by design: no network, no keys, no LLM calls anywhere in this file.
"""

from __future__ import annotations

from typing import Any

from app.agents.policy import evaluate
from app.connectors.launch_from_winner import launch_from_winner

STAGE = "launch"

_STEPS = [
    "submit_plan_to_safety_gate",
    "await_human_approval",
    "execute_via_connectors",
]

__all__ = ["LaunchBridge"]


def _as_dict(obj: Any) -> dict:
    """Tolerant view: dict passthrough, objects via __dict__, anything else {}."""
    if isinstance(obj, dict):
        return obj
    data = getattr(obj, "__dict__", None)
    return data if isinstance(data, dict) else {}


def _ws_id(workspace: Any) -> Any:
    if isinstance(workspace, dict):
        return workspace.get("id")
    return getattr(workspace, "id", None)


class LaunchBridge:
    """Wraps the workspace-scoped connector layer behind launch_creative()."""

    def __init__(self, workspace: Any = None):
        self.workspace = workspace

    def launch_creative(
        self,
        asset: Any,
        channel: str,
        policy_check: bool = True,
        dry_run: bool = True,
    ) -> dict:
        """Plan (dry_run) or execute (paused draft) a single creative launch.

        Returns a result dict:
          * dry_run=True -> {"stage", "channel", "dry_run": True,
            "status": "planned", "asset", "steps", "policy_decision"}.
            The policy verdict is included as ADVISORY information only.
          * dry_run=False -> policy gate result on block/needs_approval:
            {"success": False, "error": "policy_blocked" | "policy_needs_approval", ...};
            otherwise the launch_from_winner result (+ "channel").
            With ``policy_check=False`` the gate is skipped (tests /
            explicit human-approved flows only).
        """
        ch = str(channel or "").strip().lower()
        a = _as_dict(asset)

        payload = {
            "workspace_id": _ws_id(self.workspace),
            # Launches are not budget mutations: no proposed_changes_json, so
            # the engine's budget-shift rule stays out of the way. Asset score
            # maps to recommendation confidence (<0.6 -> needs_approval).
            "confidence": a.get("score"),
        }

        if dry_run:
            return {
                "stage": STAGE,
                "channel": ch,
                "dry_run": True,
                "status": "planned",
                "asset": {
                    "id": a.get("id"),
                    "title": a.get("title"),
                    "score": a.get("score"),
                    "creative_url": a.get("creative_url"),
                    "hook": a.get("hook"),
                    "cta": a.get("cta"),
                },
                "steps": list(_STEPS),
                "policy_decision": evaluate(payload),
            }

        if policy_check:
            decision = evaluate(payload)
            if decision["decision"] != "allow":
                return {
                    "success": False,
                    "error": (
                        "policy_blocked"
                        if decision["decision"] == "block"
                        else "policy_needs_approval"
                    ),
                    "channel": ch,
                    "dry_run": False,
                    "decision": decision["decision"],
                    "reasons": decision["reasons"],
                }

        brief = {
            "platform": ch,
            "name": a.get("name") or a.get("title") or "",
            "hook": a.get("hook"),
            "angle": a.get("angle"),
            "cta": a.get("cta"),
            "creative_url": a.get("creative_url"),
            "persona": a.get("persona"),
            "daily_budget": a.get("daily_budget", 50.0),
        }
        result = launch_from_winner(brief, self.workspace)
        result["channel"] = ch
        result.setdefault("dry_run", False)
        return result


if __name__ == "__main__":
    from app.connectors.launch_from_winner import reset_launched

    reset_launched()
    bridge = LaunchBridge({"id": 1})

    plan = bridge.launch_creative(
        {"id": 7, "title": "hook-a", "score": 0.9, "cta": "Shop Now"}, "meta"
    )
    assert plan["status"] == "planned" and plan["dry_run"] is True
    assert plan["channel"] == "meta" and plan["asset"]["id"] == 7
    assert plan["policy_decision"]["decision"] == "allow"

    ok = bridge.launch_creative(
        {"id": 7, "title": "hook-a", "score": 0.9}, "Meta", dry_run=False
    )
    assert ok["success"] is True and ok["status"] == "paused"

    weak = bridge.launch_creative(
        {"id": 8, "title": "hook-b", "score": 0.3}, "meta", dry_run=False
    )
    assert weak["success"] is False and weak["error"] == "policy_needs_approval"

    bad = bridge.launch_creative({"id": 9, "score": 0.9}, "myspace", dry_run=False)
    assert bad["success"] is False and bad["error"] == "unknown_platform"

    print("launch_bridge OK")
