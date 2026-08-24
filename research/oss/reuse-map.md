# Reuse Map — OSS → Product Subsystems

Date: 2026-08-24. Decided before writing any product code (brief Phase 14).
Principle: reuse/reverse-engineer OSS for commoditized layers; build only the moat.

| Component | Existing OSS | Reuse? | Why |
|---|---|---|---|
| Canonical data model | advertising-hub/core/models | **FORK** | `NormalizedMetrics`, `Campaign`, `AdGroup`, `Audience` already exist, MIT. Port to our ORM. |
| Connector auth | advertising-hub/core/auth | **FORK** | Per-platform OAuth2/API-key `BaseAuth` + `AuthToken`. Don't rebuild. |
| Response normalizer | advertising-hub/core/utils + Pauesome adapters | **FORK + EXTEND** | Both show Google/Meta→canonical mapping. Combine. |
| Rate limiting | advertising-hub/core/rate_limiting | **FORK** | Adaptive throttler present. |
| Google Ads read MCP | Pauesome google-ads tool + googleads/google-ads-mcp (Apache) | **WRAP** | Reuse tool surface; we add write tools behind policy. |
| Meta Ads read+write MCP | mikusnuz/meta-ads-mcp (MIT, 135 tools) + gomarble/facebook-ads-mcp-server | **WRAP** | Mature. mikusnuz has write; gomarble has clean FastMCP. |
| TikTok Ads MCP | Pauesome tiktok adapter | **WRAP** (later) | Phase 3 multi-channel. |
| GA4 / revenue connector | advertising-hub has no GA4; use official GA4 Data API client | **BUILD thin** | No clean OSS found; wrap Google's client. |
| Shopify revenue (source of truth) | Shopify Admin API client | **BUILD thin** | Commodity; wrap SDK. This is our reconciliation anchor. |
| Agent runtime | LangGraph? our own orchestrator | **EVALUATE** | Pauesome/OpenAds use markdown skills in Claude; we need a coded product runtime, not a plugin. Use a lightweight orchestrator (our own or LangGraph). |
| Analytics/metrics | Pauesome utils/metrics | **FORK** | metric math reusable. |
| Attribution / reconciliation | **NONE found** | **BUILD (moat)** | This is the wedge. No OSS does honest cross-channel reconciliation at SMB price. Our IP. |
| Decision engine | **NONE** | **BUILD (moat)** | Recommendation→action→outcome loop. Our IP. |
| Experiment engine | **NONE** | **BUILD (moat)** | Holdout/geo/incrementality-lite + A/B. Our IP. |
| Policy / safety engine | gomarble *-guardrails (methodology only) | **BUILD** using their spec as reference | Financial thresholds, approval gates, rollback. Our IP. |
| Multi-tenancy | **NONE** | **BUILD** | Product infra. |
| Auth (product users) | existing library (e.g. Clerk/Supabase/Authlib) | **REUSE service** | Don't reinvent user auth. |
| Billing | Stripe | **REUSE service** | Commodity. |
| UI | evaluate (e.g. Next.js + shadcn) | **BUILD** | Product experience is the differentiator surface. |
| Observability | OTel / Postgres event log | **BUILD thin** | Track recommendation→outcome. |

## Net build vs reuse
- REUSE (fork/wrap): canonical model, auth, normalizer, rate limiting, Google/Meta/TikTok
  connectors, metric math. ~40% of the connector layer is free.
- BUILD (moat): attribution/reconciliation, decision engine, experiment engine, policy/
  safety, multi-tenancy, billing wiring, UI, observability. ~60%, and it is the valuable 60%.
- This matches the brief's thesis: OSS gives connectors + tools + agent patterns; we build
  decision intelligence + product experience + commercial infra.
