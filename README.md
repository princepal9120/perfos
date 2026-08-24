# PerfOS — AI Performance Marketing OS

> ## Your AI performance marketer.
> ### Connect Google + Meta + Shopify. See what actually happened to your money.

PerfOS is an open performance-marketing operating system. It connects your ad
platforms and your revenue sources, then tells you the one thing no ad platform
ever will: **how much of your money actually worked**.

## The honest-attribution wedge

Every ad platform grades its own homework. Google says it drove $60k of value,
Meta says $44k — together they claim **$104,000** on $20,000 of spend
(claimed ROAS ~5x). But your store only took in **$78,000** of real revenue.

That's a **33% over-count**, invisible inside every platform dashboard because
each one only shows you its own story.

PerfOS puts revenue where it belongs — at the source of truth:

- **Spend** comes from ad platforms (Google, Meta).
- **Revenue** comes from your checkout (Shopify, Stripe). Revenue is truth.
- A reconciliation engine compares claimed vs. actual, flags tracking
  integrity problems (>15% over-count), and computes **blended MER**
  (revenue ÷ total spend) — *the* honest number. In the demo scenario:
  $78,000 ÷ $20,000 = **3.9x blended MER**, not the 5.0–5.5x the platforms claim.
- An explainable, conservative attribution model allocates real revenue by
  spend-weighted share — never parroting platform self-reported conversions.
- A recommendation engine proposes actions (e.g. budget reallocation), and a
  policy engine enforces guardrails in code: >25% budget changes blocked,
  cross-workspace actions rejected, low-confidence moves require approval,
  every executed action gets an audit log with a rollback payload.

No black boxes. No external LLM calls in the MVP (deterministic rules +
templated briefings; an `llm_hook` stub is documented for later). Every number
is traceable to evidence.

## Quickstart

Zero credentials, fully offline in mock mode:

```bash
cd PerfOS
python3 -m venv .venv && . .venv/bin/activate
pip install -e ".[postgres]"
export MOCK_MODE=true DATABASE_URL=sqlite:///./perfos.db
python scripts/seed.py           # loads the Demo DTC Brand mock scenario
uvicorn app.main:app --port 8000 # serves the API at http://127.0.0.1:8000
```

Interactive API docs: <http://127.0.0.1:8000/docs>

Then the console (Next.js 14):

```bash
cd web && npm install && npm run dev   # console at http://localhost:3000 -> /overview
```

The frontend proxies `/api/*` to the backend (see `web/lib/api.ts` and
`next.config`).

### Demo credentials

| Field    | Value  |
| -------- | ------ |
| Username | `demo` |
| Password | `demo` |

Exchange them at `POST /api/auth/token` for a workspace token, or pass the
demo workspace directly via the `X-Workspace-Id` header on scoped endpoints.
The seeded workspace is **"Demo DTC Brand"** (USD).

## Mock mode

Local development runs fully offline against deterministic fixtures:

- Set `MOCK_MODE=true` (the default for local dev) and connectors read from
  the in-memory mock backends in `app/mock` instead of live APIs.
- Real platform adapters exist behind the same `BaseConnector` interface but
  raise `NotImplementedError` until wired up.
- The seed produces these exact aggregates so the dashboard and the
  reconciliation engine always agree:

| Metric                  | Value                          |
| ----------------------- | ------------------------------ |
| Google spend / claimed  | $12,000 / $60,000 (ROAS 5.0)   |
| Meta spend / claimed    | $8,000 / $44,000 (ROAS 5.5)    |
| Total spend             | $20,000                        |
| Platform claimed value  | $104,000                       |
| Actual Shopify revenue  | $78,000 (950 orders)           |
| Over-count              | $26,000 (**33%** → flagged)    |
| Blended MER             | **3.9x**                       |

Financial-safety note: AI features in the MVP are deterministic rules and
templated narratives. No money decisions are delegated to a model.

## Docs

- [Architecture](docs/ARCHITECTURE.md) — layers, data flow, safety model
- [API reference](docs/api.md) — every endpoint

## License

TBD by project owner.
