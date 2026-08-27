"""Discovery API routes.

POST /api/discovery  {query, persona, channels, country, limit} -> run FIND
                     (live Meta Ad Library when a query is given, fixtures
                     otherwise) + SCORE, persist WinnerSignals, return the
                     signals that fit the persona's channel mix.
GET  /api/winners    -> top stored winner signals by score.
"""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.deps import get_current_workspace
from app.discovery.find.meta_collector import collect_meta_ads
from app.discovery.find.tiktok_collector import collect_tiktok_ads
from app.discovery.schemas import AdRecord
from app.discovery.score.persona_fit import rank_by_persona
from app.discovery.score.winner_engine import score_ads
from app.discovery.store import WinnerStore

router = APIRouter(tags=["discovery"], dependencies=[Depends(get_current_workspace)])

_store = WinnerStore()

_COLLECTORS = {"meta": collect_meta_ads, "tiktok": collect_tiktok_ads}


class DiscoveryRequest(BaseModel):
    persona: str = "saas"
    query: str | None = None
    channels: list[str] | None = None
    country: str = "US"
    limit: int = 30


def _persist_shape(signal) -> dict:
    """Map the scored pydantic WinnerSignal onto the store's dataclass fields."""
    return {
        "ad_id": signal.ad_id,
        "platform": signal.platform,
        "competitor": signal.advertiser,
        "title": signal.hook,
        "landing_url": signal.creative_url,
        "score": signal.score,
        "tier": signal.tier,
        "runtime_days": signal.runtime_days,
    }


async def run_discovery(
    persona: str,
    query: str | None = None,
    channels: list[str] | None = None,
    country: str = "US",
    limit: int = 30,
    workspace_id: int = 0,
) -> list[dict]:
    """Collect competitor ads, score them, persist, return persona-fit signals."""
    filters = {"query": query, "country": country} if query else None
    wanted = [c.lower() for c in (channels or _COLLECTORS)] if channels else list(_COLLECTORS)

    batches = await asyncio.gather(
        *(_COLLECTORS[c](page_size=limit, filters=filters) for c in wanted if c in _COLLECTORS),
        return_exceptions=True,
    )
    rows = [row for b in batches if isinstance(b, list) for row in b]
    signals = score_ads([AdRecord(**row) for row in rows])

    # ponytail: ad-id dedupe here instead of in WinnerStore; move into store.add()
    # if other callers need it.
    seen = {s.ad_id for s in _store.all(workspace_id)}
    for signal in signals:
        if signal.ad_id not in seen:
            _store.add_for_workspace(_persist_shape(signal), workspace_id)
            seen.add(signal.ad_id)

    return [s.model_dump() for s in rank_by_persona(signals, persona)]


@router.post("/discovery")
async def post_discovery(req: DiscoveryRequest, workspace_id: int = Depends(get_current_workspace)) -> list[dict]:
    return await run_discovery(
        req.persona, req.query, req.channels, req.country, req.limit, workspace_id
    )


@router.get("/winners")
def get_winners(limit: int = 20, workspace_id: int = Depends(get_current_workspace)) -> list:
    return _store.top(limit, workspace_id)


if __name__ == "__main__":  # pragma: no cover - runnable self-check
    import tempfile
    from pathlib import Path

    _store = WinnerStore(Path(tempfile.mkdtemp()) / "winners.json")
    _result = asyncio.run(run_discovery("dropship"))
    assert isinstance(_result, list) and _result, "expected scored signals"
    assert all(a["score"] >= b["score"] for a, b in zip(_result, _result[1:])), (
        "results must be sorted best-first"
    )
    assert _store.all()[0].competitor, "advertiser must persist as competitor"
    assert len(get_winners()) == min(len(_store.all()), 20)
    print("discovery router self-check OK")
