"""Abstract connector interface — spec/CONTRACTS.md §Connector interface.

Mock backends live in app.mock; concrete connectors serve mock data when
MOCK_MODE=true (env). Real API adapters are NotImplementedError stubs behind
the same interface.
"""

from __future__ import annotations

import os
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:  # agent B owns app.models; import lazily to avoid build-order coupling
    from app.models import Campaign, Spend


class BaseConnector(ABC):
    """Platform connector (google / meta / shopify).

    Subclasses set ``platform`` and implement the four operations. Instances
    are workspace-scoped (see app.connectors.registry.get_connector).
    """

    platform: str = ""

    def __init__(self, workspace: Any):
        self.workspace = workspace

    @property
    def mock_mode(self) -> bool:
        return os.getenv("MOCK_MODE", "").strip().lower() in ("1", "true", "yes")

    @abstractmethod
    def fetch_campaigns(self) -> list[Campaign]:
        """Return campaigns for this platform in the connected workspace."""

    @abstractmethod
    def fetch_metrics(self, date_start: Any, date_end: Any) -> list[Spend]:
        """Return per-campaign Spend rows for [date_start, date_end]."""

    @abstractmethod
    def set_budget(self, campaign_id: Any, new_daily_budget: float) -> dict:
        """Update daily budget. Mock: updates in-memory state."""

    @abstractmethod
    def pause_campaign(self, campaign_id: Any) -> dict:
        """Pause a campaign. Mock: updates in-memory state."""
