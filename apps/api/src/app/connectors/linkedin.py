"""LinkedIn Ads connector.

Implements ``BaseConnector`` from app.connectors.base per spec/CONTRACTS.md.

* MOCK_MODE (env, default true): operations run against an in-memory LinkedIn
  slice of the demo scenario.
* OAuth2: authorization-code flow against LinkedIn Marketing API v2/v3
  (``build_authorization_url`` / ``exchange_code_for_token``).
* Real analytics adapter: ``fetch_report`` hits adAnalyticsV2 and normalizes
  LinkedIn fields (costInUsd -> cost, conversions, totalConversionValue).
"""

from __future__ import annotations

import os
import urllib.parse
import urllib.request
from datetime import date
from typing import Any

from app.connectors.base import BaseConnector
from app.models import Campaign, Spend

WORKSPACE_ID = 1  # demo Workspace.id
ACCOUNT_ID = 3  # mock AdAccount.id for LinkedIn in the demo workspace

OAUTH_AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/auth"
OAUTH_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
ANALYTICS_URL = "https://api.linkedin.com/v2/adAnalyticsV2"

DEFAULT_SCOPES = "r_ads r_ads_reporting rw_ads"


def _mock_mode() -> bool:
    return os.environ.get("MOCK_MODE", "true").strip().lower() in {"1", "true", "yes", "on"}


def _to_date(value: Any) -> date:
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value)[:10])


# ---- OAuth2 --------------------------------------------------------------------


def build_authorization_url(
    client_id: str,
    redirect_uri: str,
    state: str,
    scopes: str = DEFAULT_SCOPES,
) -> str:
    """LinkedIn OAuth2 authorization URL (authorization-code flow)."""
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": state,
        "scope": scopes,
    }
    return f"{OAUTH_AUTHORIZE_URL}?{urllib.parse.urlencode(params)}"


