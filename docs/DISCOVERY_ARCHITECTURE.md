# Discovery Architecture — Find · Score · Create · Loop

PerfOS extends from a **measurement + safety OS** into an **agent-first,
end-to-end ad lifecycle OS**: find competitors' winning ads → score them →
generate clips → launch on your accounts → track → double down. All four new
stages are built by wrapping MIT/Apache-2.0 OSS (you own it; no keys needed
for the spy stage). PerfOS keeps its moat: reconciliation and policy-gated
safety.

Everything here is **additive**. Existing connectors, policy, routes,
services, seed data, and the core of `mcp_server.py` are untouched. The whole
surface runs offline in **mock mode** against SQLite, like the rest of PerfOS.
There are **no external LLM calls** anywhere in these modules — scoring and
briefing stay deterministic rules, same rule as the MVP.

```
apps/api/src/app/
  discovery/
    find/                     # FIND — spy stage
      schemas.py              #   SpyAd, Advertiser, CreativeAsset (Pydantic v2)
      meta_ads_collector.py   #   wrap promisingcoder/MetaAdsCollector (MIT, no key)
      meta_ads_scraper.py     #   wrap athm793/meta-ads-scraper (Apache-2.0, Playwright+SQLite)
      tiktok_ads_library.py   #   adkit tiktok spy adapter
      google_ads_transparency.py
      linkedin.py             #   markifact/adkit adapters
      x.py
      ingest.py               #   competitor name -> SpyAd rows (idempotent)
      store.py                #   SQLite store + dedupe (ad id + persona tag)
      persona_channel_map.py  #   SaaS->TikTok/IG, dropship->Meta/TikTok,
                              #   beauty/GenZ->Snap/IG, B2B->LinkedIn/X
    score/                    # SCORE — winner engine (adoracle port + tiers + persona fit)
      normalize.py            #   canonical Ad from any SpyAd source
      hooks.py                #   hook detection + evidence spans
      angles.py               #   price / quality / fomo / proof ...
      longevity.py            #   runtime scoring -> winner proxy
      winner_tiers.py         #   high_conf | winner | emerging | loser
      persona_fit.py          #   fit winner to persona -> channel
      dna_diff.py             #   winner vs user's existing ads
      adoracle_port.py        #   deterministic 0-100 quality score (adoracle port)
      scoring_api.py          #   GET /api/discovery/winners
  create/                     # CREATE — clips (wrap OSS generators)
      adkit_mcp_client.py money_printer_turbo.py cutagent.py commercial_creator.py
      brief.py                #   winner -> creative brief
      variation_matrix.py     #   hooks x bodies x CTAs
      pipeline.py media_store.py persona_presets.py
      create_api.py           #   POST /api/create/generate -> job id
  loop/                       # LAUNCH / TRACK / DOUBLE-DOWN + orchestration
      safety_gate.py          #   draft-first launch (paused; human approve) -> policy
      track.py                #   pull ROAS for launched ads
      double_down.py          #   scale winners / kill losers policy
      reconcile_spy.py        #   fold spy-spend into attribution
      anomaly_launch.py       #   anomaly detection on new launches
      optimizer_hook.py       #   feed winners into existing budget optimizer
      orchestrator.py dispatch.py observability.py
      api.py                  #   POST /api/loop/run
  connectors/launch_from_winner.py  # NEW file; accepts winner briefs (existing connectors untouched)
  mcp_server.py               # EXTENDED append-only: discovery + create + loop tools
```

## Layer position

The four stages bolt onto the existing stack without changing it:

```
┌──────────────────────────────────────────────────────────────────┐
│ Console (web/) — discovery · winners · studio · double-down pages│
├──────────────────────────────────────────────────────────────────┤
│ MCP surface — app.mcp_server                                     │
│ measurement_* tools (existing) + discovery_* create_* loop_* (new)│
├──────────────────────────────────────────────────────────────────┤
│ Lifecycle layer — NEW                                            │
│ discovery.find → discovery.score → create → loop                 │
├───────────────────────┬──────────────────────────────────────────┤
│ Agent layer (existing)│ Connector layer (existing)               │
│ recommend · policy    │ google · meta · tiktok · linkedin · x    │
│ orchestrator          │ + launch_from_winner (new file)          │
├───────────────────────┴──────────────────────────────────────────┤
│ Attribution layer (existing) — reconcile · attribute             │
│ + loop/reconcile_spy folds spy-spend into the same reconciliation│
├──────────────────────────────────────────────────────────────────┤
│ Data layer (existing) — SQLAlchemy 2.0 models · Pydantic v2      │
│ discovery adds its own SQLite tables (spy_ads, winners, jobs)    │
└──────────────────────────────────────────────────────────────────┘
```

