# Discovery — Find · Score · Create

PerfOS's discovery pipeline turns competitors' public ads into your own launch-ready
clips: **find** what rivals run on public ad libraries → **score** those ads into
deterministic winner tiers → **create** fresh creative from the winners' DNA.
This doc describes the runtime flow, the OSS projects each stage wraps, and the
mock/dry-run contract that keeps everything safe-by-default.

For the module-level build map see [`DISCOVERY_ARCHITECTURE.md`](./DISCOVERY_ARCHITECTURE.md).

```
find (public ad libraries → SpyAd rows)
  └─> score (canonical Ad → hooks/angles/longevity → 0–100 → tier)
        └─> create (winner → brief → variations → OSS generators → clips)
              └─> launch — draft-first, PAUSED, via loop/safety_gate.py
                    (see DISCOVERY_ARCHITECTURE.md Stage 4)
```

Code lives under `apps/api/src/app/discovery/{find,score}/`, `apps/api/src/app/create/`,
and `apps/api/src/app/loop/`.

## Stage 1 — FIND (`discovery/find/`)

Thin adapters over **public** ad libraries. One file per platform; every collector
normalizes its raw library payload into the shared `SpyAd` schema
(`discovery/find/schemas.py`: source, platform, platform_ad_id, advertiser,
headline/body/cta/landing_url, creatives, first/last seen, countries).

- Meta Ad Library is public — no keys required (MetaAdsCollector /
  meta-ads-scraper adapters).
- TikTok / Google / LinkedIn / X go through adkit (or markifact) adapters and
  degrade gracefully when unauthenticated.
- `ingest.py` fans out per persona channel map and writes deduped rows to the
  SQLite store keyed on `(platform, platform_ad_id)` + persona tag; re-running
  an ingest never duplicates.
- Output: `SpyAd` rows ready for scoring.

## Stage 2 — SCORE (`discovery/score/`)

A deterministic winner engine — pure functions, no network, no LLM calls.

1. `normalize.py` collapses any platform's `SpyAd` into one canonical `Ad`.
2. `hooks.py` / `angles.py` detect hooks (first-3-second patterns) and persuasion
   angles (price, quality, FOMO, social proof…) with evidence spans.
3. `longevity.py` scores observed runtime — how long/widely an ad has run is the
   cheapest honest performance signal.
4. `adoracle_port.py` combines the above into a deterministic **0–100 score**
   (in-repo port of adoracle).
5. `winner_tiers.py` buckets ads top-down (first match wins):

   | Tier | Gates |
   |---|---|
   | `high_conf` | score ≥ 75 **and** runtime ≥ 14 days |
   | `winner` | score ≥ 60 **and** runtime ≥ 7 days |
   | `emerging` | score ≥ 45 |
   | `loser` | below the bar |

   Invalid inputs degrade deterministically to `loser` rather than raising.

6. `persona_fit.py` / `dna_diff.py` check fit against the workspace persona→channel
   map and diff winner DNA against the user's own ads.
- Output: tiered `WinnerScore`s via `GET /api/discovery/winners`
  (workspace-scoped through `X-Workspace-Id`).

## Stage 3 — CREATE (`create/`)

Winners become briefs; briefs become clip variations through wrapped OSS generators.

1. `brief.py` turns a `WinnerScore` into a structured `CreativeBrief`
   (hook, angle, format, channel constraints from the persona map).
2. `variation_matrix.py` expands it into hooks × bodies × CTAs variants.
3. Generator adapters execute each variant:
   - `adkit_mcp_client.py` — spy + create + launch via adkit/ads-mcp
     (JSON-RPC 2.0 over HTTP when configured; deterministic local mock otherwise).
   - `cutagent.py` — compiles a brief into a cutagent-compatible 4-scene
     storyboard plus editor-importable project JSON (pure functions, no LLM).
   - `money_printer_turbo.py` — drives a local MoneyPrinterTurbo instance for
     short-form clips.
   - `commercial_creator.py` — spend-gated commercial-creator MCP server.
