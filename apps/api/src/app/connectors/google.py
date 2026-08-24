"""Google Ads connector (agent D).

Implements ``BaseConnector`` from app.connectors.base per spec/CONTRACTS.md.

* MOCK_MODE (env, default true): all four operations run against the canonical
  in-memory Google slice of the demo scenario -- spend 12000, claimed
  conversions 600, claimed conversion_value 60000 (claimed ROAS 5.0).
* Shared mock backend: when agent C's ``app.mock`` exposes a Google dataset
  (``google_campaigns`` / ``google_spend`` attrs or zero-arg callables), the
  connector prefers it over the local constants.
* Real adapter: stubs raising NotImplementedError behind the same public
  interface (MVP ships mock-only).
"""

from __future__ import annotations

import os
from datetime import date, timedelta
from typing import Any

from app.connectors.base import BaseConnector
from app.models import Campaign, Spend

ACCOUNT_ID = 1  # mock AdAccount.id for Google in the demo workspace
WORKSPACE_ID = 1


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


def _to_date(value: Any) -> date:
    if isinstance(value, date):  # datetime is a date subclass too
        return value
    return date.fromisoformat(str(value)[:10])


# Canonical Google campaigns (demo scenario).
_DEFAULT_CAMPAIGNS: list[dict] = [
    {
        "id": 1,
        "platform_campaign_id": "g-001",
        "name": "Search - Brand",
        "status": "active",
        "daily_budget": 120.0,
    },
    {
        "id": 2,
        "platform_campaign_id": "g-002",
        "name": "Search - Non-Brand",
        "status": "active",
        "daily_budget": 80.0,
    },
    {
        "id": 3,
        "platform_campaign_id": "g-003",
        "name": "Performance Max",
        "status": "active",
        "daily_budget": 100.0,
    },
]

_DAILY_SPLITS = {  # per-day share of the 3000/150/15000 aggregate, budget-weighted
    1: {
        "impressions": 16000,
        "clicks": 320,
        "cost": 1200.0,
        "conversions": 50,
        "conversion_value": 5000.0,
    },
    2: {
        "impressions": 10700,
        "clicks": 213,
        "cost": 800.0,
        "conversions": 50,
        "conversion_value": 5000.0,
    },
    3: {
        "impressions": 13300,
        "clicks": 267,
        "cost": 1000.0,
        "conversions": 50,
        "conversion_value": 5000.0,
    },
}
_DAYS_BACK = 4  # 4 days x splits == totals: 12000 / 600 / 60000


class GoogleConnector(BaseConnector):
    """Google Ads connector -- mock-first, real adapter stubbed."""

    platform = "google"

    def __init__(self, workspace: Any = None) -> None:
        super().__init__(workspace)
        shared = _shared_mock("google_campaigns", "GOOGLE_CAMPAIGNS")
        self._campaigns: list[dict] = (
            [dict(c) for c in shared if isinstance(c, dict)]
            if shared
            else [dict(c) for c in _DEFAULT_CAMPAIGNS]
        )

    # ---- BaseConnector interface -------------------------------------------------

    def fetch_campaigns(self) -> list[Campaign]:
        if not _mock_mode():
            return self._fetch_campaigns_real()
        shared = _shared_mock("google_campaigns", "GOOGLE_CAMPAIGNS")
        if shared is not None:
            return [c if isinstance(c, Campaign) else self._to_campaign(dict(c)) for c in shared]
        return [self._to_campaign(c) for c in self._campaigns]

    def fetch_metrics(self, date_start, date_end) -> list[Spend]:
        if not _mock_mode():
            return self._fetch_metrics_real(date_start, date_end)
        start, end = _to_date(date_start), _to_date(date_end)
        shared = _shared_mock("google_spend", "google_metrics", "GOOGLE_SPEND")
        if shared is not None:
            return [
                s if isinstance(s, Spend) else self._to_spend(dict(s))
                for s in shared
                if start <= _to_date(dict(s).get("date")) <= end
            ]
        out: list[Spend] = []
        for offset in range(_DAYS_BACK):
            day = date.today() - timedelta(days=offset)
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
                        impressions=split["impressions"],
                        clicks=split["clicks"],
                        cost=split["cost"],
                        conversions=split["conversions"],
                        conversion_value=split["conversion_value"],
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

    def _to_campaign(self, d: dict) -> Campaign:
        return Campaign(
            id=int(d.get("id") or 0),
            ad_account_id=ACCOUNT_ID,
            platform=self.platform,
            platform_campaign_id=d["platform_campaign_id"],
            name=d["name"],
            status=d["status"],
            daily_budget=float(d["daily_budget"]),
        )

    def _to_spend(self, d: dict) -> Spend:
        return Spend(
            workspace_id=WORKSPACE_ID,
            ad_account_id=ACCOUNT_ID,
            campaign_id=d.get("campaign_id"),
            date=str(d.get("date")),
            impressions=int(d.get("impressions") or 0),
            clicks=int(d.get("clicks") or 0),
            cost=float(d.get("cost") or 0),
            conversions=int(d.get("conversions") or 0),
            conversion_value=float(d.get("conversion_value") or 0),
        )

    # ---- real Google Ads API adapter (stubs, MVP) ---------------------------------

    def _fetch_campaigns_real(self) -> list[Campaign]:
        raise NotImplementedError("Real Google Ads adapter not implemented in MVP (mock-only)")

    def _fetch_metrics_real(self, date_start, date_end) -> list[Spend]:
        raise NotImplementedError("Real Google Ads adapter not implemented in MVP (mock-only)")

    def _set_budget_real(self, campaign_id, new_daily_budget) -> dict:
        raise NotImplementedError("Real Google Ads adapter not implemented in MVP (mock-only)")

    def _pause_campaign_real(self, campaign_id) -> dict:
        raise NotImplementedError("Real Google Ads adapter not implemented in MVP (mock-only)")