Workspace scoping reuses the existing `X-Workspace-Id` header everywhere;
per-request DB sessions come from `app/core/session_guard.py`.

## Stage 1 — FIND (`discovery/find/`)

Public ad libraries are scraped or fetched through thin OSS adapters. No API
keys: the Meta Ad Library is public; other platforms go through adkit /
markifact adapters that degrade gracefully when unauthenticated.

- **`schemas.py`** — the spy-stage contracts: `SpyAd` (platform, ad archive
  id, advertiser, creative assets, first/last seen, countries, personas),
  `Advertiser`, `CreativeAsset`. Pydantic v2, frozen where practical.
- **Collectors** (one file per platform) normalize raw library payloads into
  `SpyAd`s. Each collector is independently usable and independently mocked:
  in mock mode they return fixture rows instead of hitting the network.
- **`ingest.py`** — pipeline: competitor name → collector fan-out (selected by
  persona channel map) → normalized `SpyAd` rows. Idempotent: re-running an
  ingest never duplicates rows.
- **`store.py`** — local SQLite persistence with dedupe keyed on
  `(platform, ad_archive_id)` plus a persona tag, so the same ad can be
  tracked per-persona without duplication.
- **`persona_channel_map.py`** — JSON-backed config mapping business persona
  → priority channels: SaaS → TikTok/Instagram, dropship → Meta/TikTok,
  beauty/Gen-Z → Snapchat/Instagram, B2B → LinkedIn/X. Ingest uses it to pick
  collectors; score uses it for fit.

## Stage 2 — SCORE (`discovery/score/`)

A deterministic winner engine — the adoracle approach ported in-repo. Pure
functions throughout; no network, no LLM, fully unit-testable.

- **`normalize.py`** — collapses any platform's `SpyAd` into one canonical
  `Ad` shape the rest of the engine consumes.
- **`hooks.py` / `angles.py`** — detect hooks (first-3-second patterns) and
  persuasion angles (price, quality, FOMO, social proof, ...) with evidence
  spans pointing back into the creative text.
- **`longevity.py`** — runtime-based winner proxy: how long and how widely an
  ad has been running is the cheapest honest signal of performance.
- **`adoracle_port.py`** — deterministic 0–100 composite score combining
  hooks, angles, and longevity signals.
- **`winner_tiers.py`** — buckets scored ads into `high_conf | winner |
  emerging | loser`.
- **`persona_fit.py`** — scores how well a winner fits the user's persona →
  channel map before anyone spends a dollar cloning it.
- **`dna_diff.py`** — compares a winner's DNA (hooks/angles/format) against
  the user's own existing ads: clone what's missing, don't relearn what works.
- **`scoring_api.py`** — `GET /api/discovery/winners`: tiered winners for a
  workspace, workspace-scoped via `X-Workspace-Id`.

Data path: `SpyAd → normalize → canonical Ad → score (0-100) → tier → persona
fit → WinnerScore`.

## Stage 3 — CREATE (`create/`)

Winners become briefs; briefs become clip variations through wrapped OSS
generators. Generation runs locally or through the OSS tooling already in the
repo's dependency set — mock mode returns placeholder media so the full loop
works offline.

- **`brief.py`** — winner → structured creative brief (hook, angle, format,
  channel constraints from the persona map).
- **`variation_matrix.py`** — expands a brief into a hooks × bodies × CTAs
  matrix so each launch tests a real hypothesis, not one guess.
- **Generator adapters**: `adkit_mcp_client.py` (adkit/ads-mcp spy+launch+
  create), `money_printer_turbo.py` (MoneyPrinterTurbo, local subprocess/API),
  `cutagent.py` (fal.ai storyboard-first), `commercial_creator.py`
  (spend-gated MCP server).
- **`pipeline.py`** — orchestrates generation jobs; `media_store.py` persists
  generated clips content-hashed; `persona_presets.py` carries creative
  presets per persona.
- **`create_api.py`** — `POST /api/create/generate` returns a generation job
  id immediately (mock-safe); jobs complete asynchronously.

Data path: `WinnerScore → CreativeBrief → variation matrix → generator job →
media asset (hash)`.

