"""Unit tests for app.create.commercial_creator — spend-gated commercial-creator adapter.

Pure logic + mock-mode client: no network, no DB, no keys.
The invariant under test: money only moves via approve_video_jobs with an
explicit approver AND an estimate that fits the remaining budget cap.
"""

import pytest
from pydantic import ValidationError

from app.create.commercial_creator import (
    CommercialBrief,
    CommercialCreatorClient,
    check_budget,
    estimate_cost_usd,
    generate_commercial,
)


# --------------------------------------------------------------- pure functions

def test_estimate_matches_documented_cost_band():
    # README: draft-tier $10-20 per 30s spot -> 0.50/s lands mid-band.
    assert estimate_cost_usd(30, "draft") == 15.00
    assert estimate_cost_usd(15, "draft") == 7.50
    assert estimate_cost_usd(30, "final") == 30.00


def test_check_budget_allows_within_cap():
    v = check_budget(estimate_usd=15.0, spent_usd=5.0, cap_usd=25.0)
    assert v["decision"] == "allow"
    assert v["remaining_usd"] == 20.0


def test_check_budget_blocks_over_cap():
    v = check_budget(estimate_usd=21.0, spent_usd=5.0, cap_usd=25.0)
    assert v["decision"] == "block"
    assert "budget_cap_exceeded" in v["reasons"]


def test_check_budget_blocks_non_positive_estimate():
    assert check_budget(0, 0, 25)["decision"] == "block"


# ------------------------------------------------------------------ brief model

def test_brief_rejects_out_of_range_length():
    with pytest.raises(ValidationError):
        CommercialBrief(title="t", description="d", target_length_s=120)


# ------------------------------------------------------------------- spend gate

def _brief() -> CommercialBrief:
    return CommercialBrief(title="PocketBrew", description="coffee", budget_cap_usd=25.0)


def test_staging_never_spends():
    c = CommercialCreatorClient()
    slug = c.create_project(_brief())["slug"]
    staged = c.stage_video_batch(slug)
    assert staged["total_estimate_usd"] == 15.00
    assert c.get_project(slug)["spend_usd"] == 0.0


def test_approval_requires_named_approver():
    c = CommercialCreatorClient()
    slug = c.create_project(_brief())["slug"]
    c.stage_video_batch(slug)
    verdict = c.approve_video_jobs(slug)  # no approved_by
    assert verdict["decision"] == "needs_approval"
    assert verdict["reasons"] == ["missing_approver"]
    assert c.get_project(slug)["spend_usd"] == 0.0


def test_approval_blocks_when_estimate_exceeds_remaining():
    c = CommercialCreatorClient()
    brief = CommercialBrief(title="TIMEPIECE", description="trailer", budget_cap_usd=10.0)
    slug = c.create_project(brief)["slug"]
    c.stage_video_batch(slug)  # 15.00 > 10.00 cap
    verdict = c.approve_video_jobs(slug, approved_by="human@example.com")
    assert verdict["decision"] == "block"
    assert c.get_project(slug)["spend_usd"] == 0.0


def test_approval_spends_only_with_approver_and_budget():
    c = CommercialCreatorClient()
    slug = c.create_project(_brief())["slug"]
    c.stage_video_batch(slug)
    verdict = c.approve_video_jobs(slug, approved_by="human@example.com")
    assert verdict["decision"] == "allow"
    project = c.get_project(slug)
    assert project["spend_usd"] == 15.00
    # staged estimate cleared so a re-approve without re-staging cannot double-spend
    assert project["staged_estimate_usd"] is None


def test_run_step_forbids_direct_video_generation():
    c = CommercialCreatorClient()
    slug = c.create_project(_brief())["slug"]
    with pytest.raises(ValueError):
        c.run_step(slug, "generate-video")


def test_generate_commercial_stops_before_gate_without_approver():
    result = generate_commercial(_brief())
    assert result["state"] == "awaiting_approval"
    assert result["total_estimate_usd"] == 15.00


def test_generate_commercial_spends_with_approver():
    result = generate_commercial(_brief(), approved_by="human@example.com")
    assert result["decision"] == "allow"
