"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";

const WORKFLOW_PROMPTS = [
  {
    id: "spy",
    title: "Spy Competitors",
    userPrompt: "What's the ad Notion has been running the longest?",
    agentAction: "adkit_spy_competitor(domain: 'notion.so')",
    agentOutput: "Their Post-it style ad has been live for 142 consecutive days. It points to their top landing page (/product) with 126 active ads running to it. Would you like me to deconstruct the hook and save the creative to your swipe file?"
  },
  {
    id: "kill-scale",
    title: "Which ads to kill or scale?",
    userPrompt: "Analyze my Meta ad account for the last 14 days. Which ads should I kill and which should I scale?",
    agentAction: "adkit_meta_analyze_performance(timeframe: '14d')",
    agentOutput: "Found 2 ads with CPA 45% above target: 'Feature Breakdown V2' (Spent $1,420, ROAS 0.9x) → Recommending Pause. Found 1 breakout winner: 'Founder Story Reel' (Spent $850, ROAS 4.2x) → Staged 20% budget increase for your approval."
  },
  {
    id: "clone",
    title: "Clone a Notion ad in my brand",
    userPrompt: "Clone Notion's top evergreen ad and remix it with our Dark Violet brand kit for PerfOS.",
    agentAction: "adkit_clone_and_remix(ad_id: 'notion_142d', brand_kit: 'perfos_tokens')",
    agentOutput: "Deconstructed hook: 'Consolidate 12 tools into 1'. Synthesized 3 on-brand variations: 'Stop running ads like it's 2018. Connect Claude to Meta, Google & TikTok.' Creatives staged in AdKit dashboard for review."
  },
  {
    id: "resize",
    title: "Clone ad & resize for placements",
    userPrompt: "Take our winning desktop ad and resize it for Instagram Stories, TikTok 9:16, and LinkedIn Carousel.",
    agentAction: "adkit_batch_resize_and_adapt(creative_id: 'win_902')",
    agentOutput: "Generated 3 format variants: 9:16 vertical video with auto-safe zone captions, 1:1 Feed square, and 4:5 mobile portrait. All asset dimensions validated against network API specs."
  },
  {
    id: "draft",
    title: "Draft a new feature campaign",
    userPrompt: "We just launched our new Ads CLI. Draft a launch campaign for Meta & Twitter targeting developers.",
    agentAction: "adkit_draft_campaign(topic: 'Ads CLI Launch', target: 'devs')",
    agentOutput: "Drafted Campaign 'Ads CLI Launch' with $50/day test budget. Created 2 ad sets: Developer Tools Interest + Lookalike 1%. Staged 4 terminal-themed hooks. Ready for your 1-click approval."
  }
];

const AUDIENCE_CARDS = [
  {
    icon: "👨‍💻",
    title: "Founders & Solopreneurs",
    desc: "You're growing a product and don't have the budget for a 5-figure agency. You want to run high-converting ads yourself without spending your entire week clicking through terrible ad manager UIs."
  },
  {
    icon: "🎯",
    title: "Agencies & Media Buyers",
    desc: "You run multiple client ad accounts. Every hour lost duplicating campaigns, resizing assets, and reporting numbers is margin you'll never get back. Command your AI agent to handle the grunt work."
  },
  {
    icon: "📈",
    title: "Growth Marketers",
    desc: "You know what winning ads look like. You just want to test 5x more angles every week. Let AdKit find competitor evergreens, generate hooks, and draft campaign variants in minutes."
  },
  {
    icon: "🎨",
    title: "Brand Managers",
    desc: "Maintain strict brand guidelines and token fidelity across all creative variations while giving your team the velocity of autonomous AI production."
  }
];

const FIT_CHECK_YES = [
  "You're sick of wasting 2+ hours a week clicking around in Meta's UI to duplicate, edit, and publish the same stuff.",
  "You've wanted to run ads for a while but the bloated interfaces put you off.",
  "You already use AI agents (Claude, Cursor, ChatGPT) for work and want ads to work the exact same way.",
  "You run ads for multiple brands or clients and want to recover your lost operational margins.",
  "You want an assistant that drafts, researches, and flags what to kill while you keep the final 1-click approval."
];

