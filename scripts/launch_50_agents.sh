#!/usr/bin/env bash
# PerfOS 50-agent build swarm launcher (canonical path).
# Uses opencode-go/ox-alpha-free for ALL 50 agents.
# Canonical repo: /Users/princepal/Desktop/coding/PerfOS
# Agents write files directly (no rtk wrapper). Each edits ONLY its files.
# Launcher waits for all 50 to finish, then exits 0. No agent commits.

set -u
REPO="/Users/princepal/Desktop/coding/PerfOS"
MODEL="opencode-go/ox-alpha-free"
STATUS_DIR="$REPO/.build/status"
mkdir -p "$STATUS_DIR"

# Standard agent boilerplate (appended to every agent prompt)
common() {
  cat <<EOF
You are a build agent for the PerfOS repo at $REPO.
CRITICAL EXECUTION RULES:
- Your current working directory is already $REPO. Use RELATIVE paths from there.
- Write files DIRECTLY with your file-writing tool. Do NOT use a CLI called 'rtk' or any shell wrapper; it is not available and will fail.
- Edit ONLY the files assigned to you below. Do NOT modify other modules, connectors, the policy engine, or existing routes.
- Do NOT run 'git commit' or 'git push'. The orchestrator controls git.
- When your assigned files are written and self-consistent, create the file $STATUS_DIR/A${1}.done containing a one-line summary. Then stop.
- Keep it additive: create new files; do not rewrite existing ones unless explicitly told.
EOF
}

