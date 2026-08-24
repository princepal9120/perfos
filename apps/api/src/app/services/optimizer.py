"""Budget optimizer: what-if reallocation toward higher-iROAS channels.

Deterministic MOCK_MODE math. Returns a PLAN only; execution stays behind the
policy gate in services/execution.py and is never triggered here.

Rule: channels whose calibrated iROAS sits below the funded-channel average
fund the pool (proportional to their spend); the pool flows to at-or-above-
average channels proportional to iROAS. Totals are preserved exactly.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Campaign, Spend
from app.services.reconciliation_iroas import compute_iroas

SHIFT_SHARE = 0.25


def recommend_reallocation(workspace_id: int, session: Session) -> dict:
    iroas_rows = compute_iroas(workspace_id, session)
    spend_rows = (
        session.query(
            Campaign.platform.label("platform"),
            func.sum(Spend.cost).label("cost"),
        )
        .join(Campaign, Spend.campaign_id == Campaign.id)
        .filter(Spend.workspace_id == workspace_id)
        .group_by(Campaign.platform)
        .all()
    )
    current = {row.platform: round(float(row.cost or 0.0), 2) for row in spend_rows}

    total_spend = round(sum(current.values()), 2)
    funded = [row for row in iroas_rows if current.get(row["platform"], 0.0) > 0]

    def static_row(row):
        cur = current.get(row["platform"], 0.0)
        return {
            "platform": row["platform"],
            "current_spend": cur,
            "recommended_spend": cur,
            "delta": 0.0,
            "expected_iroas": row["iroas"],
        }

    weights = [max(row["iroas"], 0.0) for row in funded]
    if not funded or total_spend <= 0:
        plan = [static_row(row) for row in iroas_rows]
        return {
            "total_current_spend": total_spend,
            "total_recommended_spend": round(sum(r["recommended_spend"] for r in plan), 2),
            "plan": plan,
        }

    avg_iroas = sum(weights) / len(weights)
    donors = [row for row, w in zip(funded, weights) if w < avg_iroas]
    receivers = [row for row, w in zip(funded, weights) if w >= avg_iroas]

    recommended: dict[str, float] = {}
    if not donors or not receivers:
        for row in funded:
            recommended[row["platform"]] = current[row["platform"]]
    else:
        pool = round(total_spend * SHIFT_SHARE, 2)
        donor_total = sum(current[row["platform"]] for row in donors)
        receiver_weight = sum(max(row["iroas"], 1e-9) for row in receivers)

        allocated = 0.0
        for row in donors:
            platform = row["platform"]
            cur = current[platform]
            cut = round(pool * (cur / donor_total), 2) if donor_total > 0 else 0.0
            recommended[platform] = round(cur - cut, 2)

        last_platform = receivers[-1]["platform"]
        for row in receivers:
            platform = row["platform"]
            if platform == last_platform:
                gain = round(pool - allocated, 2)
            else:
                gain = round(pool * max(row["iroas"], 1e-9) / receiver_weight, 2)
                allocated += gain
            recommended[platform] = round(current[platform] + gain, 2)

    plan = []
    for row in iroas_rows:
        platform = row["platform"]
        cur = current.get(platform, 0.0)
        rec = round(recommended.get(platform, cur), 2)
        plan.append(
            {
                "platform": platform,
                "current_spend": cur,
                "recommended_spend": rec,
                "delta": round(rec - cur, 2),
                "expected_iroas": row["iroas"],
            }
        )

    return {
        "total_current_spend": total_spend,
        "total_recommended_spend": round(sum(r["recommended_spend"] for r in plan), 2),
        "plan": plan,
    }
