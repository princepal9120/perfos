#!/usr/bin/env bash
# PerfOS UI 50-agent build swarm launcher (opencode, ox-alpha-free).
# Canonical repo: /Users/princepal/Desktop/coding/PerfOS
# Each agent reads docs/UI_DESIGN_SPEC.md + UI_BUILD_PLAN_50.md, edits only its
# assigned files, verifies with `npx nx run web:build`, writes .build/ui/A<NN>.done.
set -u
REPO="/Users/princepal/Desktop/coding/PerfOS"
cd "$REPO" || exit 1
mkdir -p .build/ui
MODEL="opencode-go/ox-alpha-free"
SPEC="Read docs/UI_DESIGN_SPEC.md and UI_BUILD_PLAN_50.md FIRST. You are building the PerfOS web UI (Next.js 14 App Router, Tailwind v3, apps/web). Follow the design spec EXACTLY: dark premium adkit.so-style, one accent (#3b82f6), Space Grotesk display + Inter body, tabular-nums on metrics, active nav state, hover/active/focus micro-interactions, composed empty + skeleton loading states, sentence-case headers, real draft copy (no 'Acme Corp', no exclamation success). Edit ONLY your assigned files. Do NOT touch apps/api or other agents' files. When done, run the command: npx nx run web:build from the repo root and fix any errors your files caused (do NOT 'fix' unrelated files). Then write a one-line summary to .build/ui/A<ID>.done via the Write tool."

