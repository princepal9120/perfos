#!/usr/bin/env bash
# PerfOS UI completion wave (28 agents) — codex + gemini-3.7-flash.
# Canonical repo: /Users/princepal/Desktop/coding/PerfOS
set -u
REPO="/Users/princepal/Desktop/coding/PerfOS"
cd "$REPO" || exit 1
mkdir -p .build/ui
MODEL="gemini-3.7-flash"
SHARED="Read docs/UI_DESIGN_SPEC.md and docs/ADKIT_FEATURE_REFERENCE.md FIRST. You are completing the PerfOS web UI (Next.js 14 App Router, Tailwind v3, apps/web). Visual language: dark premium adkit.so-style. Canvas #09090b, surface #0c0c0f, borders white/[0.08], text zinc-100/400/500, single accent blue-500/400. NEW code MUST match this exact palette (no new color tokens or fonts). Sentence-case headers, tabular-nums on metrics, hover/active/focus states, composed empty + skeleton loading states, real draft copy (no 'Acme Corp'). Import from @/components/ui/* and @/lib/utils (cn). 'use client' for interactivity. Edit ONLY your assigned files. Do NOT touch apps/api or other agents' files. When done, run: cd $REPO && npx nx run web:build  and fix ONLY errors your files caused. Then write a one-line summary to .build/ui/C<ID>.done."

