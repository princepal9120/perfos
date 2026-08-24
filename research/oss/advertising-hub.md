# OpenAds / Advertising Hub — Reverse Engineering

Repo: `itallstartedwithaidea/advertising-hub` (cloned to `oss-lab/other/advertising-hub`)
License: MIT. Stars: not captured (network enumerate blocked); marketing states 14 platforms, 25+ agents.
Updated: active 2026 (AGENTS.md references 2026).

## What it is
A curated umbrella repo + a real, importable `core/` Python package that is the strongest
reusable foundation found. The repo itself is mostly docs, agents-as-markdown, and
platform/module stubs; the real value is `core/`.

## Architecture (evidence: `core/` on disk)
```
core/
  auth/         per-platform OAuth2/API-key providers (google, meta, microsoft, amazon,
                linkedin, pinterest, reddit, spotify, criteo, demandbase, thetradedesk)
  models/       NormalizedCampaign, AdGroup, Ad, Audience, Report, NormalizedMetrics
  utils/        response_normalizer, date_ranges, pagination, currency
  rate_limiting/ adaptive throttler
  errors/       unified error taxonomy
  pyproject.toml  name=advertising-hub-core, MIT, deps: httpx, pydantic, python-dotenv
```
- `models/metrics.py`: `NormalizedMetrics` dataclass — impressions, clicks, cost, conversions,
  conversion_value + derived ctr/cpc/cpa/roas/conversion_rate (rates as 0-1). This is the
  canonical marketing model the brief asks for in Phase 16.
- `utils/response_normalizer.py`: `normalize_google_campaign`, `normalize_meta_campaign` show the
  exact Google→Canonical and Meta→Canonical mapping pattern.
- `auth/base.py`: `BaseAuth` ABC + `AuthToken` dataclass with `is_expired`/`is_refreshable`.
- `mcp-servers/SPEC.md`: defines the standard MCP tool surface (list_campaigns, get_campaign,
  get_metrics, list_audiences, get_budget) every platform MCP should implement.

## Runtime flow (from SPEC.md + agents)
User intent → Agent (markdown persona) → MCP server (per platform) → core models
→ platform API → normalized response → agent reasoning → recommendation.

## Agents (25+, markdown specs)
- paid-media/: ppc-strategist, search-query-analyst, auditor, tracking-specialist,
  creative-strategist, programmatic-buyer, paid-social-strategist
- cross-platform/: attribution-analyst, budget-allocator, audience-architect,
  competitive-intel, reporting-unifier
- platform-specific/: linkedin/microsoft/amazon/reddit/pinterest/criteo/demandbase/spotify/ttd
- orchestrator/: buddy.md

## Reuse assessment
REUSE `core/` directly. It is the connector + normalizer + canonical model layer the brief
says not to rebuild. Wrap or extend the MCP SPEC for our own servers. The markdown agents
are reference methodology (lower quality than GoMarble's, but free structure).

## Gaps
- `core/` has no live MCP server implementations inside this repo (only SPEC + templates).
  Google/Meta MCP live servers exist as sibling repos (google-ads-mcp referenced).
- Models are dataclasses, not SQLAlchemy/ORM. We will port to our own ORM models.
- No persistence, no multi-tenancy, no approval/policy engine, no financial safety.
