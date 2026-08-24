"""In-memory demo dataset for PerfOS mock mode (MOCK_MODE=true).

Scenario from spec/CONTRACTS.md, workspace "Demo DTC Brand" (USD):
  Google: spend 12000, claimed conversions 600, claimed conversion_value 60000
  Meta:   spend  8000, claimed conversions 500, claimed conversion_value 44000
  Shopify actual revenue: 78000 across 950 orders (source of truth)

Row-level campaign/spend/revenue data sums EXACTLY to these aggregates:
each series is split across 7 days with the final day absorbing the remainder.
"""

from __future__ import annotations

import datetime as _dt

WORKSPACE_ID = "ws_demo"
ORG_ID = "org_demo"
ORG_NAME = "PerfOS Demo Org"
WORKSPACE_NAME = "Demo DTC Brand"
CURRENCY = "USD"

DATE_START = _dt.date(2026, 8, 1)
DAYS = 7
_DAY_WEIGHTS = (0.16, 0.14, 0.15, 0.13, 0.14, 0.15)

_ACCOUNTS = (
    ("acc_google", "google", "gmc-123", "Google Ads - Demo"),
    ("acc_meta", "meta", "act_456", "Meta Ads - Demo"),
    ("acc_shopify", "shopify", "shop_demo.myshopify.com", "Shopify Store - Demo"),
)

_CAMPAIGNS = {
    "g_brand": ("acc_google", "google", "g-111", "Search - Brand", 720.0, 5000.0, 260, 27000.0),
    "g_nonbrand": (
        "acc_google",
        "google",
        "g-222",
        "Search - Non-brand",
        580.0,
        4000.0,
        200,
        20000.0,
    ),
    "g_pmax": (
        "acc_google",
        "google",
        "g-333",
        "Performance Max - Catalog",
        430.0,
        3000.0,
        140,
        13000.0,
    ),
    "m_prospecting": (
        "acc_meta",
        "meta",
        "m-444",
        "Prospecting - Broad",
        750.0,
        5200.0,
        330,
        29000.0,
    ),
    "m_retargeting": (
        "acc_meta",
        "meta",
        "m-555",
        "Retargeting - Dynamic",
        400.0,
        2800.0,
        170,
        15000.0,
    ),
}

_CPC = {"google": 1.4, "meta": 0.9}
_IMPRESSIONS_PER_CLICK = {"google": 28, "meta": 34}

_N_ORDERS = 950
_REVENUE_TOTAL_CENTS = 7_800_000

TARGETS = {
    "google": {"spend": 12000.0, "conversions": 600, "value": 60000.0},
    "meta": {"spend": 8000.0, "conversions": 500, "value": 44000.0},
    "shopify": {"revenue": 78000.0, "orders": 950},
}


def _day(i: int) -> str:
    return (DATE_START + _dt.timedelta(days=i)).isoformat()


def _split(total: float) -> list[float]:
    head = [round(total * w, 2) for w in _DAY_WEIGHTS]
    return [*head, round(total - sum(head), 2)]


def _split_int(total: int) -> list[int]:
    head = [int(total * w) for w in _DAY_WEIGHTS]
    return [*head, total - sum(head)]


def _workspace() -> dict:
    return {
        "id": WORKSPACE_ID,
        "org_id": ORG_ID,
        "name": WORKSPACE_NAME,
        "currency": CURRENCY,
    }


def _accounts() -> list[dict]:
    return [
        {
            "id": acc_id,
            "workspace_id": WORKSPACE_ID,
            "platform": platform,
            "platform_account_id": ext_id,
            "name": name,
            "status": "active",
        }
        for acc_id, platform, ext_id, name in _ACCOUNTS
    ]


def _campaigns() -> list[dict]:
    return [
        {
            "id": f"cmp_{key}",
            "ad_account_id": acc_id,
            "platform": platform,
            "platform_campaign_id": ext_id,
            "name": name,
            "status": "active",
            "daily_budget": budget,
        }
        for key, (acc_id, platform, ext_id, name, budget, *_rest) in _CAMPAIGNS.items()
    ]


def _spend() -> list[dict]:
    rows = []
    for key, (acc_id, platform, _ext, _name, _budget, spend_t, conv_t, val_t) in _CAMPAIGNS.items():
        costs = _split(spend_t)
        convs = _split_int(conv_t)
        values = _split(val_t)
        for d in range(DAYS):
            clicks = max(1, int(costs[d] / _CPC[platform]))
            rows.append(
                {
                    "id": f"spl_{key}_{d}",
                    "workspace_id": WORKSPACE_ID,
                    "ad_account_id": acc_id,
                    "campaign_id": f"cmp_{key}",
                    "date": _day(d),
                    "impressions": clicks * _IMPRESSIONS_PER_CLICK[platform],
                    "clicks": clicks,
                    "cost": costs[d],
                    "conversions": convs[d],
                    "conversion_value": values[d],
                }
            )
    return rows


def _revenue() -> list[dict]:
    cents = [4200 + ((i * 1300) % 8000) for i in range(_N_ORDERS)]
    diff = _REVENUE_TOTAL_CENTS - sum(cents)
    share, extra = divmod(diff, _N_ORDERS)
    cents = [c + share + (1 if i < extra else 0) for i, c in enumerate(cents)]
    return [
        {
            "id": f"rev_{i + 1}",
            "workspace_id": WORKSPACE_ID,
            "source": "shopify",
            "order_id": f"SO-{10000 + i}",
            "date": _day(i % DAYS),
            "amount": c / 100.0,
            "customer_id": f"cust_{2000 + i % 700}",
            "is_new_customer": i % 3 == 0,
        }
        for i, c in enumerate(cents)
    ]


def get_mock_data() -> dict:
    """Return the full demo dataset (fresh copy each call) keyed by entity."""
    return {
        "organization": {"id": ORG_ID, "name": ORG_NAME},
        "workspace": _workspace(),
        "accounts": _accounts(),
        "campaigns": _campaigns(),
        "spend": _spend(),
        "revenue": _revenue(),
    }


def compute_aggregates(data: dict) -> dict:
    """Sum the row-level data back into scenario aggregates."""
    by_platform: dict[str, dict] = {}
    acc_platform = {a["id"]: a["platform"] for a in data["accounts"]}
    for r in data["spend"]:
        bucket = by_platform.setdefault(
            acc_platform[r["ad_account_id"]],
            {"spend": 0.0, "conversions": 0, "value": 0.0},
        )
        bucket["spend"] = round(bucket["spend"] + r["cost"], 2)
        bucket["conversions"] += r["conversions"]
        bucket["value"] = round(bucket["value"] + r["conversion_value"], 2)

    revenue = round(sum(r["amount"] for r in data["revenue"]), 2)
    total_spend = round(sum(b["spend"] for b in by_platform.values()), 2)
    claimed_value = round(sum(b["value"] for b in by_platform.values()), 2)
    over_count = round(claimed_value - revenue, 2)
    return {
        **by_platform,
        "actual_revenue": revenue,
        "orders": len(data["revenue"]),
        "total_spend": total_spend,
        "platform_claimed_value": claimed_value,
        "blended_mer": round(revenue / total_spend, 2) if total_spend else None,
        "over_count_value": over_count,
        "over_count_pct": round(over_count / revenue * 100, 1) if revenue else None,
        "tracking_integrity_flag": revenue > 0 and over_count / revenue > 0.15,
    }