# id|assignment
AGENTS=(
"01|Rewrite ONLY app/(dashboard)/layout.tsx. Replace its inline duplicate nav with imports of components/shell/sidebar.tsx (already built), components/shell/topbar.tsx, components/shell/command-menu.tsx, components/shell/page-header.tsx, components/shell/status-pill.tsx, components/shell/empty-state.tsx. Keep the same canvas/surface classes (#09090b, #0c0c0f, white/[0.08]). There must be exactly ONE sidebar. The sidebar, topbar, command-menu, page-header, status-pill, empty-state files will be created by other agents — import them (do not create them). Verify the build compiles with these imports present."
"02|Create ONLY components/shell/topbar.tsx. Top bar: workspace name (PerfOS Mock), a search/command trigger button that opens the command menu (accept an onOpenCommand prop or dispatch a custom event 'open-command-menu'), a status-pill slot, and an avatar circle. Match palette: bg #09090b, border white/[0.08], text zinc-200/400, accent blue-400. Use 'use client'."
"03|Create ONLY components/shell/command-menu.tsx. Client ⌘K command palette: a modal overlay (bg black/60) with an input and a list of dashboard routes (overview, discovery, creative, loop, measurement, accounts, recommendations, experiments, agents, mcp, command-center, chat, settings, integrations). Filter by typed query, navigate on Enter/click, close on Escape/backdrop. Expose open via custom event 'open-command-menu' (window.dispatchEvent) and also a controlled prop. Match palette."
"04|Create ONLY components/shell/page-header.tsx. Props: title, description?, actions? (ReactNode). Renders an h1 title (text-zinc-100, tracking-tight), optional muted description (text-zinc-400), and a right-aligned actions slot. Sentence case."
"05|Create ONLY components/shell/status-pill.tsx. A small pill showing 'Mock data' (emerald) by default with a status dot, or accept a `live` prop to show 'Live' (blue). Match palette: border emerald-500/20 bg emerald-500/10 text emerald-400."
"06|Create ONLY components/shell/empty-state.tsx. Props: icon? (ReactNode), title, description?, action? (ReactNode). Composed empty state: centered, icon in a bordered rounded box, title (text-zinc-100), muted description (text-zinc-500), action below. Used by discovery/measurement/others."
"07|Create ONLY app/not-found.tsx. Branded 404: 'Page not found', short line, a Link back to /overview styled like a primary button (components/ui/button). Match palette."
"08|Create ONLY components/discovery/winners-table.tsx. A data table (use components/ui/table) of scored competitor ads: columns platform, advertiser, hook (truncated), score (tabular-nums), runtime days, delta. Rows hover bg white/[0.04]. Accept a `rows` prop (array of plain objects). Match palette."
"09|Create ONLY components/discovery/ad-preview.tsx. A card previewing one winning ad: platform badge, advertiser, headline/body, score chip, estimated spend range. Accept an `ad` prop. Use components/ui/card + badge. Match palette."
"10|Create ONLY components/discovery/score-breakdown.tsx. Horizontal score bars for components runtime/reach/concentration/spend (0-1 each). Accept a `scores` prop ({runtime,reach,concentration,spend}). Bars use accent blue-500. Labels in zinc-500, values tabular-nums."
"11|Create ONLY components/discovery/empty-discovery.tsx. An empty state (use components/shell/empty-state) saying no winning ads yet, with a 'Run discovery' primary action (accept onRun prop). Sentence case copy."
"12|Rewrite ONLY app/(dashboard)/discovery/page.tsx. Compose: a KPI strip (spend, winners found, avg score, runtime), persona-picker (exists at components/discovery/persona-picker.tsx — import it), winners-table (C08), a selected ad-preview (C09), score-breakdown (C10) for the top winner, and empty-discovery (C11) when no data. Keep it a client component and building. Use mock local state if no API."
"13|Create ONLY components/create/script-brief.tsx. A brief form: hook (textarea), body (textarea), cta (input), format + platform segmented controls. Controlled via value/onChange props (Brief type). Label fields in zinc-400. Inputs: border white/[0.08] bg white/[0.03] focus blue-500/40. 'use client'."
"14|Create ONLY components/create/ad-variant.tsx. A card showing one generated variant: label, hook, body, cta, predicted hold3s/ctr/score (tabular-nums), score chip. Accept a `variant` prop. Use components/ui/card + badge. Copy + Send-to-review buttons. Match palette."
"15|Create ONLY components/create/generate-panel.tsx. A panel with a Generate button (components/ui/button) and a loading skeleton state (accept `generating` prop). 'use client'."
"16|Create ONLY components/create/variant-grid.tsx. Grid of ad-variant cards (C14) from a `variants` prop array. Responsive 1/2 cols. 'use client'."
"17|Refactor ONLY app/(dashboard)/creative/page.tsx to use the create/* components (script-brief C13, generate-panel C15, variant-grid C16, ad-variant C14) while keeping the empty/generating/done flow and the same copy. Import them; keep build green. 'use client'."
"18|Create ONLY components/loop/stage-flow.tsx. A horizontal, scrollable flow of the 6 loop stages (find, score, create, launch, track, double-down) with status badges (idle/ok/paused). Accept a `stages` prop (array {id,label,status}). Match palette."
"19|Create ONLY components/loop/audit-log.tsx. A list of audit entries (timestamp, actor, action, target, decision). Accept a `entries` prop array. Rows hover bg white/[0.04], monospace timestamps in zinc-500. 'use client'."
"20|Rewrite ONLY app/(dashboard)/loop/page.tsx to compose: stage-flow (C18), stage-card (exists at components/loop/stage-card.tsx — import), run-controls (exists at components/loop/run-controls.tsx — import), and audit-log (C19). Show the last-run JSON output below. Keep the dry-run fetch to /api/loop. Build green."
"21|Create ONLY components/measurement/iroas-chart.tsx. Horizontal bars per platform iROAS (accept `data` prop: {platform, iroas}[]). Bars accent blue-500, labels zinc-400, values tabular-nums. 'use client'."
"22|Create ONLY components/measurement/creative-table.tsx. A table (components/ui/table) of creatives: name, platform, roas, spend, status. Accept `rows` prop. tabular-nums, hover rows. Match palette."
"23|Create ONLY components/measurement/anomaly-list.tsx. A list of anomalies with severity chips (low/moderate/high using badge variants) and a short description. Accept `items` prop. 'use client'."
"24|Rewrite ONLY app/(dashboard)/measurement/page.tsx with tabs: iROAS (iroas-chart C21), Creatives (creative-table C22), Anomalies (anomaly-list C23), Optimizer (optimizer-plan exists at components/measurement/optimizer-plan.tsx — import). Use a simple tab state. Build green. 'use client'."
"25|Create ONLY components/recommendations/rec-card.tsx. A card: title, rationale, predicted impact (roas/spend), status chip, Approve + Reject buttons (accept onApprove/onReject props). Use components/ui/card + badge + button. Match palette."
"26|Rewrite ONLY app/(dashboard)/recommendations/page.tsx to render a list of rec-cards (C25) from local mock state (or fetch /api/recommendations if present, catch and fall back). Approve/Reject updates local status. Build green. 'use client'."
"27|Create ONLY components/experiments/exp-row.tsx. A table row (or card) for one A/B experiment: name, channel, status chip, primary metric + delta. Accept an `experiment` prop. Use tabular-nums. Match palette."
"28|Rewrite ONLY app/(dashboard)/experiments/page.tsx to render an experiments table using exp-row (C27) from local mock data. Build green. 'use client'."
)

for entry in "${AGENTS[@]}"; do
  id="${entry%%|*}"
  task="${entry#*|}"
  prompt="$SHARED

YOUR ASSIGNMENT (C$id): $task

Write your files, then run: cd $REPO && npx nx run web:build
Fix only errors your files introduced. Then write .build/ui/C$id.done with a one-line summary."
  log=".build/ui/C${id}.log"
  codex exec --model "$MODEL" --approve-for-me "$prompt" > "$log" 2>&1 &
  echo "launched C$id"
done

echo "All 28 completion agents dispatched."
wait
echo "All completion agents finished." > .build/ui/complete.done
