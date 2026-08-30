"""Pure-logic tests for the adkit/ads-mcp client wrapper (A25).

No DB, no network: verifies determinism, mock-safety defaults, channel
validation, variant counts, and the always-paused launch contract.
"""

import os

os.environ.setdefault("MOCK_MODE", "true")

import pytest  # noqa: E402
from pydantic import ValidationError  # noqa: E402

from app.create.adkit_mcp_client import (  # noqa: E402
    AdkitMcpClient,
    CreateBrief,
    LaunchRequest,
    SpyQuery,
    resolve_transport,
)


def _client() -> AdkitMcpClient:
    return AdkitMcpClient(mock=True)


def test_spy_is_deterministic_and_respects_limit() -> None:
    c = _client()
    q = SpyQuery(competitor="Gymshark", channel="meta", limit=5)
    first = c.spy(q)
    second = c.spy(SpyQuery(competitor="Gymshark", channel="meta", limit=5))
    assert len(first) == 5
    assert [ad.model_dump() for ad in first] == [ad.model_dump() for ad in second]
    assert all(ad.channel == "meta" for ad in first)
    assert len({ad.ad_id for ad in first}) == 5


def test_spy_varies_by_competitor_and_channel() -> None:
    c = _client()
    a = c.spy(SpyQuery(competitor="Gymshark", channel="meta", limit=3))
    b = c.spy(SpyQuery(competitor="Allbirds", channel="tiktok", limit=3))
    assert {ad.ad_id for ad in a}.isdisjoint({ad.ad_id for ad in b})


def test_create_returns_requested_variants_with_stable_hashes() -> None:
    c = _client()
    brief = CreateBrief(
        persona="GenZ shopper",
        channel="tiktok",
        headline="Clear skin in 7 days",
        body="Dermatologist-simple routine.",
        cta="Shop Now",
        variants=4,
        source_ad_id="meta-abc-001",
    )
    job = c.create(brief)
    again = c.create(CreateBrief.model_validate(brief.model_dump()))
    assert job.status == "queued"
    assert len(job.clips) == 4
    assert job.job_id == again.job_id
    assert [cl.spec_hash for cl in job.clips] == [cl.spec_hash for cl in again.clips]
    assert len({cl.variant_id for cl in job.clips}) == 4


def test_launch_always_paused_pending_approval_even_in_mock() -> None:
    c = _client()
    receipt = c.launch(
        LaunchRequest(
            workspace_id="ws-1",
            ad_account_ref="act_meta_1",
            job_id="job-abc",
            daily_budget_micros=10_000_000,
            confirm_live=True,
        )
    )
    assert receipt.status == "paused_pending_approval"
    assert receipt.requires_approval is True


def test_rejects_bad_channel_and_nonpositive_budget() -> None:
    with pytest.raises(ValidationError):
        SpyQuery(competitor="x", channel="pinterest")  # type: ignore[arg-type]
    with pytest.raises(ValidationError):
        LaunchRequest(
            workspace_id="ws",
            ad_account_ref="acct",
            job_id="job",
            daily_budget_micros=0,
        )


def test_resolve_transport_prefers_real_only_when_explicit() -> None:
    from app.create.adkit_mcp_client import HttpAdkitTransport, MockAdkitTransport

    # Default (MOCK_MODE=true): always mock.
    assert isinstance(resolve_transport(), MockAdkitTransport)
    # Explicit real request without a URL still falls back to mock (mock-safe).
    assert isinstance(resolve_transport(mock=False), MockAdkitTransport)
    # Explicit real request WITH url -> real transport.
    real = resolve_transport(mock=False, url="http://127.0.0.1:9999/mcp")
    assert isinstance(real, HttpAdkitTransport)
