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

## Development

```bash
# Install
npm install
cd apps/api && pip install -e '.[postgres]'

# Seed demo data (13 channels, reconcile scenario, creatives, tests)
cd apps/api && PYTHONPATH=src .venv/bin/python scripts/seed.py

# Run API
cd apps/api && uvicorn app.main:app --port 8000

# Run web
cd apps/web && npm run dev
```

## Deploy

Frontend auto-deploys to Cloudflare Pages on push to main.

Backend runs on Cloudflare Containers or any Docker host.

## CI/CD

See `.github/workflows/ci.yml` for backend tests, frontend build, and deploy.