const FIT_CHECK_NO = [
  "You expect AI to magically fix a broken product or offer without good strategy.",
  "You don't want to review drafts before they go live on your connected ad accounts.",
  "You enjoy spending 10 hours a week manually navigating Meta Ads Manager dropdowns."
];

const FAQS = [
  {
    q: "What can my AI agent actually do with AdKit?",
    a: "Your AI agent gains typed tools to search 500k+ competitor ads, deconstruct winning hooks, generate on-brand static and video variations, inspect live performance metrics, and draft campaigns across Meta, Google, TikTok, LinkedIn, Reddit, X, and Microsoft Ads."
  },
  {
    q: "Do changes go live immediately, or is there an approval step?",
    a: "Every change your agent makes is a draft by default. Campaigns, ad sets, and creatives sit safely in your AdKit dashboard until you click 'Approve'. Nothing touches your live accounts without your explicit sign-off."
  },
  {
    q: "Will using an MCP get my ad account flagged or banned?",
    a: "No. Unlike unofficial scraping scripts, AdKit is an approved Meta and Google Tech Partner. All operations use the official platform APIs with built-in rate-limiting and policy safeguards."
  },
  {
    q: "How long does setup take?",
    a: "Less than 3 minutes. Connect your ad accounts in the web console, copy one JSON line into your Claude Desktop / Cursor MCP settings, and you're ready to command your agent."
  },
  {
    q: "Can I use AdKit without an AI agent?",
    a: "Yes! AdKit includes a full web dashboard where you can browse the Ad Library, use the AI Creative Generator & Cloner, and inspect account metrics directly."
  },
  {
    q: "Which AI agents and IDEs are compatible?",
    a: "AdKit works natively with Claude Code, Claude Desktop, Cursor IDE, ChatGPT (OpenAI GPTs), Grok (xAI), Codex, OpenClaw, Perplexity, and Hermes Agent."
  }
];

