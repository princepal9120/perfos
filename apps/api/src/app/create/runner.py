"""CREATE orchestrator: winners -> creative assets.

For each ``WinnerSignal``, derives a brief, remixes the ad's hook, generates
clips via ``clipgen`` and persists them through ``AssetStore`` (mirrors the
shape of the score orchestrator). Mock-safe end to end.
"""

from __future__ import annotations

from app.create.clipgen import generate_clips
from app.create.hook_remix import remix_hook
from app.create.schemas import CreativeBrief, GeneratedAsset
from app.create.store import AssetStore
from app.discovery.schemas import WinnerSignal


def run_create(winners: list[WinnerSignal]) -> list[GeneratedAsset]:
    """Generate clips for each winner and persist them to .build/assets.json.

    The top remixed hook variant seeds the brief text so downstream clip
    generation inherits the strongest hook angle per winner.
    """
    store = AssetStore()
    assets: list[GeneratedAsset] = []
    for winner in winners:
        # remix_hook degrades to [] when a winner carries no hook/cta copy.
        top_hook = (remix_hook(winner) or [""])[0]
        brief = CreativeBrief(
            source_ad_id=winner.ad_id,
            brief_text=f"{top_hook} | CTA: {winner.cta or ''}".strip(" |"),
        )
        for asset in generate_clips(brief):
            store.add(asset, source_ad_id=winner.ad_id)
            assets.append(asset)
    return assets


__all__ = ["run_create"]
