"""Adapter to cxbxmxcx/commercial-creator (MIT) — spend-gated video-commercial MCP.

commercial-creator turns a product description into a finished video ad via
intake -> brief -> script -> shots -> storyboard -> animatic -> Seedance video
generation. Its own MCP surface already keeps the spend gate: staging video
jobs only returns a dollar estimate; a separate approval call moves money.

This adapter preserves that gate end-to-end for PerfOS:

* ``stage_video_batch`` never costs anything — it returns the estimate.
* ``approve_video_jobs`` is the ONLY spending method. It refuses unless an
  explicit approver is named AND the estimate fits inside the project's
  remaining budget cap (mirrors PerfOS policy vocabulary: allow/block).
* In MOCK_MODE (PerfOS default, no keys, no local server) every call is served
  from deterministic in-memory state — zero network, zero LLM, zero spend.
"""

from __future__ import annotations

import os
import uuid
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.core.config import settings

# Upstream defaults (README): typical draft-tier cost $10-20 per 30s spot,
# Seedance dominating. Deterministic rates keep mock aggregates reproducible.
_DRAFT_USD_PER_SECOND = 0.50   # 30s -> $15.00 (mid of the documented range)
_FINAL_USD_PER_SECOND = 1.00   # 1080p final tier
_DEFAULT_BASE_URL = "http://127.0.0.1:8700"


class CommercialBrief(BaseModel):
    """Minimal creative brief accepted by the pipeline intake.

    app.create.brief (winner -> brief) produces richer payloads later; this
    subset is all commercial-creator needs to start a project.
    """

    title: str
    description: str
    target_length_s: int = Field(default=30, ge=15, le=60)
    budget_cap_usd: float = Field(default=25.0, gt=0)
    tier: str = "draft"  # draft | final


def estimate_cost_usd(target_length_s: int = 30, tier: str = "draft") -> float:
    """Deterministic pre-spend estimate, matching the documented cost band."""
    rate = _FINAL_USD_PER_SECOND if tier == "final" else _DRAFT_USD_PER_SECOND
    return round(rate * target_length_s, 2)


def check_budget(
    estimate_usd: float, spent_usd: float, cap_usd: float
) -> dict[str, Any]:
    """Gate an estimate against the remaining project budget cap.

    Returns a policy-style decision dict (allow/block + reasons), same shape
    as app.agents.policy.evaluate so callers treat both gates identically.
    """
    reasons: list[str] = []
    if estimate_usd <= 0:
        reasons.append("non_positive_estimate")
    remaining = round(cap_usd - spent_usd, 2)
    if estimate_usd > remaining:
        reasons.append("budget_cap_exceeded")
    decision = "block" if reasons else "allow"
    return {
        "decision": decision,
        "reasons": reasons or ["passed_budget_checks"],
        "estimate_usd": estimate_usd,
        "spent_usd": spent_usd,
        "cap_usd": cap_usd,
        "remaining_usd": remaining,
    }


def _mock_mode() -> bool:
    """Mock when PerfOS runs mocked or when no commercial-creator URL is set."""
    url = os.getenv("COMMERCIAL_CREATOR_URL", "").strip()
    return bool(settings.MOCK_MODE) or not url


