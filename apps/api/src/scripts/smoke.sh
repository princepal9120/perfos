#!/usr/bin/env bash
# PerfOS end-to-end smoke test.
# Assumes the FastAPI backend is ALREADY running (default http://localhost:8000).
# Override with: BASE=http://host:port ./scripts/smoke.sh
#
# Steps: health -> auth token -> reconcile (over_count_pct ~33) ->
#        recommendations/generate -> approve -> assert executed.
# Prints PASS/FAIL per step; exits non-zero if any step failed.
set -u

BASE="${BASE:-http://localhost:8000}"
WS_ID="${WS_ID:-1}"
API_KEY="${API_KEY:-smoke-test-key}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FAILURES=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s  %s\n' "$1" "${2:-}"; FAILURES=$((FAILURES + 1)); }

# req METHOD PATH [JSON_BODY] -> HTTP status on stdout, response body in $TMP/body
req() {
  local method="$1" path="$2" body="${3:-}"
  local args=(-sS --max-time 10 -o "$TMP/body" -w '%{http_code}' -X "$method"
              -H 'Content-Type: application/json' -H "X-Workspace-Id: $WS_ID")
  [[ -n "$body" ]] && args+=(-d "$body")
  curl "${args[@]}" "$BASE$path"
}

jsonget() { # jsonget KEY -> value of key in last response body
  python3 -c 'import json,sys
try:
    print(json.load(sys.stdin).get(sys.argv[1], ""))
except Exception:
    print("")' "$1" <"$TMP/body"
}

first_rec_id() { # id of first recommendation in list response
  python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
    print(d[0]["id"] if d else "")
except Exception:
    print("")' <"$TMP/body"
}

in_range() { # in_range VALUE LO HI
  awk -v v="$1" -v lo="$2" -v hi="$3" 'BEGIN { exit !(v >= lo && v <= hi) }'
}

echo "== PerfOS smoke against $BASE (workspace $WS_ID) =="

# --- Step 1: health ---
code="$(req GET /api/health)" || true
if [[ "$code" == "200" && "$(jsonget status)" == "ok" ]]; then
  pass "GET /api/health -> 200 {status:ok}"
else
  fail "GET /api/health" "http=$code body=$(cat "$TMP/body" 2>/dev/null)"
fi

# --- Step 2: auth token ---
code="$(req POST /api/auth/token "{\"api_key\":\"$API_KEY\"}")" || true
ACCESS_TOKEN="$(jsonget access_token)"
if [[ "$code" == "200" && -n "$ACCESS_TOKEN" ]]; then
  pass "POST /api/auth/token -> 200 (workspace $(jsonget workspace_id))"
else
  fail "POST /api/auth/token" "http=$code body=$(cat "$TMP/body" 2>/dev/null)"
fi

# --- Step 3: reconcile, over_count_pct ~= 33.3 ---
code="$(req GET "/api/reconcile?workspace_id=$WS_ID")" || true
PCT="$(jsonget over_count_pct)"
if [[ "$code" == "200" && -n "$PCT" ]] && in_range "$PCT" 30 36; then
  pass "GET /api/reconcile?workspace_id=$WS_ID -> over_count_pct=$PCT (~33)"
else
  fail "GET /api/reconcile?workspace_id=$WS_ID" \
    "http=$code over_count_pct=${PCT:-missing} expected ~33 (30..36) body=$(cat "$TMP/body" 2>/dev/null)"
fi

# --- Step 4: generate recommendations ---
code="$(req POST /api/recommendations/generate '{}')" || true
REC_ID="$(first_rec_id)"
if [[ "$code" == "201" && -n "$REC_ID" ]]; then
  pass "POST /api/recommendations/generate -> 201 (recommendation id=$REC_ID)"
else
  fail "POST /api/recommendations/generate" \
    "http=$code body=$(head -c 300 "$TMP/body" 2>/dev/null)"
fi

# --- Step 5: approve -> executed ---
if [[ -n "$REC_ID" ]]; then
  code="$(req POST "/api/recommendations/$REC_ID/approve" '{"actor":"smoke"}')" || true
  STATUS="$(jsonget status)"
  DECISION="$(jsonget decision)"
  if [[ "$code" == "200" && "$STATUS" == "executed" ]]; then
    pass "POST /api/recommendations/$REC_ID/approve -> status=executed (decision=$DECISION)"
  else
    fail "POST /api/recommendations/$REC_ID/approve" \
      "http=$code status=${STATUS:-missing} decision=$DECISION body=$(cat "$TMP/body" 2>/dev/null)"
  fi
else
  fail "POST /api/recommendations/<id>/approve" "skipped: no recommendation id from generate step"
fi

echo "== done: $FAILURES failure(s) =="
exit "$FAILURES"
