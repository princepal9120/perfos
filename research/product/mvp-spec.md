# MVP Specification — Milestone 1 (Local Proof)

Date: 2026-08-24. Scope locked to the wedge (research/decisions/initial-wedge.md) and ICP
(research/decisions/initial-icp.md). NO real SaaS yet. Local-first, mock-data end-to-end.

## Goal
A user runs `docker compose up`, opens localhost, loads a demo workspace, and can ask:
  "Why doesn't my ROAS match my bank account?"
and get an honest cross-channel reconciliation with evidence, then a structured,
approval-gated recommendation, then (mock) execution, then a measured result.

## In scope (MVP)
1. **Canonical data model** (fork advertising-hub/core): Organization, Workspace, AdAccount,
   Campaign, AdSet, Ad, Spend, Conversion, Revenue (from Shopify/Stripe), AttributionEvent.
2. **Connectors (wrapped OSS, read)**:
   - Mock Google Ads, Mock Meta Ads (from Pauesome/GoogleAds/Mikusnuz patterns).
   - Mock Shopify/Stripe revenue (source of truth).
   - Real Google/Meta connectors stubbed behind the same interface (phase 2).
3. **Attribution / Reconciliation engine (BUILD — the moat)**:
   - Pull spend + conversions per platform.
   - Pull actual revenue from Shopify/Stripe.
   - Compute: blended MER, per-channel claimed ROAS, double-count overlap.
   - Flag over-count >10–15% as tracking-integrity issue.
   - Output an explainable channel-credit model (blended + simple MTA-lite).
4. **Daily briefing UI** (brief Phase 19):
   "Spend ₹/$, Revenue, Blended ROAS, Meta claims A, Google claims B, Overlap C.
    3 changes: ... Recommended: ..."
5. **Recommendation system** (brief Phase 20): structured JSON
   {id, type, reason, evidence, expected_impact, confidence, risk, affected_resources,
    proposed_changes, rollback, status}.
6. **Policy / safety engine** (brief Phase 27): budget-change >X% → reject; workspace
   mismatch → reject; confidence < threshold → require approval.
7. **Approval + mock execution + audit log**.
8. **Observability**: recommendation → outcome event log.
9. **Local-first**: docker compose, .env.example, seed scripts, mock mode with zero creds.

## Out of scope (defer — do not build yet)
- Real OAuth to live ad accounts (phase 2: Milestone 2).
- Multi-tenancy at scale, SSO, agency features (phase 3).
- Creative fatigue, full budget optimizer, campaign creation (phase 2-3).
- Billing (phase 3).
- TikTok / LinkedIn / Microsoft connectors (phase 3).

## Acceptance (brief Phase 37 — Local Proof)
- `docker compose up` boots frontend + backend + postgres + redis + worker.
- Load demo workspace with mock Google + Meta + Shopify.
- Ask "Why did my CAC/ROAS not match?" → system answers from mock data WITH evidence.
- Ask "What should I change?" → structured recommendation.
- "Approve." → mock action executes; audit log records it.
- "Did it work?" → system measures the (mock) result.

## Success metric for the gate
Local proof works with ZERO credentials. Then we validate willingness-to-pay with the
demo before building real connectors (phase 2 → Milestone 2).
