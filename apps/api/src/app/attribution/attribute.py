"""Spend-weighted attribution of ACTUAL revenue to channels.

Conservative, deterministic, explainable. Platform-claimed conversion values are
never used as credit; they only inform the confidence score and rationale.
"""

from __future__ import annotations

from typing import Any, Iterable

__all__ = ["attribute_revenue"]


def _get(obj: Any, key: str, default: Any = None) -> Any:
    """Read a field from either a dict or an attribute-style object."""
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _money(value: float) -> float:
    return round(float(value), 2)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def attribute_revenue(
    workspace: Any,
    reconcile_output: dict[str, Any],
    revenues: Iterable[Any],
) -> dict[str, Any]:
    """Allocate actual revenue across channels by spend share.

    Args:
        workspace: Workspace object/dict/id; unused for math, kept for API symmetry.
        reconcile_output: Dict from app.attribution.reconcile.reconcile (contract shape).
        revenues: Actual Revenue rows (source of truth). Objects or dicts with `amount`.

    Returns:
        {
          "per_channel_credit": [
            {"platform": str, "spend": float, "share": float, "credit": float,
             "claimed_value": float, "claimed_roas": float|None,
             "implied_roas": float|None}
          ],
          "confidence": float,   # 0..1
          "rationale": str,
        }

    Credits sum exactly to the allocated total (residual goes to the last channel).
    """
    per_channel = list(reconcile_output.get("per_channel") or [])
    total_spend = float(_get(reconcile_output, "total_spend", 0.0) or 0.0)
    claimed_total = float(
        _get(reconcile_output, "platform_claimed_value", 0.0) or 0.0
    )
    over_count_pct = float(_get(reconcile_output, "over_count_pct", 0.0) or 0.0)

    revenue_rows = list(revenues)
    if revenue_rows:
        actual_revenue = _money(sum(float(_get(r, "amount") or 0.0) for r in revenue_rows))
    else:
        # ponytail: fall back to reconcile aggregate when no rows are handed in
        actual_revenue = _money(_get(reconcile_output, "actual_revenue", 0.0) or 0.0)

    if not per_channel or total_spend <= 0:
        return {
            "per_channel_credit": [],
            "confidence": 0.0,
            "rationale": (
                "No attributable spend data available; revenue left unallocated."
            ),
        }

    shares = [float(_get(c, "spend") or 0.0) / total_spend for c in per_channel]
    credits = [_money(actual_revenue * s) for s in shares]
    residual = _money(actual_revenue - sum(credits))
    credits[-1] = _money(credits[-1] + residual)

    per_channel_credit: list[dict[str, Any]] = []
    for channel, share, credit in zip(per_channel, shares, credits):
        spend_c = float(_get(channel, "spend") or 0.0)
        claimed_value = float(_get(channel, "claimed_value") or 0.0)
        claimed_roas = _get(channel, "claimed_roas")
        implied_roas = round(credit / spend_c, 4) if spend_c > 0 else None
        per_channel_credit.append(
            {
                "platform": _get(channel, "platform"),
                "spend": _money(spend_c),
                "share": round(share, 4),
                "credit": _money(credit),
                "claimed_value": _money(claimed_value),
                "claimed_roas": None if claimed_roas is None else round(float(claimed_roas), 4),
                "implied_roas": implied_roas,
            }
        )

    base_confidence = 0.95 if revenue_rows else 0.75
    over_count_penalty = min(0.35, (max(0.0, over_count_pct) / 100.0) * 0.5)
    confidence = round(_clamp(base_confidence - over_count_penalty, 0.05, 1.0), 4)

    parts = [
        f"Allocated ${actual_revenue:,.2f} actual revenue across "
        f"{len(per_channel_credit)} channels by spend share "
        + ", ".join(
            f"{c['platform']} {c['share'] * 100:.1f}%" for c in per_channel_credit
        )
        + "."
    ]
    if claimed_total > 0 and claimed_total > actual_revenue:
        parts.append(
            f"Platform claims total ${claimed_total:,.2f} exceed actuals by "
            f"${claimed_total - actual_revenue:,.2f} ({over_count_pct:.1f}%); "
            "credits capped at actual revenue, never platform-reported values."
        )
    mer = reconcile_output.get("blended_mer")
    if mer:
        parts.append(f"Implied ROAS equals blended MER {float(mer):.1f}x under this model.")
    if not revenue_rows:
        parts.append("No raw revenue rows supplied; used reconcile aggregate.")
    rationale = " ".join(parts)

    return {
        "per_channel_credit": per_channel_credit,
        "confidence": confidence,
        "rationale": rationale,
    }
