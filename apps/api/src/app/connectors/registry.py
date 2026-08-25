"""Platform -> connector-class registry (spec/CONTRACTS.md §File ownership G).

get_connector(platform, workspace) returns a workspace-scoped connector
instance. Adapter modules (google/meta/revenue) are imported lazily so the
package imports cleanly during the parallel build before they land.
"""

from __future__ import annotations

import importlib
from typing import Any

from app.connectors.base import BaseConnector

# platform -> "module:ClassName" (files owned by agents D/E/F)
_PLATFORM_CONNECTORS: dict[str, str] = {
    "google": "app.connectors.google:GoogleConnector",
    "meta": "app.connectors.meta:MetaConnector",
    "shopify": "app.connectors.revenue:RevenueConnector",
    "tiktok": "app.connectors.tiktok:TikTokConnector",
    "twitter": "app.connectors.twitter:TwitterAdsConnector",
    "linkedin": "app.connectors.linkedin:LinkedInConnector",
}

_REGISTRY: dict[str, type[BaseConnector]] = {}


def register_connector(platform: str, cls: type[BaseConnector]) -> None:
    """Register (or override) a connector class for a platform."""
    _REGISTRY[platform.lower()] = cls


def get_connector(platform: str, workspace: Any) -> BaseConnector:
    """Return a connector instance for ``platform`` scoped to ``workspace``."""
    key = platform.lower()
    cls = _REGISTRY.get(key)
    if cls is None:
        path = _PLATFORM_CONNECTORS.get(key)
        if path is None:
            raise LookupError(f"No connector registered for platform '{platform}'")
        module_name, _, attr = path.partition(":")
        try:
            module = importlib.import_module(module_name)
            cls = getattr(module, attr)
        except (ImportError, AttributeError) as exc:
            raise LookupError(
                f"Connector for platform '{platform}' is not available ({path})"
            ) from exc
        _REGISTRY[key] = cls
    return cls(workspace)
