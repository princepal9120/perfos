"""Deterministic recommendation engine (PerfOS agent J).

Pure functions: no DB, no network, no LLM. Maps reconcile + attribute
outputs (shapes per spec/CONTRACTS.md) onto Recommendation-shaped dicts
ready for persistence via app.models.Recommendation.
"""

from typing import Any

BUDGET_SHIFT_PCT = 10
OVER_COUNT_FLAG_PCT = 15
RECOMMENDATION_CONFIDENCE = 0.7
SCHEMA_FIELDS = (
    "type",
    "reason",
    "evidence_json",
    "expected_impact",
    "confidence",
    "risk",
    "proposed_changes_json",
    "rollback_json",
    "status",
)

_ATTRIBUTION_KEYS = ("model", "confidence", "rationale", "allocations")


def _inflation(channel: dict[str, Any], blended_mer: float) -> float:
    return (channel.get("claimed_roas") or 0.0) / blended_mer


def generate_recommendations(
    reconcile_output: dict[str, Any],
    attribute_output: dict[str, Any] | None,
) -> list[dict[str, Any]]:
    """Emit Recommendation-shaped dicts from reconcile + attribute output."""
    if not isinstance(reconcile_output, dict):
        raise TypeError("reconcile_output must be a dict")

    over_count_pct = reconcile_output.get("over_count_pct") or 0.0
    if over_count_pct <= OVER_COUNT_FLAG_PCT:
        return []

    per_channel = reconcile_output.get("per_channel") or []
    blended_mer = reconcile_output.get("blended_mer") or 0.0
    if len(per_channel) < 2 or blended_mer <= 0:
        return []

    ranked = sorted(
        per_channel, key=lambda ch: _inflation(ch, blended_mer), reverse=True
    )
    source, target = ranked[0], ranked[-1]
    source_platform = source.get("platform")
    target_platform = target.get("platform")
    if not source_platform or not target_platform:
        return []
    if _inflation(source, blended_mer) <= _inflation(target, blended_mer):
        return []

    source_spend = source.get("spend") or 0.0
    shift_amount = round(source_spend * BUDGET_SHIFT_PCT / 100, 2)

    evidence_json: dict[str, Any] = {
        "over_count_value": reconcile_output.get("over_count_value"),
        "over_count_pct": over_count_pct,
        "blended_mer": blended_mer,
        "tracking_integrity_flag": True,
        "source_channel": {
            "platform": source_platform,
            "spend": source_spend,
            "claimed_value": source.get("claimed_value"),
            "claimed_roas": source.get("claimed_roas"),
            "inflation_vs_blended": round(_inflation(source, blended_mer), 3),
        },
        "target_channel": {
            "platform": target_platform,
            "spend": target.get("spend"),
            "claimed_roas": target.get("claimed_roas"),
            "inflation_vs_blended": round(_inflation(target, blended_mer), 3),
        },
    }
    if isinstance(attribute_output, dict) and attribute_output:
        evidence_json["attribution"] = {
            k: attribute_output[k]
            for k in _ATTRIBUTION_KEYS
            if k in attribute_output
        }

    return [
        {
            "type": "reallocate_budget",
            "reason": (
                f"{str(source_platform).capitalize()} over-credited by "
                f"{int(round(over_count_pct))}%; reallocate {BUDGET_SHIFT_PCT}% "
                f"to {str(target_platform).capitalize()} pending holdout"
            ),
            "evidence_json": evidence_json,
            "expected_impact": (
                f"Moves {BUDGET_SHIFT_PCT}% (${shift_amount:,.0f}) of "
                f"{source_platform} spend toward better-tracked channels and "
                "reduces reliance on inflated platform-reported ROAS."
            ),
            "confidence": RECOMMENDATION_CONFIDENCE,
            "risk": "medium",
            "proposed_changes_json": {
                "action": "reallocate_budget",
                "source_platform": source_platform,
                "target_platform": target_platform,
                "budget_shift_pct": BUDGET_SHIFT_PCT,
                "period_spend_source": source_spend,
                "shift_amount": shift_amount,
                "requires_holdout_experiment": True,
            },
            "rollback_json": {
                "action": "reverse_budget_transfer",
                "source_platform": target_platform,
                "target_platform": source_platform,
                "budget_shift_pct": BUDGET_SHIFT_PCT,
            },
            "status": "pending",
        }
    ]
