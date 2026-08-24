"""Daily briefing builder.

Consumes the orchestrator pipeline output and shapes it into the dashboard
briefing payload: {kpis, changes, recommendations, narrative}.
Deterministic templating only (no LLM calls in MVP).
"""

from __future__ import annotations

from typing import Any

from app.agents.orchestrator import run_analysis

__all__ = ["build_briefing"]


def _get(row: Any, key: str, default: Any = None) -> Any:
    if isinstance(row, dict):
        return row.get(key, default)
    return getattr(row, key, default)


def build_briefing(workspace_id: Any) -> dict:
    """Build the daily-briefing payload for ``workspace_id``."""
    analysis = run_analysis(workspace_id)
    reconciliation = analysis.get("reconcile") or {}
    attribution = analysis.get("attribution") or {}
    recs: list[dict] = analysis.get("recommendations") or []

    spend = float(_get(reconciliation, "total_spend", 0) or 0)
    revenue = float(_get(reconciliation, "actual_revenue", 0) or 0)
    blended_roas = _get(reconciliation, "blended_mer")
    if blended_roas is None:
        blended_roas = round(revenue / spend, 2) if spend else 0.0
    over_count_pct = _get(reconciliation, "over_count_pct", 0)

    kpis = {
        "spend": spend,
        "revenue": revenue,
        "blended_roas": blended_roas,
        "over_count_pct": over_count_pct,
    }

    changes = [
        {
            "summary": _get(rec, "reason", ""),
            "type": _get(rec, "type", ""),
            "risk": _get(rec, "risk", "low"),
            "confidence": _get(rec, "confidence"),
            "proposed_changes": _get(rec, "proposed_changes_json"),
        }
        for rec in recs[:3]
    ]

    recommendations = [
        {
            "id": _get(rec, "id"),
            "type": _get(rec, "type", ""),
            "reason": _get(rec, "reason", ""),
            "evidence": _get(rec, "evidence_json"),
            "expected_impact": _get(rec, "expected_impact"),
            "confidence": _get(rec, "confidence"),
            "risk": _get(rec, "risk", "low"),
            "status": _get(rec, "status", "pending"),
        }
        for rec in recs
    ]

    narrative = _narrate(kpis, reconciliation, changes)

    return {
        "kpis": kpis,
        "changes": changes,
        "recommendations": recommendations,
        "narrative": narrative,
    }


def _narrate(kpis: dict, reconciliation: dict, changes: list[dict]) -> str:
    flagged = bool(_get(reconciliation, "tracking_integrity_flag", False))
    claimed = float(_get(reconciliation, "platform_claimed_value", 0) or 0)
    parts = [
        f"Spend ${kpis['spend']:,.0f} generated ${kpis['revenue']:,.0f} verified "
        f"revenue ({kpis['blended_roas']}x blended ROAS)."
    ]
    if claimed:
        parts.append(
            f"Platforms self-report ${claimed:,.0f} — a {kpis['over_count_pct']}% "
            "over-count vs source-of-truth revenue."
        )
    parts.append(
        "Tracking integrity FLAGGED (>15%); trust verified numbers."
        if flagged
        else "Tracking integrity within tolerance."
    )
    if changes:
        parts.append(f"Priority action: {changes[0]['summary']}")
    else:
        parts.append("No changes recommended today.")
    return " ".join(parts)
