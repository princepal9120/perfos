"""CREATE API: generate creative assets from the top discovered winners.

Standalone router (build agent A45). Wire it in app/main.py next to app.api:

    from app.routers.create import router as create_router
    app.include_router(create_router, prefix="/api")

Routes (after the /api prefix):
    POST /api/create  {persona} -> run_create on top winners -> generated assets
    GET  /api/assets              all persisted assets from .build/assets.json

Storage follows the CREATE-stage store conventions (AssetStore/WinnerStore
defaults, relative ``.build/`` paths) so this router always reads exactly what
the pipeline writes.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.discovery.schemas import WinnerSignal

router = APIRouter()


class CreateRequest(BaseModel):
    persona: str = "saas"


def _to_signal(row: Any) -> WinnerSignal:
    """Coerce a stored winner row into the canonical pydantic WinnerSignal.

    ``WinnerStore`` persists its own dataclass shape (no hook/cta/advertiser);
    fill tolerant defaults so run_create/remix_hook never see missing attrs.
    """
    d = row if isinstance(row, dict) else vars(row)
    return WinnerSignal(
        platform=d.get("platform") or "meta",
        advertiser=d.get("competitor") or d.get("advertiser") or "",
        ad_id=str(d.get("ad_id") or ""),
        score=float(d.get("score") or 0.0),
        tier=d.get("tier") or "loser",
        hook=d.get("hook"),
        cta=d.get("cta"),
    )


@router.post("/create")
async def trigger_create(body: CreateRequest) -> dict:
    """Generate clips for the top stored winners and persist them."""
    from app.create.runner import run_create
    from app.discovery.store import WinnerStore

    try:
        top = WinnerStore().top(20)
    except Exception as exc:  # corrupt/missing store should not 500 the API
        raise HTTPException(status_code=503, detail=f"winner store unavailable: {exc}") from exc

    # Stored rows carry no persona tag; persona is accepted for contract parity
    # with /api/discovery and surfaced back in the response.
    signals = [_to_signal(s) for s in top]
    try:
        assets = run_create(signals)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"create runner failed: {exc}") from exc

    return {
        "persona": body.persona,
        "winners_used": len(signals),
        "assets": [
            {"asset_url": a.asset_url, "duration_s": a.duration_s, "provider": a.provider}
            for a in assets
        ],
    }


@router.get("/assets")
def list_assets() -> list[dict]:
    """Every asset persisted by the CREATE stage (.build/assets.json)."""
    from app.create.store import AssetStore

    return AssetStore().all()


__all__ = ["CreateRequest", "list_assets", "trigger_create"]
