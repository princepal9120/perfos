# High-Level Architecture & Plan: AdKit-Style End-to-End Marketing Website for PerfOS

## 1. Architectural Overview & Design System
We are transforming PerfOS's public web presence into an end-to-end, high-converting, developer & marketer marketing website modelled directly after **adkit.so** with our Dark Violet modern-minimal design tokens (`#0b0c10` paper, violet accent `#a855f7`, glass elevation, phosphor icons, responsive navigation).

### Target Route Hierarchy
1. **Root Homepage (`/`)**
   - Live banner: "Approved Tech Partner & MCP Certified"
   - Social proof ticker ("Basically Ahrefs for Advertising")
   - Main Hero: Value proposition + Agent chat demo + Direct CTA
   - 4-in-1 Workflow grid (Research, Create, Launch, Analyze)
   - "Running ads in 2026 feels broken..." Problem vs. Solution breakdown
   - Role-based tabs (Founders, Media Buyers, Growth Marketers, Agencies)
   - Universal MCP / CLI spotlight (Meta, Google, TikTok, LinkedIn, Reddit, X, Microsoft)
   - "Pays for itself in the first week" ROI calculator & pricing preview
   - Testimonial grid & Founder's note
   - Accordion FAQ & conversion-focused bottom CTA

2. **Feature Landing Pages (`/features/*`)**
   - `/features/ad-library` — Competitor Spy, 500k+ searchable ads, active run-time tracker, swipe files
   - `/features/ai-ads-generator` — Brand kit ingestion, multi-variant generation, hook/body/CTA synthesis
   - `/features/ads-cloner` — Remix competitor winners, angle transposition, automated creative variations
   - `/features/ads-mcp` — Universal Ads MCP hub (single connection for Claude, Cursor, ChatGPT, Codex)
   - `/features/ads-mcp/[platform]` — Deep-dive pages for Meta, Google, TikTok, LinkedIn, Reddit, X, Microsoft MCPs
   - `/features/ads-cli` — Terminal power tools for developers & automated CI/CD ad deployment

3. **Integrations Hub & Specific Sub-pages (`/integrations/*`)**
   - `/integrations` — All AI agents, IDEs, and tools (Claude, Cursor, ChatGPT, Grok, Codex, Hermes, OpenClaw, Perplexity)
   - `/integrations/[slug]` — Step-by-step setup guides, prompt templates, tool definitions for each agent

4. **Dedicated Pricing Page (`/pricing`)**
   - Monthly / Annual toggle (with 20% discount badge)
   - Single Project ($49/mo) vs Multiple Projects / Agency ($149/mo)
   - Deep Feature Comparison Matrix (Library, AI Generation, MCP Tools, CLI, Ad Accounts, Support)
   - 100% money-back guarantee badge & objection-handling FAQ

5. **Shared Marketing Layout & Components (`apps/web/components/marketing/*`)**
   - Sticky Glass Navbar with interactive Mega-menus (Features, MCPs, Integrations, Pricing)
   - Comprehensive Footer with full product sitemap, status badge, legal links, and social channels
   - Interactive Agent Prompt Runner & Terminal Simulator
   - Copy-to-clipboard code snippets & MCP config generators
