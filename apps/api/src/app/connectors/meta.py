"""Meta Ads connector (agent E).

Implements ``BaseConnector`` from app.connectors.base per spec/CONTRACTS.md.

* MOCK_MODE (env, default true): all four operations run against the canonical
  in-memory Meta slice of the demo scenario -- spend 8000, claimed conversions
  500, claimed conversion_value 44000 (claimed ROAS 5.5).
* Shared mock backend: when agent C's ``app.mock`` exposes a Meta dataset
  (``meta_campaigns`` / ``meta_spend`` attrs, or ``get_mock_data()``), the
  connector prefers it over the local constants.
* Real adapter: stubs raising NotImplementedError behind the same public
  interface (MVP ships mock-only).
"""

from __future__ import annotations

import os
from datetime import date
from typing import Any

from app.connectors.base import BaseConnector
from app.models import Campaign, Spend

WORKSPACE_ID = 1  # demo Workspace.id
ACCOUNT_ID = 2  # mock AdAccount.id for Meta in the demo workspace (google=1)

META_DATE_START = date(2026, 8, 1)  # aligns with app.mock.dataset window
DAYS = 7
_DAY_WEIGHTS = (0.16, 0.14, 0.15, 0.13, 0.14, 0.15)


def _mock_mode() -> bool:
    return os.environ.get("MOCK_MODE", "true").strip().lower() in {"1", "true", "yes", "on"}


def _shared_mock(*names: str) -> list | None:
    """Read agent C's shared mock backend (best effort)."""
    try:
        from app import mock as app_mock
    except Exception:
        return None
    for name in names:
        val = getattr(app_mock, name, None)
        if callable(val):
            try:
                val = val()
            except Exception:
                continue
        if isinstance(val, list) and val:
            return val
    return None


def _shared_rows(kind: str) -> list | None:
    """Meta rows from the shared backend: named attrs first, then get_mock_data."""
    attr_names = {
        "campaigns": ("meta_campaigns", "META_CAMPAIGNS"),
        "spend": ("meta_spend", "meta_metrics", "META_SPEND"),
    }[kind]
    rows = _shared_mock(*attr_names)
    if rows is not None:
        return rows
    try:
        from app.mock.dataset import get_mock_data

        data = get_mock_data()
    except Exception:
        return None
    meta_accounts = {a["id"] for a in data["accounts"] if a["platform"] == "meta"}
    if kind == "campaigns":
        rows = [r for r in data["campaigns"] if r.get("platform") == "meta"]
    else:
        rows = [r for r in data["spend"] if r.get("ad_account_id") in meta_accounts]
    return rows or None


def _to_date(value: Any) -> date:
    if isinstance(value, date):  # datetime is a date subclass too
        return value
    return date.fromisoformat(str(value)[:10])


