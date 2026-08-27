from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.core.config import settings
from app.mcp_server import mcp_http_app
from app.routers.ad_library import router as ad_library_router
from app.routers.create import router as create_router
from app.routers.discovery import router as discovery_router
from app.routers.loop import router as loop_router

# Pass FastMCP lifespan so streamable HTTP sessions work under uvicorn.
app = FastAPI(title="PerfOS", version="0.1.0", lifespan=mcp_http_app.lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
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
