# PerfOS Agent Loop — the 50-agent build

This document describes how PerfOS' ad-lifecycle layer (find → score → create →
launch → track → double-down) was built by a swarm of 50 scoped build agents,
maps every module that swarm produced, and shows how to run the loop end to end
in dry-run (mock-safe: no keys, no network writes, no spend).

Related docs: `BUILD_PLAN_50.md` (high-level plan + hard rules),
`docs/DISCOVERY_ARCHITECTURE.md`, `README.md` ("perfos-loop" section).

---

## 1. The 50-agent build approach

**Runner.** `scripts/launch_50_agents.sh` dispatches all 50 agents in parallel
via `opencode run "<prompt>" --model opencode-go/ox-alpha-free --auto`, each with
the repo root as its working directory. The launcher waits for all of them and
reports the done count.

**Ownership model.** Every agent gets:

- one bounded objective (the "what"), defined per agent ID in
  `scripts/launch_50_agents.sh` (`objective()`), grouped into waves matching
  `BUILD_PLAN_50.md`;
- a shared boilerplate (the "how"): edit **only your assigned files**, keep
  everything additive, no `git commit`/`git push`, no system packages, mock-safe
  by default;
- a completion contract: write `.build/status/Axx.done` (one-line summary) when
  the assigned files are self-consistent, then stop.

Because file ownership is exclusive and additive, agents cannot collide: new
packages (`discovery/`, `create/`, `loop/`) are written fresh; existing modules
(connectors, policy engine, routes, seed data) are never rewritten.

**Hard rules** (from `BUILD_PLAN_50.md`):

1. Additive only — existing modules untouched.
2. Mock/safe by default — spy adapters work keyless; launch paths only touch
   platforms behind the policy gate.
3. Every external write goes through `loop/safety_gate.py` → existing PerfOS
   policy (`app.agents.policy`) → human approval.
4. Tests are pytest for backend; demo aggregates (12k/8k spend, 78k revenue,
   3.9x MER, 33% over-count) are never modified.
5. Status markers in `.build/status/Axx.done`; agent stdout in `Axx.log`.

**Waves.**

| Wave | Agents | Scope |
| --- | --- | --- |
| Foundation | A01–A05 | Package scaffolds, find-layer config, OSS license audit, Docker deps, architecture doc |
| Find / spy | A04–A15 | Meta + TikTok + Google Transparency collectors, canonical schemas (`AdRecord`/`SpyAd`), dedupe store, merge runner |
| Score / winner engine | A08–A24 | Weighted scoring, tiers, hook/angle detection, longevity, persona fit, DNA diff |
| Create / clips | A17–A34 | Provider adapters (cutagent, MoneyPrinterTurbo, commercial-creator, adkit MCP), briefs, clip generation, asset store |
| Launch / track / double-down | A28–A41 | Launch plans, ROAS tracking, scale/kill decisions, launch-from-winner connector, safety gate |
| Orchestrator | A31–A47 | Stage chaining, scheduler, MCP tools, API routers, tests |
| Web UI | A41–A50 | Discovery dashboard, loop runner page, README append, verify script |

---

## 2. Module map

Everything below lives under `apps/api/src/app/` unless noted. All new code is
pure-Python and mock-safe; `# REAL hook:` comments mark where OSS adapters wire
in when keys are present.

### Discovery — find competitor ads

| Module | Entry points | Notes |
| --- | --- | --- |
| `discovery/schemas.py` | `AdRecord`, `CompetitorProfile`, `WinnerSignal` | Canonical Pydantic models shared by all stages |
| `discovery/find/meta_collector.py` | `collect_meta_ads(page_size, filters)` (async) | Mock rows in canonical schema; REAL hook: MetaAdsCollector / meta-ads-scraper |
| `discovery/find/google_ads_transparency.py` | `search_ads()`, `normalize_transparency_record()` | Mock mode auto-detected; Google Ads Transparency adapter |
| `discovery/find/schemas.py`, `discovery/find/store.py` | SpyAd row models, local store | Dedupe by ad id |
| `discovery/store.py` | `WinnerStore.add()/all()/top(n)` | Persists winners to `.build/winners.json` |

### Discovery — score winners

