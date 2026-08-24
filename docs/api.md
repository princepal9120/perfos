# PerfOS API Reference

Base URL: `http://127.0.0.1:8000` — all routes under the `/api` prefix.
Interactive docs: `/docs` (Swagger UI).

## Auth & scoping

- `POST /api/auth/token` returns a lightweight workspace token
  (demo credentials: username `demo`, password `demo`). No heavy auth deps.
- All list endpoints are scoped by workspace. Pass `X-Workspace-Id: <id>`
  (the seeded demo workspace is **"Demo DTC Brand"**).
- Responses are JSON, validated by Pydantic v2 response models.

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/auth/token` | Exchange credentials for a workspace token |
| GET | `/api/workspaces` | List workspaces |
| GET | `/api/accounts` | List connected ad/revenue accounts |
| POST | `/api/accounts` | Connect a mock Google / Meta / Shopify account |
| GET | `/api/reconcile?workspace_id=` | Reconciliation output (claimed vs actual, blended MER, over-count flag) |
| GET | `/api/briefing` | Daily briefing: `{kpis, changes[], recommendations[], narrative}` |
| GET | `/api/recommendations` | List recommendations with evidence + status |
| POST | `/api/recommendations/{id}/approve` | Run policy → execute (mock) → audit log |
| POST | `/api/recommendations/{id}/reject` | Reject a recommendation |
| GET | `/api/experiments` | List experiments |
| POST | `/api/experiments` | Create an experiment |
| GET | `/api/outcomes` | List recorded outcomes (before/after metrics) |
| GET | `/api/agents` | List ConnectedAgents (ChatGPT / Claude / opencode) |
| POST | `/api/agents` | Register a ChatGPT / Claude / opencode agent |
| POST | `/api/agents/{id}/dispatch` | Record a dispatch event, update `last_run_at` |
| GET | `/api/health` | Liveness check |

## Key payloads

### `GET /api/reconcile`

```json
{
  "total_spend": 20000,
  "platform_claimed_value": 104000,
  "actual_revenue": 78000,
  "blended_mer": 3.9,
  "per_channel": [
    {"platform": "google", "spend": 12000, "claimed_value": 60000, "claimed_roas": 5.0},
    {"platform": "meta",   "spend": 8000,  "claimed_value": 44000, "claimed_roas": 5.5}
  ],
  "over_count_value": 26000,
  "over_count_pct": 33.0,
  "tracking_integrity_flag": true
}
```

`tracking_integrity_flag` is true when over-count exceeds 15%.

### `POST /api/auth/token`

Request:

```json
{"username": "demo", "password": "demo"}
```

Response: token + workspace id for use in the `X-Workspace-Id` header.

### Policy decisions (`approve`)

Approval runs the safety policy engine; decisions are one of
`allow`, `block`, `needs_approval` and always carry a `reasons[]` list.
Guardrails enforced in code:

- budget change > 25% ⇒ blocked
- cross-workspace recommendation ⇒ blocked
- confidence < 0.6 ⇒ requires approval (status stays pending)
- every executed action ⇒ audit-log entry with rollback payload
