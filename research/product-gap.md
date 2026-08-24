# Product Gap Analysis — What OSS Gives vs What a Paying Customer Needs

Date: 2026-08-24. After reverse-engineering 11 OSS repos and studying competitors.

## What the OSS does well
- Connectors: Google/Meta/TikTok MCP servers exist, mature, MIT/Apache. Read + some write.
- Normalization: Pauesome + advertising-hub/core already normalize metrics cross-platform.
- Methodology: GoMarble's 36 skills are a world-class audit playbook (fatigue, wasted spend,
  guardrails, GA4 source-of-truth).
- Safety culture: approval-gated writes, paused-by-default, read-only servers are the norm.

## What is missing for a commercial product (the gap = our job)
1. **Honest attribution / reconciliation** — NO OSS does cross-channel reconciliation
   against actual revenue. This is the wedge and it is absent everywhere.
2. **Product memory** — GoMarble has STRATEGY.md (markdown), OpenAds has a memory file. None
   have a structured, queryable, per-customer decision/experiment history.
3. **Decision engine** — OSS recommends (skills output text). None structure a recommendation
   as {type, reason, evidence, expected_impact, confidence, risk, rollback, status} with
   policy gating (brief Phase 20).
4. **Experiment engine** — OSS mentions A/B design (Pauesome) but none persists
   hypothesis→outcome→learning (brief Phase 22).
5. **Multi-tenancy + auth + billing + audit logs** — entirely absent. These turn a tool into
   a SaaS.
6. **Financial safety in code** — guardrails are prompt-level (GoMarble). We need enforced
   thresholds: budget change > X% → reject; account mismatch → reject; low confidence →
   require approval (brief Phase 27).
7. **Daily briefing UX** — OSS is chat/CLI. A paying customer wants a first screen that
   answers "what happened / why / what to do" (brief Phase 19).
8. **Revenue source-of-truth connector** — Shopify/Stripe/GA4 as the anchor for
   reconciliation. OSS ad connectors exist; revenue anchoring does not.
9. **Observability of recommendation→outcome** — the most important metric (brief Phase 28)
   is not tracked by any OSS.

## What would confuse / unsafe in raw OSS for an end customer
- Markdown-skill agents require a developer IDE (Claude Code). Not a product.
- Hosted MCP competitors (Adspirer/PaidSync) require trusting their server with credentials
  and per-task billing. A product owner wants their own tenant.
- Read-only servers can't act; full-write servers (without our policy engine) are unsafe.

## Commercial opportunity
The gap is precisely the moat the brief describes (Phase 32): customer data + decision
history + experiment history + attribution + customer-specific memory + optimization
policies + outcome feedback. OSS hands us the plumbing; we build the brain and the product.
