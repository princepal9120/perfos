# PerfOS Web UI — Design Spec (adkit.so-inspired, agent-first)

This spec is the single source of truth for every UI agent. All 50 UI agents
MUST follow it. The goal: a clean, premium, "agent OS" dashboard that looks
like adkit.so — calm, dense where data lives, generous whitespace in marketing
surfaces, one considered accent, no generic AI slop.

## 1. Reference: what adkit.so looks like (from research)
- Dark, near-black canvas (#0a0a0b-ish), single subtle accent (blue/indigo).
- Left sidebar nav with small icons + labels, active item clearly marked.
- Top bar: workspace switcher, search/command, status, avatar.
- Content uses a max-width container (~1280px) with generous gutters.
- Metric cards: tabular figures, tiny delta chips (green up / red down), no
  heavy borders — elevation via background + 1px subtle border only.
- Typography: a geometric display face for headings (Space Grotesk / Geist),
  neutral sans for body. Tight tracking on big headings.
- Micro-interactions: 150-220ms transitions, hover background shift, active
  scale(0.98), visible focus ring.
- Empty states are composed (icon + one-line guidance + primary action), not
  blank. Loading uses skeleton shimmer matching layout. Errors inline.

## 2. Tech stack (DO NOT migrate)
- Next.js 14 App Router, TypeScript, Tailwind v3, shadcn-style `components/ui`.
- App lives in `apps/web`. Dashboard routes under `app/(dashboard)/*`.
- Existing tokens in `tailwind.config.ts`: bg.deep/surface/elevated,
  border.subtle/hover, text.primary/secondary/muted, accent (#3b82f6).
- Use these tokens. Do NOT hardcode hex in components; extend the theme if a
  token is missing (add to tailwind.config.ts + globals.css vars).

## 3. Design tokens to apply (copy-paste standard)
- Background canvas: `#0a0a0b` (replace pure `#09090b` with a hair of warmth).
- Surface: `#111114`. Elevated: `#18181c`.
- Border: `rgba(255,255,255,0.08)` default, `0.16` hover.
- Text: primary `#f4f4f6`, secondary `#a1a1aa`, muted `#71717a`.
- Accent: `#3b82f6` (blue) with hover `#2563eb`; muted `rgba(59,130,246,0.12)`.
  Keep ONE accent. No purple/blue AI gradients.
- Fonts: display = `Space Grotesk` (var `--font-display-face`), body = `Inter`
  (var `--font-body-face`). Enable tabular-nums on all numeric/metric text.
- Radius: container 12px, inner 8px, tight 4px. Vary, don't uniform.
- Shadows: tinted to background hue, low opacity. No pure-black shadows.

## 4. Layout rules
- Dashboard: left sidebar (icon+label, active state marked with accent left
  border + muted bg), top bar (workspace, command/search, status pill, avatar).
- Content max-width 1280px, auto margins, generous padding (px-6 py-8).
- Use CSS Grid for multi-column; avoid flexbox % math.
- KPI row: 2x2 or 4-col asymmetric, not three equal generic cards.
- Sentence case headers. No "Elevate/Seamless/Unleash" copy. Real draft copy.
- Buttons: primary filled accent, secondary ghost; pin CTAs to card bottom.
- Active nav indicator, smooth scroll, focus rings, hover/active states.

## 5. Required states (every surface)
- Loading: skeleton shimmer matching the real layout shape.
- Empty: composed "getting started" with one primary action.
- Error: inline message, no alert().
- Data: tabular-nums, delta chips, sortable tables.

## 6. Agent assignment contract
- Each agent owns DISTINCT files (see UI_BUILD_PLAN_50.md). No two agents edit
  the same file. Additive only.
- Every agent MUST end by running `npx nx run web:build` (or `npx nx run
  web:lint` + `npx nx run web:tsc`) from repo root and fixing its own errors.
- Do NOT commit/push. Do NOT edit backend (apps/api) files. UI only.
- Write a `.build/ui/A<NN>.done` marker file on success with one line summary.

## 7. Anti-slop checklist (fail if any present)
- Pure #000 bg, purple/blue AI gradient, three equal generic cards, Inter-only,
  missing hover/active/focus, dead `#` links, no empty/loading states,
  title-case headers, placeholder "Acme Corp" names, exclamation success msgs.
