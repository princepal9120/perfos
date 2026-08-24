"""Shopify/Stripe revenue connector — the SOURCE OF TRUTH for attribution.

In MOCK_MODE the connector reads from the in-memory demo dataset
(app.mock.dataset); real Shopify Admin API / Stripe SDK adapters are stubbed
behind the same interface so the product can later fetch verified revenue
without changing callers.
"""

from __future__ import annotations

from typing import Any

from app.core.config import settings

__all__ = ["RevenueConnector"]


class RevenueConnector:
    """Fetches verified revenue (orders) for a workspace."""

    platform = "shopify"

    def __init__(self, workspace: Any = None) -> None:
        self.workspace = workspace

    # -- source of truth --------------------------------------------------- #
    def fetch_actual_revenue(
        self, date_start: str | None = None, date_end: str | None = None
    ) -> list[dict]:
        """Return revenue rows. Mock mode pulls from the demo dataset; the real
        adapter would query Shopify orders / Stripe charges in [date_start, date_end]."""
        if getattr(settings, "MOCK_MODE", True):
            from app.mock.dataset import get_mock_data

            data = get_mock_data()
            rows = data.get("revenue", [])
            return [dict(r) for r in rows]

        # Real adapter stub — intentionally not implemented in MVP.
        raise NotImplementedError(
            "Real Shopify/Stripe revenue sync is a Phase 2 milestone. "
            "Set MOCK_MODE=true to use demo data."
        )

    def total_revenue(self, date_start: str | None = None, date_end: str | None = None) -> float:
        rows = self.fetch_actual_revenue(date_start, date_end)
        return float(sum(float(r.get("amount", 0) or 0) for r in rows))

    # -- real adapter hooks (Phase 2) -------------------------------------- #
    def sync_shopify(self, shop_domain: str, access_token: str) -> list[dict]:  # pragma: no cover
        raise NotImplementedError("Shopify revenue sync lands in Phase 2.")

    def sync_stripe(self, api_key: str) -> list[dict]:  # pragma: no cover
        raise NotImplementedError("Stripe revenue sync lands in Phase 2.")
