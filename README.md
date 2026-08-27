# PerfOS

AI performance marketing operating system. Built with Nx monorepo, FastAPI, and Next.js.

PerfOS reconciles what ad platforms CLAIM against actual revenue (the source of truth),
then turns the gap into policy-gated, auditable recommendations. It is local-first and
BYOK: your data stays in your SQLite/Postgres instance and your API keys stay yours.
Nothing executes without explicit approval.

## Architecture

```
perfos/
├── apps/
│   ├── api/            # FastAPI backend
│   │   ├── src/app/    # Application code
│   │   ├── tests/      # pytest suite
│   │   ├── scripts/    # seed, smoke
│   │   └── pyproject.toml
│   └── web/            # Next.js 14 dashboard
│       ├── app/        # App Router pages
│       ├── components/ # UI components
│       ├── lib/        # API client, utils
│       └── package.json
├── nx.json             # Nx workspace config
└── package.json        # Root workspace
```

## Features

### Measurement (competitor parity: Triple Whale / Northbeam / Measured / Sellforte)
- Revenue reconciliation across 13 ad channels (Google, Meta, Shopify, TikTok,
  LinkedIn, Pinterest, Snapchat, Amazon, Reddit, Twitter/X, YouTube, Amazon DSP,
  X Ads) with over-count detection (demo shows 33% platform inflation).
- iROAS per channel: platform-reported ROAS corrected by incrementality
  calibration factors (`GET /api/iroas`).
- Incrementality testing: geo holdout / conversion lift experiments with a
  draft -> running -> completed lifecycle and deterministic lift computation
  (`POST /api/incrementality/{id}/run`).
- Budget optimizer: what-if reallocation toward higher-iROAS channels. Plan only;
  execution requires the policy gate (`POST /api/optimizer/reallocate`).
- Creative analytics: per-creative performance with fatigue detection
  (`GET /api/creatives`).
- Anomaly detection: deterministic spend/CPA/CTR drift alerts (`GET /api/anomalies`).

### Safety loop (the wedge competitors lack)
- Every recommendation carries evidence, confidence, risk and a rollback plan.
- Policy engine enforced in code: budget changes above 25% are blocked,
  cross-workspace actions are rejected, low-confidence changes require approval.
- Full audit trail; nothing writes to an ad account without explicit approval.

### Agent operations
- Connected agents (ChatGPT / Claude / opencode) with dispatch tracking.
- MCP server registry and external integrations hub.
- Command Center: one-click pipeline + tool dispatch.
- Machine-readable parity contract: `GET /api/capabilities`,
  `perfos capabilities --json`, and MCP `platform_capabilities`.

### Ad lifecycle surfaces

The same pipeline is reachable three ways — HTTP, CLI, and MCP — because all
three call one implementation (`app.routers.discovery.run_discovery`).

| Capability | HTTP | CLI | MCP tool |
|---|---|---|---|
| Ad library search | `POST /api/discovery` | `perfos search "Notion"` | `ads_search` |
| Ranked winners | `GET /api/winners` | `perfos winners` | `ads_winners` |
| Ads cloner | `POST /api/clone` | `perfos clone <ad_id>` | `ads_clone` |
| Creative generation | `POST /api/create` | `perfos generate` | `ads_generate` |
| Generated assets | `GET /api/assets` | `perfos assets` | `ads_assets` |
| Full lifecycle | `POST /api/loop` | `perfos loop --query "Notion"` | `ads_loop_run` |
| Last run | `GET /api/loop/status` | `perfos status` | `ads_loop_status` |

**Live vs fixtures.** Passing a `query` searches the *public* Meta Ad Library
for real. Meta rejects plain HTTP clients ("403 Client challenge"), so this
drives headless chromium and reads the JSON blob Meta ships inside the page —
read-only, no login, no API key, 15-40s per search. Any failure degrades to
deterministic fixtures rather than erroring, and `PERFOS_LIVE_DISCOVERY=0`
forces fixtures everywhere (the test suite sets this). Google/TikTok/LinkedIn/X
stay on fixtures until their keys are connected.

Public libraries hide spend and impressions for commercial ads, so the winner
score uses `variant_count` (how many near-duplicate copies of an ad the
advertiser is running) as the volume signal, with observed runtime still the
dominant term.

```bash
pip install -e '.[live]' && playwright install chromium   # live search deps
perfos search "Notion" --limit 10
perfos loop --query "Notion"        # find -> ... -> double-down, dry run
```

## Development

```bash
# Install
npm install
cd apps/api && pip install -e '.[postgres]'

# Seed demo data (13 channels, reconcile scenario, creatives, tests)
cd apps/api && PYTHONPATH=src .venv/bin/python scripts/seed.py

# Run API
cd apps/api && uvicorn app.main:app --app-dir src --port 8000

# Run web
cd apps/web && npm run dev
```

## Deploy

Frontend auto-deploys to Cloudflare Pages on push to main.

Backend runs on Cloudflare Containers or any Docker host.

## CI/CD

See `.github/workflows/ci.yml` for backend tests, frontend build, and deploy.

## perfos-loop (agent build)

The ad lifecycle was missing its first half: finding what already works before
spending on new creative. This build adds three additive packages under
`apps/api/src/app/`, produced by a 50-agent orchestrated pass over the repo
(each agent owned one bounded module; everything is additive, mock-safe by
default, and makes no external LLM calls without keys).

### Discovery (`discovery.find` + `discovery.score`)
- **find** — OSS adapters over public ad libraries (MetaAdsCollector /
  meta-ads-scraper, Google Ads Transparency, plus LinkedIn/X surfaces) that
  normalize competitor ads into canonical `SpyAd` rows with a local store
  (`discovery.find.store`).
- **score** — deterministic winner engine: hook/angle detection with evidence
  spans, longevity scoring as a winner proxy, winner tiers
  (high_conf / winner / emerging / loser), persona fit, winner-DNA diff vs your
  own ads, and the 0–100 adoracle score. Pure Python, no external calls.

### Create (`create`)
Creative generation adapters that keep PerfOS policy vocabulary end-to-end:
- **commercial_creator** — adapter to cxbxmxcx/commercial-creator: intake →
  brief → script → storyboard → Seedance video. Staging is always free
  (estimate only); spending requires an explicit named approver inside budget
  cap. MOCK_MODE serves everything deterministically with zero network/spend.
- **cutagent**, **money_printer_turbo**, **adkit_mcp_client** — clip/asset
  assembly and MCP tool clients behind the same mock-first contract.

### Loop (`loop`)
End-to-end orchestrator: find → score → create → launch → track → double-down.
- **safety_gate** — every external write passes through draft-first, paused,
  human-approval gating reusing the existing PerfOS policy engine.
- **stages/track** — ROAS tracking folds spy spend into attribution
  (`reconcile_spy`).
- **stages/double_down** — pure decisions per asset: roas ≥ 2.0 → scale,
  roas < 1.0 → kill, otherwise hold. Execution still goes through safety_gate.
- **scheduler** — interval driver for the cycle; dry-run by default, real work
  only with `dry_run=False` and an injected tick.

Nothing executes against a live ad account or spends money without explicit
approval — consistent with the Safety loop above.
