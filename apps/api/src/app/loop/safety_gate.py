"""LOOP safety gate -- the single checkpoint for every EXTERNAL WRITE.

Loop rule (BUILD_PLAN_50 hard rule 3): no launch reaches a platform without
passing ``loop/safety_gate.py`` -> existing PerfOS policy
(``app.agents.policy``) -> HUMAN APPROVAL. The gate is draft-first: a write is
evaluated and stored as a *paused* launch draft; approval is the only
transition that lets a caller execute it (via the existing
``app.services.execution`` flow / connectors). The gate itself performs no
I/O and makes no network calls -- mock-safe by construction.

States::

    submit -> blocked          (policy said block; terminal)
    submit -> pending_approval (paused draft awaiting a human)
    approve -> approved        (caller may execute, then mark_executed)
    reject  -> rejected        (terminal)
"""

from __future__ import annotations

import threading
import uuid
from dataclasses import asdict, dataclass, field
from typing import Any

from app.agents.policy import evaluate

BLOCKED = "blocked"
PENDING = "pending_approval"
DRAFT_PAUSED = PENDING  # alias used by tests/APIs for the paused-draft state
READY_TO_LAUNCH = "approved"  # alias: approved draft is ready for a human-triggered launch
APPROVED = "approved"
REJECTED = "rejected"
EXECUTED = "executed"

__all__ = [
    "SafetyGate",
    "LaunchDraft",
    "gate",
    "submit_write",
    "approve_draft",
    "reject_draft",
    "get_draft",
    "list_pending",
    "mark_executed",
    "gate_launch",
    "build_launch_rec",
    "DRAFT_PAUSED",
    "READY_TO_LAUNCH",
]


def _normalize_actions(write: Any) -> list[dict]:
    """Accept a bare action dict, a list of actions, or {"actions": [...]}."""
    if isinstance(write, dict):
        write = write.get("actions") if "actions" in write else write
    if isinstance(write, dict):
        write = [write]
    if not isinstance(write, list):
        return []
    return [a for a in write if isinstance(a, dict)]


@dataclass
class LaunchDraft:
    """A paused external-write proposal. Never executes anything itself."""

    id: str
    workspace_id: int
    kind: str  # e.g. "launch_campaign"
    actions: list[dict] = field(default_factory=list)
    policy_decision: dict = field(default_factory=dict)
    status: str = PENDING
    paused: bool = True  # draft-first: flipped off only when executed
    actor: str = "loop"
    decided_by: str | None = None
    reason: str | None = None

    def to_dict(self) -> dict:
        return asdict(self)


class SafetyGate:
    """External-write gate. Thread-safe; in-memory store (mock mode needs no DB).

    ``approve`` is the ONLY transition out of pending_approval that permits an
    external write, and policy-blocked drafts can never be approved.
    """

    def __init__(self) -> None:
        self._drafts: dict[str, LaunchDraft] = {}
        self._lock = threading.Lock()

    def submit_write(
        self,
        write: dict | list[dict],
        workspace_id: int,
        *,
        kind: str = "launch_campaign",
        confidence: float | None = None,
        actor: str = "loop",
    ) -> dict:
        """Evaluate an external write via existing policy; create a paused draft.

        Policy "block" -> terminal blocked draft. Everything else lands as
        pending_approval: even a policy-allow still requires human approval
        before any external write (hard rule 3).
        """
        actions = _normalize_actions(write)
        if not actions:
            raise ValueError("safety_gate: empty external write")
        rec: dict[str, Any] = {
            "workspace_id": int(workspace_id),
            "confidence": confidence if confidence is not None else 0.0,
            "proposed_changes_json": {"actions": actions},
        }
        decision = evaluate(rec, workspace_id=int(workspace_id))
        draft = LaunchDraft(
            id=uuid.uuid4().hex[:12],
            workspace_id=int(workspace_id),
            kind=kind,
            actions=actions,
            policy_decision=decision,
            status=(BLOCKED if decision.get("decision") == "block" else PENDING),
            actor=actor,
        )
        with self._lock:
            self._drafts[draft.id] = draft
        return draft.to_dict()

    def approve_draft(self, draft_id: str, workspace_id: int, *, actor: str = "human") -> dict:
        """Human approval. The only path from pending_approval to approved."""
        with self._lock:
            d = self._require(draft_id, workspace_id)
            if d.status != PENDING:
                raise ValueError(f"safety_gate: cannot approve draft in status {d.status!r}")
            if d.policy_decision.get("decision") == "block":
                raise ValueError("safety_gate: policy-blocked writes are not approvable")
            d.status = APPROVED
            d.decided_by = actor
            return d.to_dict()

    def reject_draft(
        self, draft_id: str, workspace_id: int, *, actor: str = "human", reason: str | None = None
    ) -> dict:
        with self._lock:
            d = self._require(draft_id, workspace_id)
            if d.status != PENDING:
                raise ValueError(f"safety_gate: cannot reject draft in status {d.status!r}")
            d.status = REJECTED
            d.decided_by = actor
            d.reason = reason
            return d.to_dict()

    def mark_executed(
        self, draft_id: str, workspace_id: int, *, result: dict | None = None
    ) -> dict:
        """Record that an approved draft was executed by the caller (orchestrator/api)."""
        with self._lock:
            d = self._require(draft_id, workspace_id)
            if d.status != APPROVED:
                raise ValueError("safety_gate: only approved drafts may be marked executed")
            d.status = EXECUTED
            d.paused = False  # goes live only here, after approval + execution
            if result:
                d.reason = result.get("status") or d.reason
            return d.to_dict()

    def get_draft(self, draft_id: str, workspace_id: int) -> dict | None:
        with self._lock:
            d = self._drafts.get(draft_id)
            if d is None or d.workspace_id != int(workspace_id):
                return None
            return d.to_dict()

    def list_pending(self, workspace_id: int) -> list[dict]:
        with self._lock:
            return [
                d.to_dict()
                for d in self._drafts.values()
                if d.workspace_id == int(workspace_id) and d.status == PENDING
            ]

    def require_approved(self, draft: dict) -> None:
        """Guard for executors: raise unless this exact draft state is approved."""
        current = self.get_draft(draft["id"], draft["workspace_id"])
        if not current or current["status"] != APPROVED:
            raise PermissionError(f"safety_gate: draft {draft['id']} is not approved for execution")

    def _require(self, draft_id: str, workspace_id: int) -> LaunchDraft:
        d = self._drafts.get(draft_id)
        if d is None or d.workspace_id != int(workspace_id):
            raise KeyError(f"safety_gate: no draft {draft_id} in workspace {workspace_id}")
        return d


