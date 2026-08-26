"""Dataclasses for the CREATE / clips stage.

Pure data models only — no I/O, no external calls; mock-safe by default.
"""

from dataclasses import dataclass


@dataclass
class CreativeBrief:
    """Structured brief derived from a scored winner ad."""

    source_ad_id: str
    brief_text: str


@dataclass
class GeneratedAsset:
    """A single generated creative artifact."""

    asset_url: str
    duration_s: float | None = None
    provider: str | None = None


@dataclass
class VideoClip(GeneratedAsset):
    """A generated video clip ready for launch."""