def exchange_code_for_token(
    client_id: str,
    client_secret: str,
    redirect_uri: str,
    code: str,
) -> dict:
    """Exchange an authorization code for an access token."""
    data = urllib.parse.urlencode(
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "client_secret": client_secret,
        }
    ).encode()
    req = urllib.request.Request(OAUTH_TOKEN_URL, data=data, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        import json

        return json.loads(resp.read().decode())


# ---- analytics normalization -----------------------------------------------------


def normalize_report_row(row: dict) -> dict:
    """LinkedIn adAnalyticsV2 row -> PerfOS metric shape."""
    return {
        "campaign_id": row.get("campaignId") or row.get("campaign"),
        "impressions": int(row.get("impressions") or 0),
        "clicks": int(row.get("clicks") or 0),
        "cost": float(row.get("costInUsd") or row.get("costInLocalCurrency") or 0),
        "conversions": float(row.get("conversions") or 0),
        "conversion_value": float(row.get("totalConversionValue") or 0),
    }


def fetch_report(
    access_token: str,
    campaign_urns: list[str],
    start: date,
    end: date,
    version: int = 2,
) -> list[dict]:
    """Fetch adAnalytics rows for the given campaign URNs and normalize them."""
    # Use /rest/ endpoint for v3+, /v2/ for older
    base = ANALYTICS_URL.replace("/v2/", "/rest/") if version >= 3 else ANALYTICS_URL
    daterange = f"(start:{start.strftime('%Y%m%d')},end:{end.strftime('%Y%m%d')})"
    fields = "impressions,clicks,spend,totalShare,uniqueVic"
    params = [
        ("q", "analytics"),
        ("dateRange", daterange),
        ("fields", fields),
        *(("campaignIds", urn) for urn in campaign_urns),
    ]
    url = f"{base}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            **({"LinkedIn-Version": "202401"} if version >= 3 else {}),
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        import json

        payload = json.loads(resp.read().decode())
    elements = payload.get("elements", [])
    return [normalize_report_row(el) for el in elements]


# ---- demo mock slice ---------------------------------------------------------------

_CAMPAIGNS: list[dict] = [
    {
        "id": 21,
        "platform_campaign_id": "li-901",
        "urn": "urn:li:sponsoredCampaign:901",
        "name": "Sponsored Content - Demand Gen",
        "status": "active",
        "daily_budget": 300.0,
    },
]

_DAILY_ROWS: dict[str, dict] = {  # keyed by ISO date, one campaign only
    "2026-08-01": {"impressions": 9000, "clicks": 120, "cost": 400.0, "conversions": 12, "conversion_value": 1300.0},
    "2026-08-02": {"impressions": 8500, "clicks": 110, "cost": 380.0, "conversions": 10, "conversion_value": 1100.0},
    "2026-08-03": {"impressions": 0, "clicks": 0, "cost": 0.0, "conversions": 0, "conversion_value": 0.0},
}


class LinkedInConnector(BaseConnector):
    """LinkedIn Ads connector -- mock-first, real OAuth/analytics helpers included."""

    platform = "linkedin"

    def __init__(self, workspace: Any = None) -> None:
        super().__init__(workspace)
        self._access_token: str | None = None

    # ---- BaseConnector interface -------------------------------------------------

    def fetch_campaigns(self) -> list[Campaign]:
        if not _mock_mode():
            raise NotImplementedError("Real LinkedIn campaigns adapter not implemented")
        return [self._to_campaign(c) for c in _CAMPAIGNS]

    def fetch_metrics(self, date_start, date_end) -> list[Spend]:
        if not _mock_mode():
            if not self._access_token:
                raise RuntimeError("Not authenticated: call authenticate() first")
            start, end = _to_date(date_start), _to_date(date_end)
            urns = [c["urn"] for c in _CAMPAIGNS]
            rows = fetch_report(self._access_token, urns, start, end)
        else:
            start, end = _to_date(date_start), _to_date(date_end)
            rows = [
                {"campaign_id": c["id"], **metrics}
                for day, metrics in _DAILY_ROWS.items()
                if start <= _to_date(day) <= end
                for c in _CAMPAIGNS
            ]
        return [self._to_spend(r) for r in rows]

    def set_budget(self, campaign_id, new_daily_budget) -> dict:
        camp = next((c for c in _CAMPAIGNS if str(c["platform_campaign_id"]) == str(campaign_id)), None)
        if camp is None:
            return {"success": False, "error": "campaign_not_found", "campaign_id": str(campaign_id)}
        previous = camp["daily_budget"]
        camp["daily_budget"] = float(new_daily_budget)
        return {
            "success": True,
            "campaign_id": camp["platform_campaign_id"],
            "previous_daily_budget": previous,
            "daily_budget": camp["daily_budget"],
        }

    def pause_campaign(self, campaign_id) -> dict:
        camp = next((c for c in _CAMPAIGNS if str(c["platform_campaign_id"]) == str(campaign_id)), None)
        if camp is None:
            return {"success": False, "error": "campaign_not_found", "campaign_id": str(campaign_id)}
        camp["status"] = "paused"
        return {"success": True, "campaign_id": camp["platform_campaign_id"], "status": "paused"}

    # ---- auth / report -------------------------------------------------------------

    def authenticate(self, access_token: str) -> None:
        """Store a bearer token for real-API calls (set by the OAuth callback)."""
        self._access_token = access_token

    @staticmethod
    def authorization_url(client_id: str, redirect_uri: str, state: str) -> str:
        return build_authorization_url(client_id, redirect_uri, state)

    # ---- helpers ------------------------------------------------------------------

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
            date=str(d.get("date")) if d.get("date") else "",
            impressions=int(d.get("impressions") or 0),
            clicks=int(d.get("clicks") or 0),
            cost=float(d.get("cost") or 0),
            conversions=d.get("conversions") or 0,
            conversion_value=float(d.get("conversion_value") or 0),
        )
