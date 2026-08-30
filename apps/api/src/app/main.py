from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.core.config import settings
from app.core.db import init_db
from app.mcp_server import mcp_http_app
from app.routers.ad_library import router as ad_library_router
from app.routers.create import router as create_router
from app.routers.discovery import router as discovery_router
from app.routers.loop import router as loop_router

# Create/migrate the durable command and lifecycle tables before serving the
# first request. This is intentionally additive for the SQLite local runtime.
init_db()

tags_metadata = [
    {
        "name": "health",
        "description": "Server health checks and readiness probes",
    },
    {
        "name": "auth",
        "description": "Authentication — API key token exchange and HttpOnly session cookies",
    },
    {
        "name": "workspaces",
        "description": "Workspace management",
    },
    {
        "name": "accounts",
        "description": "Ad account connections and management",
    },
    {
        "name": "analytics",
        "description": "Revenue reconciliation, attribution, briefings, iROAS, creative fatigue, and anomaly detection",
    },
    {
        "name": "recommendations",
        "description": "AI-generated recommendations with policy-gated approval workflow",
    },
    {
        "name": "experiments",
        "description": "A/B and geo-holdout experiment management",
    },
    {
        "name": "agents",
        "description": "Connected AI agent registry, dispatch, and job tracking",
    },
    {
        "name": "integrations",
        "description": "External integration registry (ads, analytics, CRM, creative providers)",
    },
    {
        "name": "mcp",
        "description": "MCP server registry — register, probe, and toggle third-party tool servers",
    },
    {
        "name": "command-center",
        "description": "Full pipeline orchestration, agent capabilities contract, tool calls, and bulk dispatch",
    },
    {
        "name": "optimizer",
        "description": "Budget reallocation planning and what-if analysis",
    },
    {
        "name": "incrementality",
        "description": "Incrementality testing — geo holdout and conversion lift tests",
    },
    {
        "name": "chat",
        "description": "Natural-language chat agent — intent-routed access to the PerfOS engine",
    },
    {
        "name": "discovery",
        "description": "Ad discovery pipeline — FIND + SCORE, winner signal persistence",
    },
    {
        "name": "ad-library",
        "description": "Ad library search, save boards, competitor watchlist, and ad detail",
    },
    {
        "name": "create",
        "description": "Creative asset generation from winners, ad cloning and remixing",
    },
    {
        "name": "lifecycle",
        "description": "Full lifecycle loop — find → score → create → launch → track → double-down",
    },
]

app = FastAPI(
    title="PerfOS",
    description=(
        "AI Performance Marketing OS — a unified platform that reconciles ad spend against real revenue, "
        "discovers winning competitor creatives, generates and launches ad variants, tracks fatigue, and "
        "orchestrates AI agents through a policy-gated approval workflow."
    ),
    version="0.1.0",
    openapi_tags=tags_metadata,
    contact={
        "name": "PerfOS Team",
        "url": "https://perfos.ai",
    },
    license_info={
        "name": "Proprietary",
    },
    servers=[
        {"url": "http://localhost:8000", "description": "Local development"},
        {"url": "https://api.perfos.ai", "description": "Production"},
    ],
    lifespan=mcp_http_app.lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(router, prefix="/api")
# Discovery routes: POST /api/discovery, GET /api/winners.
app.include_router(discovery_router, prefix="/api")
# Ad Library: /api/ad-library (+ /search, /saved, /competitors, /{ad_id}).
app.include_router(ad_library_router, prefix="/api")
# CREATE: POST /api/create, GET /api/assets.
app.include_router(create_router, prefix="/api")
# LOOP: POST /api/loop, GET /api/loop/status.
app.include_router(loop_router, prefix="/api")
# Built-in tools MCP. External server registry stays at /api/mcp.
app.mount("/mcp", mcp_http_app)
