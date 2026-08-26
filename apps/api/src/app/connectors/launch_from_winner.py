"""Launch-from-winner connector (agent A35).

Accepts a winner brief (from discovery score -> create brief) and mock-creates
a PAUSED campaign on the target ad platform. Draft-first safety model: nothing
goes live here; a human approves via loop/safety_gate before activation.

Mock-safe by design:
* No external LLM or platform API calls.
* Launched campaigns live in this module's own in-memory store so the
  canonical demo aggregates (Google 12k/60k, Meta 8k/44k) are never touched --
  we never append to an existing connector's campaign list, because that would
  pollute its fetch_metrics totals.
* Platform validity is checked via app.connectors.registry (read-only lookup).
"""

from __future__ import annotations

import itertools
from typing import Any

from pydantic import BaseModel, Field, field_validator


class WinnerBrief(BaseModel):
    """Minimal winner brief accepted by launch_from_winner."""

    platform: str = "meta"
    name: str = ""
    source_ad_id: str | None = None
    hook: str | None = None
    angle: str | None = None
    cta: str | None = None
    creative_url: str | None = None
    persona: str | None = None
    channel: str | None = None
    daily_budget: float = Field(default=50.0, ge=0)

    @field_validator("platform")
    @classmethod
    def _lower_platform(cls, v: str) -> str:
        return v.strip().lower()

    def derived_name(self) -> str:
        if self.name:
            return self.name
        base = self.source_ad_id or self.hook or "Winner"
        return f"[Winner] {base}"[:255]


# In-memory store of campaigns created from winner briefs. Demo ids in the
# shared mock live well below this range, so there is no id collision.
_LAUNCHED: list[dict] = []
_IDS = itertools.count(9100)


def launch_from_winner(
    brief: WinnerBrief | dict[str, Any], workspace: Any = None
) -> dict:
    """Create a paused draft campaign for ``brief``. Mock-only.

    Returns a result dict: {"success": bool, ...}. On failure includes
    "error": "unknown_platform" | "invalid_brief". The campaign is always
    created with status "paused" -- activation is policy-gated elsewhere.
    """
    try:
        if not isinstance(brief, WinnerBrief):
            brief = WinnerBrief.model_validate(brief)
    except Exception as exc:  # pydantic ValidationError
        return {
            "success": False,
            "error": "invalid_brief",
            "detail": str(exc),
        }

    # Read-only validation: reject platforms no connector serves.
    try:
        from app.connectors.registry import get_connector

        get_connector(brief.platform, workspace)
    except LookupError as exc:
        return {
            "success": False,
            "error": "unknown_platform",
            "platform": brief.platform,
            "detail": str(exc),
        }

    cid = next(_IDS)
    record = {
        "id": cid,
        "platform_campaign_id": f"lfw-{cid}",
        "platform": brief.platform,
        "name": brief.derived_name(),
        "status": "paused",
        "daily_budget": float(brief.daily_budget),
        "source_ad_id": brief.source_ad_id,
        "hook": brief.hook,
        "angle": brief.angle,
        "cta": brief.cta,
        "creative_url": brief.creative_url,
        "persona": brief.persona,
        "channel": brief.channel,
    }
    _LAUNCHED.append(record)
    return {
        "success": True,
        **record,
        "note": "mock campaign created in paused state; requires human approval to activate",
    }


def list_launched(platform: str | None = None) -> list[dict]:
    """All campaigns created from winner briefs (optionally per platform)."""
    if platform is None:
        return list(_LAUNCHED)
    key = platform.strip().lower()
    return [r for r in _LAUNCHED if r["platform"] == key]


def reset_launched() -> None:
    """Clear the in-memory launch store (tests / fresh loop runs)."""
    _LAUNCHED.clear()
