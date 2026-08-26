"""LOOP create stage -- turns scored winners into creative assets (mock).

Stage 3 of the loop (find -> score -> CREATE -> launch -> track). Accepts the
winner payloads emitted by the score engine (``app.discovery.schemas.WinnerSignal``
or equivalent dicts), derives one brief per winner, and generates assets via
the existing mock clip generator (``app.create.clipgen``). Pure function:
no I/O, no network -- mock-safe by construction.

# REAL hook: teamgroove/cutagent, harry0703/MoneyPrinterTurbo,
# cxbxmxcx/commercial-creator behind ``app.create.*`` adapters.
"""

from __future__ import annotations

from typing import Any

from app.create.clipgen import generate_clips
from app.create.schemas import CreativeBrief, GeneratedAsset

STAGE = "create"

__all__ = ["create_stage"]


def _field(winner: Any, *names: str) -> str | None:
    """Read the first present field off a dict or duck-typed winner object."""
    for name in names:
        if isinstance(winner, dict):
            value = winner.get(name)
        else:
            value = getattr(winner, name, None)
        if value:
            return str(value)
    return None


def create_stage(winners: list[Any] | None) -> list[GeneratedAsset]:
    """Generate creative assets for each scored winner.

    One ``CreativeBrief`` per winner (id + hook/cta text), then two deterministic
    mock clips via ``app.create.clipgen.generate_clips``. Returns every asset in
    input order; empty/None input yields an empty list.
    """
    assets: list[GeneratedAsset] = []
    for winner in winners or []:
        source_ad_id = _field(winner, "ad_id", "source_ad_id", "id") or "brief"
        hook = _field(winner, "hook") or ""
        cta = _field(winner, "cta") or ""
        brief_text = " ".join(part for part in (hook, cta) if part)
        assets.extend(generate_clips(CreativeBrief(source_ad_id=source_ad_id, brief_text=brief_text)))
    return assets


if __name__ == "__main__":
    # Minimal self-check: 2 mock clips per winner, ids threaded through URLs.
    out = create_stage(
        [
            {"ad_id": "w1", "hook": "Stop scrolling", "cta": "Try free"},
            {"ad_id": "", "hook": ""},
        ]
    )
    assert len(out) == 4
    assert [a.asset_url for a in out[:2]] == ["mock://clips/w1-hook.mp4", "mock://clips/w1-body.mp4"]
    assert all(a.provider == "mock" for a in out)
    assert create_stage(None) == []
    print("create_stage OK")
