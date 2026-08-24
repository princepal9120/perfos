from app.attribution.reconcile import reconcile


def demo_spends():
    return [
        {
            "platform": "google",
            "spend": 12000,
            "impressions": 1_000_000,
            "clicks": 25000,
            "conversions": 600,
            "conversion_value": 60000,
        },
        {
            "platform": "meta",
            "spend": 8000,
            "impressions": 800_000,
            "clicks": 20000,
            "conversions": 500,
            "conversion_value": 44000,
        },
    ]


def demo_revenues():
    # Shopify orders, source of truth: total 78000.
    return [
        {"source": "shopify", "order_id": "1001", "amount": 30000},
        {"source": "shopify", "order_id": "1002", "amount": 25000},
        {"source": "shopify", "order_id": "1003", "amount": 23000},
    ]


def test_demo_reconciliation_matches_contract():
    out = reconcile(demo_spends(), demo_revenues())

    assert out["total_spend"] == 20000
    assert out["platform_claimed_value"] == 104000
    assert out["actual_revenue"] == 78000
    assert out["blended_mer"] == 3.9
    assert out["over_count_value"] == 26000
    assert out["over_count_pct"] == 33.0
    assert out["tracking_integrity_flag"] is True


def test_demo_per_channel():
    out = reconcile(demo_spends(), demo_revenues())

    channels = {c["platform"]: c for c in out["per_channel"]}
    assert set(channels) == {"google", "meta"}

    google = channels["google"]
    assert google["spend"] == 12000
    assert google["claimed_value"] == 60000
    assert google["claimed_roas"] == 5.0

    meta = channels["meta"]
    assert meta["spend"] == 8000
    assert meta["claimed_value"] == 44000
    assert meta["claimed_roas"] == 5.5


def test_rows_aggregate_within_platform():
    spends = [
        {"platform": "google", "spend": 7000, "conversion_value": 30000},
        {"platform": "google", "spend": 5000, "conversion_value": 30000},
        {"platform": "meta", "spend": 8000, "conversion_value": 44000},
    ]
    out = reconcile(spends, demo_revenues())

    assert [c["platform"] for c in out["per_channel"]] == ["google", "meta"]
    google = out["per_channel"][0]
    assert google["spend"] == 12000
    assert google["claimed_value"] == 60000
    assert out["total_spend"] == 20000
    assert out["platform_claimed_value"] == 104000


def test_empty_inputs_are_safe():
    out = reconcile([], [])

    assert out == {
        "total_spend": 0,
        "platform_claimed_value": 0,
        "actual_revenue": 0,
        "blended_mer": 0.0,
        "per_channel": [],
        "over_count_value": 0,
        "over_count_pct": 0.0,
        "tracking_integrity_flag": False,
    }


def test_undercount_does_not_flag():
    spends = [{"platform": "google", "spend": 1000, "conversion_value": 500}]
    revenues = [{"amount": 900}]
    out = reconcile(spends, revenues)

    assert out["over_count_value"] == -400
    assert out["tracking_integrity_flag"] is False


def test_zero_revenue_with_claims_flags():
    spends = [{"platform": "meta", "spend": 500, "conversion_value": 2500}]
    out = reconcile(spends, [])

    assert out["actual_revenue"] == 0
    assert out["blended_mer"] == 0.0
    assert out["tracking_integrity_flag"] is True


def test_zero_spend_claim_gives_no_roas():
    spends = [{"platform": "organic", "spend": 0, "conversion_value": 100}]
    revenues = [{"amount": 50}]
    out = reconcile(spends, revenues)

    assert out["per_channel"][0]["claimed_roas"] is None
    assert out["blended_mer"] == 0.0
