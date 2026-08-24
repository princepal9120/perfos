"""Tests for unified measurement endpoints: /iroas, /creatives, /anomalies,
/optimizer/reallocate and the incrementality lifecycle."""


def test_iroas_calibration(client, seeded_db):
    resp = client.get("/api/iroas", headers={"X-Workspace-Id": str(seeded_db["workspace_id"])})
    assert resp.status_code == 200
    rows = {r["platform"]: r for r in resp.json()}

    # Every calibrated channel is represented (11 entries).
    assert len(rows) == 11
    for platform in (
        "google",
        "meta",
        "tiktok",
        "linkedin",
        "pinterest",
        "snapchat",
        "amazon",
        "reddit",
        "twitter",
        "youtube",
        "shopify",
    ):
        assert platform in rows

    # Canonical seed: google 60000 value on 12000 spend -> reported 5.0 x 0.82.
    google = rows["google"]
    assert google["reported_roas"] == 5.0
    assert google["calibration"] == 0.82
    assert google["iroas"] == round(5.0 * 0.82, 2)

    # Meta: 44000/8000 = 5.5 x 0.71.
    meta = rows["meta"]
    assert meta["reported_roas"] == 5.5
    assert meta["calibration"] == 0.71
    assert meta["iroas"] == round(5.5 * 0.71, 2)


def test_creatives_and_anomalies(client, seeded_db, db_session):
    ws_id = seeded_db["workspace_id"]

    from app.models import CreativePerformance

    db_session.add_all(
        [
            CreativePerformance(
                workspace_id=ws_id,
                platform="meta",
                creative_id="CR-TIRED-001",
                impressions=100_000,
                spend=5000.0,
                conversions=210.0,
                fatigue_score=0.81,
                hook_rate=0.29,
            ),
            CreativePerformance(
                workspace_id=ws_id,
                platform="google",
                creative_id="CR-FRESH-002",
                impressions=80_000,
                spend=4200.0,
                conversions=180.0,
                fatigue_score=0.21,
                hook_rate=0.55,
            ),
        ]
    )
    db_session.commit()

    resp = client.get("/api/creatives", headers={"X-Workspace-Id": str(ws_id)})
    assert resp.status_code == 200
    creatives = resp.json()
    by_id = {c["creative_id"]: c for c in creatives}
    assert by_id["CR-TIRED-001"]["fatigue_score"] > 0.7
    assert by_id["CR-FRESH-002"]["fatigue_score"] < 0.7

    # Deterministic anomaly feed.
    first = client.get("/api/anomalies").json()
    second = client.get("/api/anomalies").json()
    assert first == second and len(first) >= 1
    assert {"platform", "metric", "severity", "detected_at", "detail"} <= set(first[0])


def test_optimizer_plan_preserves_total(client, seeded_db):
    resp = client.post(
        "/api/optimizer/reallocate",
        headers={"X-Workspace-Id": str(seeded_db["workspace_id"])},
    )
    assert resp.status_code == 200
    body = resp.json()
    plan = body["plan"]

    current_total = round(sum(r["current_spend"] for r in plan), 2)
    recommended_total = round(sum(r["recommended_spend"] for r in plan), 2)
    assert current_total == body["total_current_spend"]
    assert abs(recommended_total - current_total) <= 0.05

    by_platform = {r["platform"]: r for r in plan}
    # Google has higher calibrated iROAS than Meta: it should gain budget.
    assert by_platform["google"]["delta"] > by_platform["meta"]["delta"]


def test_incrementality_lifecycle(client, seeded_db):
    headers = {"X-Workspace-Id": str(seeded_db["workspace_id"])}

    created = client.post(
        "/api/incrementality",
        headers=headers,
        json={
            "platform": "tiktok",
            "test_type": "geo_holdout",
            "markets_treated": ["CA", "TX"],
            "markets_control": ["NY", "FL"],
            "spend_treated": 45000.0,
            "spend_control": 40500.0,
            "conversions_treated": 3100.0,
            "conversions_control": 2500.0,
        },
    )
    assert created.status_code == 201
    draft = created.json()
    assert draft["status"] == "draft"
    assert draft["lift_pct"] is None

    run = client.post(f"/api/incrementality/{draft['id']}/run", headers=headers)
    assert run.status_code == 200
    running = run.json()
    expected_lift = round(((3100 / 2500) / (45000 / 40500) - 1) * 100, 2)
    assert running["status"] == "running"
    assert running["lift_pct"] == expected_lift
    assert running["started_at"] is not None

    done = client.post(f"/api/incrementality/{draft['id']}/complete", headers=headers)
    assert done.status_code == 200
    finished = done.json()
    assert finished["status"] == "completed"
    assert finished["completed_at"] is not None


def test_incrementality_run_without_numbers_stays_none(client, seeded_db):
    headers = {"X-Workspace-Id": str(seeded_db["workspace_id"])}
    created = client.post(
        "/api/incrementality",
        headers=headers,
        json={"platform": "linkedin", "test_type": "ab"},
    )
    assert created.status_code == 201
    test_id = created.json()["id"]

    run = client.post(f"/api/incrementality/{test_id}/run", headers=headers)
    assert run.status_code == 200
    assert run.json()["lift_pct"] is None

    missing = client.post(f"/api/incrementality/{test_id}/complete", headers=headers)
    assert missing.status_code == 200

    not_found = client.post("/api/incrementality/99999/run", headers=headers)
    assert not_found.status_code == 404
