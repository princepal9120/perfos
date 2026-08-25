"""X/Twitter Ads connector.

Implements ``BaseConnector`` from app.connectors.base per spec/CONTRACTS.md.

* MOCK_MODE (env, default true): all four operations run against a small
  deterministic in-memory X Ads dataset.
* Real adapter: OAuth2 (authorization-code flow) against
  https://twitter.com/i/oauth2/authorize + https://api.twitter.com/2/oauth2/token,
  and campaign stats via https://ads-api.twitter.com/7/stats, normalized into
  Spend rows. Requires business-account access to the Ads API.
"""

from __future__ import annotations

import os
import secrets
import urllib.parse
import urllib.request
from datetime import date, timedelta
from typing import Any

from app.connectors.base import BaseConnector
from app.models import Campaign, Spend

ACCOUNT_ID = 3  # mock AdAccount.id for X/Twitter in the demo workspace
WORKSPACE_ID = 1

OAUTH_AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize"
OAUTH_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
ADS_STATS_URL = "https://ads-api.twitter.com/7/stats"

ADS_METRICS = "impressions,clicks,spent,conversions,url_clicks,engagements"


def _mock_mode() -> bool:
    return os.environ.get("MOCK_MODE", "true").strip().lower() in {"1", "true", "yes", "on"}


def _env(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        raise ValueError(f"Missing required env var {name} for X/Twitter Ads API")
    return val


def _to_date(value: Any) -> date:
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value)[:10])


# Canonical X campaigns (demo scenario).
_DEFAULT_CAMPAIGNS: list[dict] = [
    {
        "id": 1,
        "platform_campaign_id": "x-001",
        "name": "Launch - Followers",
        "status": "active",
        "daily_budget": 60.0,
    },
    {
        "id": 2,
        "platform_campaign_id": "x-002",
        "name": "Website Traffic",
        "status": "active",
        "daily_budget": 40.0,
    },
]

_DAILY_SPLITS = {
    1: {
        "impressions": 8000,
        "clicks": 120,
        "cost": 400.0,
        "conversions": 20,
        "conversion_value": 1400.0,
    },
    2: {
        "impressions": 6000,
        "clicks": 90,
        "cost": 300.0,
        "conversions": 20,
        "conversion_value": 1400.0,
    },
}
_DAYS_BACK = 7  # 7 days x splits == totals: 4900 / 280 / 19600


class TwitterAdsConnector(BaseConnector):
    """X/Twitter Ads connector -- mock-first, real adapter behind same interface."""

    platform = "twitter"

    def __init__(self, workspace: Any = None) -> None:
        super().__init__(workspace)
        self._campaigns: list[dict] = [dict(c) for c in _DEFAULT_CAMPAIGNS]

    # ---- OAuth2 -------------------------------------------------------------------

    def build_authorization_url(self, redirect_uri: str | None = None, state: str | None = None) -> dict:
        """PKCE authorization-code URL for X OAuth2."""
        client_id = _env("TWITTER_CLIENT_ID")
        redirect_uri = redirect_uri or _env("TWITTER_REDIRECT_URI")
        state = state or secrets.token_urlsafe(16)
        code_verifier = secrets.token_urlsafe(48)[:128]
        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": "tweet.read users.read offline.access",
            "state": state,
            "code_challenge": code_verifier,  # ponytail: plain challenge, no S256 hash
            "code_challenge_method": "plain",
        }
        return {
            "url": f"{OAUTH_AUTHORIZE_URL}?{urllib.parse.urlencode(params)}",
            "state": state,
            "code_verifier": code_verifier,
        }

    def exchange_code_for_token(self, code: str, code_verifier: str, redirect_uri: str | None = None) -> dict:
        """Exchange an authorization code for an access token."""
        import json

        data = urllib.parse.urlencode({
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri or _env("TWITTER_REDIRECT_URI"),
            "client_id": _env("TWITTER_CLIENT_ID"),
            "code_verifier": code_verifier,
        }).encode()
        req = urllib.request.Request(
            OAUTH_TOKEN_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())

    # ---- Ads API stats --------------------------------------------------------------

    def fetch_report(self, campaign_ids: list[str], start_time: str, end_time: str) -> list[dict]:
        """Raw /7/stats response rows normalized to flat dicts.

        GET /7/stats?entity=CAMPAIGN&entity_ids=...&start_time=...&end_time=...
            &metrics=impressions,clicks,spent,conversions,...
        """
        import json

        params = {
            "entity": "CAMPAIGN",
            "entity_ids": ",".join(campaign_ids),
            "start_time": start_time,
            "end_time": end_time,
            "metrics": ADS_METRICS,
            "granularity": "DAY",
        }
        url = f"{ADS_STATS_URL}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(
            url,
            headers={"Authorization": f"Bearer {_env('TWITTER_ACCESS_TOKEN')}"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode())
        return self._normalize_stats(body)

    @staticmethod
    def _normalize_stats(payload: dict) -> list[dict]:
        """Flatten id_data[].id + metrics[] day arrays into one row per entity/day."""
        out: list[dict] = []
        for entry in payload.get("data") or []:
            entity_id = entry.get("id")
            metrics = entry.get("metrics") or {}
            days = len(metrics.get("impressions") or [])
            for i in range(days):
                spent_raw = metrics.get("spent", [0] * days)[i]
                out.append(
                    {
                        "campaign_id": entity_id,
                        "impressions": int(metrics.get("impressions", [0] * days)[i] or 0),
                        "clicks": int((metrics.get("url_clicks") or metrics.get("clicks") or [0] * days)[i] or 0),
                        "spent": float(spent_raw or 0),  # micros in real API
                        "conversions": int(metrics.get("conversions", [0] * days)[i] or 0),
                    }
                )
        return out

    # ---- BaseConnector interface ------------------------------------------------------

    def fetch_campaigns(self) -> list[Campaign]:
        if not _mock_mode():
            raise NotImplementedError("Real X Ads adapter not implemented in MVP (mock-only)")
        return [self._to_campaign(c) for c in self._campaigns]

    def fetch_metrics(self, date_start, date_end) -> list[Spend]:
        if not _mock_mode():
            raise NotImplementedError("Real X Ads adapter not implemented in MVP (mock-only)")
        start, end = _to_date(date_start), _to_date(date_end)
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
            raise NotImplementedError("Real X Ads adapter not implemented in MVP (mock-only)")
        camp = self._find(campaign_id)
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
        if not _mock_mode():
            raise NotImplementedError("Real X Ads adapter not implemented in MVP (mock-only)")
        camp = self._find(campaign_id)
        if camp is None:
            return {"success": False, "error": "campaign_not_found", "campaign_id": str(campaign_id)}
        camp["status"] = "paused"
        return {"success": True, "campaign_id": camp["platform_campaign_id"], "status": "paused"}

    # ---- helpers -----------------------------------------------------------------------

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
