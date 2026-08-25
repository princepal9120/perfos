from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.mcp_server import mcp_http_app

# Pass FastMCP lifespan so streamable HTTP sessions work under uvicorn.
app = FastAPI(title="PerfOS", version="0.1.0", lifespan=mcp_http_app.lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
# Built-in tools MCP. External server registry stays at /api/mcp.
app.mount("/mcp", mcp_http_app)
