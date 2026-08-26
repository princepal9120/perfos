# PerfOS 50-Agent Build Swarm — High-Level Plan

Goal: extend PerfOS from a **measurement + safety OS** into an **agent-first,
end-to-end ad lifecycle OS**: find competitors' winning ads -> score them ->
generate clips -> launch on your accounts -> track -> double down.
All four new stages are built by wrapping MIT/Apache OSS (you own it, no keys for
the spy stage). PerfOS keeps its unique moat: reconciliation + policy-gated safety.

Model: `opencode-go/ox-alpha-free`. Runner: `scripts/launch_50_agents.sh`.
Each agent edits ONLY its exclusive files and writes `.build/status/Axx.done`.
No agent commits, pushes, installs system packages, or edits files outside its list.

## Architecture (new modules, additive — existing code untouched)

```
apps/api/src/app/
  discovery/            # FIND + SCORE (the missing half)
    find/               # OSS adapters: MetaAdsCollector, meta-ads-scraper,
                        #   TikTok Ad Library, Google Transparency, LinkedIn, X
    find/schemas.py     # SpyAd, Advertiser, CreativeAsset (Pydantic)
    find/ingest.py      # competitor -> SpyAd pipeline
    find/store.py       # SQLite store + dedupe
    find/persona_channel_map.py  # SaaS->TikTok/IG, dropship->Meta/TikTok,
                                 #   beauty/GenZ->Snap/IG, B2B->LinkedIn/X
    score/              # winner engine (adoracle port + tiers + persona fit)
  create/               # CREATE / clips (wrap adkit, MPT, cutagent, commercial-creator)
  loop/                 # orchestrator: find->score->create->launch->track->double-down
  mcp_server.py         # EXTENDED by A42 with discovery + create + loop tools
```

OSS reused (license-verified MIT/Apache-2.0):
- find Meta: `promisingcoder/MetaAdsCollector` (MIT, no key, all countries) +
  `athm793/meta-ads-scraper` (Apache-2.0, Playwright+SQLite).
- find TikTok/Google/LinkedIn/X: `adkit/ads-mcp` (MIT, 12*) + `markifact-mcp` (MIT) adapters.
- score: `redzicdenis08-afk/adoracle` (MIT, deterministic 0-100, hooks/angles, longevity).
- create: `adkit/ads-mcp` (spy+launch+create), `harry0703/MoneyPrinterTurbo` (MIT, 116k*),
  `teamgroove/cutagent` (MIT), `cxbxmxcx/commercial-creator` (MIT, MCP).
- launch/track/double-down: extend existing PerfOS connectors + policy gate
  (Google/Meta/TikTok/LinkedIn/X connectors already exist; mock mode works).
- agent surface: existing `mcp_server.py` (FastMCP) extended with new tools.

## 50 agents (exclusive file ownership)

### FOUNDATION (A1-A5)
- A1: `app/core/session_guard.py` + `app/core/config.py` add DISCOVERY settings; per-request DB sessions; reuse X-Workspace-Id.
- A2: scaffold `__init__.py` for `discovery/`, `discovery/find/`, `discovery/score/`, `create/`, `loop/` (empty packages + docstrings).
- A3: `NOTICE` + `scripts/oss_audit.py` enumerating every OSS dep + license (MIT/Apache only).
- A4: `Dockerfile`, `docker-compose.yml` add Playwright deps for meta-ads-scraper.
- A5: `docs/DISCOVERY_ARCHITECTURE.md` describing new modules + loop.

### FIND / SPY (A6-A15)
- A6: `discovery/find/schemas.py` (SpyAd, Advertiser, CreativeAsset Pydantic v2).
- A7: `discovery/find/meta_ads_collector.py` (wrap MetaAdsCollector; no key; all countries; normalize->SpyAd).
- A8: `discovery/find/meta_ads_scraper.py` (wrap meta-ads-scraper Playwright; SQLite; normalize).
- A9: `discovery/find/tiktok_ads_library.py` (adapter to adkit tiktok spy; normalize).
- A10: `discovery/find/google_ads_transparency.py` (adapter; normalize).
- A11: `discovery/find/linkedin.py` (adapter via markifact/adkit; normalize).
- A12: `discovery/find/x.py` (X/Twitter adapter; normalize).
- A13: `discovery/find/ingest.py` (pipeline: competitor name -> SpyAd rows; idempotent).
- A14: `discovery/find/store.py` (SQLite store + dedupe by ad id + persona tag).
- A15: `discovery/find/persona_channel_map.py` (persona->channels config, JSON-backed).

