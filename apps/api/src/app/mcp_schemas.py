"""Pydantic v2 request/response schemas for the three PerfOS agent-loop MCP tools.

Wire contract shared by ``app.mcp_tools`` and ``app.mcp_server_extra``:

- ``perfos_find_ads``      -> FindRequest  -> FindResponse   (discovery FIND stage)
- ``perfos_score_winners`` -> ScoreRequest -> ScoreResponse  (SCORE stage)
- ``perfos_run_loop``      -> LoopRequest  -> LoopResponse   (full closed loop)

Reuses the canonical discovery models (``AdRecord``, ``WinnerSignal``) instead
of redefining field names. Pure data models only — no I/O; mock-safe by default.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.discovery.schemas import AdRecord, WinnerSignal


class FindRequest(BaseModel):
    """Request body for ``perfos_find_ads``."""

    model_config = ConfigDict(extra="forbid")

    persona: str = Field(
        default="saas",
        description="Target persona key from app.discovery.score.persona_fit.PERSONA_MAP.",
    )
    channels: list[str] | None = Field(
        default=None,
        description="Restrict collection to these platforms; None = all mapped channels.",
    )


class ScoreRequest(BaseModel):
    """Request body for ``perfos_score_winners``."""

    model_config = ConfigDict(extra="forbid")

    persona: str = Field(default="saas")
    channels: list[str] | None = None
    top_n: int | None = Field(
        default=None,
        ge=1,
        description="Keep only the best N winner signals after scoring.",
    )


class LoopRequest(BaseModel):
    """Request body for ``perfos_run_loop``."""

    model_config = ConfigDict(extra="forbid")

    persona: str = Field(default="saas")
    channels: list[str] | None = None
    dry_run: bool = Field(
        default=True,
        description="Dry-run never launches creatives or touches live ad accounts.",
    )


class FindResponse(BaseModel):
    """Competitor ads normalized by the FIND stage."""

    persona: str
    ads: list[AdRecord] = Field(default_factory=list)


class ScoreResponse(BaseModel):
    """Winner signals emitted by the SCORE stage."""

    persona: str
    winners: list[WinnerSignal] = Field(default_factory=list)


class LoopResponse(BaseModel):
    """Summary of one closed-loop run: find->score->create->launch->track->double_down."""

    persona: str
    dry_run: bool = True
    stage_counts: dict[str, int] = Field(
        default_factory=dict,
        description="Items processed per LOOP_STAGES stage.",
    )
    summary: dict[str, Any] | None = Field(
        default=None,
        description="Raw orchestrator payload preserved for richer clients.",
    )
