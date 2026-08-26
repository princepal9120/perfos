"""Unit tests for app.discovery.score.winner_tiers — pure tier classification.

Gates under test:
  * high_conf: score >= 75 AND runtime >= 14d
  * winner:    score >= 60 AND runtime >= 7d
  * emerging:  score >= 45 (any runtime) — incl. hot-but-young ads
  * loser:     everything else, incl. missing/untrusted inputs
"""

from dataclasses import dataclass

from app.discovery.score.winner_tiers import (
    EMERGING,
    HIGH_CONF,
    LOSER,
    WINNER,
    classify_ad,
    classify_tier,
)


def test_high_conf_requires_score_and_longevity():
    assert classify_tier(90.0, 20.0) == HIGH_CONF


def test_high_conf_boundaries():
    # Exactly at both gates -> in; one notch below either gate -> not.
    assert classify_tier(75.0, 14.0) == HIGH_CONF
    assert classify_tier(74.9, 14.0) == WINNER
    assert classify_tier(75.0, 13.9) == WINNER


def test_winner():
    assert classify_tier(70.0, 8.0) == WINNER
    assert classify_tier(60.0, 7.0) == WINNER
    # Strong score but under the winner runtime window stays emerging.
    assert classify_tier(60.0, 6.9) == EMERGING


def test_emerging_covers_hot_new_and_mid_ads():
    # High score, too young to trust.
    assert classify_tier(95.0, 2.0) == EMERGING
    # Mid score, long-running but never crossed the bar.
    assert classify_tier(50.0, 30.0) == EMERGING
    assert classify_tier(45.0, 0.0) == EMERGING


def test_loser_below_bar():
    assert classify_tier(44.9, 60.0) == LOSER
    assert classify_tier(10.0, 1.0) == LOSER


def test_missing_or_invalid_inputs_degrade_to_loser_deterministically():
    assert classify_tier(None, None) == LOSER
    assert classify_tier(None, 100.0) == LOSER
    assert classify_tier(-5.0, 3.0) == LOSER
    # Over-range scores clamp to 100 -> still emerging while young.
    assert classify_tier(150.0, 3.0) == EMERGING


@dataclass
class FakeScoredAd:
    score: float | None = None
    runtime_days: float | None = None


def test_classify_ad_accepts_dict_and_object():
    assert classify_ad({"score": 80.0, "runtime_days": 21}) == HIGH_CONF
    assert classify_ad(FakeScoredAd(score=80.0, runtime_days=21)) == HIGH_CONF
    assert classify_ad(FakeScoredAd()) == LOSER
