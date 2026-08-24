# BUILD CONTRACT — PerfOS (AI Performance Marketing OS)

Shared spec for the 20-agent parallel build. Every agent MUST read this file first and
adhere to it so the pieces integrate. Do NOT deviate from field names, API paths, or the
mock scenario. Use ONLY the model `opencode-go/ox-alpha-free` (no other model).

## Tech stack (fixed)
- Backend: Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, uvicorn. SQLite for local
  (mock mode), Postgres connection string via env for later. Use `sqlalchemy.orm` sessions.
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS. No extra UI lib required;
  build minimal shadcn-style components in `web/components/ui`.
- No external LLM calls in MVP. AI = deterministic rules + templated briefing (financial
  safety). Leave a documented `llm_hook` stub only.
- All code must pass `pytest` (backend) / `tsc --noEmit` + `next build` (frontend).

## Canonical data model (SQLAlchemy, module app.models)
Fields per entity (use these exact names):
- Organization(id, name, created_at)
- Workspace(id, org_id, name, currency="USD", created_at)
- AdAccount(id, workspace_id, platform["google","meta","shopify"], platform_account_id,
  name, status["active","paused"], connected_at)
- Campaign(id, ad_account_id, platform, platform_campaign_id, name, status, daily_budget,
  created_at)
- AdSet(id, campaign_id, name, status)
- Ad(id, ad_set_id, name, creative_id, status)
- Spend(id, workspace_id, ad_account_id, campaign_id, date, impressions, clicks, cost,
  conversions, conversion_value)  # platform-CLAIMED numbers
- Revenue(id, workspace_id, source["shopify","stripe"], order_id, date, amount,
  customer_id, is_new_customer)  # SOURCE OF TRUTH
- AttributionEvent(id, workspace_id, date, channel, attributed_revenue, model)
- Recommendation(id, workspace_id, type, reason, evidence_json, expected_impact,
  confidence, risk["low","medium","high"], proposed_changes_json, rollback_json, status
  ["pending","approved","rejected","executed","failed"], created_at)
- Approval(id, recommendation_id, actor, decision, note, created_at)
- Experiment(id, workspace_id, hypothesis, control_json, variant_json, primary_metric,
  status, result_json, created_at)
- Outcome(id, recommendation_id, metric, before, after, delta, recorded_at)
- ConnectedAgent(id, workspace_id, provider["chatgpt","claude","opencode","openai",
  "anthropic"], name, status, config_json, last_run_at)  # manage ChatGPT/Claude/opencode
- AuditLog(id, workspace_id, actor, action, target, payload_json, created_at)

## Mock scenario (MUST match across backend + frontend)
Demo workspace "Demo DTC Brand", currency USD:
- Google: spend 12000, claimed conversions 600, claimed conversion_value 60000 (claimed ROAS 5.0)
- Meta: spend 8000, claimed conversions 500, claimed conversion_value 44000 (claimed ROAS 5.5)
- Shopify actual revenue: 78000 (orders 950, source of truth)
- Platform sum claimed value = 104000 vs actual 78000 => over-count 26000 (33%) => FLAG (>15%)
- Blended MER = 78000 / 20000 = 3.9x  (the honest number)
- Seed must produce these exact aggregates so dashboard + reconciliation agree.

## Connector interface (app.connectors.base)
```
class BaseConnector(ABC):
    platform: str
    def fetch_campaigns(self) -> list[Campaign]
    def fetch_metrics(self, date_start, date_end) -> list[Spend]
    def set_budget(self, campaign_id, new_daily_budget) -> dict   # mock: updates in-memory
    def pause_campaign(self, campaign_id) -> dict
```
Mock backends live in app.mock; connectors read from mock when MOCK_MODE=true (env). Real
adapters are stubs raising NotImplementedError behind same interface.

## Reconciliation engine (app.attribution.reconcile) — pure functions, fully tested
Inputs: list[Spend] (per platform), list[Revenue] (actual). Output dict:
```
{
  "total_spend": 20000,
  "platform_claimed_value": 104000,
  "actual_revenue": 78000,
  "blended_mer": 3.9,
  "per_channel": [{"platform":"google","spend":12000,"claimed_value":60000,
                   "claimed_roas":5.0}, {"platform":"meta",...}],
  "over_count_value": 26000,
  "over_count_pct": 33.0,
  "tracking_integrity_flag": true   # true when over_count_pct > 15
}
```

## Attribution model (app.attribution.attribute) — explainable, last-touch blended
Allocate actual revenue to channels by spend-weighted share; produce confidence + a short
human rationale string. Conservative: never claim platform self-reported numbers.

