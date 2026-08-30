"""Layer config for the FIND stage.

Star-importable via ``from .config import *`` (see ``__all__``).
"""

from pathlib import Path

# Root of the discovery layer (apps/api/src/app/discovery/find/config.py -> find/)
BASE_DIR = Path(__file__).resolve().parent

DEFAULT_PAGE_SIZE = 100

# Source registry: which collectors are enabled by default.
SOURCE_REGISTRY: dict[str, bool] = {
    "meta": True,
    "tiktok": True,
    "google": False,
    "linkedin": False,
    "x": False,
}

__all__ = ["BASE_DIR", "DEFAULT_PAGE_SIZE", "SOURCE_REGISTRY"]
