# PerfOS Architecture

PerfOS is a two-tier system: a FastAPI backend that owns data, reconciliation,
and agent safety, and a Next.js console for humans. Everything in the MVP runs
offline in mock mode against SQLite.

```
┌────────────────────────────────────────────────────────────┐
│  Console (web/) — Next.js 14 App Router + Tailwind         │
│  Overview · Accounts · Recommendations · Experiments · Agents│
└───────────────────────────┬────────────────────────────────┘
                            │ /api (proxy, X-Workspace-Id)
┌───────────────────────────▼────────────────────────────────┐
│  API layer — app.main + app.api (FastAPI)                  │
│  auth (app.core.security) · deps (app.core.deps)           │
├────────────────────────────────────────────────────────────┤
│  Agent layer — app.agents                                  │
│  recommend.py → policy.py → orchestrator.py                │
│  services: briefing · execution · audit                    │
├────────────────────────────────────────────────────────────┤
│  Attribution layer — app.attribution                       │
│  reconcile.py (claimed vs actual) · attribute.py           │
├────────────────────────────────────────────────────────────┤
│  Connector layer — app.connectors                          │
│  base.BaseConnector · google · meta · revenue · registry   │
│  mock backends in app.mock (MOCK_MODE=true)                │
├────────────────────────────────────────────────────────────┤
│  Data layer — app.models (SQLAlchemy 2.0)                  │
│  app/schemas.py (Pydantic v2) · SQLite local / Postgres via env │
└────────────────────────────────────────────────────────────┘
```

## Layers

### 1. Data layer (`app.models`, `app.schemas`)

Canonical entities with fixed field names across the whole build:
`Organization, Workspace, AdAccount, Campaign, AdSet, Ad, Spend, Revenue,
AttributionEvent, Recommendation, Approval, Experiment, Outcome,
ConnectedAgent, AuditLog`.

Two facts matter more than the rest:

- **`Spend` rows are platform-CLAIMED numbers.** `Revenue` rows
  (source `shopify`/`stripe`) are the **source of truth**.
- Every mutating action flows through `Recommendation` → `Approval` →
  `Outcome`, with `AuditLog` recording actor, action, and rollback payload.

SQLite for local/mock mode; Postgres reachable later by swapping the env
connection string. Sessions come from `sqlalchemy.orm`.

### 2. Connector layer (`app.connectors`)

One interface for every platform:

```python
class BaseConnector(ABC):
    platform: str
    def fetch_campaigns(self) -> list[Campaign]
    def fetch_metrics(self, date_start, date_end) -> list[Spend]
    def set_budget(self, campaign_id, new_daily_budget) -> dict
    def pause_campaign(self, campaign_id) -> dict
```

- `google.py`, `meta.py`: spend-side connectors. Real adapters are stubs
  raising `NotImplementedError`.
- `revenue.py`: revenue-side connector (Shopify/Stripe).
- When `MOCK_MODE=true`, connectors read deterministic fixtures from
  `app.mock`; otherwise they would hit live APIs through the same interface.
- `registry.py` resolves platform → connector instance.

The mock scenario is contractual: Google $12k spend / $60k claimed value;
Meta $8k / $44k; Shopify actual revenue $78k on $20k total spend ⇒ 33%
over-count, blended MER 3.9x.

### 3. Attribution layer (`app.attribution`) — pure functions

- **`reconcile.py`** compares per-platform claimed value against actual
  revenue and returns one dict: `total_spend`, `platform_claimed_value`,
  `actual_revenue`, `blended_mer`, `per_channel[]`, `over_count_value`,
  `over_count_pct`, `tracking_integrity_flag` (true when over-count > 15%).
- **`attribute.py`** allocates *actual* revenue to channels by spend-weighted
  share, emitting confidence plus a human-readable rationale. Conservative by
  design: platform self-reported conversions are never echoed back as truth.

Both are pure functions over `(list[Spend], list[Revenue])` — fully unit
tested, no I/O.

### 4. Agent layer (`app.agents`, `app.services`) — rules + guardrails

