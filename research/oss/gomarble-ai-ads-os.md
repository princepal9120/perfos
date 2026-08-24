# GoMarble AI Ads OS / AI Media Buyer — Reverse Engineering (Methodology)

Repos:
- gomarble-ai/ai-ads-os (cloned: oss-lab/gomarble/ai-ads-os) — MIT, 36 skills, 8 commands
- gomarble-ai/ai-media-buyer (cloned: oss-lab/gomarble/ai-media-buyer) — MIT
- gomarble-ai/google-ads-mcp-server + facebook-ads-mcp-server (cloned) — MIT, FastMCP Python

## What it is
The best METHODOLOGY reference found. A Claude Code / Codex plugin that turns the terminal
into a senior media buyer across Google, Meta, TikTok, LinkedIn, Bing, GA4, Shopify,
Klaviyo, Search Console. Built by an agency that runs real DTC ad spend.

## Architecture
```
skills/            36 SKILL.md files (Google 17, Meta 10, GA4/Shopify/etc 4, docs 5)
commands/          8 slash commands (meta-daily-optimization, google-search-audit, ...)
hooks/             SessionStart hook (MCP probe + version check + date injection)
.mcp.json          remote MCP wiring (Streamable HTTP + OAuth) to GoMarble's hosted server
```
Flow: user asks → skill auto-invokes by description → skill calls GoMarble MCP tools
→ live API → agent applies methodology + guardrails → answer. Mutations happen only via
explicit "Agent Mode" opt-in.

## Most valuable parts (reusable as methodology, MIT)
- `google-ads-guardrails` / `meta-guardrails`: mutation safety, attribution discipline,
  "what never to fabricate." Directly maps to our policy engine (Phase 18).
- `meta-creative-analysis`: creative-fatigue scoring (Healthy / Warning / Fatigued / Dead).
  This is the brief's "creative fatigue detector" wedge, already specced.
- `google-search-term-audit`: 80/80 Pareto + campaign-relative triggers for wasted spend.
- `ga4-source-of-truth`: "Conversions ≠ transactions, channel-subset-sum traps" — exactly the
  attribution-reconciliation problem our wedge attacks.
- Daily decision matrices: pause / cut / reallocate / scale candidates.

## Reuse assessment
REUSE the skill *methodology* as specification for our agent workflows (we are building a
product, not a plugin, so we implement the logic in code, not markdown prompts). The two
MCP servers are standard FastMCP read+write patterns we can wrap.

## Gaps for a product
- Tied to GoMarble's hosted MCP (OAuth to their server). We self-host connectors.
- No multi-tenancy, no persistent product memory beyond STRATEGY.md, no billing, no audit
  log, no experiment history, no financial-safety thresholds baked into code.
