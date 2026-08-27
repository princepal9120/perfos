"""Ad Library API routes.

POST /api/ad-library/search              -> live collect + SCORE + persist, returns
                                            canonical AdLibraryItem rows.
GET  /api/ad-library                     -> filter/sort/paginate the stored library.
GET/POST/DELETE /api/ad-library/saved    -> save boards.
GET/POST/DELETE /api/ad-library/competitors (+ /{name}/sync) -> watchlist.
GET  /api/ad-library/{ad_id}             -> one ad, 404 when unknown.

Reads and writes the isolated spy DB (``app.discovery.find.store``), so
``/api/discovery`` and ``/api/winners`` are untouched by anything here.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Annotated, TypeAlias

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.deps import get_current_workspace
from app.discovery.find import store
from app.discovery.find.meta_collector import collect_meta_ads
from app.discovery.find.platform_collectors import (
    collect_google_ads,
    collect_linkedin_ads,
    collect_x_ads,
)
from app.discovery.find.tiktok_collector import collect_tiktok_ads
from app.discovery.schemas import AdRecord, WinnerSignal
from app.discovery.score.winner_engine import score_ads
from app.discovery.score.winner_tiers import classify_tier

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ad-library"])
WorkspaceId: TypeAlias = Annotated[int, Depends(get_current_workspace)]

_COLLECTORS = {
    "meta": collect_meta_ads,
    "tiktok": collect_tiktok_ads,
    "google": collect_google_ads,
    "linkedin": collect_linkedin_ads,
    "x": collect_x_ads,
}


class AdLibraryIngest:
    """One live search: collect -> score -> persist -> read back canonical rows.

    The collectors fall back to fixtures on a failed scrape (see
    ``meta_collector``), so a dead ad library degrades to fixture rows rather
    than an empty library.

    ``refresh`` re-scores ads that are already stored. Only a competitor-scoped
    pass sets it: winner_engine normalizes reach/spend/concentration against the
    batch, so a competitor's own ad set is the batch that makes those numbers
    mean what they claim. A broad keyword search's batch is whatever shared the
    keyword, and letting it overwrite would churn stored scores on noise.
    """

    def __init__(self, *, workspace_id: int = 0, refresh: bool = False) -> None:
        self.workspace_id = workspace_id
        self.refresh = refresh

    async def run(
        self,
        query: str,
        *,
        platforms: list[str] | None = None,
        country: str = "US",
        limit: int = 30,
    ) -> dict:
        records = await self.collect(query, platforms=platforms, country=country, limit=limit)
        added = self.persist(records)
        items = self.reload([r.ad_id for r in records])
        return {"added": added, "total": len(items), "items": items}

    async def collect(
        self,
        query: str,
        *,
        platforms: list[str] | None = None,
        country: str = "US",
        limit: int = 30,
    ) -> list[AdRecord]:
        filters = {"query": query, "country": country}
        wanted = [p.lower() for p in (platforms or _COLLECTORS)]
        batches = await asyncio.gather(
            *(
                _COLLECTORS[p](page_size=limit, filters=filters)
                for p in wanted
                if p in _COLLECTORS
            ),
            return_exceptions=True,
        )
        rows = []
        for batch in batches:
            if isinstance(batch, BaseException):
                logger.warning("ad-library collector failed for %r: %s", query, batch)
                continue
            rows.extend(batch)
        return [AdRecord(**row) for row in rows]

    def persist(self, records: list[AdRecord]) -> int:
        """Score and upsert the batch; returns how many rows were new."""
        by_id = {r.ad_id: r for r in records}
        results = store.upsert_ads(
            [self._persist_shape(s, by_id[s.ad_id]) for s in score_ads(records)],
            workspace_id=self.workspace_id,
            refresh=self.refresh,
        )
        return sum(1 for _, created in results if created)

    def reload(self, ad_ids: list[str]) -> list[dict]:
        """Read the persisted rows back so callers only ever see AdLibraryItem."""
        items: dict[str, dict] = {}
        for ad_id in ad_ids:
            if ad_id in items:
                continue
            item = store.get_ad(ad_id, workspace_id=self.workspace_id)
            if item is not None:
                items[ad_id] = item
        return sorted(items.values(), key=lambda i: -(i.get("score") or 0.0))

    @staticmethod
    def _persist_shape(signal: WinnerSignal, record: AdRecord) -> dict:
        """Store row for one scored ad.

        ``WinnerSignal.tier`` is the longevity label (proven/strong/floor), not the
        library tier, so the library tier is re-derived from score + runtime.
        """
        return {
            "ad_id": signal.ad_id,
            "platform": signal.platform,
            "competitor": signal.advertiser,
            "advertiser": signal.advertiser,
            "title": signal.hook,
            "body": signal.text,
            "cta": signal.cta,
            "landing_url": signal.landing_url,
            "media_urls": [signal.creative_url] if signal.creative_url else [],
            "score": signal.score,
            "tier": classify_tier(signal.score, signal.runtime_days),
            "start_date": signal.start_date,
            "variant_count": record.variant_count,
        }


def _require_text(value: str, field: str) -> str:
    """Reject blank ids/names at the edge.

    The store raises ValueError on an empty key, which FastAPI would surface as a
    500 for what is plain bad client input.
    """
    text = str(value).strip()
    if not text:
        raise HTTPException(status_code=400, detail=f"'{field}' must not be empty")
    return text


def _competitor_row(name: str, *, workspace_id: int = 0) -> dict | None:
    """The roster entry for one competitor, read back after a write."""
    key = name.strip().lower()
    roster = store.list_competitors(workspace_id=workspace_id)
    return next((c for c in roster if c["name"].strip().lower() == key), None)


class AdLibrarySearchRequest(BaseModel):
    query: str
    platforms: list[str] | None = None
    country: str = "US"
    limit: int = 30
    # Accepted for parity with /api/discovery. The library is persona-agnostic:
    # tagging ads per persona would fork the dedupe key and duplicate rows.
    persona: str = "saas"


class SaveAdRequest(BaseModel):
    ad_id: str
    board: str = "default"
    note: str | None = None


class TrackCompetitorRequest(BaseModel):
    name: str
    platform: str | None = None
    domain: str | None = None


class SyncCompetitorRequest(BaseModel):
    country: str = "US"
    limit: int = 30


@router.post("/ad-library/search")
async def post_ad_library_search(req: AdLibrarySearchRequest, workspace_id: WorkspaceId) -> dict:
    result = await AdLibraryIngest(workspace_id=workspace_id).run(
        req.query, platforms=req.platforms, country=req.country, limit=req.limit
    )
    return {"total": result["total"], "items": result["items"]}


@router.get("/ad-library")
def get_ad_library(
    workspace_id: WorkspaceId,
    q: str | None = None,
    platform: str | None = None,
    competitor: str | None = None,
    tier: str | None = None,
    board: str | None = None,
    saved_only: bool = False,
    min_runtime_days: float | None = None,
    sort: str = "recent",
    limit: int = 60,
    offset: int = 0,
) -> dict:
    return store.search_ads(
        workspace_id=workspace_id,
        q=q,
        platform=platform,
        competitor=competitor,
        tier=tier,
        board=board,
        saved_only=saved_only,
        min_runtime_days=min_runtime_days,
        sort=sort,
        limit=limit,
        offset=offset,
    )


@router.get("/ad-library/saved")
def get_saved_ads(workspace_id: WorkspaceId, board: str | None = None, limit: int = 200) -> dict:
    return store.list_saved_ads(workspace_id=workspace_id, board=board, limit=limit)


@router.post("/ad-library/saved")
def post_saved_ad(req: SaveAdRequest, workspace_id: WorkspaceId) -> dict:
    ad_id = _require_text(req.ad_id, "ad_id")
    record = store.save_ad(
        ad_id, workspace_id=workspace_id, board=req.board, note=req.note
    )
    # An ad can be saved before it was ever collected; then the save record is
    # all there is to return.
    return store.get_ad(ad_id, workspace_id=workspace_id) or record


@router.delete("/ad-library/saved/{ad_id}")
def delete_saved_ad(ad_id: str, workspace_id: WorkspaceId, board: str = "default") -> dict:
    return {
        "removed": store.unsave_ad(ad_id, workspace_id=workspace_id, board=board)
    }


@router.get("/ad-library/competitors")
def get_ad_library_competitors(workspace_id: WorkspaceId) -> dict:
    return {"items": store.list_competitors(workspace_id=workspace_id)}


@router.post("/ad-library/competitors")
def post_ad_library_competitor(
    req: TrackCompetitorRequest, workspace_id: WorkspaceId
) -> dict:
    name = _require_text(req.name, "name")
    return store.track_competitor(
        name, workspace_id=workspace_id, platform=req.platform, domain=req.domain
    )


@router.delete("/ad-library/competitors/{name}")
def delete_ad_library_competitor(name: str, workspace_id: WorkspaceId) -> dict:
    return {"removed": store.untrack_competitor(name, workspace_id=workspace_id)}


@router.post("/ad-library/competitors/{name}/sync")
async def post_ad_library_competitor_sync(
    name: str, workspace_id: WorkspaceId, req: SyncCompetitorRequest | None = None
) -> dict:
    opts = req or SyncCompetitorRequest()
    competitor = _require_text(name, "name")
    result = await AdLibraryIngest(workspace_id=workspace_id, refresh=True).run(
        competitor, country=opts.country, limit=opts.limit
    )

    # Track before stamping: mark_competitor_synced only writes to a watchlist row,
    # so stamping first would silently no-op on a competitor's first sync.
    store.track_competitor(competitor, workspace_id=workspace_id)
    store.mark_competitor_synced(competitor, workspace_id=workspace_id)
    return {
        **result,
        "competitor": _competitor_row(competitor, workspace_id=workspace_id),
    }


# Declared last: a path param at this level shadows /saved and /competitors.
@router.get("/ad-library/{ad_id}")
def get_ad_library_ad(ad_id: str, workspace_id: WorkspaceId) -> dict:
    item = store.get_ad(ad_id, workspace_id=workspace_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"unknown ad_id {ad_id!r}")
    return item


if __name__ == "__main__":  # pragma: no cover - runnable self-check
    import os
    import tempfile

    os.environ["DISCOVERY_SPY_DB_URL"] = f"sqlite:///{tempfile.mkdtemp()}/spy.db"
    os.environ["PERFOS_LIVE_DISCOVERY"] = "0"

    _result = asyncio.run(AdLibraryIngest().run("skin", limit=5))
    assert _result["items"], "expected fixture-backed library rows"
    assert _result["added"] == len(_result["items"]), "a fresh DB must count every row as new"
    assert _result["items"][0]["tier"] in {"high_conf", "winner", "emerging", "loser"}

    _ad_id = _result["items"][0]["ad_id"]
    assert get_ad_library_ad(_ad_id, 0)["ad_id"] == _ad_id
    assert post_saved_ad(SaveAdRequest(ad_id=_ad_id), 0)["saved"] is True
    assert get_saved_ads(0)["total"] == 1
    assert delete_saved_ad(_ad_id, 0)["removed"] is True

    _sync = asyncio.run(post_ad_library_competitor_sync("Nimbus Skin", 0))
    assert _sync["competitor"]["tracked"] is True, "sync must add the competitor to the watchlist"
    assert _sync["competitor"]["last_synced_at"], "sync must stamp last_synced_at"

    try:
        post_saved_ad(SaveAdRequest(ad_id="   "), 0)
        raise AssertionError("a blank ad_id must be rejected, not persisted")
    except HTTPException as _exc:
        assert _exc.status_code == 400
    print("ad_library router self-check OK")