- **`recommend.py`**: turns reconcile + attribute output into structured
  `Recommendation` objects (type, reason, evidence JSON, expected impact,
  confidence, risk tier, proposed changes, rollback plan).
- **`policy.py`** — enforced in code, not prompt:
  - budget change > 25% ⇒ block
  - cross-workspace recommendation ⇒ block
  - confidence < 0.6 ⇒ requires approval (stays pending)
  - every executed action ⇒ `AuditLog` entry carrying the rollback payload
  Returns `{decision: "allow" | "block" | "needs_approval", reasons: []}`.
- **`orchestrator.py`** sequences recommend → policy → execution → audit.
- **Services**: `briefing.py` composes the daily briefing
  (`{kpis, changes[], recommendations[], narrative}` — templated text, no LLM);
  `execution.py` applies approved changes through connectors (mock updates
  in-memory); `audit.py` writes the immutable trail.

Financial-safety rule: no external LLM calls in the MVP. AI = deterministic
rules + templated briefing. A documented `llm_hook` stub exists for future
narrative upgrades only.

### 5. API layer (`app.main`, `app.api`, `app.core`)

FastAPI under the `/api` prefix. All list endpoints are workspace-scoped via
the `X-Workspace-Id` header. Auth is deliberately lightweight (`POST
/api/auth/token`, demo credentials `demo`/`demo`) — no heavy auth deps.
Pydantic v2 response models on every route. Full endpoint table:
[api.md](api.md).

### 6. Console (`web/`) — Next.js 14 App Router

An operator console, sidebar + topbar layout (`(dashboard)/layout.tsx`) with:

- **Overview** — KPI cards (Spend, Revenue, Blended ROAS, Over-count %),
  the three-changes block, recommendations preview. First screen.
- **Accounts** — connect/manage Google/Meta/Shopify (mock connect).
- **Recommendations** — evidence, approve/reject, diff, status.
- **Experiments** — history table + create.
- **Agents** — register/dispatch ChatGPT/Claude/opencode agents
  (`ConnectedAgent`).

API access goes through `web/lib/api.ts`, which hits `/api` behind the
Next.js proxy configured in `next.config`. UI primitives are minimal
shadcn-style components in `web/components/ui` — no extra UI library.

## The financial-safety loop

Every mutation — no exceptions — travels this path, enforced in
`app/agents/policy.py` + `app/services/execution.py`:

```
LLM/engine → Recommendation → Structured Action → Policy Engine → Risk Check →
Human Approval → Execution (mock) → Audit Log (with rollback)
```

Validated, logged, attributable, reversible:

- **Recommendation** (`recommend.py`) is structured data — type, reason,
  evidence JSON, confidence, risk tier, proposed changes, rollback plan.
- **Policy Engine / Risk Check** (`policy.py`) blocks budget changes > 25%,
  rejects cross-workspace actions, and holds anything with confidence < 0.6
  for approval. Enforced in code, not prompt.
- **Human Approval** is a first-class state machine: pending → approved /
  rejected; only approved actions reach execution.
- **Execution** (`execution.py`) applies the change through the platform
  connector (in-memory in mock mode) and writes an `Outcome` row.
- **Audit Log** (`audit.py`) appends an immutable record carrying
  `rollback_json` — every executed action can be undone.

## Request flow (happy path)

1. Seed loads the mock scenario into SQLite (`scripts/seed.py`).
2. Console fetches `/api/reconcile` → engine flags the 33% over-count.
3. `/api/briefing` renders KPIs + narrative from reconcile/attribute output.
4. `recommend.py` proposes e.g. *"Meta over-credited by 33%; reallocate 10%
   to Google pending holdout"* (confidence 0.7, risk medium).
5. Human approves → `policy.py` evaluates → `execution.py` applies via
   connector (mock) → `audit.py` logs action + rollback payload.
6. `Outcome` rows record before/after metrics for the decision.

## Testing & CI

- Backend: pure-logic units (reconcile, attribute, recommend, policy) are
  covered by pytest under `tests/`.
- Frontend: `tsc --noEmit` gates types; `next build` gates compilation.
- CI (`.github/workflows/ci.yml`) runs both on every push.
