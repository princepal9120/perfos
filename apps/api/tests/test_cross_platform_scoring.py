"""Scoring must compare ads fairly across libraries that disclose different data.

Meta publishes runtime + duplicate-variant counts, Google publishes runtime
only, LinkedIn publishes neither. A score built by dividing over all four
weights punishes an ad for its library's disclosure policy rather than its
performance, so the score normalizes over available evidence and the tier gates
on how much evidence there was.
"""

from datetime import UTC, datetime, timedelta

from app.discovery.schemas import AdRecord
from app.discovery.score.winner_engine import evidence_of, score_ads
from app.discovery.score.winner_tiers import HIGH_CONF, UNSCORED, classify_tier

NOW = datetime.now(UTC)


def _ad(ad_id: str, *, days: int | None = None, variants: int | None = None,
        spend: float | None = None, platform: str = "meta") -> AdRecord:
    return AdRecord(
        platform=platform,
        advertiser="Acme",
        ad_id=ad_id,
        start_date=(NOW - timedelta(days=days)).replace(tzinfo=None) if days else None,
        variant_count=variants,
        spend_estimate=spend,
    )


def test_evidence_reports_only_disclosed_signals():
    assert evidence_of(_ad("a", days=100, variants=4, spend=500.0)) == (
        "runtime", "reach", "spend"
    )
    assert evidence_of(_ad("b", days=100, platform="google")) == ("runtime",)
    assert evidence_of(_ad("c", platform="linkedin")) == ()


def test_runtime_only_ad_is_not_capped_at_the_runtime_weight():
    """The Google case: a 227-day ad must not be stuck at 40/100."""
    [signal] = score_ads([_ad("g1", days=227, platform="google")], now=NOW)
    assert signal.score == 100.0, "maxed runtime is a perfect score on runtime-only evidence"
    assert signal.evidence == ["runtime"]


def test_a_long_runtime_only_ad_beats_a_short_one_on_the_same_platform():
    signals = score_ads(
        [_ad("old", days=200, platform="google"), _ad("new", days=5, platform="google")],
        now=NOW,
    )
    by_id = {s.ad_id: s.score for s in signals}
    assert by_id["old"] > by_id["new"]


def test_richer_evidence_does_not_lower_the_score_for_an_equally_strong_ad():
    """Disclosing more must not penalise; both ads are maxed on what they publish."""
    [meta] = score_ads([_ad("m", days=200, variants=9, spend=900.0)], now=NOW)
    [google] = score_ads([_ad("g", days=200, platform="google")], now=NOW)
    assert meta.score == google.score == 100.0


def test_no_evidence_scores_zero_and_is_unscored():
    [signal] = score_ads([_ad("li", platform="linkedin")], now=NOW)
    assert signal.score == 0.0
    assert signal.evidence == []
    assert classify_tier(signal.score, signal.runtime_days, signal.evidence) == UNSCORED


def test_high_confidence_requires_more_than_one_signal():
    """Runtime alone can reach 100, but one signal is not high confidence."""
    assert classify_tier(100.0, 227.0, ["runtime"]) != HIGH_CONF
    assert classify_tier(100.0, 227.0, ["runtime", "reach"]) == HIGH_CONF


def test_tier_without_evidence_argument_keeps_legacy_behaviour():
    """Callers that never pass evidence must not silently lose their top tier."""
    assert classify_tier(90.0, 30.0) == HIGH_CONF


def test_scores_stay_within_bounds_across_mixed_platforms():
    signals = score_ads(
        [
            _ad("m1", days=300, variants=12, spend=5000.0),
            _ad("g1", days=150, platform="google"),
            _ad("l1", platform="linkedin"),
        ],
        now=NOW,
    )
    assert all(0.0 <= s.score <= 100.0 for s in signals)
    # Best-first ordering survives the mixed evidence set.
    assert [s.score for s in signals] == sorted((s.score for s in signals), reverse=True)
