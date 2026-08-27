"""LOOP find stage -- spy competitors via the shared discovery pipeline.

Thin LOOP wrapper over the FIND pipeline (find -> score -> store): one
persona + channel selection in, scored competitor ``AdRecord`` rows out.
Live only when a query is supplied; fixtures otherwise. This stage only
normalizes whatever shape ``run_discovery`` returns
(bare list, {"ads": [...]}, {"winners": [...]} / top-winners dict) into
a flat ``list[AdRecord]`` for downstream LOOP stages.
"""

from __future__ import annotations

from typing import Any

from app.discovery.schemas import AdRecord

__all__ = ["find_stage"]

# Keys run_discovery-style result dicts may carry ad rows under.
_ROW_KEYS = ("ads", "records", "winners", "top", "results")


def _extract_rows(result: Any) -> list[Any]:
    """Pull raw ad rows out of a bare list or a top-winners-style dict."""
    if isinstance(result, dict):
        for key in _ROW_KEYS:
            value = result.get(key)
            if isinstance(value, list):
                return value
        # Single ad dict passed straight through.
        return [result] if "ad_id" in result else []
    return result if isinstance(result, list) else []


def _run_sync(coro: Any) -> Any:
    """Await ``coro`` from sync code, whether or not a loop is already running.

    find_stage is sync but the orchestrator calls it from inside an event loop,
    so a plain asyncio.run() would raise; offload to a thread in that case.
    """
    import asyncio
    from concurrent.futures import ThreadPoolExecutor

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    with ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(asyncio.run, coro).result()


def _to_ad_record(row: Any) -> AdRecord | None:
    """Coerce one raw winner/ad row into an ``AdRecord``; None if unusable."""
    if not isinstance(row, dict):
        return None
    try:
        return AdRecord.model_validate(row)
    except Exception:  # missing required fields etc. -- skip bad row, never crash the loop
        return None


def find_stage(
    persona: str = "saas",
    channels: list[str] | None = None,
    query: str | None = None,
    workspace_id: int = 0,
    session: Any = None,
) -> list[AdRecord]:
    """Run one FIND pass for ``persona`` on ``channels`` and return its ads.

    With a ``query`` this runs the live ad-library search; without one the same
    collectors serve fixtures. Unusable rows are skipped, not fatal.

    Deliberately shares ``routers.discovery.run_discovery`` with the API, CLI,
    and MCP surfaces — the older ``discovery.cli`` chain only ever supported the
    saas persona and raised on the rest.
    """
    from app.routers.discovery import run_discovery

    result = _run_sync(
        run_discovery(persona, query, channels, workspace_id=workspace_id, session=session)
    )
    return [
        ad for row in _extract_rows(result) if (ad := _to_ad_record(row)) is not None
    ]


if __name__ == "__main__":
    # Self-check: normalization logic only (cli.py is a sibling build target).
    assert _extract_rows([{"ad_id": "1"}]) == [{"ad_id": "1"}]
    assert _extract_rows({"ads": [{"ad_id": "2"}]}) == [{"ad_id": "2"}]
    assert _extract_rows({"winners": [{"ad_id": "3"}], "meta": 1}) == [{"ad_id": "3"}]
    assert _extract_rows({}) == []
    assert _extract_rows(None) == []

    good = {
        "platform": "meta",
        "advertiser": "acme",
        "ad_id": "a1",
        "score": 88,
        "tier": "winner",
    }
    rec = _to_ad_record(good)
    assert rec is not None and rec.ad_id == "a1"
    assert not hasattr(rec, "tier")  # extra keys ignored per AdRecord contract
    assert _to_ad_record({"nope": 1}) is None
    assert _to_ad_record("junk") is None

    ads = [_to_ad_record(r) for r in _extract_rows({"winners": [good, {"bad": 0}]})]
    assert [a.ad_id for a in ads if a is not None] == ["a1"]
    print("ok")
