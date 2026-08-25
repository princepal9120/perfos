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
    """Return per-channel {platform, reported_roas, iroas, calibration}."""
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
    reported = {
        row.platform: round(row.value / row.cost, 4) if row.cost else None for row in spend_rows
    }

    out: list[dict] = []
    for platform in CHANNELS:
        calibration = IROAS_CALIBRATION.get(platform, DEFAULT_CALIBRATION)
        reported_roas = (
            reported.get(platform)
            if reported.get(platform) is not None
            else FALLBACK_REPORTED_ROAS[platform]
        )
        out.append(
            {
                "platform": platform,
                "reported_roas": round(reported_roas, 2),
                "iroas": round(reported_roas * calibration, 2),
                "calibration": calibration,
            }
        )
    return out