### SCORE / WINNER ENGINE (A16-A24)
- A16: `discovery/score/normalize.py` (canonical Ad from any SpyAd source).
- A17: `discovery/score/hooks.py` (hook detection + evidence spans).
- A18: `discovery/score/angles.py` (angle detection: price/quality/fomo/proof...).
- A19: `discovery/score/longevity.py` (runtime scoring, winner proxy).
- A20: `discovery/score/winner_tiers.py` (high_conf / winner / emerging / loser).
- A21: `discovery/score/persona_fit.py` (fit winner to persona->channel).
- A22: `discovery/score/dna_diff.py` (compare winner vs user's existing ads).
- A23: `discovery/score/adoracle_port.py` (port adoracle deterministic 0-100).
- A24: `discovery/score/scoring_api.py` + `tests/test_scoring.py` (GET /api/discovery/winners).

### CREATE / CLIPS (A25-A34)
- A25: `create/adkit_mcp_client.py` (wrap adkit/ads-mcp spy+launch+create).
- A26: `create/money_printer_turbo.py` (adapter, local subprocess/API).
- A27: `create/cutagent.py` (adapter, fal.ai storyboard-first).
- A28: `create/commercial_creator.py` (adapter, spend-gated MCP).
- A29: `create/brief.py` (winner -> creative brief).
- A30: `create/variation_matrix.py` (hooks x bodies x CTAs).
- A31: `create/pipeline.py` (orchestrate generation -> media store).
- A32: `create/media_store.py` (store generated clips, hash).
- A33: `create/persona_presets.py` (creative presets per persona).
- A34: `create/create_api.py` + `tests/test_create.py` (POST /api/create/generate).

### LAUNCH / TRACK / DOUBLE-DOWN (A35-A42)
- A35: extend connectors (new `connectors/launch_from_winner.py`) to accept winner brief; do NOT edit existing connector files.
- A36: `loop/safety_gate.py` draft-first launch (paused; human approve) reusing policy.
- A37: `loop/track.py` pull ROAS for launched ads.
- A38: `loop/double_down.py` scale winners / kill losers policy.
- A39: `loop/reconcile_spy.py` fold spy-spend into attribution.
- A40: `loop/anomaly_launch.py` anomaly detection on new launches.
- A41: `loop/optimizer_hook.py` feed winners into existing budget optimizer.
- A42: `mcp_server.py` ADD discovery + create + loop tools (append only; do not alter existing tools).

### ORCHESTRATOR (A43-A47)
- A43: `loop/orchestrator.py` full loop find->score->create->launch->track->double-down.
- A44: `loop/safety_gate.py` external-write gate (calls A36 + policy).
- A45: `loop/dispatch.py` integrate with existing ConnectedAgent dispatch.
- A46: `loop/observability.py` track recommendation->outcome for spy too.
- A47: `loop/api.py` + `tests/test_loop.py` (POST /api/loop/run).

### WEB UI (A48-A50)
- A48: `web/app/(dashboard)/discovery/page.tsx` spy dashboard (search competitor, see ads).
- A49: `web/app/(dashboard)/winners/page.tsx` + `web/app/(dashboard)/studio/page.tsx` winners board + create studio.
- A50: `web/app/(dashboard)/double-down/page.tsx` + `web/app/page.tsx` landing update.

## Hard rules
1. Additive only. Do NOT rewrite existing modules (connectors, policy, routes, services, mcp_server core).
2. Mock/safe by default. Spy adapters must work with no API key (Meta public library). Launch adapters call adkit/markifact only when user connects keys.
3. Every external write (launch) goes through `loop/safety_gate.py` -> existing policy -> human approval.
4. Tests are pytest for backend (pure functions), `tsc --noEmit` for frontend. Do NOT run the full suite.
5. Write `.build/status/Axx.done` with one line of what you built. No git commit.
6. Keep demo aggregates (12k/8k/78k/3.9x/33.3%) intact. Do not touch seed data.

## Acceptance
- `discovery/score/scoring_api.py` returns winners with tiers.
- `create/create_api.py` returns a generation job id (mock-safe).
- `loop/api.py` runs the loop end-to-end in mock mode (find mock -> score -> create mock -> launch paused -> track mock -> double-down decision).
- MCP server exposes discovery + create + loop tools alongside measurement tools.
- Web shows discovery + winners + studio + double-down pages that build clean.