def _coerce_id(value: Any) -> Any:
    """Keep shared-backend string ids intact; normalize numeric ids to int."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return value


def _split(total: float) -> list[float]:
    head = [round(total * w, 2) for w in _DAY_WEIGHTS]
    return [*head, round(total - sum(head), 2)]


def _split_int(total: int) -> list[int]:
    head = [int(total * w) for w in _DAY_WEIGHTS]
    return [*head, total - sum(head)]


# Canonical Meta campaigns (demo scenario): per-campaign totals split across
# DAYS days sum EXACTLY to 8000 spend / 500 conversions / 44000 claimed value.
_CAMPAIGN_TOTALS: list[dict] = [
    {
        "id": 11,
        "platform_campaign_id": "m-444",
        "name": "Prospecting - Broad",
        "status": "active",
        "daily_budget": 750.0,
        "spend": 5200.0,
        "conversions": 330,
        "conversion_value": 29000.0,
    },
    {
        "id": 12,
        "platform_campaign_id": "m-555",
        "name": "Retargeting - Dynamic",
        "status": "active",
        "daily_budget": 400.0,
        "spend": 2800.0,
        "conversions": 170,
        "conversion_value": 15000.0,
    },
]

_DAILY_SPLITS: dict[int, dict[str, list]] = {
    c["id"]: {
        "cost": _split(c["spend"]),
        "conversions": _split_int(c["conversions"]),
        "conversion_value": _split(c["conversion_value"]),
    }
    for c in _CAMPAIGN_TOTALS
}


class MetaConnector(BaseConnector):
    """Meta Ads connector -- mock-first, real adapter stubbed."""

    platform = "meta"

    def __init__(self, workspace: Any = None) -> None:
        super().__init__(workspace)
        shared = _shared_rows("campaigns")
        source = [dict(c) for c in shared] if shared else [dict(c) for c in _CAMPAIGN_TOTALS]
        self._campaigns: list[dict] = [self._normalize_campaign(c) for c in source]

    # ---- BaseConnector interface -------------------------------------------------

    def fetch_campaigns(self) -> list[Campaign]:
        if not _mock_mode():
            return self._fetch_campaigns_real()
        return [self._to_campaign(dict(c)) for c in self._campaigns]

    def _normalize_campaign(self, d: dict) -> dict:
        """Coerce a shared-backend or local row into this connector's shape."""
        cid = _coerce_id(d.get("id"))
        return {
            "id": cid,
            "ad_account_id": d.get("ad_account_id") or ACCOUNT_ID,
            "platform": d.get("platform") or self.platform,
            "platform_campaign_id": d.get("platform_campaign_id") or f"m-{cid}",
            "name": d.get("name", ""),
            "status": d.get("status", "active"),
            "daily_budget": float(d.get("daily_budget") or 0),
        }

    def fetch_metrics(self, date_start, date_end) -> list[Spend]:
        if not _mock_mode():
            return self._fetch_metrics_real(date_start, date_end)
        start, end = _to_date(date_start), _to_date(date_end)
        shared = _shared_rows("spend")
        if shared is not None:
            return [
                s if isinstance(s, Spend) else self._to_spend(dict(s))
                for s in shared
                if start <= _to_date(dict(s).get("date")) <= end
            ]
        out: list[Spend] = []
        for offset in range(DAYS):
            day = date.fromordinal(META_DATE_START.toordinal() + offset)
            if not (start <= day <= end):
                continue
            for camp in self._campaigns:
                split = _DAILY_SPLITS[camp["id"]]
                out.append(
                    Spend(
                        workspace_id=WORKSPACE_ID,
                        ad_account_id=ACCOUNT_ID,
                        campaign_id=camp["id"],
                        date=day.isoformat(),
                        impressions=self._impressions(split["cost"][offset]),
                        clicks=max(1, int(split["cost"][offset] / 0.9)),
                        cost=split["cost"][offset],
                        conversions=split["conversions"][offset],
                        conversion_value=split["conversion_value"][offset],
                    )
                )
        return out

    def set_budget(self, campaign_id, new_daily_budget) -> dict:
        if not _mock_mode():
            return self._set_budget_real(campaign_id, new_daily_budget)
        camp = self._find(campaign_id)
        if camp is None:
            return {
                "success": False,
                "error": "campaign_not_found",
                "campaign_id": str(campaign_id),
            }
        previous = camp["daily_budget"]
        camp["daily_budget"] = float(new_daily_budget)
        return {
            "success": True,
            "campaign_id": camp["platform_campaign_id"],
            "previous_daily_budget": previous,
            "daily_budget": camp["daily_budget"],
        }

    def pause_campaign(self, campaign_id) -> dict:
        if not _mock_mode():
            return self._pause_campaign_real(campaign_id)
        camp = self._find(campaign_id)
        if camp is None:
            return {
                "success": False,
                "error": "campaign_not_found",
                "campaign_id": str(campaign_id),
            }
        camp["status"] = "paused"
        return {"success": True, "campaign_id": camp["platform_campaign_id"], "status": "paused"}

    # ---- helpers ------------------------------------------------------------------

    def _find(self, campaign_id) -> dict | None:
        key = str(campaign_id)
        for camp in self._campaigns:
            if camp["platform_campaign_id"] == key or str(camp["id"]) == key:
                return camp
        return None

    @staticmethod
    def _impressions(day_cost: float) -> int:
        # ~34 impressions per click at the demo CPC of 0.90 (mirrors app.mock)
        return max(1, int(day_cost / 0.9)) * 34

    def _to_campaign(self, d: dict) -> Campaign:
        return Campaign(
            id=_coerce_id(d.get("id")),
            ad_account_id=_coerce_id(d.get("ad_account_id") or ACCOUNT_ID),
            platform=d.get("platform") or self.platform,
            platform_campaign_id=d.get("platform_campaign_id", f"m-{_coerce_id(d.get('id'))}"),
            name=d.get("name", ""),
            status=d.get("status", "active"),
            daily_budget=float(d.get("daily_budget") or 0),
        )

    def _to_spend(self, d: dict) -> Spend:
        return Spend(
            id=d.get("id") if isinstance(d.get("id"), int) else None,
            workspace_id=_coerce_id(d.get("workspace_id") or WORKSPACE_ID),
            ad_account_id=_coerce_id(d.get("ad_account_id") or ACCOUNT_ID),
            campaign_id=_coerce_id(d.get("campaign_id")),
            date=_to_date(d.get("date")),
            impressions=int(d.get("impressions") or 0),
            clicks=int(d.get("clicks") or 0),
            cost=float(d.get("cost") or 0),
            conversions=float(d.get("conversions") or 0),
            conversion_value=float(d.get("conversion_value") or 0),
        )

    # ---- real Meta Marketing API adapter (stubs, MVP) ------------------------------

    def _fetch_campaigns_real(self) -> list[Campaign]:
        raise NotImplementedError("Real Meta Ads adapter not implemented in MVP (mock-only)")

    def _fetch_metrics_real(self, date_start, date_end) -> list[Spend]:
        raise NotImplementedError("Real Meta Ads adapter not implemented in MVP (mock-only)")

    def _set_budget_real(self, campaign_id, new_daily_budget) -> dict:
        raise NotImplementedError("Real Meta Ads adapter not implemented in MVP (mock-only)")

    def _pause_campaign_real(self, campaign_id) -> dict:
        raise NotImplementedError("Real Meta Ads adapter not implemented in MVP (mock-only)")
