"""Mock clip generation for the CREATE / clips stage.

Returns two deterministic placeholder clips so the create pipeline runs
end-to-end offline; no external AI calls are made.

# REAL hook: teamgroove/cutagent, harry0703/MoneyPrinterTurbo,
# cxbxmxcx/commercial-creator
"""

from __future__ import annotations

from app.create.schemas import CreativeBrief, GeneratedAsset, VideoClip


def generate_clips(brief: CreativeBrief) -> list[GeneratedAsset]:
    """Return 2 mock clips derived from ``brief`` (deterministic, offline)."""
    tag = brief.source_ad_id or "brief"
    return [
        VideoClip(
            asset_url=f"mock://clips/{tag}-hook.mp4",
            duration_s=3.0,
            provider="mock",
        ),
        VideoClip(
            asset_url=f"mock://clips/{tag}-body.mp4",
            duration_s=8.0,
            provider="mock",
        ),
    ]