| Module | Entry points | Notes |
| --- | --- | --- |
| `discovery/score/winner_tiers.py` | `classify_tier(score, runtime_days)`, `classify_ad(ad)` | Tier thresholds on runtime as winner proxy |
| `discovery/score/angles.py` | `detect_angles(ad)`, `extract_angles(ads)`, `angle_vector(ad)` | Hook/price/FOMO/proof angle detection with evidence |
| `discovery/score/dna_diff.py` | `extract_dna(ad)`, `dna_similarity(winner, other)`, `diff_winner_vs_ads(...)` | Winner DNA vs your existing ads |

### Create — clip generation

| Module | Entry points | Notes |
| --- | --- | --- |
| `create/schemas.py` | `CreativeBrief`, `GeneratedAsset`, `VideoClip` | Dataclasses carried through the pipeline |
| `create/clipgen.py` | `generate_clips(brief)` | Mock 2-clip generator; REAL hook: cutagent / MoneyPrinterTurbo / commercial-creator |
| `create/cutagent.py`, `create/money_printer_turbo.py`, `create/commercial_creator.py`, `create/adkit_mcp_client.py` | provider adapters | Same mock-first contract; commercial-creator staging is free, spend needs named approver |
| `create/config.py` | `PROVIDERS`, base brief | Provider registry |

### Loop — orchestration & safety

| Module | Entry points | Notes |
| --- | --- | --- |
| `loop/config.py` | `LOOP_STAGES`, `LoopState` | Stage order: find, score, create, launch, track, double-down |
| `loop/safety_gate.py` | `submit_write`, `approve_draft`, `reject_draft`, `mark_executed`, process-wide `gate` | Draft-first external-write gate (see §4); reuses `app.agents.policy.evaluate`; no I/O itself |
| `loop/stages/launch_stage.py` | `launch_stage(assets, channels, dry_run=True)` | One plan dict per channel; status "planned"; never touches a platform |
| `loop/stages/track_stage.py` | `track_stage(launches)` | Mock performance rows (impressions/spend/conversions) |
| `loop/stages/double_down_stage.py` | `double_down_stage(tracking)` | roas ≥ 2.0 → scale, < 1.0 → kill, else hold; data only |
| `loop/scheduler.py` | `LoopScheduler(interval, tick, dry_run=True).start()/stop()` | Interval driver; dry-run ticks log only, real work via injected `tick` when `dry_run=False` |

### Connectors & config

| Module | Notes |
| --- | --- |
| `connectors/launch_from_winner.py` | `launch_from_winner(brief)` — creates a PAUSED draft campaign in an in-memory store (ids ≥ 9100, never touching the canonical demo campaigns); platform validated read-only via `connectors.registry` |
| Existing `connectors/*` (meta, google, tiktok, linkedin, twitter, revenue) | Untouched by the swarm |
| `config/perfos_settings.py` | Env-driven `PERFOS_DRY_RUN` (default **true**) and `PERFOS_PERSONA` (default "saas") |

### Web

- `apps/web/app/(dashboard)/discovery/page.tsx` — spy dashboard.
- `apps/web/app/(dashboard)/loop/page.tsx` — stage list + "Run Loop (dry-run)" button.

> **Gap vs plan:** the single `run_loop()` orchestrator function, the
> `/api/loop` + `/api/discovery` routers, and the 0–100 scorer chain
> (`normalize` → `adoracle_port` feeding `winner_tiers`) are spec'd in
> `BUILD_PLAN_50.md` (A08/A31/A43–A47) but not yet landed; today the six
> stages compose manually (§3.3) while the proven API-level loop is the
> measurement/safety loop (§3.2).

---

## 3. Running the loop end to end in dry-run

Dry-run is the default everywhere: `PERFOS_DRY_RUN` defaults true, stage
functions default `dry_run=True`, the safety gate only produces paused drafts,
and connectors serve mock data under `MOCK_MODE=true`. No API keys required.
Run everything with the repo venv (`apps/api/.venv`) or after
`. .venv/bin/activate`; `python` below means that interpreter.

### 3.1 One-shot verification (test suite)

```bash
scripts/verify_build.sh          # runs apps/api pytest suite + lists .done markers
# or directly:
cd apps/api && python -m pytest -q
```

Key suites covering the chain: `tests/test_api_loop.py` (API-level loop),
`tests/test_safety_gate.py`, `tests/test_launch_from_winner.py`,
`tests/test_score_angles.py`, `tests/test_winner_tiers.py`,
`tests/test_dna_diff.py`, `tests/test_discovery_find_store.py`.
The DB env (`MOCK_MODE=true`, SQLite scratch file) is set by
`tests/conftest.py` before any app import.