## Recommendation engine (app.agents.recommend)
From reconcile + attribute output, emit structured Recommendation objects (schema above).
Example: type="reallocate_budget", reason="Meta over-credited by 33%; reallocate 10% to
Google pending holdout", confidence=0.7, risk="medium", proposed_changes_json={...},
rollback_json={...}.

## Policy/safety engine (app.agents.policy) — enforced in code
- budget change > 25% => REJECT (return blocked reason)
- recommendation workspace_id != actor workspace => REJECT
- confidence < 0.6 => REQUIRE_APPROVAL (status stays pending)
- every executed action => AuditLog entry with rollback payload
Return dict {decision:"allow"|"block"|"needs_approval", reasons:[]}.

## API (FastAPI, prefix /api, module app.api)
All list endpoints scoped by workspace (workspace_id from auth header `X-Workspace-Id`).
Routes:
- POST /api/auth/token  (simple API-key or password login -> returns workspace token; use a
  lightweight scheme, do NOT pull heavy deps)
- GET  /api/workspaces
- GET  /api/accounts
- POST /api/accounts (connect mock google/meta/shopify)
- GET  /api/reconcile?workspace_id=  -> reconcile output
- GET  /api/briefing  -> {kpis, changes[], recommendations[], narrative}
- GET  /api/recommendations
- POST /api/recommendations/{id}/approve  -> runs policy -> execution (mock) -> audit
- POST /api/recommendations/{id}/reject
- GET  /api/experiments
- POST /api/experiments
- GET  /api/outcomes
- GET  /api/agents  (ConnectedAgent list: chatgpt/claude/opencode)
- POST /api/agents  (register a ChatGPT/Claude/opencode agent)
- POST /api/agents/{id}/dispatch  (record dispatch event, update last_run_at)
- GET  /api/health
Return JSON; Pydantic response models.

## Frontend pages (Next.js App Router, under web/app)
- `(dashboard)/layout.tsx` : sidebar (Overview, Accounts, Recommendations, Experiments,
  Agents) + topbar. This is the aicmohq-style console.
- `(dashboard)/page.tsx` : Overview / daily briefing — KPI cards (Spend, Revenue, Blended
  ROAS, Over-count %), the 3-changes block, recommendations preview. THE first screen.
- `(dashboard)/accounts` : connect/manage Google/Meta/Shopify (mock connect buttons).
- `(dashboard)/recommendations` : list, evidence, approve/reject, diff, status.
- `(dashboard)/experiments` : history table + create.
- `(dashboard)/agents` : manage ConnectedAgent rows (ChatGPT / Claude / opencode): add,
  list, dispatch. This is the "manage all things chatgpt/claude code for performance
  marketing" console.
API client in `web/lib/api.ts` hitting `/api` (proxy in next.config).

## File ownership (EXCLUSIVE — do not touch others' files)
A: pyproject.toml, docker-compose.yml, Dockerfile, .env.example, app/__init__.py,
   app/core/{config,db}.py, tests/conftest.py, pytest.ini
B: app/models/*.py (all ORM + Pydantic schemas in app/schemas.py)
C: app/mock/*.py, scripts/seed.py
D: app/connectors/google.py
E: app/connectors/meta.py
F: app/connectors/revenue.py
G: app/connectors/base.py, app/connectors/registry.py, app/connectors/__init__.py
H: app/attribution/reconcile.py  (+ tests/test_reconcile.py)
I: app/attribution/attribute.py  (+ tests/test_attribute.py)
J: app/agents/recommend.py       (+ tests/test_recommend.py)
K: app/agents/policy.py          (+ tests/test_policy.py)
L: app/agents/orchestrator.py, app/services/briefing.py
M: app/main.py, app/api/*.py, app/core/{security,deps}.py
N: app/services/execution.py, app/services/audit.py
O: web/ scaffold (package.json, tailwind, app/layout, globals, components/ui/*)
P: web/app/(dashboard)/accounts/*
Q: web/app/(dashboard)/page.tsx + overview components
R: web/app/(dashboard)/recommendations/*
S: web/app/(dashboard)/experiments/* + web/app/(dashboard)/agents/*
T: README.md, docs/*, .github/workflows/ci.yml, landing copy

## Acceptance (each agent self-checks its own isolated unit tests)
- Backend agents: `cd PerfOS && python -m pytest tests/test_<yours>.py -q` passes for pure
  logic (reconcile/attribute/recommend/policy). Do NOT run the full suite (deps land later).
- Frontend agents: `cd PerfOS/web && npx tsc --noEmit` clean for your files.
- Every agent: leave a one-line note in PerfOS/.build/status/agent<X>.done with what it built.
