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

from typing import Annotated, Any, TypeAlias

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.deps import get_current_workspace
from app.discovery.schemas import WinnerSignal

router = APIRouter(dependencies=[Depends(get_current_workspace)])
WorkspaceId: TypeAlias = Annotated[int, Depends(get_current_workspace)]


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
        # WinnerStore persists the hook under "title" and the creative under "landing_url".
        hook=d.get("hook") or d.get("title"),
        cta=d.get("cta"),
        creative_url=d.get("creative_url") or d.get("landing_url"),
    )


def _from_ad_library(ad: dict) -> WinnerSignal:
    """Coerce an AdLibraryItem dict into the canonical pydantic WinnerSignal.

    These rows carry real, separate fields, so nothing is overloaded the way
    ``_to_signal`` has to compensate for: the creative stays the creative and
    ``landing_url`` stays the click destination.
    """
    media = ad.get("media_urls") or []
    return WinnerSignal(
        platform=ad.get("platform") or "meta",
        advertiser=ad.get("advertiser") or ad.get("competitor") or "",
        ad_id=str(ad.get("ad_id") or ""),
        score=float(ad.get("score") or 0.0),
        tier=ad.get("tier") or "loser",
        hook=ad.get("title"),
        cta=ad.get("cta"),
        text=ad.get("body"),
        creative_url=ad.get("creative_url") or (media[0] if media else None),
        landing_url=ad.get("landing_url"),
        start_date=ad.get("start_date"),
        runtime_days=float(ad.get("runtime_days") or 0.0),
    )


def _resolve_ad(ad_id: str, *, workspace_id: int = 0) -> WinnerSignal | None:
    """Find one ad by id across both stores, or None.

    The Ad Library persists to its own spy DB and never writes WinnerStore, so an
    ad discovered or saved through /api/ad-library exists only there.
    """
    from app.discovery.find import store as ad_library_store
    from app.discovery.store import WinnerStore

    match = next(
        (r for r in WinnerStore().all(workspace_id) if str(r.ad_id) == ad_id), None
    )
    if match is not None:
        return _to_signal(match)

    ad = ad_library_store.get_ad(ad_id, workspace_id=workspace_id)
    return _from_ad_library(ad) if ad is not None else None


@router.post("/create")
async def trigger_create(body: CreateRequest, workspace_id: WorkspaceId) -> dict:
    """Generate clips for the top stored winners and persist them."""
    from app.create.runner import run_create
    from app.discovery.store import WinnerStore

    try:
        top = WinnerStore().top(20, workspace_id)
    except Exception as exc:  # corrupt/missing store should not 500 the API
        raise HTTPException(status_code=503, detail=f"winner store unavailable: {exc}") from exc

    # Stored rows carry no persona tag; persona is accepted for contract parity
    # with /api/discovery and surfaced back in the response.
    signals = [_to_signal(s) for s in top]
    try:
        assets = run_create(signals, workspace_id=workspace_id)
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


class CloneRequest(BaseModel):
    ad_id: str
    generate: bool = False


@router.post("/clone")
def clone_ad(body: CloneRequest, workspace_id: WorkspaceId) -> dict:
    """Ads Cloner: turn one stored ad into your own hook variants + brief.

    Resolves against the WinnerStore and the Ad Library, so a swipe-file ad is
    clonable even when no /api/discovery scan ever surfaced it.
    """
    from app.create.hook_remix import remix_hook
    from app.create.runner import run_create

    signal = _resolve_ad(body.ad_id, workspace_id=workspace_id)
    if signal is None:
        raise HTTPException(status_code=404, detail=f"ad {body.ad_id!r} not found")

    variants = remix_hook(signal)
    assets = run_create([signal], workspace_id=workspace_id) if body.generate else []

    return {
        "source": {
            "ad_id": signal.ad_id,
            "platform": signal.platform,
            "advertiser": signal.advertiser,
            "hook": signal.hook,
            "cta": signal.cta,
            "score": signal.score,
            "tier": signal.tier,
        },
        "variants": variants,
        "assets": [
            {"asset_url": a.asset_url, "duration_s": a.duration_s, "provider": a.provider}
            for a in assets
        ],
    }


@router.get("/assets")
def list_assets(workspace_id: WorkspaceId) -> list[dict]:
    """Every asset persisted by the CREATE stage (.build/assets.json)."""
    from app.create.store import AssetStore

    return AssetStore().all(workspace_id)


__all__ = ["CloneRequest", "CreateRequest", "clone_ad", "list_assets", "trigger_create"]
