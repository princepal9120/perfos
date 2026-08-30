# PerfOS UI — 50-Agent Build Plan (adkit.so-inspired)

All agents run via `opencode` with model `opencode-go/ox-alpha-free`.
Each agent: reads `docs/UI_DESIGN_SPEC.md`, builds its assigned files ONLY
(no overlap), verifies with `npx nx run web:build` from repo root, writes
`.build/ui/A<NN>.done`. Do NOT commit/push. UI only (apps/web).

File ownership is partitioned to prevent collisions. Each agent edits a unique
set of files. If a shared component is needed, create a new one under
`components/<area>/` rather than editing another agent's file.

## Layer A — Design system & globals (A01-A08)
- A01: `app/globals.css` — CSS vars, base bg/typography, tabular-nums utility,
  focus ring, scroll-smooth, noise overlay class. Owns globals.css only.
- A02: `tailwind.config.ts` — tune tokens per spec (warm #0a0a0b, radius scale,
  tinted shadow, display/body font vars). Owns tailwind.config.ts only.
- A03: `app/layout.tsx` — root html/body, font faces (Space Grotesk + Inter via
  next/font), metadata, skip-to-content link, favicon. Owns layout.tsx.
- A04: `components/ui/button.tsx` — primary/secondary/ghost + hover/active/
  focus states, scale(0.98) press, 200ms transition. Owns button.tsx.
- A05: `components/ui/card.tsx` — surface bg + 1px subtle border, varied radius,
  tinted shadow, optional hover lift. Owns card.tsx.
- A06: `components/ui/badge.tsx` — status/delta chips (up green / down red,
  neutral), square (not pill) option. Owns badge.tsx.
- A07: `components/ui/skeleton.tsx` — shimmer skeleton matching layout blocks.
  Owns skeleton.tsx.
- A08: `components/ui/table.tsx` — sortable data table, tabular-nums, row hover,
  empty-state slot. Owns table.tsx.

## Layer B — Shell & navigation (A09-A16)
- A09: `app/(dashboard)/layout.tsx` — sidebar + topbar shell, active nav state,
  workspace switcher, command/search trigger, status pill, avatar. Owns layout.
- A10: `components/shell/sidebar.tsx` — nav items (overview, discovery, create,
  loop, measurement, accounts, recommendations, experiments, agents, mcp,
  command-center, creative, integrations, settings, chat), active marker. Owns.
- A11: `components/shell/topbar.tsx` — workspace name, search/command, status,
  avatar menu. Owns.
- A12: `components/shell/command-menu.tsx` — ⌘K command palette (client). Owns.
- A13: `components/shell/page-header.tsx` — title + description + actions slot,
  sentence case. Owns.
- A14: `components/shell/status-pill.tsx` — mock mode / live status indicator.
  Owns.
- A15: `app/not-found.tsx` — branded 404 with back link. Owns.
- A16: `components/shell/empty-state.tsx` — composed empty state (icon+text+CTA).
  Owns.

## Layer C — Overview (A17-A22)
- A17: `app/(dashboard)/overview/page.tsx` — KPI grid + narrative + rec preview.
  Owns overview page.
- A18: `components/overview/kpi-cards.tsx` — asymmetric KPI grid, tabular nums,
  delta chips. Owns.
- A19: `components/overview/narrative.tsx` — iROAS narrative copy block. Owns.
- A20: `components/overview/recommendation-preview.tsx` — latest rec card. Owns.
- A21: `components/overview/change-list.tsx` — recent changes list. Owns.
- A22: `components/overview/health-strip.tsx` — platform health mini-cards. Owns.

## Layer D — Discovery (find/score) (A23-A28)
- A23: `app/(dashboard)/discovery/page.tsx` — discovery dashboard: query,
  persona picker, winners table. Owns discovery page.
- A24: `components/discovery/persona-picker.tsx` — saas/dropship/beauty/b2b. Owns.
- A25: `components/discovery/winners-table.tsx` — scored competitors (use ui/table).
  Owns.
- A26: `components/discovery/ad-preview.tsx` — single winning ad card. Owns.
- A27: `components/discovery/score-breakdown.tsx` — score component bars. Owns.
- A28: `components/discovery/empty-discovery.tsx` — run-first empty state. Owns.

## Layer E — Create (A29-A33)
- A29: `app/(dashboard)/creative/page.tsx` — creative studio landing. Owns creative page.
- A30: `components/create/script-brief.tsx` — brief form (hook/cta/body). Owns.
- A31: `components/create/ad-variant.tsx` — variant preview card. Owns.
- A32: `components/create/generate-panel.tsx` — generate action + loading skel. Owns.
- A33: `components/create/variant-grid.tsx` — generated variants grid. Owns.

## Layer F — Loop (orchestrator) (A34-A38)
- A34: `app/(dashboard)/loop/page.tsx` — pipeline viz: find→score→create→launch→
  track→double-down with stage counts. Owns loop page.
- A35: `components/loop/stage-flow.tsx` — horizontal stage flow with statuses. Owns.
- A36: `components/loop/stage-card.tsx` — one stage card (count, status). Owns.
- A37: `components/loop/run-controls.tsx` — dry-run / run buttons + confirm. Owns.
- A38: `components/loop/audit-log.tsx` — audit trail list. Owns.

## Layer G — Measurement (A39-A43)
- A39: `app/(dashboard)/measurement/page.tsx` — iROAS / creatives / anomalies /
  optimizer tabs. Owns measurement page.
- A40: `components/measurement/iroas-chart.tsx` — per-platform iROAS bars. Owns.
- A41: `components/measurement/creative-table.tsx` — creatives list. Owns.
- A42: `components/measurement/anomaly-list.tsx` — anomalies with severity. Owns.
- A43: `components/measurement/optimizer-plan.tsx` — reallocation plan view. Owns.

## Layer H — Accounts / Recommendations / Experiments (A44-A48)
- A44: `app/(dashboard)/accounts/page.tsx` — connected ad accounts grid. Owns.
- A45: `app/(dashboard)/recommendations/page.tsx` — rec list + approve/reject. Owns.
- A46: `components/recommendations/rec-card.tsx` — rec card w/ approve/reject. Owns.
- A47: `app/(dashboard)/experiments/page.tsx` — A/B experiments table. Owns.
- A48: `components/experiments/exp-row.tsx` — experiment row. Owns.

## Layer I — Agents / MCP / Command / Chat / Settings / Integrations (A49-A50 + extras)
- A49: `app/(dashboard)/agents/page.tsx` + `app/(dashboard)/mcp/page.tsx` —
  agent roster + MCP tools list. Owns both pages.
- A50: `app/(dashboard)/command-center/page.tsx` + `chat/page.tsx` +
  `settings/page.tsx` + `integrations/page.tsx` — command center, chat,
  settings, integrations surfaces. Owns all four.

## Launch
`scripts/launch_ui_50.sh` spawns all 50 via opencode, waits, writes `.build/ui/*.done`.
