"""iROAS: incrementality-corrected ROAS per channel (deterministic mock mode).

Reported ROAS comes from platform-claimed Spend rows; the calibration factor
is a deterministic stand-in for incrementality calibration until geo holdout
results land. iROAS = reported_roas * calibration.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Campaign, Spend

IROAS_CALIBRATION: dict[str, float] = {
    "google": 0.82,
    "meta": 0.71,
    "tiktok": 0.88,
    "linkedin": 0.75,
    "pinterest": 0.84,
    "snapchat": 0.81,
    "amazon": 0.90,
    "reddit": 0.77,
    "twitter": 0.80,
    "youtube": 0.86,
    "shopify": 1.0,
}

DEFAULT_CALIBRATION = 0.80

# Deterministic fallback reported ROAS for channels with no Spend rows yet.
FALLBACK_REPORTED_ROAS: dict[str, float] = {
    "google": 5.00,
    "meta": 5.50,
    "tiktok": 4.20,
    "linkedin": 3.60,
    "pinterest": 3.80,
    "snapchat": 3.50,
    "amazon": 5.20,
    "reddit": 3.10,
    "twitter": 3.40,
    "youtube": 4.60,
    "shopify": 1.00,
}

CHANNELS = list(IROAS_CALIBRATION.keys())


def compute_iroas(workspace_id: int, session: Session) -> list[dict]:
    """Return per-channel {platform, reported_roas, iroas, calibration}.

    Every calibrated channel is represented. Channels with no/zero Spend rows in
    this workspace fall back to their deterministic FALLBACK_REPORTED_ROAS (so a
    dashboard never shows a gap), while zero-cost spend that DOES exist yields a
    reported ROAS of 0.0 (never a fabricated fallback). A calibrated channel
    missing a fallback entry raises ValueError (calibration without a fallback is
    a config error, not a silent gap).
    """
    spend_rows = (
        session.query(
            Campaign.platform.label("platform"),
            func.sum(Spend.cost).label("cost"),
            func.sum(Spend.conversion_value).label("value"),
        )
        .join(Campaign, Spend.campaign_id == Campaign.id)
        .filter(Spend.workspace_id == workspace_id)
        .group_by(Campaign.platform)
        .all()
    )
    # NULL sums from empty partitions guard to 0; zero cost -> reported 0.0,
    # never a fabricated fallback ROAS.
    reported = {
        row.platform: round((row.value or 0) / (row.cost or 0), 4)
        if (row.cost or 0) > 0
        else 0.0
        for row in spend_rows
    }

    out: list[dict] = []
    for platform, reported_roas in reported.items():
        calibration = IROAS_CALIBRATION.get(platform, DEFAULT_CALIBRATION)
        out.append(
            {
                "platform": platform,
                "reported_roas": round(reported_roas, 2),
                "iroas": round(reported_roas * calibration, 2),
                "calibration": calibration,
            }
        )

    # Deterministic fallback for every calibrated channel that had no spend.
    for platform in CHANNELS:
        if platform in reported:
            continue
        if platform not in FALLBACK_REPORTED_ROAS:
            # Calibrated but no fallback -> config error, surface clearly.
            raise ValueError(
                f"iroas: channel {platform!r} is calibrated but has no fallback ROAS entry"
            )
        fallback = FALLBACK_REPORTED_ROAS[platform]
        calibration = IROAS_CALIBRATION.get(platform, DEFAULT_CALIBRATION)
        out.append(
            {
                "platform": platform,
                "reported_roas": round(fallback, 2),
                "iroas": round(fallback * calibration, 2),
                "calibration": calibration,
            }
        )
    return out