### 3.2 Live API loop (measurement → recommendation → approve → execute)

```bash
cd apps/api && MOCK_MODE=true DATABASE_URL=sqlite:///./perfos_dev.db \
  python -m uvicorn app.main:app --port 8000

# then:
curl -s http://127.0.0.1:8000/api/health
# -> {"status":"ok"}

TOKEN_JSON=$(curl -s -X POST http://127.0.0.1:8000/api/auth/token \
  -H 'Content-Type: application/json' -d '{"username":"demo","password":"demo"}')
WS=$(echo "$TOKEN_JSON" | python3 -c 'import sys,json;print(json.load(sys.stdin)["workspace_id"])')

REC_ID=$(curl -s -X POST http://127.0.0.1:8000/api/recommendations/generate \
  -H "X-Workspace-Id: $WS" | python3 -c 'import sys,json;print(json.load(sys.stdin)[0]["id"])')

curl -s -X POST "http://127.0.0.1:8000/api/recommendations/$REC_ID/approve" \
  -H "X-Workspace-Id: $WS" -H 'Content-Type: application/json' \
  -d '{"actor":"manual-dry-run"}'
# -> {"decision":"allow", ..., "status":"executed"}
```

That round-trip exercises the full safety spine: policy evaluation → mock
execution → audit log. This is exactly what `tests/test_api_loop.py` asserts.

### 3.3 Ad-lifecycle stage chain (find → … → double-down, all mock)

```python
import asyncio
from app.discovery.find.meta_collector import collect_meta_ads
from app.create.clipgen import generate_clips
from app.create.schemas import CreativeBrief
from app.loop.stages.launch_stage import launch_stage
from app.loop.stages.track_stage import track_stage
from app.loop.stages.double_down_stage import double_down_stage

ads = asyncio.run(collect_meta_ads(page_size=100))                      # FIND (mock)
winners = sorted(ads, key=lambda a: a["impressions"], reverse=True)[:2]  # SCORE (reach proxy)
assets = generate_clips(CreativeBrief(source_ad_id=winners[0]["ad_id"],
                                      brief_text="remix winning hook"))  # CREATE (mock)
plans = launch_stage(assets, ["meta", "google"])                         # LAUNCH (plans only)
tracked = track_stage(plans)                                             # TRACK (mock metrics)
decisions = double_down_stage(tracked)                                   # DOUBLE-DOWN
print(decisions)
```

Verified output shape:

```
find: 3 | winners: ['MT-LEDG-003', 'MT-GOOG-001'] | assets: 2 | plans: ['meta', 'google']
decisions: [{'asset_id': None, 'roas': None, 'decision': 'hold', ...}, ...]
```

Notes:
- Nothing here performs an external write: `launch_stage` returns plans whose
  steps are literally `submit_plan_to_safety_gate → await_human_approval →
  execute_via_connectors`.
- Winner selection is a reach proxy for now — mock collector rows don't carry
  `score`/`runtime_days`, which `discovery.score.winner_tiers.classify_ad`
  expects (see gap note in §2).
- `track_stage` rows have spend but no revenue yet, so decisions come back
  `hold`; feed rows with a `roas` (or revenue + spend) to see
  scale (≥ 2.0) / kill (< 1.0) fire.

### 3.4 Scheduler smoke (dry-run ticks)

```bash
cd apps/api && PYTHONPATH=src python -m app.loop.scheduler
# logs two "[dry-run] loop tick (no external effects)" lines, exits
```

---

## 4. Safety-gate contract (external writes)

Every would-be platform write flows through `loop/safety_gate.py`:

```
submit_write(write) ──policy block──▶ blocked            (terminal)
        │
        └─▶ pending_approval   (paused draft, human gate)
                 approve ─▶ approved   (caller may execute, then mark_executed)
                 reject  ─▶ rejected    (terminal)
```

The gate performs no I/O and makes no network calls; execution happens only in
the existing services/connectors layer after approval. `connectors/
launch_from_winner.py` follows the same model — it always creates campaigns in
`status: "paused"` and requires human activation. In practice this means the
entire system can be driven end to end in dry-run indefinitely, and going live
is an explicit, auditable human act.

---

## 5. Build status artifacts

- `.build/status/Axx.log` — raw stdout/stderr of each agent run.
- `.build/status/Axx.done` — completion marker with one-line summary.
- `scripts/verify_build.sh` — reruns the test suite and lists markers.
