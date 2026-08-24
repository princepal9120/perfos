"""Tests for app.attribution.attribute (agent I)."""

import pytest

from app.attribution.attribute import attribute_revenue


class Revenue:
    def __init__(self, amount, source="shopify", is_new_customer=False):
        self.amount = amount
        self.source = source
        self.is_new_customer = is_new_customer


def mock_reconcile_output():
    return {
        "total_spend": 20000,
        "platform_claimed_value": 104000,
        "actual_revenue": 78000,
        "blended_mer": 3.9,
        "per_channel": [
            {"platform": "google", "spend": 12000, "claimed_value": 60000, "claimed_roas": 5.0},
            {"platform": "meta", "spend": 8000, "claimed_value": 44000, "claimed_roas": 5.5},
        ],
        "over_count_value": 26000,
        "over_count_pct": 33.0,
        "tracking_integrity_flag": True,
    }


def test_mock_scenario_spend_weighted_credits():
    out = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(78000)])
    credits = {c["platform"]: c["credit"] for c in out["per_channel_credit"]}
    assert credits["google"] == pytest.approx(46800.0)
    assert credits["meta"] == pytest.approx(31200.0)
    shares = {c["platform"]: c["share"] for c in out["per_channel_credit"]}
    assert shares["google"] == pytest.approx(0.6)
    assert shares["meta"] == pytest.approx(0.4)


def test_credits_sum_to_actual_revenue():
    out = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(78000)])
    total = sum(c["credit"] for c in out["per_channel_credit"])
    assert total == pytest.approx(78000.0, abs=0.01)
    # residual lands exactly: no rounding drift
    assert round(total, 2) == 78000.0


def test_never_exceeds_actual_even_when_platform_claims_higher():
    ro = mock_reconcile_output()
    ro["per_channel"][0]["claimed_value"] = 999999
    out = attribute_revenue("ws-1", ro, [Revenue(78000)])
    total = sum(c["credit"] for c in out["per_channel_credit"])
    assert total <= 78000.0 + 1e-9


def test_implied_roas_equals_blended_mer():
    out = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(78000)])
    for c in out["per_channel_credit"]:
        assert c["implied_roas"] == pytest.approx(3.9, abs=0.001)


def test_confidence_penalized_by_over_count_but_in_range():
    out = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(78000)])
    expected = round(0.95 - min(0.35, 0.33 * 0.5), 4)  # over-count penalty
    assert out["confidence"] == pytest.approx(expected, abs=1e-6)
    assert 0.05 <= out["confidence"] <= 1.0

    clean = mock_reconcile_output()
    clean.update(over_count_pct=0.0, over_count_value=0, tracking_integrity_flag=False)
    out_clean = attribute_revenue("ws-1", clean, [Revenue(78000)])
    assert out_clean["confidence"] > out["confidence"]
    assert out_clean["confidence"] == pytest.approx(0.95, abs=1e-6)


def test_rationale_mentions_actuals_and_over_count():
    out = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(78000)])
    r = out["rationale"].lower()
    assert "78,000.00" in out["rationale"]
    assert "over" in r or "exceed" in r
    assert isinstance(out["rationale"], str) and len(out["rationale"]) > 20


def test_dict_and_object_revenues_equivalent():
    obj_out = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(50000), Revenue(28000)])
    dict_out = attribute_revenue(
        "ws-1", mock_reconcile_output(), [{"amount": 50000}, {"amount": 28000}]
    )
    assert obj_out == dict_out


def test_empty_revenues_falls_back_to_reconcile_aggregate():
    out = attribute_revenue("ws-1", mock_reconcile_output(), [])
    total = sum(c["credit"] for c in out["per_channel_credit"])
    assert total == pytest.approx(78000.0, abs=0.01)
    # lower confidence without raw revenue rows
    with_rows = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(78000)])
    assert out["confidence"] < with_rows["confidence"]


def test_zero_spend_returns_empty_with_zero_confidence():
    ro = mock_reconcile_output()
    ro["total_spend"] = 0
    out = attribute_revenue("ws-1", ro, [Revenue(100)])
    assert out["per_channel_credit"] == []
    assert out["confidence"] == 0.0


def test_no_channels_returns_empty():
    ro = mock_reconcile_output()
    ro["per_channel"] = []
    out = attribute_revenue("ws-1", ro, [])
    assert out["per_channel_credit"] == []
    assert out["confidence"] == 0.0


def test_single_channel_gets_full_credit():
    ro = {
        "total_spend": 20000,
        "platform_claimed_value": 30000,
        "actual_revenue": 15000,
        "blended_mer": 0.75,
        "per_channel": [
            {"platform": "google", "spend": 20000, "claimed_value": 30000, "claimed_roas": 1.5}
        ],
        "over_count_value": 15000,
        "over_count_pct": 100.0,
        "tracking_integrity_flag": True,
    }
    out = attribute_revenue("ws-1", ro, [Revenue(15000)])
    assert len(out["per_channel_credit"]) == 1
    assert out["per_channel_credit"][0]["credit"] == pytest.approx(15000.0)
    assert out["per_channel_credit"][0]["share"] == pytest.approx(1.0)


def test_deterministic_same_input_same_output():
    a = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(70000), Revenue(8000)])
    b = attribute_revenue("ws-1", mock_reconcile_output(), [Revenue(70000), Revenue(8000)])
    assert a == b


def test_workspace_accepts_object_or_none():
    class WS:
        id = "ws-9"

    for ws in ("ws-1", {"id": "ws-1"}, WS(), None):
        out = attribute_revenue(ws, mock_reconcile_output(), [Revenue(78000)])
        assert out["confidence"] >= 0.05
