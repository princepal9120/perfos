"""Reconciliation engine: platform-claimed numbers vs. actual revenue.

Pure functions only — no DB, no I/O. The revenue list is the source of truth;
platform "conversion_value" on spend rows is the claimed number that gets
audited here.
"""

FLAG_THRESHOLD_PCT = 15.0


def _get(row: dict, *keys):
    for key in keys:
        value = row.get(key)
        if value is not None:
            return value
    return 0


def reconcile(spends: list[dict], revenues: list[dict]) -> dict:
    """Reconcile per-platform spend claims against actual revenue.

    Args:
        spends: dicts with at least {"platform", "spend"|"cost",
            "conversion_value"} ("claimed_value" also accepted).
        revenues: dicts with at least {"amount"}.

    Returns dict with keys: total_spend, platform_claimed_value,
    actual_revenue, blended_mer, per_channel, over_count_value,
    over_count_pct, tracking_integrity_flag.
    """
    channels: dict[str, dict] = {}
    for row in spends:
        platform = row.get("platform") or "unknown"
        entry = channels.setdefault(
            platform,
            {"platform": platform, "spend": 0, "conversions": 0, "claimed_value": 0},
        )
        entry["spend"] += _get(row, "spend", "cost")
        entry["conversions"] += _get(row, "conversions")
        entry["claimed_value"] += _get(row, "conversion_value", "claimed_value")

    per_channel = []
    for platform in sorted(channels):
        entry = channels[platform]
        roas = (
            entry["claimed_value"] / entry["spend"] if entry["spend"] else None
        )
        per_channel.append(
            {
                "platform": entry["platform"],
                "spend": entry["spend"],
                "claimed_value": entry["claimed_value"],
                "claimed_roas": roas,
            }
        )

    total_spend = sum(c["spend"] for c in per_channel)
    platform_claimed_value = sum(c["claimed_value"] for c in per_channel)
    actual_revenue = sum(_get(r, "amount") for r in revenues)

    blended_mer = actual_revenue / total_spend if total_spend else 0.0

    over_count_value = platform_claimed_value - actual_revenue
    if actual_revenue:
        raw_pct = over_count_value / actual_revenue * 100
        # Whole-point display value; flag below uses the unrounded ratio.
        over_count_pct = float(round(raw_pct))
    else:
        raw_pct = 100.0 if platform_claimed_value else 0.0
        over_count_pct = raw_pct

    return {
        "total_spend": total_spend,
        "platform_claimed_value": platform_claimed_value,
        "actual_revenue": actual_revenue,
        "blended_mer": blended_mer,
        "per_channel": per_channel,
        "over_count_value": over_count_value,
        "over_count_pct": over_count_pct,
        "tracking_integrity_flag": raw_pct > FLAG_THRESHOLD_PCT,
    }
