# PerfOS — Reverse Engineering

PerfOS is an AI Performance Marketing OS built from a 20-agent parallel `opencode`
swarm on the `opencode-go/ox-alpha-free` model. This document records what exists,
how it fits together, and what is incomplete — the map the completion swarm needs.

## One-line thesis
"Your AI performance marketer." Connect Google + Meta + Shopify, see what ACTUALLY
happened to your money (not what the platforms claim), get a safe, approval-gated
recommendation, and execute it against mock (later real) ad accounts.

## Layered architecture (as built)
```
Next.js 14 (web/)  ──/api proxy──▶  FastAPI (app/)  ──▶  SQLAlchemy + SQLite (mock mode)
   dashboard UI                                      │
                                                      ├─ connectors/   (google, meta, revenue = Shopify source-of-truth)
                                                      ├─ attribution/  (reconcile = MOAT, attribute)
                                                      ├─ agents/       (recommend, policy = safety, orchestrator)
                                                      ├─ services/     (briefing, execution, audit)
                                                      └─ models/       (ORM: Workspace, AdAccount, Spend, Revenue, Recommendation, ...)
```

## Module inventory (file → responsibility)
- `app/core/config.py` — pydantic-settings; MOCK_MODE, DATABASE_URL, SECRET_KEY.
- `app/core/db.py` — SQLAlchemy engine/session/Base/init_db.
- `app/models/*` — ORM. Key: `Spend` (platform-CLAIMED), `Revenue` (SOURCE OF TRUTH),
  `Recommendation`, `Approval`, `Experiment`, `Outcome`, `ConnectedAgent`, `AuditLog`.
- `app/mock/dataset.py` — in-memory demo: Google spend 12000/claimed 60000, Meta 8000/44000,
  Shopify actual 78000. Sums EXACTLY to spec.
- `app/connectors/base.py` + `google.py` + `meta.py` + `revenue.py` + `registry.py` —
  per-platform connector; registry lazy-imports by platform string.
- `app/attribution/reconcile.py` — **MOAT**. Pure fn: platform-claimed vs actual;
  outputs blended_mer, over_count_value/pct, tracking_integrity_flag (>15%).
- `app/attribution/attribute.py` — spend-weighted allocation of ACTUAL revenue (explainable).
- `app/agents/recommend.py` — emits structured Recommendation dicts when over_count>15%.
- `app/agents/policy.py` — **SAFETY (enforced in code)**. budget change >25% → block;
  workspace mismatch → block; confidence <0.6 → needs_approval; else allow.
- `app/agents/orchestrator.py` — run_analysis: reconcile→attribute→recommend, with
  defensive fallbacks.
- `app/services/briefing.py` — daily-briefing payload {kpis, changes, recommendations, narrative}.
- `app/services/execution.py` — applies approved recs via connectors (mock), writes AuditLog
  with rollback_json. Handles set_budget/pause/reallocate_budget.
- `app/services/audit.py` — immutable AuditLog rows.
- `app/api/routes.py` — FastAPI: /health, /auth/token, /workspaces, /accounts, /reconcile,
  /briefing, /recommendations (+/generate), /approve, /reject, /experiments, /outcomes,
  /agents (+/dispatch).
- `web/` — Next.js 14: (dashboard) layout (sidebar shell), overview (briefing), accounts,
  recommendations, experiments, agents (ChatGPT/Claude/opencode console). `web/lib/api.ts` client.

## The financial-safety loop (brief Phase 18/27)
```
LLM/engine → Recommendation → Structured Action → Policy Engine → Risk Check →
Human Approval → Execution (mock) → Audit Log (with rollback)
```
Every mutation: validated, logged, attributable, reversible. Enforced in `policy.py` + `execution.py`.

## Status at reverse-engineering time
DONE:
- 53 backend tests pass.
- Seed matches spec exactly (blended 3.9x, over-count 33.3%, flag True).
- /reconcile, /briefing, /auth/token, /recommendations/generate, /agents register+dispatch all work.
PATCHED (last turn, NOT yet re-verified): expected_impact column float→string; execution
_normalize flat-dict handling; reallocate_budget as first-class reversible mock action.
INCOMPLETE:
- Frontend not booted/verified (`next build` not run; api.ts ↔ routes consistency unconfirmed).
- No Outcome rows written on execution (endpoint exists, nothing populates it).
- SQLAlchemy null-PK warning in execution._platform_for when campaign_id is None.
- Docker verified only by file presence, not a real `docker compose up` (Docker absent on host).
- No end-to-end integration test (TestClient) for the full loop.
- Policy/execution/audit unit tests thin.
- Landing page / docs/ARCHITECTURE / README quickstart present but unverified.

## How to run (local, mock, zero credentials)
```
cd PerfOS
python3 -m venv .venv && . .venv/bin/activate
pip install -e ".[postgres]"
export MOCK_MODE=true DATABASE_URL=sqlite:///./perfos.db
python scripts/seed.py
uvicorn app.main:app --port 8000 &
cd web && npm install && npm run dev   # http://localhost:3000 -> /overview
```
