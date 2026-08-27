"""Winner engine: rank discovered competitor ads into actionable winner signals.

Follows the adoracle scoring approach referenced by ``app.discovery.score``
(a deterministic 0-100 weighted blend of observed signals, no LLM calls), with
observed runtime as the dominant winner proxy — an ad a competitor keeps money
behind for months is the strongest signal we can read from public libraries.

Composite score = 100 * (runtime*0.40 + reach*0.30 + concentration*0.20 + spend*0.10)

* ``runtime``       — days live, saturating at the proven window (90d).
* ``reach``         — impressions, relative to the batch maximum.
* ``concentration`` — the ad's share of its advertiser's spend (or impressions);
                      an ad soaking up most of a competitor's budget is a bet.
* ``spend``         — estimated spend, relative to the batch maximum.

Longevity tiers gate trust in the signal: ``>= 30d floor``, ``>= 45d strong``,
``>= 90d proven``. Anything newer is ``below_floor``. Pure functions, no I/O;
missing fields degrade deterministically instead of raising.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime

from app.discovery.schemas import AdRecord, WinnerSignal

__all__ = [
    "WEIGHTS",
    "FLOOR_MIN_DAYS",
    "STRONG_MIN_DAYS",
    "PROVEN_MIN_DAYS",
    "TIER_PROVEN",
    "TIER_STRONG",
    "TIER_FLOOR",
    "TIER_BELOW_FLOOR",
    "evidence_of",
    "longevity_days",
    "longevity_tier",
    "score_ads",
]

# --- scoring knobs -----------------------------------------------------------

RUNTIME_WEIGHT = 0.40
REACH_WEIGHT = 0.30
CONCENTRATION_WEIGHT = 0.20
SPEND_WEIGHT = 0.10

WEIGHTS: dict[str, float] = {
    "runtime": RUNTIME_WEIGHT,
    "reach": REACH_WEIGHT,
    "concentration": CONCENTRATION_WEIGHT,
    "spend": SPEND_WEIGHT,
}

# Longevity tiers: minimum observed days for each label (first match wins).
FLOOR_MIN_DAYS = 30.0
STRONG_MIN_DAYS = 45.0
PROVEN_MIN_DAYS = 90.0

TIER_PROVEN = "proven"
TIER_STRONG = "strong"
TIER_FLOOR = "floor"
TIER_BELOW_FLOOR = "below_floor"


def longevity_days(ad: AdRecord, now: datetime | None = None) -> float:
    """Days an ad has been running (start_date -> now), clamped at 0.

    Naive timestamps are assumed UTC. Missing start_date -> 0.0.
    """
    start = ad.start_date
    if start is None:
        return 0.0
    now = datetime.now(UTC) if now is None else now
    if start.tzinfo is None:
        start = start.replace(tzinfo=UTC)
    return max((now - start).total_seconds() / 86400.0, 0.0)


def longevity_tier(days: float) -> str:
    """Map observed runtime onto a longevity tier."""
    if days >= PROVEN_MIN_DAYS:
        return TIER_PROVEN
    if days >= STRONG_MIN_DAYS:
        return TIER_STRONG
    if days >= FLOOR_MIN_DAYS:
        return TIER_FLOOR
    return TIER_BELOW_FLOOR


# --- components --------------------------------------------------------------

def _batch_max(values: list[float]) -> float:
    return max(values, default=0.0)


def _volume(ad: AdRecord) -> float:
    """Best available volume signal for an ad.

    Impressions when the library exposes them (political ads only on Meta),
    otherwise the count of near-duplicate variants the advertiser is running.
    """
    if ad.impressions:
        return float(ad.impressions)
    return float(ad.variant_count or 0)


def _concentrations(ads: list[AdRecord]) -> dict[str, float]:
    """ad_id -> share of its advertiser's spend (fallback: impressions).

    Single-ad advertisers get 1.0; advertisers with no volume data get 0.0.
    """
    adv_spend: dict[str, float] = defaultdict(float)
    adv_impr: dict[str, float] = defaultdict(float)
    has_spend: set[str] = set()
    has_impr: set[str] = set()
    for ad in ads:
        if ad.spend_estimate is not None and ad.spend_estimate > 0:
            adv_spend[ad.advertiser] += ad.spend_estimate
            has_spend.add(ad.advertiser)
        if _volume(ad) > 0:
            adv_impr[ad.advertiser] += _volume(ad)
            has_impr.add(ad.advertiser)

    shares: dict[str, float] = {}
    for ad in ads:
        if ad.advertiser in has_spend and adv_spend[ad.advertiser] > 0:
            denom = adv_spend[ad.advertiser]
            numer = float(ad.spend_estimate or 0.0)
        elif ad.advertiser in has_impr and adv_impr[ad.advertiser] > 0:
            denom = adv_impr[ad.advertiser]
            numer = _volume(ad)
        else:
            shares[ad.ad_id] = 0.0
            continue
        shares[ad.ad_id] = min(numer / denom, 1.0)
    return shares


def evidence_of(ad: AdRecord) -> tuple[str, ...]:
    """Which scoring signals this library actually disclosed for this ad.

    Public libraries differ in what they publish: Meta gives runtime and
    duplicate-variant counts, Google gives runtime only, LinkedIn gives neither.
    Scoring has to know the difference — see ``_score_one``.
    """
    signals: list[str] = []
    if ad.start_date is not None:
        signals.append("runtime")
    if _volume(ad) > 0:
        signals.append("reach")
    if ad.spend_estimate:
        signals.append("spend")
    return tuple(signals)


def _score_one(
    ad: AdRecord,
    days: float,
    max_reach: float,
    max_spend: float,
    concentration: float,
) -> float:
    """0-100 over the signals the source disclosed, not over all four.

    Dividing by the full weight set would cap a Google ad at 40 no matter how
    long it ran, purely because the Transparency Center hides spend and reach.
    The score answers "how strong on the available evidence"; ``evidence_of``
    reports how much evidence that was, and the tier gates on it.
    """
    parts: list[tuple[float, float]] = []

    if ad.start_date is not None:
        parts.append((RUNTIME_WEIGHT, min(days / PROVEN_MIN_DAYS, 1.0)))
    if max_reach > 0 and _volume(ad) > 0:
        parts.append((REACH_WEIGHT, min(_volume(ad) / max_reach, 1.0)))
        parts.append((CONCENTRATION_WEIGHT, concentration))
    if max_spend > 0 and ad.spend_estimate:
        parts.append((SPEND_WEIGHT, min(float(ad.spend_estimate) / max_spend, 1.0)))

    available = sum(w for w, _ in parts)
    if available <= 0:
        return 0.0
    composite = sum(w * v for w, v in parts) / available
    return round(min(composite, 1.0) * 100.0, 2)


# --- public API ---------------------------------------------------------------

def score_ads(ads: list[AdRecord], *, now: datetime | None = None) -> list[WinnerSignal]:
    """Score every ad into a 0-100 WinnerSignal, best first.

    Deterministic order: descending score, then platform/ad_id as tie-break.
    Includes sub-floor ads (tier ``below_floor``) so callers see the full field;
    filter on ``tier`` for winners only.
    """
    if not ads:
        return []

    longevities = [longevity_days(ad, now) for ad in ads]
    concentrations = _concentrations(ads)
    max_reach = _batch_max([_volume(ad) for ad in ads])
    max_spend = _batch_max([float(ad.spend_estimate or 0.0) for ad in ads])

    signals = [
        WinnerSignal(
            platform=ad.platform,
            advertiser=ad.advertiser,
            ad_id=ad.ad_id,
            creative_url=ad.creative_url,
            landing_url=ad.landing_url,
            score=_score_one(ad, days, max_reach, max_spend, concentrations.get(ad.ad_id, 0.0)),
            tier=longevity_tier(days),
            start_date=ad.start_date,
            hook=ad.hook,
            cta=ad.cta,
            text=ad.text,
            runtime_days=round(days, 1),
            evidence=list(evidence_of(ad)),
        )
        for ad, days in zip(ads, longevities)
    ]
    return sorted(signals, key=lambda s: (-s.score, s.platform, s.ad_id))


if __name__ == "__main__":  # pragma: no cover - runnable self-check
    from datetime import timedelta

    _now = datetime.now(UTC)
    _ads = [
        AdRecord(
            platform="meta", advertiser="Acme", ad_id="a1",
            spend_estimate=500.0, impressions=40_000,
            start_date=_now - timedelta(days=100),
        ),
        AdRecord(
            platform="meta", advertiser="Acme", ad_id="a2",
            spend_estimate=100.0, impressions=5_000,
            start_date=_now - timedelta(days=10),
        ),
        AdRecord(platform="tiktok", advertiser="Beta", ad_id="b1"),
    ]
    _signals = score_ads(_ads, now=_now)
    _tiers = {s.ad_id: s.tier for s in _signals}
    assert _tiers == {"a1": TIER_PROVEN, "a2": TIER_BELOW_FLOOR, "b1": TIER_BELOW_FLOOR}
    assert _signals[0].ad_id == "a1" and 0.0 <= _signals[0].score <= 100.0
    assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9
    print("winner_engine self-check OK")