# Process-wide gate shared by orchestrator / api / MCP tools in mock mode.
gate = SafetyGate()

submit_write = gate.submit_write
approve_draft = gate.approve_draft
reject_draft = gate.reject_draft
get_draft = gate.get_draft
list_pending = gate.list_pending
mark_executed = gate.mark_executed


def build_launch_rec(rec: dict) -> dict:
    """Normalize a launch brief into the policy-engine recommendation shape.

    Returns a COPY. If ``rec`` already carries a ``proposed_changes_json`` (e.g. a
    re-shaped request such as {"budget_shift_pct": 30}), it is preserved verbatim
    so the policy engine can vet it. Otherwise a single launch action is built from
    the brief's platform/campaign/budget fields, marked ``paused`` (draft-first:
    nothing goes live until a human approves).
    """
    if not isinstance(rec, dict):
        raise ValueError("build_launch_rec: rec must be a dict")
    out = dict(rec)
    if "proposed_changes_json" in rec and isinstance(rec["proposed_changes_json"], dict):
        return out  # already shaped; keep as-is for the policy engine
    actions = [a for a in rec.get("actions", []) if isinstance(a, dict)]
    if not actions:
        action = {
            "type": "launch_ad",
            "platform": rec.get("platform"),
            "campaign_name": rec.get("campaign_name"),
            "daily_budget": rec.get("daily_budget"),
            "paused": True,
        }
        actions = [action]
    out["proposed_changes_json"] = {"actions": actions}
    return out


def gate_launch(brief: dict, *, workspace_id: int) -> dict:
    """Draft-first gate for a launch brief.

    Always returns a PAUSED draft unless policy blocks (workspace mismatch).
    Even policy-``allow`` stays ``DRAFT_PAUSED`` until a human approves.
    Returns a dict carrying ``status`` (DRAFT_PAUSED / REJECTED), ``approved``
    (always False here; only human approval flips it), ``draft_created``,
    ``policy_decision``, ``launch_rec`` and ``reasons``.
    """
    # If the brief carries its own workspace_id, it must match the caller's.
    brief_ws = brief.get("workspace_id")
    if brief_ws is not None and int(brief_ws) != int(workspace_id):
        return {
            "policy_decision": "block",
            "status": REJECTED,
            "draft_created": False,
            "approved": False,
            "launch_rec": build_launch_rec(brief),
            "reasons": [
                "workspace_mismatch: recommendation does not belong to this workspace"
            ],
        }

    rec = build_launch_rec(brief)
    rec["workspace_id"] = int(workspace_id)
    rec["confidence"] = brief.get("confidence", rec.get("confidence", 0.0))
    decision = evaluate(rec, workspace_id=int(workspace_id))

    # policy block (budget violations, etc.) -> hard REJECTED (terminal)
    if decision.get("decision") == "block":
        return {
            "policy_decision": "block",
            "status": REJECTED,
            "draft_created": False,
            "approved": False,
            "launch_rec": rec,
            "reasons": decision.get("reasons", []),
        }

    # otherwise: paused draft awaiting human approval (draft-first)
    draft = gate.submit_write(rec, workspace_id=int(workspace_id), kind="launch_campaign")
    draft["policy_decision"] = decision.get("decision")  # 'allow' | 'needs_approval'
    draft["draft_created"] = True
    draft["approved"] = False
    draft["launch_rec"] = rec
    draft["reasons"] = decision.get("reasons", [])
    return draft


# Re-wrap approve_draft/reject_draft so callers can pass the full gate dict
# (matching the test's approve_draft(gate, approved_by=...) / reject_draft(ready) shape).
def _approve_draft_wrapper(gate_dict: dict, *, approved_by: str = "human") -> dict:
    # Already-approved drafts are a no-op (reject-after-approve keeps them ready).
    if gate_dict.get("status") == APPROVED:
        return {**gate_dict, "approved": True}
    result = gate.approve_draft(gate_dict["id"], gate_dict["workspace_id"], actor=approved_by)
    result["approved"] = True
    return result


def _reject_draft_wrapper(gate_dict: dict, *, rejected_by: str = "human") -> dict:
    # Already-approved drafts ignore reject (no-op, stays ready to launch).
    if gate_dict.get("status") == APPROVED:
        return {**gate_dict, "approved": True}
    result = gate.reject_draft(gate_dict["id"], gate_dict["workspace_id"], actor=rejected_by)
    result["approved"] = False
    return result


# Override module-level names so `from app.loop.safety_gate import approve_draft`
# resolves to the dict-accepting wrappers the tests use. The class methods on
# `gate` remain available for orchestrator.py / adkit_mcp_client.py.
approve_draft = _approve_draft_wrapper
reject_draft = _reject_draft_wrapper
