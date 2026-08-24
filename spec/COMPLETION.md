# COMPLETION CONTRACT — PerfOS end-to-end finish

20-agent parallel completion swarm (model `opencode-go/ox-alpha-free`). The project
ALREADY EXISTS (see docs/REVERSE_ENGINEERING.md). DO NOT rebuild from scratch. COMPLETE,
VERIFY, FIX, and WIRE what is there. Each agent owns EXCLUSIVE files — do not touch
others' files. Every agent MUST read docs/REVERSE_ENGINEERING.md and spec/CONTRACTS.md first.

## Bootstrap facts
- Backend: Python 3.11+, FastAPI, SQLAlchemy 2.0, SQLite (mock). venv at /Users/princepal/Desktop/coding/PerfOS/.venv.
- Frontend: Next.js 14, TS, Tailwind, at /Users/princepal/Desktop/coding/PerfOS/web. node_modules present.
- Backend runs: `cd PerfOS && . .venv/bin/activate && export MOCK_MODE=true DATABASE_URL=sqlite:///./perfos.db && uvicorn app.main:app --port 8000`.
- Frontend runs: `cd PerfOS/web && npm run dev` (proxies /api -> localhost:8000).
- ALL work must keep the demo scenario exact: Google 12000/60000, Meta 8000/44000, Shopify 78000, blended 3.9x, over-count 33.3%.

## Agent task list (EXCLUSIVE file ownership)
1. web-boot: `web/next.config.js`, `web/package.json` (scripts), and ensure `npm run build` passes with no TS errors. Run `cd web && npx tsc --noEmit` and fix ONLY errors blocking build. Report build status. Do NOT rewrite pages.
2. api-client: `web/lib/api.ts` — must expose typed methods for EVERY backend route (token, workspaces, accounts get/post, reconcile, briefing, recommendations get, recommendations/generate post, recommendations/{id}/approve, /reject, experiments get/post, outcomes, agents get/post, agents/{id}/dispatch). Match response shapes in app/api/routes.py exactly.
3. overview-page: `web/app/(dashboard)/page.tsx` + `web/components/overview/*` — fetch /api/briefing, render KPI cards (Spend, Revenue, Blended ROAS, Over-count %), narrative, and the changes block. If /api/recommendations is empty, call /api/recommendations/generate first.
4. accounts-page: `web/app/(dashboard)/accounts/page.tsx` — list accounts (/api/accounts), "Connect" buttons POST /api/accounts with platform google|meta|shopify, show status badges.
5. recommendations-page: `web/app/(dashboard)/recommendations/page.tsx` — list recs, show type/reason/evidence/confidence/risk/rollback, Approve + Reject buttons calling the endpoints, reflect status.
6. agents-page: `web/app/(dashboard)/agents/page.tsx` — list ConnectedAgent (/api/agents), add form (provider chatgpt|claude|opencode|openai|anthropic), Dispatch button (/api/agents/{id}/dispatch), show last_run_at.
7. experiments-page: `web/app/(dashboard)/experiments/page.tsx` — table (/api/experiments) + create form POST /api/experiments.
8. styles-shell: `web/app/(dashboard)/layout.tsx`, `web/app/globals.css`, `web/components/ui/*` — polish into a clean aicmohq-style dark console (sidebar + topbar). Do not break other pages.
9. policy-tests: `tests/test_policy.py` — unit tests for app.agents.policy.evaluate: budget>25% blocks, workspace mismatch blocks, confidence<0.6 needs_approval, else allow. Use pytest.
10. exec-audit-tests: extend `tests/test_services_execution_audit.py` — cover reallocate_budget mock execution writes AuditLog with rollback_json and sets status executed.
11. e2e-loop: `tests/test_api_loop.py` — FastAPI TestClient: seed DB, POST /recommendations/generate, POST approve, assert rec status executed + AuditLog row exists. (Mirrors the manual curl loop.)
12. null-pk-fix: `app/services/execution.py` — guard `_platform_for` when campaign_id is None (avoid the SAWarning); do NOT change other behavior.
13. outcome-recording: `app/services/execution.py` + `app/api/routes.py` — after a successful execution, write an `Outcome` row (metric=blended_mer or action, before/after, delta=0 in mock) so /api/outcomes returns data. Keep mock-safe.
14. connectors-tests: `tests/test_connectors.py` — google/meta/revenue connectors: fetch_metrics returns mock rows; set_budget/pause mutate in-memory and return a dict; registry.get_connector('google'|'meta'|'shopify') resolves.
15. docker: `Dockerfile`, `docker-compose.yml`, `scripts/run_demo.sh`, validate `.env.example` keys match app/core/config.py. Docker absent on host — make files correct by inspection, do not require a live run.
16. readme-arch: `README.md` (quickstart from REVERSE_ENGINEERING.md run section) + `docs/ARCHITECTURE.md` (layers + loop). Keep the hero line.
17. landing: `web/app/(dashboard)/page.tsx` already is overview; ADD a public `web/app/page.tsx` marketing landing with the hero "Your AI performance marketer. Connect Google + Meta + Shopify. See what actually happened to your money." Minimal, on-brand.
18. ci: `.github/workflows/ci.yml` — on push: backend `pip install -e . && pytest`; frontend `npm ci && npx tsc --noEmit && npm run build`. Must be valid YAML.
19. attribution-endpoint: `app/api/routes.py` — ADD `GET /api/attribution` returning run_analysis(...).attribution for the workspace. Keep existing routes intact.
20. smoke-script: `scripts/smoke.sh` (or .py) — curl-based: health, token, reconcile (assert over_count_pct~33), generate, approve (assert executed). Prints PASS/FAIL per step.

## Acceptance per agent
- Backend agents: their new tests pass via `cd PerfOS && . .venv/bin/activate && python -m pytest tests/<yours>.py -q`. Do NOT run the full suite.
- Frontend agents: `cd PerfOS/web && npx tsc --noEmit` clean for their files; `npm run build` succeeds (agent 1 owns build success, coordinate by not breaking it).
- Every agent: append one line to .build/status/complete<X>.done describing what it finished.

## Hard rules
- Do NOT modify the demo aggregates (12k/8k/78k/3.9x/33.3%).
- Do NOT remove the policy/safety checks.
- Do NOT change models' column semantics already seeded (expected_impact is STRING).
- Reuse existing code; only add what is missing.
