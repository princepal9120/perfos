# PerfOS UI Completion Wave (28 agents, codex + gemini-3.7-flash)

Goal: complete the adkit.so-style UI to depth. The first 50-agent opencode wave
produced a BUILDING dashboard (18 routes, all 200) but left 21 planned files
missing and the active `app/(dashboard)/layout.tsx` bypasses the properly-built
`components/shell/sidebar.tsx` (orphaned). This wave fixes that and deepens pages.

Each agent runs in **codex** with model **gemini-3.7-flash**, edits ONLY its
assigned files, verifies with `cd apps/web && npx nx run web:build` (or from repo
root `npx nx run web:build`), fixes only its own errors, and writes
`.build/ui/C<NN>.done`. Do NOT commit/push. Do NOT touch apps/api.

Shared context baked into every prompt:
- Read `docs/UI_DESIGN_SPEC.md` and `docs/ADKIT_FEATURE_REFERENCE.md` FIRST.
- Visual language: dark premium adkit.so-style. Canvas `#09090b`, surface
  `#0c0c0f`, borders `white/[0.08]`, text `zinc-100/400/500`, single accent
  `blue-500/400`. The existing layout already uses these raw values — NEW code
  MUST match this exact palette (do not introduce new color tokens or fonts).
- Sentence-case headers, tabular-nums on metrics, hover/active/focus states,
  composed empty + skeleton loading states, real draft copy (no 'Acme Corp').
- Keep "use client" where interactivity is needed. Import from `@/components/ui/*`
  and `@/lib/utils` (cn).

## Layer 1 — Shell wiring + missing shell pieces (C01-C07)
- C01: `app/(dashboard)/layout.tsx` ONLY. Replace the inline duplicate nav with
  imports of `components/shell/sidebar.tsx` (already built, proper tokens),
  `topbar.tsx`, `command-menu.tsx`, `page-header.tsx`, `status-pill.tsx`,
  `empty-state.tsx`. Keep the same canvas/surface classes. Remove the second
  sidebar definition so there is ONE sidebar. Verify build.
- C02: `components/shell/topbar.tsx` — workspace name + search/command trigger
  (opens command-menu), status pill slot, avatar. Uses existing palette.
- C03: `components/shell/command-menu.tsx` — client ⌘K palette; navigates the
  dashboard routes; closes on select/Escape.
- C04: `components/shell/page-header.tsx` — title + description + actions slot.
- C05: `components/shell/status-pill.tsx` — mock-mode / live indicator.
- C06: `components/shell/empty-state.tsx` — icon + one-line guidance + primary CTA.
- C07: `app/not-found.tsx` — branded 404 with back link.

## Layer 2 — Discovery depth (adkit.so browse/swipe-file/competitor) (C08-C12)
- C08: `components/discovery/winners-table.tsx` — scored competitors, ui/table,
  tabular-nums, delta chips.
- C09: `components/discovery/ad-preview.tsx` — single winning ad card.
- C10: `components/discovery/score-breakdown.tsx` — score bars (runtime/reach/
  concentration/spend).
- C11: `components/discovery/empty-discovery.tsx` — run-first empty state.
- C12: `app/(dashboard)/discovery/page.tsx` — rewrite to compose persona-picker
  (exists) + winners-table + ad-preview + score-breakdown + empty-discovery,
  with KPI strip. Keep it building.

## Layer 3 — Create/Studio depth (C13-C17)
- C13: `components/create/script-brief.tsx` — brief form (hook/body/cta).
- C14: `components/create/ad-variant.tsx` — variant preview card.
- C15: `components/create/generate-panel.tsx` — generate action + skeleton.
- C16: `components/create/variant-grid.tsx` — generated variants grid.
- C17: `app/(dashboard)/creative/page.tsx` — refactor to use create/* components
  (script-brief, variant-grid, ad-variant, generate-panel) while keeping the
  empty/generating/done flow. Verify build.

## Layer 4 — Loop depth (C18-C20)
- C18: `components/loop/stage-flow.tsx` — horizontal stage flow with statuses.
- C19: `components/loop/audit-log.tsx` — audit trail list.
- C20: `app/(dashboard)/loop/page.tsx` — compose stage-flow + stage-card (exists)
  + run-controls (exists) + audit-log; show last-run output.

## Layer 5 — Measurement depth (C21-C24)
- C21: `components/measurement/iroas-chart.tsx` — per-platform iROAS bars.
- C22: `components/measurement/creative-table.tsx` — creatives list, ui/table.
- C23: `components/measurement/anomaly-list.tsx` — anomalies w/ severity chips.
- C24: `app/(dashboard)/measurement/page.tsx` — tabs (iROAS / creatives /
  anomalies / optimizer) using C21-C23 + optimizer-plan (exists).

## Layer 6 — Recommendations / Experiments depth (C25-C28)
- C25: `components/recommendations/rec-card.tsx` — rec card + approve/reject + status.
- C26: `app/(dashboard)/recommendations/page.tsx` — list of rec-cards w/ approve/
  reject, wired to /api/recommendations if available else local mock state.
- C27: `components/experiments/exp-row.tsx` — experiment row w/ status + metric.
- C28: `app/(dashboard)/experiments/page.tsx` — A/B experiments table using exp-row.

## Launch
`scripts/launch_ui_complete.sh` spawns all 28 via codex (gemini-3.7-flash), waits.