# id|assignment
AGENTS=(
"01|Design system globals: edit ONLY app/globals.css. Add CSS vars, base background/typography, tabular-nums utility, focus ring, scroll-smooth, subtle noise overlay class. Match tailwind tokens."
"02|Tailwind theme: edit ONLY tailwind.config.ts. Tune tokens per spec (warm #0a0a0b canvas, radius scale lg/md/sm, tinted shadow, display/body font vars). Do not break existing token names used by pages."
"03|Root layout: edit ONLY app/layout.tsx. Wire next/font for Space Grotesk (display) + Inter (body), set --font-display-face/--font-body-face vars, metadata, skip-to-content link, favicon link."
"04|Button component: edit ONLY components/ui/button.tsx. primary/secondary/ghost variants with hover bg shift, active scale(0.98), visible focus ring, 200ms transition."
"05|Card component: edit ONLY components/ui/card.tsx. surface bg + 1px subtle border, varied radius, tinted shadow, optional hover lift."
"06|Badge component: edit ONLY components/ui/badge.tsx. status + delta chips (up green/down red, neutral), square (not pill) option."
"07|Skeleton component: edit ONLY components/ui/skeleton.tsx. shimmer skeleton matching layout blocks."
"08|Table component: edit ONLY components/ui/table.tsx. sortable data table, tabular-nums, row hover, empty-state slot."
"09|Dashboard shell: edit ONLY app/(dashboard)/layout.tsx. sidebar + topbar shell, active nav state, workspace switcher slot, command trigger, status pill, avatar."
"10|Sidebar: create/edit ONLY components/shell/sidebar.tsx. nav items (overview, discovery, create, loop, measurement, accounts, recommendations, experiments, agents, mcp, command-center, creative, integrations, settings, chat) with active marker (accent left border + muted bg)."
"11|Topbar: create/edit ONLY components/shell/topbar.tsx. workspace name, search/command trigger, status pill slot, avatar menu."
"12|Command menu: create/edit ONLY components/shell/command-menu.tsx. client component ⌘K command palette that navigates dashboard routes."
"13|Page header: create/edit ONLY components/shell/page-header.tsx. title + description + actions slot, sentence case."
"14|Status pill: create/edit ONLY components/shell/status-pill.tsx. mock-mode / live status indicator."
"15|404: create/edit ONLY app/not-found.tsx. branded page-not-found with back link."
"16|Empty state: create/edit ONLY components/shell/empty-state.tsx. composed empty state (icon + one-line guidance + primary action)."
"17|Overview page: edit ONLY app/(dashboard)/overview/page.tsx. KPI grid + narrative + rec preview + change list + health strip, using components/overview/* and ui/*."
"18|KPI cards: create/edit ONLY components/overview/kpi-cards.tsx. asymmetric KPI grid, tabular nums, delta chips."
"19|Narrative: create/edit ONLY components/overview/narrative.tsx. iROAS narrative copy block (real draft copy)."
"20|Rec preview: create/edit ONLY components/overview/recommendation-preview.tsx. latest recommendation card."
"21|Change list: create/edit ONLY components/overview/change-list.tsx. recent changes list."
"22|Health strip: create/edit ONLY components/overview/health-strip.tsx. per-platform health mini-cards."
"23|Discovery page: edit ONLY app/(dashboard)/discovery/page.tsx. query input, persona picker, winners table, score breakdown, empty state."
"24|Persona picker: create/edit ONLY components/discovery/persona-picker.tsx. saas/dropship/beauty/b2b select."
"25|Winners table: create/edit ONLY components/discovery/winners-table.tsx. scored competitors using ui/table, tabular nums."
"26|Ad preview: create/edit ONLY components/discovery/ad-preview.tsx. single winning ad card."
"27|Score breakdown: create/edit ONLY components/discovery/score-breakdown.tsx. score component bars (runtime/reach/concentration/spend)."
"28|Empty discovery: create/edit ONLY components/discovery/empty-discovery.tsx. run-first empty state."
"29|Creative page: edit ONLY app/(dashboard)/creative/page.tsx. creative studio landing using components/create/*."
"30|Script brief: create/edit ONLY components/create/script-brief.tsx. brief form (hook/cta/body) with client validation."
"31|Ad variant: create/edit ONLY components/create/ad-variant.tsx. variant preview card."
"32|Generate panel: create/edit ONLY components/create/generate-panel.tsx. generate action + loading skeleton."
"33|Variant grid: create/edit ONLY components/create/variant-grid.tsx. generated variants grid."
"34|Loop page: edit ONLY app/(dashboard)/loop/page.tsx. pipeline viz find->score->create->launch->track->double-down with stage counts + run controls + audit log."
"35|Stage flow: create/edit ONLY components/loop/stage-flow.tsx. horizontal stage flow with statuses."
"36|Stage card: create/edit ONLY components/loop/stage-card.tsx. one stage card (count, status)."
"37|Run controls: create/edit ONLY components/loop/run-controls.tsx. dry-run/run buttons + confirm dialog."
"38|(reserved merge) — edit ONLY components/loop/audit-log.tsx. audit trail list. If file exists, enhance; else create."
"39|Measurement page: edit ONLY app/(dashboard)/measurement/page.tsx. tabs: iROAS / creatives / anomalies / optimizer using components/measurement/*."
"40|iROAS chart: create/edit ONLY components/measurement/iroas-chart.tsx. per-platform iROAS bars."
"41|Creative table: create/edit ONLY components/measurement/creative-table.tsx. creatives list using ui/table."
"42|Anomaly list: create/edit ONLY components/measurement/anomaly-list.tsx. anomalies with severity chips."
"43|Optimizer plan: create/edit ONLY components/measurement/optimizer-plan.tsx. reallocation plan view."
"44|Accounts page: edit ONLY app/(dashboard)/accounts/page.tsx. connected ad accounts grid (meta/google/tiktok/linkedin/x) with connect states."
"45|Recommendations page: edit ONLY app/(dashboard)/recommendations/page.tsx. rec list + approve/reject using components/recommendations/rec-card."
"46|Rec card: create/edit ONLY components/recommendations/rec-card.tsx. recommendation card with approve/reject buttons + status."
"47|Experiments page: edit ONLY app/(dashboard)/experiments/page.tsx. A/B experiments table."
"48|Exp row: create/edit ONLY components/experiments/exp-row.tsx. experiment row with status + metric."
"49|Agents + MCP pages: edit ONLY app/(dashboard)/agents/page.tsx and app/(dashboard)/mcp/page.tsx. agent roster + MCP tools list."
"50|Command/chat/settings/integrations pages: edit ONLY app/(dashboard)/command-center/page.tsx, chat/page.tsx, settings/page.tsx, integrations/page.tsx. Compose each surface (command center = quick actions; chat = agent chat shell; settings = workspace/config form; integrations = marketplace grid)."
)

for entry in "${AGENTS[@]}"; do
  id="${entry%%|*}"
  task="${entry#*|}"
  prompt="$SPEC

YOUR ASSIGNMENT (A$id): $task

Write your files, then run: cd $REPO && npx nx run web:build
Fix only errors your files introduced. Then write .build/ui/A$id.done with a one-line summary."
  log=".build/ui/A${id}.log"
  nohup opencode run --model "$MODEL" --auto "$prompt" > "$log" 2>&1 &
  echo "launched A$id"
done

echo "All 50 UI agents dispatched."
wait
echo "All UI agents finished." > .build/ui/launcher.done