export default function HomePage() {
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);

  const currentWorkflow = WORKFLOW_PROMPTS[activeWorkflow];

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("npx -y @adkit/mcp-server");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/20 selection:text-purple-200">
      <MarketingNavbar />

      <main className="pt-24 pb-20">
        {/* HERO SECTION */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 text-center">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-linear-to-tr from-purple-600/20 via-violet-500/15 to-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Social Proof Quote Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/4 dark:bg-white/4 border border-border shadow-inner mb-6 hover:border-primary/30 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span className="text-xs font-medium text-muted-foreground dark:text-zinc-300">
              “Basically Ahrefs but for advertising”
            </span>
            <span className="text-xs text-primary font-semibold flex items-center">
              Explore AdKit 2.0 →
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground dark:text-white max-w-4xl mx-auto leading-[1.08]">
            The ads toolbox for you & your{" "}
            <span className="bg-linear-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
              AI agents
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Research competitors, launch campaigns, and track performance in minutes instead of hours — all from your preferred AI agent, or from the dashboard.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-foreground dark:text-white bg-linear-to-r from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/30 hover:from-purple-500 hover:to-indigo-500 border border-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Start 7-day Trial →
            </Link>

            <Link
              href="/features/ads-mcp"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-muted-foreground dark:text-zinc-300 bg-black/4 dark:bg-white/4 hover:bg-black/8 dark:bg-white/8 rounded-xl border border-border hover:text-foreground dark:text-white transition-all flex items-center justify-center gap-2"
            >
              <span className="text-primary font-mono">⌘</span> Explore Ads MCP
            </Link>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            7-day free trial · Cancel in one click · Bring your own AI keys
          </p>

          {/* Trust Partner Strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Meta Approved Tech Partner
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Google & TikTok Certified
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Anthropic & OpenAI MCP Native
            </span>
          </div>

          {/* Social Proof Testimonial Callout */}
          <div className="mt-10 max-w-3xl mx-auto p-4 rounded-xl bg-black/2 dark:bg-white/2 border border-border text-left">
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-zinc-300 italic">
              &quot;My agent analyzed my account using AdKit, found what to optimize, and drafted all the changes on its own. I only had to click &apos;Approve&apos;. The first 30 minutes already saved me 8 hours of work.&quot;
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground dark:text-white">Gabe Salinas</span>
              <span>·</span>
              <span>Founder & Media Buyer</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: YOUR FULL AD WORKFLOW IN ONE PLACE (4 TABS) */}
        <section className="py-20 border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                What you can do with AdKit
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground dark:text-white">
                Your full ad workflow, in one place
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Research */}
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-primary text-lg">
                    🔍
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground dark:text-white">Research</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Browse 500k+ ads or import your competitors. Filter by longevity to uncover true evergreen winners live for 90+ days.
                  </p>
                </div>
                <Link href="/features/ad-library" className="text-xs text-primary hover:text-primary font-semibold">
                  Find what&apos;s working →
                </Link>
              </div>

              {/* Create */}
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-indigo-500/30 transition-all group flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg">
                    🎨
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground dark:text-white">Create</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Turn your brand kit and competitor winners into 30+ static and video hooks in seconds. 1-click resize for every placement.
                  </p>
                </div>
                <Link href="/features/ai-ads-generator" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                  AI Ads Generator →
                </Link>
              </div>

              {/* Launch */}
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-pink-500/30 transition-all group flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-lg">
                    ⚡
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground dark:text-white">Launch</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Let your agent draft campaigns, sets, and budgets directly from chat. Review in your dashboard and approve in 1 click.
                  </p>
                </div>
                <Link href="/features/ads-mcp" className="text-xs text-pink-400 hover:text-pink-300 font-semibold">
                  Launch with your agent →
                </Link>
              </div>

              {/* Analyze */}
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/30 transition-all group flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
                    📈
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground dark:text-white">Analyze</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cut through platform over-reporting. Identify fatigued creatives and scale winning ad sets with real incremental ROAS.
                  </p>
                </div>
                <Link href="/command-center" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                  Track real ROAS →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE PROBLEM (RUNNING ADS FEELS LIKE 2018...) */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
                The Problem
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground dark:text-white">
                Running ads feels like you&apos;re back in 2018...
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                You don&apos;t have hours to waste clicking through ad managers. Let your agent do the boring work so you can focus on strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Without AdKit */}
              <div className="p-8 rounded-2xl bg-rose-950/10 border border-rose-500/20 space-y-5">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase font-semibold">
                  <span>😩</span> Without AdKit
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-muted-foreground dark:text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 mt-0.5">✕</span>
                    <span>Scroll ad libraries and feeds hoping to find inspiration.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 mt-0.5">✕</span>
                    <span>Screenshot competitors into ChatGPT to guess why their ads work.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 mt-0.5">✕</span>
                    <span>Open Photoshop/Canva to make 8 subtle size variations manually.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-400 mt-0.5">✕</span>
                    <span>Click through 15 dropdowns in Meta Ads Manager just to duplicate a campaign.</span>
                  </li>
                </ul>
              </div>

              {/* With AdKit */}
              <div className="p-8 rounded-2xl bg-purple-950/15 border border-primary/30 space-y-5 shadow-xl shadow-black/5 dark:shadow-purple-950/20">
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase font-semibold">
                  <span>😎</span> With AdKit
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-foreground">
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Ask your agent: &quot;What are Notion&apos;s longest-running ads?&quot;</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>&quot;Clone their top 3 ads into my brand and write 5 hook variations.&quot;</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>&quot;Resize all 5 for Stories, Feed, and TikTok in 1 click.&quot;</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>&quot;Draft a test campaign on Meta with $50/day budget.&quot; Click Approve. Done.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WORKFLOW EXAMPLES (INTERACTIVE PROMPTS SIMULATOR) */}
        <section className="py-20 border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Workflow Examples
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground dark:text-white">
                What running ads with AdKit looks like
              </h2>
              <p className="text-muted-foreground text-sm">
                Pick a prompt below. See exactly what your AI agent does about it in real-time.
              </p>
            </div>

            {/* Prompt Selector Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-4xl mx-auto">
              {WORKFLOW_PROMPTS.map((wf, idx) => (
                <button
                  key={wf.id}
                  onClick={() => setActiveWorkflow(idx)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeWorkflow === idx
                      ? "bg-primary text-white dark:text-white shadow-lg shadow-primary/30 border border-purple-400/40"
                      : "bg-black/4 dark:bg-white/4 text-muted-foreground hover:text-foreground dark:text-white border border-border"
                  }`}
                >
                  {wf.title}
                </button>
              ))}
            </div>

            {/* Simulated Chat Interface */}
            <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Agent Connected: Claude Code / Cursor MCP</span>
                </div>
                <button
                  onClick={handleCopyCmd}
                  className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-muted-foreground dark:text-zinc-300 border border-border text-[11px]"
                >
                  {copiedCmd ? "✓ Copied MCP Config" : "Copy MCP Server"}
                </button>
              </div>

              {/* User Prompt */}
              <div className="p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-primary font-bold block">You (Marketer / Founder)</span>
                <p className="text-sm font-medium text-foreground">&quot;{currentWorkflow.userPrompt}&quot;</p>
              </div>

              {/* Agent Action & Output */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-primary font-mono font-semibold">
                  <span className="animate-spin">⚙</span> Calling Tool: <code className="text-foreground bg-black/5 dark:bg-black/40 px-1.5 py-0.5 rounded">{currentWorkflow.agentAction}</code>
                </div>
                <div className="p-3.5 rounded-lg bg-black/5 dark:bg-black/60 border border-border text-muted-foreground dark:text-zinc-300 leading-relaxed font-sans text-xs sm:text-sm">
                  {currentWorkflow.agentOutput}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/4 text-[11px]">
                  <span className="text-emerald-400 font-semibold">✓ Draft staged in AdKit dashboard</span>
                  <Link href="/command-center" className="text-primary hover:text-primary underline font-medium">
                    Review & Click Approve →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: WHO IS THIS FOR? (4 AUDIENCE CARDS) */}
        <section className="py-20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Who is this for?
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground dark:text-white">
                People who&apos;d rather ship than click
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {AUDIENCE_CARDS.map((aud, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-3xl block">{aud.icon}</span>
                    <h3 className="text-base font-display font-bold text-foreground dark:text-white">
                      {aud.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {aud.desc}
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="text-xs font-semibold text-primary hover:text-primary pt-2 border-t border-white/4 block"
                  >
                    Start Free Trial →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: A WORD FROM THE FOUNDER */}
        <section className="py-20 border-t border-border bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-10 rounded-2xl bg-card border border-border space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xl font-bold text-foreground dark:text-white shadow-lg">
                  N
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground dark:text-white">A word from the founder</h3>
                  <p className="text-xs text-muted-foreground">Hi there 👋 I&apos;m Nico, the creator of AdKit</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-muted-foreground dark:text-zinc-300 leading-relaxed border-t border-border pt-6">
                <p>
                  Before building startups, I was a media buyer. I managed over <strong>$1,000,000 in ads</strong>, sold two startups grown entirely with performance marketing, and helped 1,000+ founders learn Meta Ads through my guides.
                </p>
                <p>
                  I love ads, but running them involves a tremendous amount of repetitive, mind-numbing grunt work 😩 Duplicating ad sets, resizing 20 static banners, copying and pasting copy, and navigating laggy ad managers. I hated every second of it.
                </p>
                <p>
                  So I built AdKit to fix that. To let me and other marketers focus on what actually moves the needle: <strong>the strategy, the thinking, and the creativity</strong> — while letting AI agents handle the manual execution.
                </p>
                <p className="font-semibold text-foreground dark:text-white pt-2">
                  — Nico, Founder of AdKit
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                <span className="text-xs text-muted-foreground">Try it risk-free with full access for 7 days.</span>
                <Link
                  href="/pricing"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary text-white dark:text-white text-xs font-semibold shadow-md transition-all"
                >
                  Start 7-day Trial →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: BUT I HEARD... (OBJECTION BUSTERS) */}
        <section className="py-20 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Objection Handling
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground dark:text-white">
                &quot;But I heard...&quot;
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                <span className="text-rose-400 font-mono text-xs font-bold block">
                  ...letting an AI agent run my ads is risky 😰
                </span>
                <p className="text-xs text-muted-foreground dark:text-zinc-300 leading-relaxed">
                  <strong>Not with AdKit.</strong> Every change your agent makes is a draft by default. Campaigns, ad sets, and creatives sit safely in your AdKit dashboard until you click &quot;Approve&quot;. Nothing touches your live accounts without approval.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                <span className="text-amber-400 font-mono text-xs font-bold block">
                  ...MCPs will get my account banned 😱
                </span>
                <p className="text-xs text-muted-foreground dark:text-zinc-300 leading-relaxed">
                  Other tools use unofficial scraping endpoints. AdKit is an <strong>officially approved Meta and Google Tech Partner</strong>, so every action travels through verified, rate-limited partner APIs.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                <span className="text-primary font-mono text-xs font-bold block">
                  ...setting up an MCP is too technical 😳
                </span>
                <p className="text-xs text-muted-foreground dark:text-zinc-300 leading-relaxed">
                  It takes 3 clicks. Connect your ad accounts in the web console, paste one line into your Claude / Cursor config, done. If you can use an AI chat, you can use AdKit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: PRICING PREVIEW */}
        <section className="py-20 border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Transparent Plans
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground dark:text-white">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground text-sm">
                Save 30%+ with annual billing. Cancel anytime with 1 click.
              </p>

              {/* Billing Toggle */}
              <div className="pt-3 inline-flex items-center gap-3 p-1 rounded-xl bg-black/4 dark:bg-white/4 border border-border">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    !annualBilling ? "bg-primary text-white dark:text-white shadow" : "text-muted-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    annualBilling ? "bg-primary text-white dark:text-white shadow" : "text-muted-foreground"
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Save 30%+
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Single Project */}
              <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground dark:text-white">Single Project</h3>
                    <p className="text-xs text-muted-foreground mt-1">Every AdKit tool (ad library, AI studio, and MCP) for one brand.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold text-foreground dark:text-white">
                      ${annualBilling ? "29" : "49"}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">/ month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-muted-foreground dark:text-zinc-300 border-t border-border pt-5">
                    <li className="flex items-center gap-2">✓ Multi-platform Ad Library (500k+ ads)</li>
                    <li className="flex items-center gap-2">✓ Competitor Longevity & Activity Alerts</li>
                    <li className="flex items-center gap-2">✓ AI Ads Generator & Creative Cloner</li>
                    <li className="flex items-center gap-2">✓ Ads MCP Server & Terminal CLI</li>
                    <li className="flex items-center gap-2">✓ Meta, Google, TikTok, LinkedIn ad accounts</li>
                  </ul>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full py-3 text-center text-xs font-semibold text-foreground dark:text-white bg-black/6 dark:bg-white/6 hover:bg-black/12 dark:bg-white/12 rounded-xl border border-border transition-colors"
                >
                  Start 7-Day Trial
                </Link>
              </div>

              {/* Multiple Projects */}
              <div className="p-8 rounded-2xl bg-linear-to-b from-[#171524] to-[#111218] border-2 border-purple-500/40 relative shadow-2xl shadow-purple-950/30 space-y-6 flex flex-col justify-between">
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary text-[10px] font-bold uppercase tracking-wider text-white dark:text-white shadow-md">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Multiple Projects</h3>
                    <p className="text-xs text-zinc-400 mt-1">For agencies, media buyers, and operators with multiple brands.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold text-white">
                      ${annualBilling ? "89" : "149"}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">/ month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-white border-t border-border pt-5">
                    <li className="flex items-center gap-2">✓ <strong>Unlimited</strong> Brands & Client Workspaces</li>
                    <li className="flex items-center gap-2">✓ Unlimited Competitor Ad Search & Downloads</li>
                    <li className="flex items-center gap-2">✓ 1,000 AI Creative Generations / mo</li>
                    <li className="flex items-center gap-2">✓ Multi-Seat Team Access & Dedicated API Keys</li>
                    <li className="flex items-center gap-2">✓ Priority Support & Custom MCP Bridge</li>
                  </ul>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full py-3 text-center text-xs font-semibold text-white bg-primary hover:bg-primary rounded-xl shadow-lg shadow-primary/30 transition-colors"
                >
                  Start Agency Trial →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: IS ADKIT THE RIGHT FIT FOR YOU? (HONEST CHECK) */}
        <section className="py-20 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Honest Check
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground dark:text-white">
                Is AdKit the right fit for you?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Made for you */}
              <div className="p-8 rounded-2xl bg-card border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-semibold">
                  <span>🎯</span> AdKit is made for you if...
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground dark:text-zinc-300">
                  {FIT_CHECK_YES.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not for you */}
              <div className="p-8 rounded-2xl bg-card border border-rose-500/20 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase font-semibold">
                  <span>🚫</span> But it might not be a good fit if...
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                  {FIT_CHECK_NO.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-rose-400 mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: PAYS FOR ITSELF IN THE FIRST WEEK (ROI CALCULATOR) */}
        <section className="py-20 border-t border-border bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Your ROI
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground dark:text-white">
                Pays for itself in the first week
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Every hour not spent clicking in an ad manager is an hour spent on strategy and growth that actually moves revenue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                <span className="text-4xl font-display font-bold text-primary">3h</span>
                <h4 className="font-bold text-foreground dark:text-white text-sm">3 hours saved weekly</h4>
                <p className="text-xs text-muted-foreground">Duplicating, editing, resizing, publishing: all handled from a chat.</p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                <span className="text-4xl font-display font-bold text-indigo-400">52</span>
                <h4 className="font-bold text-foreground dark:text-white text-sm">52 weeks a year</h4>
                <p className="text-xs text-muted-foreground">Because this isn&apos;t a one-time cleanup. It&apos;s your permanent workflow.</p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                <span className="text-4xl font-display font-bold text-emerald-400">150+ hrs</span>
                <h4 className="font-bold text-foreground dark:text-white text-sm">~1 month recovered / yr</h4>
                <p className="text-xs text-muted-foreground">Recovered time to spend on strategy, creative, and customer research.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: FAQS */}
        <section className="py-20 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                F.A.Q.
              </span>
              <h2 className="text-3xl font-display font-bold text-foreground dark:text-white">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-foreground hover:text-primary"
                  >
                    <span>{faq.q}</span>
                    <span className="text-primary font-mono text-base">
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-white/4 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 11: FINAL CONVERTING CTA */}
        <section className="py-20 border-t border-border relative overflow-hidden text-center bg-linear-to-b from-transparent to-purple-950/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground dark:text-white">
              Stop clicking. Start Advertising.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
              Give your AI agent the ads toolbox it&apos;s missing: research, create, launch, and diagnose from a single chat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-foreground dark:text-white bg-linear-to-r from-primary to-primary-dark rounded-xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.02]"
              >
                Start 7-day Trial →
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              7-day free trial · Cancel in one click · Bring your own AI keys
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
