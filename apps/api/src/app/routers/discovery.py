"""Discovery API routes.

POST /api/discovery  {persona} -> run FIND (mock-safe collectors) + SCORE,
                               persist WinnerSignals to the WinnerStore, and
                               return the signals that fit the persona's
                               channel mix (unknown personas get everything).
GET  /api/winners    -> top-20 stored winner signals by score.
"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.discovery.find.meta_collector import collect_meta_ads
from app.discovery.find.tiktok_collector import collect_tiktok_ads
from app.discovery.score.persona_fit import PERSONA_MAP, persona_fit
from app.discovery.score.winner_engine import score_ads
from app.discovery.schemas import AdRecord
from app.discovery.store import WinnerStore

router = APIRouter(tags=["discovery"])

_store = WinnerStore()


class DiscoveryRequest(BaseModel):
    persona: str


async def run_discovery(persona: str) -> list[dict]:
    """Collect competitor ads from mock-safe sources, score them, persist, return."""
    rows = await collect_meta_ads() + await collect_tiktok_ads()
    signals = score_ads([AdRecord(**row) for row in rows])

    # ponytail: ad-id dedupe here instead of in WinnerStore (store.py not mine to edit);
    # move into store.add() if other callers need it.
    seen = {s.ad_id for s in _store.all()}
    for signal in signals:
        if signal.ad_id not in seen:
            _store.add(signal.model_dump())
            seen.add(signal.ad_id)

    known_persona = persona in PERSONA_MAP
    return [
        s.model_dump()
        for s in signals
        if not known_persona or persona_fit(s, persona)
    ]


@router.post("/discovery")
async def post_discovery(req: DiscoveryRequest) -> list[dict]:
    return await run_discovery(req.persona)


@router.get("/winners")
def get_winners() -> list:
    return _store.top(20)


if __name__ == "__main__":  # pragma: no cover - runnable self-check
    import asyncio
    import tempfile
    from pathlib import Path

    _tmp = Path(tempfile.mkdtemp()) / "winners.json"
    _store = WinnerStore(_tmp)
    _result = asyncio.run(run_discovery("dropship"))
    assert isinstance(_result, list) and _result, "expected scored signals"
    assert all(s["score"] >= s2["score"] for s, s2 in zip(_result, _result[1:])), (
        "results must be sorted best-first"
    )
    assert len(get_winners()) == min(len(_store.all()), 20)
    print("discovery router self-check OK")
