# PerfOS multi-stage image.
#   --target api  -> FastAPI backend (default target)
#   --target web  -> Next.js dashboard
# Both build from the repo root; docker-compose.yml selects per service.

# ---------- web: Next.js 14 ----------
FROM node:20-alpine AS web

WORKDIR /app/web
ENV NEXT_TELEMETRY_DISABLED=1

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web ./
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

# ---------- api: FastAPI (powered by Astral uv) ----------
FROM python:3.11-slim AS api

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

COPY apps/api/pyproject.toml apps/api/uv.lock ./
RUN uv sync --frozen --no-install-project --all-extras

COPY apps/api/src ./src
COPY apps/api/scripts ./scripts
RUN uv sync --frozen --all-extras

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