4. Output: generation jobs (`POST /api/create/generate` returns a job id;
   mock mode returns placeholder media) persisted content-hashed by
   `media_store.py`.

Launch stays outside this doc's scope except for one invariant: **nothing goes
live automatically.** Every launch flows draft-first and PAUSED through
`loop/safety_gate.py` → existing policy engine → human approval, with audit +
rollback payloads.

## OSS projects reused

Everything is MIT/Apache-2.0 — you own what runs. PerfOS wraps them behind thin
adapters; none of them are forked into the repo.

| Project | License | Used for | PerfOS wrapper |
|---|---|---|---|
| [promisingcoder/MetaAdsCollector](https://github.com/promisingcoder/MetaAdsCollector) | MIT | Collect competitor ads from the public Meta Ad Library, no API key, all countries | `discovery/find/meta_ads_collector.py` |
| [redzicdenis08-afk/adoracle](https://github.com/redzicdenis08-afk/adoracle) | MIT | Deterministic 0–100 ad quality scoring (hooks, angles, longevity) — approach ported in-repo so it stays pure-Python and testable | `discovery/score/adoracle_port.py` (+ tiers/persona fit around it) |
| [adkit/ads-mcp](https://github.com/adkit/ads-mcp) | MIT | Spy + create + launch MCP tool server (TikTok/Google Transparency/etc.). Google Ads Transparency has no official API, so live fetches route through adkit's `adkit_library` tool | `create/adkit_mcp_client.py`; referenced by `discovery/find/tiktok_ads_library.py` and `discovery/find/google_ads_transparency.py` |
| [teamgroove/cutagent](https://github.com/teamgroove/cutagent) | MIT | Storyboard-first video ads (fal.ai supplied by the operator). Rendering runs *outside* PerfOS: import the emitted project JSON into the cutagent editor | `create/cutagent.py` |
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | MIT | Short-form ad clip generation driven via a local MoneyPrinterTurbo instance | `create/money_printer_turbo.py` |

Also referenced elsewhere in discovery: `athm793/meta-ads-scraper` (Apache-2.0,
Playwright-based Meta library scraper) and `cxbxmxcx/commercial-creator` (MIT,
MCP) — see `create/commercial_creator.py`.

## Mock / dry-run contract

The whole surface runs offline by design. The rules every discovery/create
module follows:

1. **`MOCK_MODE=true` is the repo default** (`app/core/config.py`). With zero
   credentials and zero network, collectors, generators, trackers, and the loop
   all complete end-to-end.
2. **Mock wins unless two things are true at once**: `MOCK_MODE=false` **and**
   the relevant endpoint/key is configured (e.g. `ADKIT_MCP_URL` for adkit).
   See `resolve_transport()` in `create/adkit_mcp_client.py`.
3. **Determinism.** Mock answers are seeded by the sha256 of the request
   payload — the same request always yields the same ads, job ids, and receipt
   ids (`job-{digest}`, `rcpt-{digest}`). Tests can assert exact values.
4. **No external LLM calls anywhere** in discovery/score/create. Scoring and
   briefing are pure rules; mock media is placeholder content.
5. **Launches are never live from these modules.**
   - `LaunchRequest.confirm_live=False` (default): even the *real* HTTP transport
     refuses and returns a paused-draft receipt.
   - Receipts always come back `status="paused_pending_approval"`,
     `requires_approval=True`.
   - Any external write must still pass `loop/safety_gate.py` → policy engine →
     human approval; loop stages default to `dry_run=True`.
6. **Real-mode escape hatches** (opt-in only): set `MOCK_MODE=false` plus
   `ADKIT_MCP_URL` for adkit, or the local MoneyPrinterTurbo base URL for MPT.
   Missing endpoints raise a clear `RuntimeError` instead of silently faking
   success. cutagent rendering always happens in the cutagent editor/fal.ai —
   PerfOS emits the project JSON and stops there.

In short: mock mode is not a degraded demo — it is the contract. Same schemas,
same determinism, same safety gates; flipping to real mode changes only the
transport, never the approval path.
