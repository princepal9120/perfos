"""Unit tests for app.loop.safety_gate — draft-first launch gate.

Pure logic, no DB: the gate must reuse app.agents.policy.evaluate and never
produce a live launch (every draft starts paused; humans approve).
"""

from app.loop.safety_gate import (
    DRAFT_PAUSED,
    REJECTED,
    READY_TO_LAUNCH,
    approve_draft,
    build_launch_rec,
    gate_launch,
    reject_draft,
)

BRIEF = {
    "workspace_id": 1,
    "platform": "meta",
    "campaign_name": "winner-clone-1",
    "daily_budget": 50.0,
    "confidence": 0.9,
}


def test_gate_creates_paused_draft_even_when_policy_allows():
    gate = gate_launch(BRIEF, workspace_id=1)
    assert gate["policy_decision"] == "allow"
    assert gate["status"] == DRAFT_PAUSED
    assert gate["draft_created"] is True
    assert gate["approved"] is False
    action = gate["launch_rec"]["proposed_changes_json"]["actions"][0]
    assert action["paused"] is True


def test_low_confidence_requires_human_and_stays_paused():
    gate = gate_launch({**BRIEF, "confidence": 0.2}, workspace_id=1)
    assert gate["policy_decision"] == "needs_approval"
    assert gate["status"] == DRAFT_PAUSED


def test_launch_brief_without_policy_violation_pauses_for_human():
    gate = gate_launch({**BRIEF, "daily_budget": 10000.0}, workspace_id=1)
    # Existing policy has no budget rule for launch_ad actions; draft-first
    # still keeps it paused until a human approves.
    assert gate["policy_decision"] == "allow"
    assert gate["status"] == DRAFT_PAUSED
    assert gate["approved"] is False


def test_workspace_mismatch_blocks():
    gate = gate_launch(BRIEF, workspace_id=2)
    assert gate["status"] == REJECTED
    assert any("workspace_mismatch" in r for r in gate["reasons"])


def test_approve_then_reject_lifecycle():
    gate = gate_launch(BRIEF, workspace_id=1)
    ready = approve_draft(gate, approved_by="human@example.com")
    assert ready["status"] == READY_TO_LAUNCH
    assert ready["approved"] is True
    # Rejecting an already-approved draft is a no-op.
    assert reject_draft(ready)["status"] == READY_TO_LAUNCH

    paused = gate_launch({**BRIEF, "confidence": 0.3}, workspace_id=1)
    denied = reject_draft(paused, rejected_by="human@example.com")
    assert denied["status"] == REJECTED


def test_rec_shaped_request_passes_through_to_policy():
    rec = {"workspace_id": 1, "proposed_changes_json": {"budget_shift_pct": 30}, "confidence": 1.0}
    assert build_launch_rec(rec) is not rec
    assert build_launch_rec(rec)["proposed_changes_json"] == rec["proposed_changes_json"]
    gate = gate_launch(rec, workspace_id=1)
    assert gate["status"] == REJECTED
