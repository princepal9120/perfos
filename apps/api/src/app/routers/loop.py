"""LOOP API: trigger the find -> score -> create -> launch -> track -> double-down run.

Standalone router (build agent A44). Wire it in app/main.py next to app.api:

    from app.routers.loop import router as loop_router
    app.include_router(loop_router, prefix="/api")

Routes (after the /api prefix):
    POST /api/loop         {persona, dry_run} -> run_loop summary dict
    GET  /api/loop/status   last run state from <repo>/.build/loop_state.json
"""

import inspect
import json
from datetime import UTC, datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# State lives at the repo root (.build/loop_state.json), independent of server CWD.
_REPO_ROOT = Path(__file__).resolve().parents[5]
_STATE_PATH = _REPO_ROOT / ".build" / "loop_state.json"


class LoopRequest(BaseModel):
    persona: str = "saas"
    dry_run: bool = True


def _read_state() -> dict:
    if not _STATE_PATH.exists():
        return {"last_run": None}
    return json.loads(_STATE_PATH.read_text())


def _write_state(state: dict) -> None:
    _STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    _STATE_PATH.write_text(json.dumps(state, indent=2))


@router.post("/loop")
async def trigger_loop(body: LoopRequest) -> dict:
    """Run the LOOP lifecycle once and persist the summary for /api/loop/status."""
    try:
        from app.loop.orchestrator import run_loop
    except ImportError as exc:
        raise HTTPException(
            status_code=503, detail=f"loop orchestrator unavailable: {exc}"
        ) from exc

    # Tolerate a sync run_loop implementation too.
    result = run_loop(persona=body.persona, dry_run=body.dry_run)
    if inspect.isawaitable(result):
        result = await result

    _write_state(
        {
            "persona": body.persona,
            "dry_run": body.dry_run,
            "finished_at": datetime.now(UTC).isoformat(),
            "summary": result,
        }
    )
    return result


@router.get("/loop/status")
def get_loop_status() -> dict:
    return _read_state()
