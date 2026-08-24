#!/usr/bin/env bash
# PerfOS demo runner (host, mock mode, zero credentials).
#
# Boots the FastAPI backend against a fresh seeded SQLite DB, verifies the demo
# aggregates, and optionally starts the Next.js dashboard.
#
# Usage:
#   scripts/run_demo.sh          # backend only
#   scripts/run_demo.sh --web    # backend + frontend (npm run dev)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WITH_WEB=0
[[ "${1:-}" == "--web" ]] && WITH_WEB=1

# --- python: prefer repo venv -------------------------------------------------
if [ -x ".venv/bin/python" ]; then
  PY=".venv/bin/python"
else
  PY="python3"
fi

export MOCK_MODE=true
export DATABASE_URL="${DATABASE_URL:-sqlite:///./perfos.db}"

echo "==> [deps] checking fastapi import"
"$PY" -c "import fastapi, uvicorn" 2>/dev/null || {
  echo "    installing perfos (editable)"
  "$PY" -m pip install -e ".[postgres]" >/dev/null
}
echo "PASS deps"

echo "==> [seed] seeding mock dataset ($DATABASE_URL)"
"$PY" scripts/seed.py
echo "PASS seed"

API_PID=""
WEB_PID=""
cleanup() {
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> [api] starting uvicorn on :8000"
"$PY" -m uvicorn app.main:app --port 8000 &
API_PID=$!

for _ in $(seq 1 30); do
  curl -sf http://localhost:8000/api/health >/dev/null 2>&1 && break
  sleep 1
done
curl -sf http://localhost:8000/api/health >/dev/null || { echo "FAIL health"; exit 1; }
echo "PASS api-health"

echo "==> [reconcile] verifying over_count_pct ~= 33.3 and blended_mer ~= 3.9"
RECON=$(curl -sf http://localhost:8000/api/reconcile)
echo "$RECON" | "$PY" - <<'EOF' || { echo "FAIL reconcile"; exit 1; }
import json, sys
d = json.load(sys.stdin)
assert abs(d.get("over_count_pct", 0) - 33.3) < 0.5, d.get("over_count_pct")
assert abs(d.get("blended_mer", 0) - 3.9) < 0.15, d.get("blended_mer")
print("    blended_mer=%s over_count_pct=%s flag=%s" % (
    d.get("blended_mer"), d.get("over_count_pct"), d.get("tracking_integrity_flag")))
EOF
echo "PASS reconcile (spec aggregates intact)"

if [ "$WITH_WEB" = "1" ]; then
  echo "==> [web] starting next dev on :3000"
  (cd web && npm run dev) &
  WEB_PID=$!
  sleep 5
  echo "    dashboard: http://localhost:3000"
fi

echo ""
echo "PerfOS demo running. Ctrl-C to stop."
wait "$API_PID"
