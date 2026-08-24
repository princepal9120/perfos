# Paid-Media-MCP (Pauesome) — Reverse Engineering

Repo: `Pauesome/Paid-Media-MCP` (cloned to `oss-lab/paid-media-mcp/Pauesome`)
License: MIT (LICENSE + package.json). TypeScript/Node. 16 read-only tools.

## What it is
Clean, production-shaped MCP server giving an AI assistant normalized READ-ONLY access to
Google Ads, Meta Ads, TikTok Ads. Plus an optional Claude-specific intelligence layer
(skills + subagents + Spain benchmarks).

## Architecture (evidence: src/ on disk)
```
src/
  index.ts        stdio entry
  server.ts       ListTools / CallTool wiring
  config/         env + account registry (clients/*.json, multi-account)
  schemas/        zod: tool-inputs, normalized output, client config
  tools/          one file per platform area (google-ads, meta-ads, tiktok-ads, list-clients)
  services/       per-platform orchestration + normalization
  adapters/       ONLY layer that knows raw API shapes (google/meta/tiktok .adapter.ts)
  utils/          date, logger, metric math
.claude/          skills + subagents + references (optional, Claude-specific)
```
Data flow: tools → services → adapters → platform API (out), reverse normalized (back).
`adapters/` is the only platform-aware layer; everything above speaks the normalized vocabulary.

## Normalized output shape (from README)
Every metric normalized to: spend, impressions, clicks, CTR, CPC, CPM, conversions, CPA,
conversion value, ROAS — identical across platforms. This is the exact normalization the
brief demands (Phase 16).

## Tools (16, all read-only)
list_clients; google: campaign/hourly/search-terms/keywords/impression-share; meta:
campaign/hourly/opportunity-score/auction-rankings/anomaly-signal; tiktok: campaign/
hourly/ad/anomaly. Notable: `wasted_spend` surfaced, `get_meta_anomaly_signal` uses
rolling-baseline Z-score anomaly detection per campaign×metric.

## Safety pattern (reusable)
- 100% read-only. No write path. README explicitly: "The server has no write path to any ad account."
- Token in `.env` + per-account `clients/*.json`, gitignored; ships only `_example.json`.
- Secrets read at runtime, used only to call official APIs.

## Reuse assessment
REUSE the `adapters/` + `services/` + `schemas/` pattern as the template for our own
READ + WRITE MCP connectors. The read-only discipline + zod normalization is the right
shape. We will extend it with write tools gated by our policy engine.

## Gaps
- No write tools (safe by design; we add them behind policy/approval).
- Spain-specific benchmarks in `.claude/references` — useful as a template, we replace with
  customer-configurable benchmarks.
- TikTok + Meta + Google only; no GA4/Shopify/revenue source. We add revenue connectors.
