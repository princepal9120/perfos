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

# ---------- api: FastAPI ----------
FROM python:3.11-slim AS api

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml ./
COPY app ./app
COPY scripts ./scripts

# [postgres] extra so DATABASE_URL may be swapped to Postgres without a rebuild.
RUN pip install --no-cache-dir ".[postgres]"

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