class CommercialCreatorClient:
    """Thin client over commercial-creator's REST API (/api/v1).

    Mirrors the tool paths of its bundled mcp_server.py. Spend-gating lives in
    :meth:`stage_video_batch` (free) vs :meth:`approve_video_jobs` (gated).
    """

    def __init__(self, base_url: str | None = None, timeout_s: float = 120.0):
        env_url = os.getenv("COMMERCIAL_CREATOR_URL", "").strip()
        self.base_url = (base_url or env_url or _DEFAULT_BASE_URL).rstrip("/")
        self.timeout_s = timeout_s
        self._mock_projects: dict[str, dict[str, Any]] = {}

    # ------------------------------------------------------------------ core

    def _request(self, method: str, path: str, body: dict | None = None) -> Any:
        resp = httpx.request(
            method,
            self.base_url + "/api/v1" + path,
            json=body,
            timeout=self.timeout_s,
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"{method} {path} -> {resp.status_code}: {resp.text[:300]}")
        return resp.json() if resp.text else {}

    # ------------------------------------------------------- project lifecycle

    def create_project(self, brief: CommercialBrief) -> dict:
        """Create a project with a budget cap. Mock-safe, never spends."""
        if _mock_mode():
            slug = f"cc-{uuid.uuid4().hex[:8]}"
            self._mock_projects[slug] = {
                "name": brief.title,
                "description": brief.description,
                "target_length_s": brief.target_length_s,
                "budget_cap_usd": brief.budget_cap_usd,
                "tier": brief.tier,
                "spend_usd": 0.0,
                "staged_estimate_usd": None,
            }
            return {"slug": slug, **self._mock_projects[slug]}
        return self._request(
            "POST",
            "/projects",
            {
                "name": brief.title,
                "target_length_s": brief.target_length_s,
                "budget_cap_usd": brief.budget_cap_usd,
            },
        )

    def set_intake(self, slug: str, description: str) -> dict:
        """Set product/brief intake text (planning input, costs nothing)."""
        if _mock_mode():
            p = self._require_mock(slug)
            p["description"] = description
            return {"ok": True}
        return self._request("PUT", f"/projects/{slug}/intake", {"description": description})

    def get_project(self, slug: str) -> dict:
        if _mock_mode():
            return dict(self._require_mock(slug))
        return self._request("GET", f"/projects/{slug}")

    # ------------------------------------------------------------ planning steps

    def run_step(self, slug: str, step: str, params: dict | None = None) -> dict:
        """Run one planning/rendering step (brief, script, shots, keyframes,
        animatic, judge, assemble, audio_mix, variants).

        Deliberately excludes generate-video: staging/spending goes through the
        dedicated gated methods below.
        """
        forbidden = {"generate-video", "generate_video"}
        if step in forbidden:
            raise ValueError("video generation must use stage_video_batch/approve_video_jobs")
        if _mock_mode():
            self._require_mock(slug)
            return {"state": "completed", "step": step, "mock": True}
        return self._request("POST", f"/projects/{slug}/generate/{step}", {"params": params or {}})

    # ------------------------------------------------------------- SPEND GATE

    def stage_video_batch(self, slug: str, row_index: int | None = None) -> dict:
        """Stage video generation jobs WITHOUT spending; returns the estimate.

        Nothing generates until approve_video_jobs — surface total_estimate_usd
        to the human first.
        """
        if _mock_mode():
            p = self._require_mock(slug)
            estimate = estimate_cost_usd(p["target_length_s"], p["tier"])
            p["staged_estimate_usd"] = estimate
            return {"staged": True, "total_estimate_usd": estimate}
        body: dict[str, Any] = {}
        if row_index is not None:
            body["row_index"] = row_index
        return self._request("POST", f"/projects/{slug}/generate-video", body)

    def approve_video_jobs(
        self, slug: str, approved_by: str | None = None
    ) -> dict:
        """THE ONLY METHOD THAT SPENDS.

        Two gates, both required:
          1. an explicitly named approver (no anonymous money movement);
          2. the last staged estimate must fit the remaining budget cap.
        Otherwise returns a block/needs_approval decision and spends nothing.
        """
        project = self.get_project(slug)
        spent = float(project.get("spend_usd") or 0.0)
        cap = float(project.get("budget_cap_usd") or 0.0)

        if _mock_mode():
            estimate = (self._require_mock(slug).get("staged_estimate_usd")) or 0.0
        else:
            estimate = float(project.get("staged_estimate_usd") or 0.0)

        if not approved_by:
            return {
                "decision": "needs_approval",
                "reasons": ["missing_approver"],
                "estimate_usd": estimate,
                "spent_usd": spent,
            }
        verdict = check_budget(estimate, spent, cap)
        if verdict["decision"] == "block":
            return verdict

        if _mock_mode():
            p = self._require_mock(slug)
            p["spend_usd"] = round(spent + estimate, 2)
            p["staged_estimate_usd"] = None
            return {
                "decision": "allow",
                "reasons": ["approved_by:" + approved_by],
                "jobs_approved": True,
                "spend_usd": p["spend_usd"],
            }
        result = self._request("POST", f"/projects/{slug}/jobs/approve-all")
        return {
            "decision": "allow",
            "reasons": ["approved_by:" + approved_by],
            **(result or {}),
        }

    # ------------------------------------------------------------------ helpers

    def _require_mock(self, slug: str) -> dict[str, Any]:
        try:
            return self._mock_projects[slug]
        except KeyError as exc:
            raise KeyError(f"unknown mock project slug: {slug}") from exc


def generate_commercial(
    brief: CommercialBrief,
    approved_by: str | None = None,
    client: CommercialCreatorClient | None = None,
) -> dict:
    """Convenience walk-through: create -> intake -> stage. NEVER auto-spends.

    Stops right before the gate and returns the estimate plus the exact call
    needed to proceed. Pass ``approved_by`` to cross the spend gate.
    """
    client = client or CommercialCreatorClient()
    project = client.create_project(brief)
    slug = project["slug"]
    client.set_intake(slug, brief.description)
    staged = client.stage_video_batch(slug)
    estimate = float(staged.get("total_estimate_usd") or 0.0)
    if approved_by is None:
        return {
            "slug": slug,
            "state": "awaiting_approval",
            "total_estimate_usd": estimate,
            "next": "approve_video_jobs(slug, approved_by=...)",
        }
    verdict = client.approve_video_jobs(slug, approved_by=approved_by)
    return {"slug": slug, **verdict}
