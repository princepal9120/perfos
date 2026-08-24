# PerfOS - Local Proof and Cloudflare Deployment

An AI performance marketing operating system. Reverse engineered from OSS, completed by a 20 agent parallel coding swarm.

## What was built

PerfOS connects Google, Meta and Shopify, reconciles platform claimed revenue against actual revenue, flags over counting, generates policy gated recommendations, and lets a human approve safe changes that execute with a full audit trail. It also manages AI agents (ChatGPT, Claude, opencode) and MCP servers from one console.

## How it was made

- Reverse engineered from OSS: advertising hub/core (MIT), Pauesome (MIT), mikusnuz meta ads mcp (MIT), googleads/google ads mcp (Apache), GoMarble (MIT).
- Completed by a 20 agent parallel swarm using opencode on model `opencode-go/ox-alpha-free`.
- Dashboard redesigned with the Hallmark skill to match the jobclaw.site/dashboard look: light first 3 color blue system, Clash Display plus Satoshi fonts, fixed app shell with a collapsible sidebar.

## Backend stack

FastAPI plus SQLAlchemy plus SQLite in mock mode. Endpoints:

- `POST /api/auth/token` - workspace token
- `GET /api/reconcile` - platform claimed vs actual revenue
- `GET /api/briefing` - narrative summary
- `POST /api/recommendations/generate` - persist mock engine output
- `POST /api/recommendations/{id}/approve` - policy engine then execute with audit
- `POST /api/recommendations/{id}/reject` - archive
- `GET/POST /api/experiments` - holdout tests
- `GET/POST /api/agents` and `POST /api/agents/{id}/dispatch` - agent registry
- `GET/POST /api/mcp` and `POST /api/mcp/{id}/toggle` - MCP server registry

## Frontend

Next.js 14 App Router dashboard. Pages: Overview, Accounts, Recommendations, Experiments, Agents, MCP, Settings. Static export builds to `web/out`.

## Verification evidence

- 75 backend pytest pass.
- Frontend builds clean with 9 static routes.
- Live smoke against uvicorn:
  - `GET /api/health` returns `{"status":"ok"}`.
  - `GET /api/reconcile` returns spend 20000, claimed 104000, actual 78000, over count 33.0 percent, tracking integrity flag True.
  - `POST /api/recommendations/generate` then `POST /api/recommendations/2/approve` returns decision allow, status executed.
  - Audit row `recommendation.allow recommendation:2` persisted.
  - MCP register then list returns count 1, toggle flips connected to disabled.

## Cloudflare deployment

Frontend is deployed as a static export to Cloudflare Pages (project `perfos-dashboard`) via wrangler. Build with `npm run build` in `web`, then `npx wrangler pages deploy web/out --project-name=perfos-dashboard`.

Backend is not deployable to Cloudflare Workers as is (it is a uvicorn ASGI server with a SQLite file). Two options:

1. Cloudflare Containers: run the existing Dockerfile api target as a container. No code changes.
2. Worker plus D1: port `app.main` to a Worker fetch handler and swap SQLAlchemy plus SQLite for D1.

After deploying the frontend, set the Pages project environment variable `NEXT_PUBLIC_API_URL` to the backend URL so the dashboard can reach the API.

## Run locally

```bash
cd PerfOS
. .venv/bin/activate
export MOCK_MODE=true DATABASE_URL=sqlite:///./perfos.db
python scripts/seed.py
uvicorn app.main:app --port 8000 &

cd web
npm run dev
# open http://localhost:3000/overview
```
