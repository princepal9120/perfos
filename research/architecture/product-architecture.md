# Product Architecture — AI Performance Marketing OS

Date: 2026-08-24. Built on the reuse map (research/oss/reuse-map.md). Local-first; MVP is
the reconciliation wedge (research/decisions/initial-wedge.md) for the DTC/e-com ICP
(research/decisions/initial-icp.md).

## Layered design
```
                         ┌─────────────────────────────┐
                         │  Web UI (Next.js)            │  first screen: what
                         │  Daily briefing · actions    │  happened / why / do
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │  API (FastAPI) + Auth        │  multi-tenant, per-workspace
                         └──────────────┬──────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
┌───────▼───────┐            ┌──────────▼──────────┐          ┌────────▼────────┐
│ Connectors    │            │ Decision / Agent      │          │ Product layer   │
│ (REUSED OSS)  │            │ Runtime (BUILD)       │          │ (BUILD)         │
│               │            │                       │          │                 │
│ Google MCP    │            │ Orchestrator          │          │ Multi-tenancy   │
│ Meta MCP      │──pull──▶   │ Performance Analyst   │          │ Workspace        │
│ TikTok MCP    │  raw       │ Attribution Analyst ● │◀──decide─│ Billing (Stripe)│
│ GA4 client    │            │ Budget Strategist     │          │ Permissions     │
│ Shopify/Stripe│──revenue─▶ │ Experiment Agent      │          │ Audit log       │
│ (source of    │            │ Campaign Operator     │          │ Approvals       │
│  truth)       │            └──────────┬──────────┘          │ Persistent memory│
└───────────────┘                       │                      │ Daily briefing   │
                                         ▼                      └────────┬────────┘
                         ┌──────────────────────────────┐                │
                         │ Canonical Model (FORKED OSS) │                │
                         │ advertising-hub/core models  │                │
                         │ NormalizedMetrics, Campaign, │                │
                         │ Ad, Audience, Revenue, Event  │                │
                         └──────────────┬───────────────┘                │
                                         │                              │
                         ┌──────────────▼───────────────┐                │
                         │ ATTRIBUTION / RECONCILIATION │◀─── THE MOAT ───┘
                         │ (BUILD)                      │
                         │ • platform sum vs actual     │
                         │ • blended MER, channel credit│
                         │ • double-count / overlap flag │
                         │ • explainable model           │
                         └──────────────┬───────────────┘
                                         │
                         ┌──────────────▼───────────────┐
                         │ POLICY / SAFETY ENGINE (BUILD)│
                         │ threshold checks → approve    │
                         │ risk check → human gate       │
                         │ rollback plan per action      │
                         └──────────────┬───────────────┘
                                         │
                         ┌──────────────▼───────────────┐
                         │ Storage: Postgres + Redis     │
                         │ (mock mode: sqlite + fixtures) │
                         └──────────────────────────────┘
```

## Data flow (read + recommend)
Platform APIs → Connectors (OSS, normalized) → Canonical Model → Attribution/Reconciliation
→ Decision runtime → structured Recommendation → Policy engine → (approve) → Execution
→ Audit log → Observability (rec→outcome).

## Safety architecture (brief Phase 18) — enforced in code, not prompts
LLM → Recommendation → Structured Action → Policy Engine → Risk Check → Human Approval →
Execution → Audit Log. Every mutation: validated, logged, attributable, reversible.

## Local-first / mock mode (brief Phase 24-25)
- docker compose: frontend, backend, postgres, redis, worker.
- `.env.example`, seed scripts, test accounts.
- Mock Google / Meta / Shopify: full loop works with zero credentials.
  Mock data → reconciliation → recommendation → approval → mock execution → measured result.

## MVP agents (start small — wedge only)
1. Attribution Analyst (reconciliation) — MVP core.
2. Performance Analyst (daily briefing) — delivery surface for reconciliation.
Defer Budget Strategist / Experiment / Operator to phase 2-3.

## Tech choices (constraint-fit)
- Backend: Python FastAPI (reuse OSS Python connectors directly; no rewrite).
- Canonical model: fork advertising-hub/core models → SQLAlchemy ORM.
- Connectors: wrap Pauesome/googleads/mikusnuz/gomarble MCP servers (subprocess or in-process).
- Frontend: Next.js + shadcn (product experience is a differentiator).
- DB: Postgres + Redis; mock mode uses sqlite.
- Auth: Authlib/Supabase (don't reinvent). Billing: Stripe.
- Agent runtime: lightweight orchestrator (our own or LangGraph) — NOT markdown plugins.
