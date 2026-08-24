import copy

import pytest

from app.agents.recommend import (
    SCHEMA_FIELDS,
    generate_recommendations,
)

MOCK_RECONCILE = {
    "total_spend": 20000,
    "platform_claimed_value": 104000,
    "actual_revenue": 78000,
    "blended_mer": 3.9,
    "per_channel": [
        {
            "platform": "google",
            "spend": 12000,
            "claimed_value": 60000,
            "claimed_roas": 5.0,
        },
        {
            "platform": "meta",
            "spend": 8000,
            "claimed_value": 44000,
            "claimed_roas": 5.5,
        },
    ],
    "over_count_value": 26000,
    "over_count_pct": 33.0,
    "tracking_integrity_flag": True,
}

MOCK_ATTRIBUTE = {
    "allocations": [
        {"platform": "google", "attributed_revenue": 46800},
        {"platform": "meta", "attributed_revenue": 31200},
    ],
    "confidence": 0.65,
    "rationale": "Spend-weighted last-touch allocation of actual Shopify revenue.",
}


def test_no_recommendation_when_under_threshold():
    rec = copy.deepcopy(MOCK_RECONCILE)
    rec["over_count_pct"] = 12.0
    rec["tracking_integrity_flag"] = False
    assert generate_recommendations(rec, MOCK_ATTRIBUTE) == []


def test_no_recommendation_when_over_count_pct_missing_or_zero():
    rec = copy.deepcopy(MOCK_RECONCILE)
    rec["over_count_pct"] = None
    assert generate_recommendations(rec, None) == []
    rec["over_count_pct"] = 0
    assert generate_recommendations(rec, None) == []


def test_single_channel_returns_empty():
    rec = copy.deepcopy(MOCK_RECONCILE)
    rec["per_channel"] = [rec["per_channel"][0]]
    assert generate_recommendations(rec, None) == []


def test_bad_input_raises_typeerror():
    with pytest.raises(TypeError):
        generate_recommendations(["not", "a", "dict"], None)


def test_mock_scenario_emits_exactly_one_pending_rec():
    recs = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)
    assert len(recs) == 1
    rec = recs[0]
    assert rec["type"] == "reallocate_budget"
    assert rec["status"] == "pending"


def test_exact_schema_fields():
    recs = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)
    for rec in recs:
        assert tuple(rec.keys()) == SCHEMA_FIELDS


def test_reason_matches_contract_example_format():
    rec = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)[0]
    assert (
        rec["reason"]
        == "Meta over-credited by 33%; reallocate 10% to Google pending holdout"
    )


def test_source_is_most_inflated_target_least_inflated():
    rec = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)[0]
    ev = rec["evidence_json"]
    src_ratio = ev["source_channel"]["claimed_roas"] / ev["blended_mer"]
    tgt_ratio = ev["target_channel"]["claimed_roas"] / ev["blended_mer"]
    assert ev["source_channel"]["platform"] == "meta"
    assert ev["target_channel"]["platform"] == "google"
    assert src_ratio > tgt_ratio


def test_confidence_risk_and_policy_safe_shift():
    rec = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)[0]
    assert rec["confidence"] == 0.7
    assert rec["risk"] == "medium"
    proposed = rec["proposed_changes_json"]
    assert 0 < proposed["budget_shift_pct"] <= 25
    assert proposed["shift_amount"] == round(8000 * 0.10, 2)
    assert proposed["requires_holdout_experiment"] is True


def test_rollback_reverses_proposal_direction():
    rec = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)[0]
    proposed = rec["proposed_changes_json"]
    rollback = rec["rollback_json"]
    assert rollback["source_platform"] == proposed["target_platform"]
    assert rollback["target_platform"] == proposed["source_platform"]
    assert rollback["budget_shift_pct"] == proposed["budget_shift_pct"]


def test_evidence_carries_reconcile_numbers():
    rec = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)[0]
    ev = rec["evidence_json"]
    assert ev["over_count_value"] == 26000
    assert ev["over_count_pct"] == 33.0
    assert ev["blended_mer"] == 3.9
    assert ev["tracking_integrity_flag"] is True


def test_attribute_output_enriches_evidence_when_present():
    rec = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)[0]
    attr = rec["evidence_json"]["attribution"]
    assert attr["confidence"] == 0.65
    assert "rationale" in attr

    bare = generate_recommendations(MOCK_RECONCILE, None)[0]
    assert "attribution" not in bare["evidence_json"]


def test_deterministic_output():
    a = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)
    b = generate_recommendations(MOCK_RECONCILE, MOCK_ATTRIBUTE)
    assert a == b


def test_tied_channels_skip_transfer_to_self():
    rec = copy.deepcopy(MOCK_RECONCILE)
    for ch in rec["per_channel"]:
        ch["claimed_roas"] = 5.0
    assert generate_recommendations(rec, None) == []
