"""Tier-threshold tests for app.discovery.score.winner_engine.score_ads.

Contract under test (discovery spec): weights runtime=0.40, reach=0.30,
concentration=0.20, spend=0.10; longevity tiers >=30d floor, >=45d strong,
>=90d proven.

Gates:
  * an ad running ~95 days promotes all the way to ``proven``
  * an ad running ~10 days is not promoted to any tier (under the 30d floor)
"""

from datetime import datetime, timedelta, timezone

from app.discovery.schemas import AdRecord
from app.discovery.score.winner_engine import score_ads

# Promoted tiers per spec: >=30d floor, >=45d strong, >=90d proven.
# Anything else (incl. being dropped from the output) means "not promoted".
PROMOTED_TIERS = {"floor", "strong", "proven"}
PROVEN = "proven"


def _ad(ad_id: str, days_live: float) -> AdRecord:
    """AdRecord first seen ``days_live`` ago, with all scoring inputs present."""
    return AdRecord(
        platform="meta",
        advertiser="Rival Co",
        ad_id=ad_id,
        start_date=datetime.now(timezone.utc) - timedelta(days=days_live),
        spend_estimate=5_000.0,
        impressions=250_000,
        text="Trusted by thousands of customers.",
        hook="Stop wasting ad spend",
        cta="Shop Now",
    )


def test_95_day_ad_promotes_to_proven():
    signals = score_ads([_ad("old-95", 95)])
    tiers = [s.tier for s in signals if s.ad_id == "old-95"]
    assert tiers == [PROVEN]


def test_10_day_ad_is_not_promoted():
    signals = score_ads([_ad("young-10", 10)])
    young = [s for s in signals if s.ad_id == "young-10"]
    # Being filtered out entirely also counts as "not promoted"; if surfaced,
    # the sub-floor ad must carry a non-promoted tier.
    assert all(s.tier not in PROMOTED_TIERS for s in young)
