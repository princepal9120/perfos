"""Analysis pipeline orchestrator.

Runs reconcile -> attribute -> recommend in sequence for a workspace and
returns {"reconcile": ..., "attribution": ..., "recommendations": ...}.

Sibling modules (app.attribution.reconcile / app.attribution.attribute /
app.agents.recommend) are imported defensively: if they are missing or fail to
import, contract-faithful local fallbacks keep the pipeline functional.

// ponytail: input loader probes mock store then DB; callers can also inject
// spends/revenues directly for tests.
"""

from __future__ import annotations

import inspect
from typing import Any, Iterable

__all__ = ["run_analysis"]


# --------------------------------------------------------------------------- #
# small utilities
# --------------------------------------------------------------------------- #

def _get(row: Any, key: str, default: Any = None) -> Any:
    """Read an attribute from dict-like or object rows."""
    if isinstance(row, dict):
        return row.get(key, default)
    return getattr(row, key, default)


def _try_import(module_path: str, names: Iterable[str]) -> Any:
    """Import the first existing callable among ``names``; None otherwise."""
    for name in names:
        try:
            module = __import__(module_path, fromlist=[name])
            fn = getattr(module, name)
            if callable(fn):
                return fn
        except Exception:
            continue
    return None


def _invoke(fn: Any | None, **kwargs: Any) -> Any:
    """Call ``fn`` passing only the kwargs it declares (or **kwargs-friendly)."""
    if fn is None:
        return None
    params = inspect.signature(fn).parameters
    if any(p.kind is inspect.Parameter.VAR_KEYWORD for p in params.values()):
        return fn(**kwargs)
    return fn(**{k: v for k, v in kwargs.items() if k in params})


def _row_to_dict(row: Any) -> Any:
    """Sibling engines expect plain dict rows; pass ORM/objects through as dicts."""
    if isinstance(row, dict):
        return row
    try:
        return dict(vars(row))
    except TypeError:
        return {
            k: _get(row, k)
            for k in (
                "id",
                "workspace_id",
                "ad_account_id",
                "campaign_id",
                "date",
                "impressions",
                "clicks",
                "cost",
                "conversions",
                "conversion_value",
                "amount",
                "platform",
            )
        }


# --------------------------------------------------------------------------- #
# input loading (best effort: caller-injected > mock store > database)
# --------------------------------------------------------------------------- #

def _load_inputs(workspace_id: Any) -> tuple[list[Any], list[Any]]:
    """Fetch spend/revenue rows for a workspace from mock dataset, store, or DB.

    Spend rows are enriched with ``platform`` (joined from accounts) because the
    reconciliation engine groups per platform but spend rows do not carry it.
    """
    get_mock_data = _try_import("app.mock.dataset", ("get_mock_data",))
    if get_mock_data:
        try:
            data = get_mock_data() or {}
        except Exception:
            data = {}
        spends = [s for s in data.get("spend", []) if _match_ws(s, workspace_id)]
        revenues = [
            r for r in data.get("revenue", []) if _match_ws(r, workspace_id)
        ]
        if spends or revenues:
            platform_by_account = {
                a["id"]: a["platform"]
                for a in data.get("accounts", [])
                if isinstance(a, dict) and "id" in a
            }
            for row in spends:
                row.setdefault(
                    "platform",
                    platform_by_account.get(_get(row, "ad_account_id"), "unknown"),
                )
            return list(spends), list(revenues)

    getters = (
        ("app.mock.store", ("get_spends", "list_spends", "get_spend_rows")),
        ("app.mock", ("get_spends", "list_spends")),
    )
    for module_path, names in getters:
        get_spends = _try_import(module_path, names)
        get_revenues = _try_import(
            module_path,
            ("get_revenues", "list_revenues", "get_revenue_rows"),
        )
        if get_spends and get_revenues:
            try:
                return (
                    list(_invoke(get_spends, workspace_id=workspace_id) or []),
                    list(_invoke(get_revenues, workspace_id=workspace_id) or []),
                )
            except Exception:
                continue

    SessionLocal = _try_import("app.core.db", ("SessionLocal",))
    SpendModel = _try_import("app.models", ("Spend",))
    RevenueModel = _try_import("app.models", ("Revenue",))
    AccountModel = _try_import("app.models", ("AdAccount",))
    if SessionLocal and SpendModel and RevenueModel:
        with SessionLocal() as session:
            query = session.query(SpendModel).filter(
                SpendModel.workspace_id == workspace_id
            )
            if AccountModel is not None and hasattr(SpendModel, "ad_account_id"):
                # join account -> platform onto each spend row
                rows = (
                    query.join(
                        AccountModel,
                        SpendModel.ad_account_id == AccountModel.id,
                        isouter=True,
                    )
                    .with_entities(SpendModel, AccountModel.platform)
                    .all()
                )
                spends = []
                for row, platform in rows:
                    try:
                        session.expunge(row)
                    except Exception:
                        pass
                    d = _row_to_dict(row)
                    d.setdefault("platform", platform)
                    spends.append(d)
            else:
                spends = [_row_to_dict(r) for r in query.all()]
            revenues = [
                _row_to_dict(r)
                for r in session.query(RevenueModel)
                .filter(RevenueModel.workspace_id == workspace_id)
                .all()
            ]
            return spends, revenues

    return [], []


