"""Unit tests for app.agents.policy.evaluate — financial-safety policy engine.

Rules under test (spec/CONTRACTS.md + brief Phase 18/27):
  * budget change > 25%        -> "block"
  * workspace mismatch         -> "block"
  * confidence < 0.6           -> "needs_approval"
  * otherwise                  -> "allow"

Pure logic: fake dict-like rec objects, no DB required.
"""

from app.agents.policy import (
    BUDGET_CHANGE_LIMIT_PCT,
    CONFIDENCE_APPROVAL_THRESHOLD,
    evaluate,
    evaluate_payload,
)


class FakeRec:
    """Minimal stand-in for the Recommendation ORM model."""

    def __init__(self, workspace_id=1, proposed_changes_json=None, confidence=1.0):
        self.workspace_id = workspace_id
        self.proposed_changes_json = proposed_changes_json
        self.confidence = confidence


def test_budget_change_over_limit_blocks():
    rec = FakeRec(workspace_id=1, proposed_changes_json={"budget_shift_pct": 30}, confidence=0.9)
    result = evaluate(rec, workspace_id=1)
    assert result["decision"] == "block"
    assert any("budget_change_exceeds_limit" in r for r in result["reasons"])


def test_workspace_mismatch_blocks():
    rec = FakeRec(workspace_id=2, proposed_changes_json={"budget_shift_pct": 10}, confidence=0.9)
    result = evaluate(rec, workspace_id=1)
    assert result["decision"] == "block"
    assert any("workspace_mismatch" in r for r in result["reasons"])


def test_low_confidence_needs_approval():
    rec = FakeRec(workspace_id=1, proposed_changes_json={"budget_shift_pct": 5}, confidence=0.4)
    result = evaluate(rec, workspace_id=1)
    assert result["decision"] == "needs_approval"
    assert any("low_confidence" in r for r in result["reasons"])


def test_normal_rec_allows():
    rec = FakeRec(
        workspace_id=1,
        proposed_changes_json={"budget_shift_pct": BUDGET_CHANGE_LIMIT_PCT},
        confidence=0.7,
    )
    result = evaluate(rec, workspace_id=1)
    assert result == {"decision": "allow", "reasons": ["passed_policy_checks"]}


def test_boundary_values():
    # Exactly at the limits -> not blocked / not held.
    at_limit = evaluate(FakeRec(1, {"budget_shift_pct": 25}, CONFIDENCE_APPROVAL_THRESHOLD), 1)
    assert at_limit["decision"] == "allow"
    just_over = evaluate(FakeRec(1, {"budget_shift_pct": 25.01}), 1)
    assert just_over["decision"] == "block"
    just_under_conf = evaluate(FakeRec(1, None, 0.59), 1)
    assert just_under_conf["decision"] == "needs_approval"


def test_json_string_and_actions_shapes_parsed():
    string_form = evaluate(FakeRec(1, '{"budget_shift_pct": 40}'), 1)
    assert string_form["decision"] == "block"
    actions_form = evaluate(FakeRec(1, {"actions": [{"pct": 10}, {"budget_shift_pct": 60}]}), 1)
    assert actions_form["decision"] == "block"


def test_dict_rec_supported():
    payload = {
        "workspace_id": 7,
        "proposed_changes_json": {"budget_shift_pct": 3},
        "confidence": 0.8,
    }
    assert evaluate(payload, workspace_id=7)["decision"] == "allow"
    assert evaluate_payload(payload, workspace_id=8)["decision"] == "block"


def test_missing_fields_default_safe():
    # No changes, no confidence -> treated as fully confident, allowed.
    assert evaluate(FakeRec())["decision"] == "allow"
