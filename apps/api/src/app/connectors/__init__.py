"""app.connectors — BaseConnector + registry (agent G)."""

from app.connectors.base import BaseConnector
from app.connectors.registry import get_connector, register_connector

__all__ = ["BaseConnector", "get_connector", "register_connector"]