## Stage 4 — LAUNCH / TRACK / DOUBLE-DOWN (`loop/`)

This stage is deliberately boring: it reuses PerfOS's existing safety spine.
Every external write — launching an ad, scaling budget — goes through
`loop/safety_gate.py` → existing `app/agents/policy.py` → human approval.
Draft-first: created campaigns launch **paused**, a human flips them live.

- **`safety_gate.py`** — wraps any launch/scale action as a `Recommendation`
  flowing the standard path: `Recommendation → Approval → Outcome → AuditLog`.
  Budget-change limits, confidence thresholds, and rollback payloads are the
  existing policy's, not reimplemented. (Hardened later into the
  external-write gate calling policy directly.)
- **`launch_from_winner.py`** (new file under `connectors/`) accepts winner
  briefs and drives existing platform connectors; no existing connector file
  is edited.
- **`track.py`** — pulls actual ROAS for launched ads through the existing
  connector/metrics path.
- **`reconcile_spy.py`** — folds spy-side observations into the same
  reconciliation math the measurement OS already trusts, so claimed-vs-actual
  stays the single source of truth.
- **`anomaly_launch.py`** — flags anomalies on fresh launches early.
- **`double_down.py`** — encodes the scale-winners / kill-losers policy;
  proposals again route through the safety gate.
- **`optimizer_hook.py`** — hands proven winners to the existing budget
  optimizer as candidate inputs.
- **`dispatch.py` / `observability.py`** — integrate with existing
  `ConnectedAgent` dispatch and record recommendation → outcome chains,
  including for spy-derived recommendations.

## The agent lifecycle loop

`loop/orchestrator.py` sequences all six steps; `loop/api.py` exposes it as
one endpoint. In mock mode the whole chain runs end-to-end offline:

```
find (mock competitors' ads)
  └─> score (tier winners deterministically)
        └─> create (brief -> variations -> mock clips)
              └─> launch (draft-first, PAUSED, via safety gate -> human approves)
                    └─> track (pull real/mock ROAS)
                          └─> double down (scale winners / kill losers, gated again)
                                └─> feed results back into find/score priors
```

Acceptance for the loop: `POST /api/loop/run` completes find mock → score →
create mock → launch paused → track mock → double-down decision, producing
auditable artifacts at each step. Nothing goes live without human approval,
and nothing executes without an audit trail carrying its rollback payload.

## MCP surface

`mcp_server.py` gains discovery, create, and loop tools **append-only** —
existing measurement/list tools stay byte-for-byte identical — so any agent
(Claude, ChatGPT, opencode) can drive the lifecycle: search competitors, list
winners by tier, request clip generation, run the loop, inspect gate status.

## Safety invariants

1. **Additive only.** New packages, new files; existing modules untouched.
2. **Mock-safe by default.** Every collector, generator, and tracker works
   with zero credentials; real calls happen only after the user connects keys.
3. **Gated writes.** Every external write passes `safety_gate.py` → existing
   policy → human approval, with audit + rollback.
4. **Deterministic intelligence.** Scoring and briefing are pure functions;
   no external LLM calls.
5. **Demo truth intact.** Seed data untouched: Google $12k spend / $60k
   claimed value, Meta $8k / $44k, Shopify actual revenue $78k on $20k total
   ⇒ 33.3% over-count, blended MER 3.9x.

## Ownership map

| Stage | Files | Agents |
|---|---|---|
| Foundation | session_guard/config, package scaffolds, NOTICE/OSS audit, Docker deps, this doc | A1–A5 |
| FIND | `discovery/find/*` (schemas, 6 collectors, ingest, store, persona map) | A6–A15 |
| SCORE | `discovery/score/*` (+ `scoring_api.py`, `tests/test_scoring.py`) | A16–A24 |
| CREATE | `create/*` (+ `create_api.py`, `tests/test_create.py`) | A25–A34 |
| LAUNCH/TRACK | `loop/safety_gate..anomaly/optimizer`, `connectors/launch_from_winner.py`, mcp tools | A35–A42 |
| ORCHESTRATION | `loop/orchestrator.py`, gate v2, dispatch, observability, `api.py` + test | A43–A47 |
| WEB UI | discovery/winners/studio/double-down pages, landing | A48–A50 |

Tests follow the house rule: pytest over pure functions for backend logic
(`tests/test_scoring.py`, `test_create.py`, `test_loop.py`); no full-suite
runs during construction.