def _match_ws(row: Any, workspace_id: Any) -> bool:
    ws = _get(row, "workspace_id")
    return ws is None or ws == workspace_id


# --------------------------------------------------------------------------- #
# contract-faithful fallbacks (used only when sibling modules are absent)
# --------------------------------------------------------------------------- #

def _fallback_reconcile(spends: list[Any], revenues: list[Any]) -> dict:
    total_spend = float(sum(_get(s, "cost", 0) or 0 for s in spends))
    claimed = float(sum(_get(s, "conversion_value", 0) or 0 for s in spends))
    actual = float(sum(_get(r, "amount", 0) or 0 for r in revenues))
    over = claimed - actual
    pct = round(over / actual * 100, 1) if actual else 0.0

    channels: dict[str, dict] = {}
    for s in spends:
        key = _get(s, "platform") or str(_get(s, "ad_account_id", "unknown"))
        ch = channels.setdefault(
            key, {"platform": key, "spend": 0.0, "claimed_value": 0.0}
        )
        ch["spend"] += float(_get(s, "cost", 0) or 0)
        ch["claimed_value"] += float(_get(s, "conversion_value", 0) or 0)
    per_channel = []
    for ch in channels.values():
        ch["claimed_roas"] = (
            round(ch["claimed_value"] / ch["spend"], 2) if ch["spend"] else 0.0
        )
        per_channel.append(ch)

    return {
        "total_spend": total_spend,
        "platform_claimed_value": claimed,
        "actual_revenue": actual,
        "blended_mer": round(actual / total_spend, 2) if total_spend else 0.0,
        "per_channel": per_channel,
        "over_count_value": over,
        "over_count_pct": pct,
        "tracking_integrity_flag": pct > 15.0,
    }


def _fallback_attribute(
    spends: list[Any], revenues: list[Any], reconciliation: dict | None = None
) -> dict:
    recon = reconciliation or _fallback_reconcile(spends, revenues)
    total_spend = recon.get("total_spend", 0.0) or 0.0
    actual = recon.get("actual_revenue", 0.0) or 0.0
    channels = []
    allocated = 0.0
    for ch in recon.get("per_channel", []):
        share = ch["spend"] / total_spend if total_spend else 0.0
        attributed = round(actual * share, 2)
        allocated += attributed
        channels.append(
            {
                "platform": ch["platform"],
                "spend": ch["spend"],
                "share": round(share, 4),
                "attributed_revenue": attributed,
                "claimed_roas": ch.get("claimed_roas"),
                "confidence": 0.6,
                "rationale": (
                    f"{ch['spend']:.0f} of {total_spend:.0f} spend "
                    f"({share:.0%}); conservative last-touch blended split"
                ),
            }
        )
    if channels and actual:
        channels[-1]["attributed_revenue"] = round(
            channels[-1]["attributed_revenue"] + (actual - allocated), 2
        )
    return {
        "model": "last_touch_blended_spend_weighted",
        "total_attributed": actual,
        "channels": channels,
    }


