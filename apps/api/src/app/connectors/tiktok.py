"""TikTok Ads connector.

Implements ``BaseConnector`` from app.connectors.base plus the TikTok
Marketing API v3 OAuth2 flow and the integrated report endpoint.

* MOCK_MODE (env, default true): serves a small in-memory demo dataset.
* Real mode: OAuth2 authorization-URL builder, access-token exchange, and
  report/integrated/get fetch + normalization to PerfOS Spend rows.
"""

from __future__ import annotations

import os
import secrets
from datetime import date
from typing import Any
from urllib.parse import urlencode

import httpx

from app.connectors.base import BaseConnector
from app.models import Campaign, Spend

API_BASE = "https://business-api.tiktok.com/open_api/v3.0"
AUTH_URL = f"{API_BASE}/oauth2/auth/"
TOKEN_URL = f"{API_BASE}/oauth2/access_token/"
REPORT_URL = f"{API_BASE}/report/integrated/get/"

ACCOUNT_ID = 3  # mock AdAccount.id for TikTok in the demo workspace
WORKSPACE_ID = 1


def _mock_mode() -> bool:
    return os.environ.get("MOCK_MODE", "true").strip().lower() in {"1", "true", "yes", "on"}


# ---- OAuth2 --------------------------------------------------------------------


def build_auth_url(client_id: str | None = None, redirect_uri: str | None = None,
                   state: str | None = None, scope: str | None = None) -> str:
    """TikTok OAuth2 authorization URL."""
    client_id = client_id or os.environ.get("TIKTOK_CLIENT_ID", "")
    redirect_uri = redirect_uri or os.environ.get("TIKTOK_REDIRECT_URI", "")
    state = state or secrets.token_urlsafe(16)
    params: dict[str, str] = {"app_id": client_id, "state": state}
    if redirect_uri:
        params["redirect_uri"] = redirect_uri
    if scope:
        params["scope"] = scope
    return f"{AUTH_URL}?{urlencode(params)}"


def exchange_code_for_token(code: str, client_id: str | None = None,
                            client_secret: str | None = None,
                            redirect_uri: str | None = None) -> dict:
    """Exchange an OAuth2 auth code for an access token. Returns token payload."""
    resp = httpx.post(
        TOKEN_URL,
        json={
            "app_id": client_id or os.environ.get("TIKTOK_CLIENT_ID", ""),
            "secret": client_secret or os.environ.get("TIKTOK_CLIENT_SECRET", ""),
            "auth_code": code,
        },
        timeout=30,
    )
    resp.raise_for_status()
    body = resp.json()
    if body.get("code") not in (0, "0"):
        raise RuntimeError(f"TikTok token exchange failed: {body.get('message', body)}")
    data = body.get("data", {})
    return {
        "access_token": data.get("access_token"),
        "expires_in": data.get("expires_in"),
    }


def _fmt_date(value: Any) -> str:
    d = value if isinstance(value, date) else date.fromisoformat(str(value)[:10])
    return d.strftime("%Y%m%d")


# ---- Report fetch + normalization -----------------------------------------------


def fetch_report(access_token: str, date_start: Any, date_end: Any,
                 advertiser_id: str = "", campaign_ids: list[str] | None = None) -> list[dict]:
    """Call report/integrated/get; return raw per-campaign rows (normalized keys)."""
    start, end = _fmt_date(date_start), _fmt_date(date_end)
    payload = {
        "report_type": "BASIC",
        "data_level": "CAMPAIGN",
        "dimensions": ["campaign_name", "campaign_id", "date"],
        "metrics": [
            "spend", "impression", "click", "complete_payment",
            "payment_conversion_value",
        ],
        "filters": {
            "campaign_ids": campaign_ids or [],
            "start_date": start,
            "end_date": end,
        },
        "start_date": start,
        "end_date": end,
    }
    headers = {"Access-Token": access_token}
    if advertiser_id:
        headers["Advertiser-Id"] = advertiser_id
    resp = httpx.post(REPORT_URL, json=payload, headers=headers, timeout=30)
    resp.raise_for_status()
    body = resp.json()
    if body.get("code") not in (0, "0"):
        raise RuntimeError(f"TikTok report fetch failed: {body.get('message', body)}")
    rows: list[dict] = []
    for item in body.get("data", {}).get("list", []):
        dims, metrics = item.get("dimensions", {}), item.get("metrics", {})
        rows.append({
            "campaign_id": str(dims.get("campaign_id", "")),
            "campaign_name": dims.get("campaign_name", ""),
            "date": _fmt_date(dims.get("date", date_start)),
            **{k: metrics.get(k, "0") for k in (
                "spend", "impression", "click",
                "complete_payment", "payment_conversion_value")},
        })
    return rows


