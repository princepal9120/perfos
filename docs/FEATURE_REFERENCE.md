# adkit.so — Full Feature Reference (distilled from changelog)

Source: adkit.so public changelog (Nov 2025 – Aug 2026). This is the complete
product surface PerfOS's UI must mirror. Distilled into capability groups;
use as the scope checklist for the UI rebuild.

## 1. Ad account dashboards (Manage)
- Per-platform account dashboards: Meta, Google, TikTok, LinkedIn, X,reddit.
- Metrics: spend, impressions, clicks, results, cost per result, ROAS.
- Period comparison with hover chart (current vs previous period).
- Sortable table grouped by project; sticky account list; named Google results.

## 2. Browse / Swipe File (Discovery)
- Browse competitor ads grid; bookmark on the ad itself (one click → board).
- Boards: save to board, Unsorted default, shareable public link.
- Swipe File search: filter by platform, media type, status, duration, est. spend.
- Estimated ad spend: min-max range per ad, sortable, shown on cards/advertiser/browse.
- Ad scoring (beta): rank winning ads (runtime/engagement heuristics).
- Language detection + filters.
- All-Advertisers default view; sort by longest-running / oldest.

## 3. Studio (Create / Clone)
- Unified creation: From Scratch + Clone Ad in one flow; reference image upload (drag/paste).
- Bulk select/delete; denser grid on large screens.
- Generate creatives (GPT Image 2); preview on different platforms.
- Storyboards (scene order); export downloads.
- Per-placement media for Meta (square/vertical/horizontal).

## 4. Drafts & approval (Safety gate)
- Drafts page: list + detail modal + sidebar nav.
- Readable draft details (labeled text, not raw JSON): targeting, carousel cards, fields.
- Select-all drafts; Publish All; bulk publish/delete.
- Split draft-approval layout (list left, details right, auto-load next).
- Meta result keys (exact event behind Results number).

## 5. Campaign types per platform
- Google: Search, Display, Performance Max (asset groups CRUD), Demand Gen
  (campaigns/ad groups/video ads from YouTube), video ads, call assets,
  RSA asset pinning, device bid modifiers, location match targeting,
  target bidding (tCPA/tROAS), conversion goals (primary/secondary),
  offline conversions, change history, placement reporting, MCC accounts.
- Meta: carousels, radius targeting, Click-to-WhatsApp, Instant Forms,
  per-placement media, start-time control, Instagram identities, Mobile app opt.
- TikTok: Spark Ads (from organic post ID), Asset Library videos, dayparting, Smart+.
- LinkedIn: first-class (campaigns/ad groups/ads, bidding, carousels, formats).
- X/Twitter: image uploads, funding source read.
- Microsoft/Bing: Google sign-in connect.
- Reddit: Ads in MCP.

## 6. Competitor Tracking
- Automatic competitor discovery; advertiser pages (clean names, no junk).
- Scan status (running/partial/failed) + wait estimates.
- Similar competitors list.

## 7. Agent / MCP / CLI
- One MCP for all projects (mcp.adkit.so one-click setup).
- Official ChatGPT app install; Codex, Perplexity, Gemini CLI agents.
- Agent can: create/update projects, connect accounts, upload media, update ads.
- Agent authorization screen (name, logo, account).
- API key access levels (read/draft/publish); per-key scoping.
- 30-day MCP sessions (no hourly reconnect); ~30% fewer tokens in MCP responses.

## 8. Workspaces / Members / Settings
- Workspaces: team under one workspace, all projects.
- Member roles: read/draft/publish; project-scoped members.
- Centralized Settings (agent permissions under project nav; settings on phones
  use section dropdown).
- Ad accounts in Settings; workspace integrations; account organizer (drag-drop).

## 9. Loop / Pipeline (PerfOS owns this uniquely)
- find → score → create → launch → track → double-down, with draft-first safety.

## 10. Chat
- Agent chat shell for natural-language ad ops.

## Coverage mapping → PerfOS pages
- Manage/accounts → `accounts` page (+ measurement)
- Browse/Swipe/Competitor → `discovery` page (+ boards concept)
- Studio → `creative` page
- Drafts/approval → `recommendations` + safety gate UI
- Campaign types → connectors (backend) + `creative`/`loop` UI
- Agent/MCP → `agents` + `mcp` pages
- Workspaces/Settings → `settings` page
- Loop → `loop` page
- Chat → `chat` page
- Overview → `overview` (KPIs, narrative, recs)
- Command center → `command-center`
- Experiments → `experiments`
