# PerfOS

AI performance marketing operating system. Built with Nx monorepo, FastAPI, and Next.js.

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

- Revenue reconciliation with 33% over-count detection
- Policy-gated recommendations with audit trail
- Agent management (ChatGPT, Claude, opencode)
- MCP server registry
- Integrations hub (Google Ads, Meta Ads, Shopify, Stripe, Slack)
- Command Center: one-click pipeline + tool dispatch

## Development

```bash
# Install
npm install
cd apps/api && pip install -e '.[postgres]'

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