def normalize_report_rows(rows: list[dict]) -> list[dict]:
    """Map TikTok metric names onto PerfOS Spend fields (floats/ints)."""
    out = []
    for r in rows:
        out.append({
            "campaign_id": r["campaign_id"],
            "name": r.get("campaign_name", ""),
            "date": r["date"],
            "impressions": int(float(r.get("impression") or 0)),
            "clicks": int(float(r.get("click") or 0)),
            "cost": float(r.get("spend") or 0),
            "conversions": float(r.get("complete_payment") or 0),
            "conversion_value": float(r.get("payment_conversion_value") or 0),
        })
    return out


# ---- Connector ------------------------------------------------------------------

_DEMO_CAMPAIGNS = [
    {"id": 13, "platform_campaign_id": "tt-777", "name": "Spark - Video Views",
     "status": "active", "daily_budget": 250.0},
]


class TikTokConnector(BaseConnector):
    """TikTok Ads connector -- mock-first, real API behind same interface."""

    platform = "tiktok"

    def __init__(self, workspace: Any = None) -> None:
        super().__init__(workspace)
        self._campaigns = [dict(c) for c in _DEMO_CAMPAIGNS]

    def fetch_campaigns(self) -> list[Campaign]:
        if not _mock_mode():
            raise NotImplementedError("Real TikTok campaigns fetch not implemented")
        return [
            Campaign(
                id=c["id"], ad_account_id=ACCOUNT_ID, platform=self.platform,
                platform_campaign_id=c["platform_campaign_id"], name=c["name"],
                status=c["status"], daily_budget=c["daily_budget"],
            )
            for c in self._campaigns
        ]

    def fetch_metrics(self, date_start, date_end) -> list[Spend]:
        if not _mock_mode():
            token = os.environ.get("TIKTOK_ACCESS_TOKEN", "")
            rows = normalize_report_rows(
                fetch_report(token, date_start, date_end,
                             advertiser_id=os.environ.get("TIKTOK_ADVERTISER_ID", ""))
            )
            return [self._to_spend(r) for r in rows]
        # TikTok demo slice: campaigns with spend on a single demo day.
        day = date(2026, 8, 3)
        start = date_start if isinstance(date_start, date) else date.fromisoformat(str(date_start)[:10])
        end = date_end if isinstance(date_end, date) else date.fromisoformat(str(date_end)[:10])
        if not (start <= day <= end):
            return []
        return [
            Spend(
                workspace_id=WORKSPACE_ID, ad_account_id=ACCOUNT_ID,
                campaign_id=c["id"], date=day.isoformat(),
                impressions=12000, clicks=180, cost=150.0,
                conversions=9, conversion_value=640.0,
            )
            for c in self._campaigns
        ]

    def set_budget(self, campaign_id, new_daily_budget) -> dict:
        camp = self._find(campaign_id)
        if camp is None:
            return {"success": False, "error": "campaign_not_found", "campaign_id": str(campaign_id)}
        previous = camp["daily_budget"]
        camp["daily_budget"] = float(new_daily_budget)
        return {"success": True, "campaign_id": camp["platform_campaign_id"],
                "previous_daily_budget": previous, "daily_budget": camp["daily_budget"]}

    def pause_campaign(self, campaign_id) -> dict:
        camp = self._find(campaign_id)
        if camp is None:
            return {"success": False, "error": "campaign_not_found", "campaign_id": str(campaign_id)}
        camp["status"] = "paused"
        return {"success": True, "campaign_id": camp["platform_campaign_id"], "status": "paused"}

    # ---- helpers -----------------------------------------------------------------

    def _find(self, campaign_id) -> dict | None:
        key = str(campaign_id)
        for camp in self._campaigns:
            if camp["platform_campaign_id"] == key or str(camp["id"]) == key:
                return camp
        return None

    def _to_spend(self, d: dict) -> Spend:
        return Spend(
            workspace_id=WORKSPACE_ID,
            ad_account_id=ACCOUNT_ID,
            campaign_id=d["campaign_id"],
            date=d["date"],
            impressions=int(d.get("impressions") or 0),
            clicks=int(d.get("clicks") or 0),
            cost=float(d.get("cost") or 0),
            conversions=float(d.get("conversions") or 0),
            conversion_value=float(d.get("conversion_value") or 0),
        )