# Per-agent objective (the "what to build")
objective() {
  case "$1" in
    A01) echo "Foundation: create apps/api/src/app/discovery/__init__.py ('Discovery package: find winning ads, score them, feed PerfOS.'), apps/api/src/app/create/__init__.py ('Creative generation package (clip/asset assembly).'), apps/api/src/app/loop/__init__.py ('Closed-loop orchestration: find->score->create->launch->track->double-down.'). Add a one-line docstring each.";;
    A02) echo "Create apps/api/src/app/discovery/__init__.py docstring; create apps/api/src/app/discovery/find/__init__.py ('Find winning competitor ads package.').";;
    A03) echo "Find layer config: create apps/api/src/app/discovery/find/config.py with BASE_DIR, default page_size=100, source registry dict {meta: True, tiktok: True, google: False, linkedin: False, x: False}, and from .config import * style re-export.";;
    A04) echo "Meta find: create apps/api/src/app/discovery/find/meta_collector.py implementing async def collect_meta_ads(page_size, filters) -> list[dict] that returns mock ad dicts in schema {platform, advertiser, ad_id, creative_url, spend_estimate, impressions, start_date, text, hook, cta} with >=3 mock entries; include a clear # REAL hook: wire to promisingcoder/MetaAdsCollector / athm793/meta-ads-scraper when keys present.";;
    A05) echo "TikTok find: create apps/api/src/app/discovery/find/tiktok_collector.py async def collect_tiktok_ads(page_size, filters) -> list[dict] returning mock entries in the same schema as A04; note # REAL hook: proxy-intell/tiktok-ads-library-mcp. Provide 3 mock entries.";;
    A06) echo "Schemas: create apps/api/src/app/discovery/schemas.py with pydantic (or dataclass) models AdRecord, CompetitorProfile, WinnerSignal with fields {platform, advertiser, ad_id, creative_url, spend_estimate, impressions, start_date, text, hook, cta, score, tier}. Used by all find/score agents.";;
    A07) echo "Score: create apps/api/src/app/discovery/score/__init__.py ('Score competitors' ads and rank winners.').";;
    A08) echo "Winner engine: create apps/api/src/app/discovery/score/winner_engine.py with def score_ads(ads: list[AdRecord]) -> list[WinnerSignal] implementing weights runtime=0.40, reach=0.30, concentration=0.20, spend=0.10, tiers (>=30d floor, >=45d strong, >=90d proven) and a longevity_days() helper. Reference adoracle scoring approach in a comment.";;
    A09) echo "Angles: create apps/api/src/app/discovery/score/angles.py with def extract_angles(ads) -> list[dict] that pulls hook/cta/offer themes from ad text (keyword heuristics). Mock implementation fine.";;
    A10) echo "Persona fit: create apps/api/src/app/discovery/score/persona_fit.py with PERSONA_MAP (saas->[tiktok,instagram,linkedin,x], dropship->[meta,tiktok], beauty->[instagram,tiktok,snap], b2b->[linkedin,x]) and def persona_fit(ad, persona) -> float in [0,1].";;
    A11) echo "Store: create apps/api/src/app/discovery/store.py with an in-memory + JSON-file store (class WinnerStore) saving WinnerSignal list to .build/winners.json. Methods add(), all(), top(n).";;
    A12) echo "Find orchestrator: create apps/api/src/app/discovery/find/runner.py async def run_find(persona, channels) -> list[AdRecord] that calls meta/tiktok collectors and merges; returns merged list. Mock data only.";;
    A13) echo "Score orchestrator: create apps/api/src/app/discovery/score/runner.py def run_score(ads, persona) -> list[WinnerSignal] calling winner_engine + angles + persona_fit and persisting via store.";;
    A14) echo "Discovery CLI: create apps/api/src/app/discovery/cli.py exposing a function run_discovery(persona='saas', channels=None) that chains find->score->store and returns top winners dict. No external deps beyond stdlib + local modules.";;
    A15) echo "Tests find: create apps/api/tests/test_find.py with pytest cases for meta_collector and tiktok_collector returning >=1 ad with required schema keys.";;
    A16) echo "Tests score: create apps/api/tests/test_score.py with pytest for score_ads tier thresholds (a 95-day ad -> 'proven'; a 10-day ad -> not promoted).";;
    A17) echo "Create package: create apps/api/src/app/create/__init__.py ('Creative generation package (clip/asset assembly).'); create apps/api/src/app/create/config.py with PROVIDERS={cutagent:True, mpt:True, commercial_creator:True} and a base CreativeBrief dataclass.";;
    A18) echo "Create schemas: create apps/api/src/app/create/schemas.py with CreativeBrief, GeneratedAsset, VideoClip dataclasses {source_ad_id, brief_text, asset_url, duration_s, provider}.";;
    A19) echo "Clip gen: create apps/api/src/app/create/clipgen.py with def generate_clips(brief: CreativeBrief) -> list[GeneratedAsset] returning 2 mock clips; note # REAL hook: teamgroove/cutagent, harry0703/MoneyPrinterTurbo, cxbxmxcx/commercial-creator.";;
    A20) echo "Hook remix: create apps/api/src/app/create/hook_remix.py with def remix_hook(winner: WinnerSignal) -> list[str] producing 3 variant hook lines from a winner's hook.";;
    A21) echo "Asset store: create apps/api/src/app/create/store.py class AssetStore saving GeneratedAsset to .build/assets.json with add()/all()/by_source(ad_id).";;
    A22) echo "Create orchestrator: create apps/api/src/app/create/runner.py def run_create(winners: list[WinnerSignal]) -> list[GeneratedAsset] calling clipgen + hook_remix + store.";;
    A23) echo "Create tests: create apps/api/tests/test_create.py pytest for generate_clips returning 2 assets and remix_hook returning 3 variants.";;
    A24) echo "Loop package: create apps/api/src/app/loop/__init__.py ('Closed-loop orchestration: find->score->create->launch->track->double-down.'); create apps/api/src/app/loop/config.py with LOOP_STAGES list and a LoopState dataclass.";;
    A25) echo "Find integration: create apps/api/src/app/loop/stages/find_stage.py with def find_stage(persona, channels) -> list[AdRecord] calling discovery.cli.run_discovery.";;
    A26) echo "Score stage: create apps/api/src/app/loop/stages/score_stage.py def score_stage(ads, persona) -> list[WinnerSignal].";;
    A27) echo "Create stage: create apps/api/src/app/loop/stages/create_stage.py def create_stage(winners) -> list[GeneratedAsset].";;
    A28) echo "Launch stage: create apps/api/src/app/loop/stages/launch_stage.py def launch_stage(assets, channels, dry_run=True) -> list[dict] returning a mock launch plan per channel; note # REAL hook: adkit/ads-mcp + markifact + mkt-cli behind PerfOS connectors policy gate.";;
    A29) echo "Track stage: create apps/api/src/app/loop/stages/track_stage.py def track_stage(launches) -> list[dict] returning mock performance rows {impressions, spend, conversions}.";;
    A30) echo "Double-down stage: create apps/api/src/app/loop/stages/double_down_stage.py def double_down_stage(tracking) -> list[dict] deciding scale/kill per asset using a simple ROAS threshold (>=2 scale, <1 kill).";;
    A31) echo "Loop orchestrator: create apps/api/src/app/loop/orchestrator.py async def run_loop(persona='saas', channels=None, dry_run=True) -> dict chaining all 6 stages and returning a summary dict with counts per stage.";;
    A32) echo "Loop scheduler: create apps/api/src/app/loop/scheduler.py with class LoopScheduler that can run_loop on an interval (asyncio sleep placeholder) and exposes start()/stop(). Dry-run default.";;
    A33) echo "Loop CLI: create apps/api/src/app/loop/cli.py with def perfos_loop(persona='saas', dry_run=True) -> dict that calls orchestrator and prints a short summary; importable.";;
    A34) echo "Loop tests: create apps/api/tests/test_loop.py pytest for run_loop returning a dict with keys find/score/create/launch/track/double_down counts >0 in dry-run.";;
    A35) echo "MCP registration: create apps/api/src/app/mcp_server_extra.py that imports the existing mcp_server FastMCP instance (from app.mcp_server import mcp) and registers 3 new tools: perfos_find_ads(persona), perfos_score_winners(persona), perfos_run_loop(persona, dry_run). Use @mcp.tool() decorator. Do not break existing tools.";;
    A36) echo "MCP tool bodies: create apps/api/src/app/mcp_tools.py with the 3 tool implementations (find->run_discovery, score->run_score, loop->run_loop) referencing the discovery/loop modules. Imported by mcp_server_extra.";;
    A37) echo "MCP schemas: create apps/api/src/app/mcp_schemas.py with request/response pydantic models for the 3 new MCP tools (FindRequest, ScoreRequest, LoopRequest, and their responses).";;
    A38) echo "MCP tests: create apps/api/tests/test_mcp.py pytest that imports mcp_server_extra and asserts the 3 tools are registered (use mcp.list_tools() or inspect).";;
    A39) echo "Launch connector wrapper: create apps/api/src/app/connectors/launch_bridge.py that wraps PerfOS existing connector interface with a method launch_creative(asset, channel, policy_check=True) which in dry-run returns a plan dict and otherwise calls the channel connector only after a policy check. Reference adkit/ads-mcp + markifact + mkt-cli as the real backend.";;
    A40) echo "Config wiring: create apps/api/src/app/config/perfos_settings.py with a PerfosSettings dataclass reading env P ERFOS_DRY_RUN (default True), P ERFOS_PERSONA default 'saas', and a get_settings() factory.";;
    A41) echo "Web: create apps/web/app/(dashboard)/discovery/page.tsx a simple client component rendering a button 'Run Discovery' that POSTs to /api/discovery and lists returned winners (mock UI, no real fetch needed but wire the endpoint).";;
    A42) echo "Web: create apps/web/app/(dashboard)/loop/page.tsx a client component showing loop stages and a 'Run Loop (dry-run)' button posting to /api/loop.";;
    A43) echo "API discovery route: create apps/api/src/app/routers/discovery.py with a FastAPI router exposing POST /api/discovery {persona} -> run_discovery result and GET /api/winners -> store.top(20). Wire into main app import (add a comment where to include_router).";;
    A44) echo "API loop route: create apps/api/src/app/routers/loop.py FastAPI router POST /api/loop {persona, dry_run} -> run_loop summary and GET /api/loop/status returning last run state from .build/loop_state.json.";;
    A45) echo "API create route: create apps/api/src/app/routers/create.py FastAPI router POST /api/create {persona} -> run_create on top winners and GET /api/assets.";;
    A46) echo "Docs: create docs/DISCOVERY.md describing the find->score->create flow, the OSS projects reused (MetaAdsCollector, adoracle, adkit, cutagent, MoneyPrinterTurbo), and the mock/dry-run contract.";;
    A47) echo "Docs: create docs/AGENT_LOOP.md describing the 50-agent build approach, the module map, and how to run the loop end to end in dry-run.";;
    A48) echo "Tests root: create apps/api/tests/test_integration_smoke.py that imports discovery.cli, create.runner, loop.orchestrator and asserts the full dry-run chain runs without error.";;
    A49) echo "README update: append a 'perfos-loop (agent build)' section to README.md describing the new discovery/create/loop modules and the 50-agent build. Keep existing content; only append.";;
    A50) echo "Final verify helper: create scripts/verify_build.sh that runs 'cd apps/api && python -m pytest tests/' and prints pass/fail, and lists which .build/status/A*.done files exist. Make it executable (chmod +x).";;
    *) echo "Unknown agent $1";;
  esac
}

PIDS=()
for n in $(seq -w 1 50); do
  id="A${n}"
  prompt="$(objective "$id")

$(common "$id")"
  log="$STATUS_DIR/${id}.log"
  # background each agent; cwd = canonical repo; wait later
  ( cd "$REPO" && opencode run "$prompt" --model "$MODEL" --auto > "$log" 2>&1; echo "EXIT:$?" >> "$log" ) &
  PIDS+=($!)
  echo "dispatched $id (pid $!)"
done

echo "All 50 dispatched. Waiting for completion..."
for pid in "${PIDS[@]}"; do
  wait "$pid"
done
echo "All 50 agents finished. Done count: $(ls "$STATUS_DIR"/*.done 2>/dev/null | wc -l)"