def _fallback_recommend(
    workspace_id: Any, reconciliation: dict, attribution: dict
) -> list[dict]:
    recs: list[dict] = []
    if reconciliation.get("tracking_integrity_flag"):
        worst = max(
            reconciliation.get("per_channel", []),
            key=lambda c: c.get("claimed_roas", 0),
            default=None,
        )
        others = [
            c
            for c in reconciliation.get("per_channel", [])
            if worst is None or c["platform"] != worst["platform"]
        ]
        target = max(others, key=lambda c: c.get("spend", 0), default=None)
        recs.append(
            {
                "workspace_id": workspace_id,
                "type": "reallocate_budget",
                "reason": (
                    f"{worst['platform']} over-credited by "
                    f"{reconciliation.get('over_count_pct')}%; reallocate 10% to "
                    f"{target['platform'] if target else 'best performer'} pending holdout"
                    if worst
                    else "Platform over-count exceeds threshold"
                ),
                "evidence_json": {
                    "over_count_value": reconciliation.get("over_count_value"),
                    "over_count_pct": reconciliation.get("over_count_pct"),
                },
                "expected_impact": "Align reported ROAS with verified revenue",
                "confidence": 0.7,
                "risk": "medium",
                "proposed_changes_json": {
                    "action": "shift_budget",
                    "pct": 0.10,
                    "from": worst["platform"] if worst else None,
                    "to": target["platform"] if target else None,
                },
                "rollback_json": {"action": "restore_previous_budgets"},
                "status": "pending",
            }
        )
    return recs


# --------------------------------------------------------------------------- #
# public API
# --------------------------------------------------------------------------- #

def run_analysis(
    workspace_id: Any,
    *,
    spends: list[Any] | None = None,
    revenues: list[Any] | None = None,
) -> dict:
    """Run the full analysis pipeline for ``workspace_id``.

    Returns {"reconcile": dict, "attribution": dict, "recommendations": list}.
    """
    if spends is None or revenues is None:
        loaded_spends, loaded_revenues = _load_inputs(workspace_id)
        if spends is None:
            spends = loaded_spends
        if revenues is None:
            revenues = loaded_revenues
    spends = [_row_to_dict(s) for s in (spends or [])]
    revenues = [_row_to_dict(r) for r in (revenues or [])]

    reconcile_fn = _try_import(
        "app.attribution.reconcile", ("reconcile", "run_reconcile", "compute_reconcile")
    )
    attribute_fn = _try_import(
        "app.attribution.attribute",
        ("attribute", "attribute_revenue", "run_attribution", "compute_attribution"),
    )
    recommend_fn = _try_import(
        "app.agents.recommend",
        ("generate_recommendations", "recommend", "make_recommendations"),
    )

    reconciliation = _invoke(
        reconcile_fn,
        spends=spends,
        spend_rows=spends,
        revenues=revenues,
        revenue_rows=revenues,
    )
    if reconciliation is None:
        reconciliation = _fallback_reconcile(spends, revenues)

    attribution = _invoke(
        attribute_fn,
        workspace=workspace_id,
        reconciliation=reconciliation,
        reconcile_output=reconciliation,
        spends=spends,
        revenues=revenues,
    )
    if attribution is None:
        attribution = _fallback_attribute(spends, revenues, reconciliation)

    raw_recommendations = _invoke(
        recommend_fn,
        workspace_id=workspace_id,
        workspace=workspace_id,
        reconciliation=reconciliation,
        reconcile_output=reconciliation,
        attribution=attribution,
        attribute_output=attribution,
        spends=spends,
        revenues=revenues,
    )
    if raw_recommendations is None:
        raw_recommendations = _fallback_recommend(
            workspace_id, reconciliation, attribution
        )

    recommendations = [
        r if isinstance(r, dict) else _orm_to_dict(r) for r in raw_recommendations
    ]

    return {
        "reconcile": reconciliation,
        "attribution": attribution,
        "recommendations": recommendations,
    }


_ORM_FIELDS = (
    "id",
    "workspace_id",
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


def _orm_to_dict(obj: Any) -> dict:
    out = {}
    for field in _ORM_FIELDS:
        value = _get(obj, field)
        if value is not None:
            out[field] = value
    return out
