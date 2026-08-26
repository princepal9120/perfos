/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import {
  MetaLogo,
  GoogleLogo,
  TikTokLogo,
  LinkedInLogo,
  ClaudeLogo,
  CursorLogo,
  ChatGPTLogo,
  NotionLogo,
  PerfOSLogo
} from '@/components/marketing/icons';


const WORKFLOW_PROMPTS = [
  {
    id: "spy",
    title: "Spy Competitors",
    icon: "🔍",
    userPrompt: "What is the longest-running evergreen ad for notion.so?",
    agentAction: "adkit_spy_competitor(domain: 'notion.so', min_longevity_days: 90)",
    agentOutput: "Discovered top winner: 'Post-it Note Workflow' running active for 142 consecutive days. Directing to /product with 126 live variants. Hook angle: 'Consolidate 12 tools into 1 workspace'.",
    badge: "142 Days Live",
    adHeadline: "Consolidate 12 fragmented tools into 1 unified workspace.",
    adSub: "Estimated spend: $42,500+ · 142 days continuous run · 9.4% CTR",
    network: "Meta & YouTube"
  },
  {
    id: "kill-scale",
    title: "Kill or Scale Ads",
    icon: "⚡",
    userPrompt: "Audit our Meta Ad Account for the last 14 days. What should we pause or scale?",
    agentAction: "adkit_meta_audit_performance(timeframe: '14d', target_roas: 2.5)",
    agentOutput: "2 underperformers identified: 'Feature Breakdown V2' (CPA $84.20, ROAS 0.8x) -> Staged Pause. 1 breakout winner: 'Founder Voiceover Reel' (ROAS 4.6x, Spent $1,240) -> Staged +25% Budget scale.",
    badge: "ROAS 4.6x Scaled",
    adHeadline: "Founder Story Reel: Why we ditched bloated agencies.",
    adSub: "ROAS 4.6x · Spent $1,240 · Scaled budget to $150/day",
    network: "Instagram & TikTok"
  },
  {
    id: "clone",
    title: "Clone & Remix",
    icon: "🧬",
    userPrompt: "Clone Notion's 142-day evergreen ad and remix it with our PerfOS Dark Violet brand kit.",
    agentAction: "adkit_clone_creative(source_id: 'notion_142d', brand_kit: 'perfos_tokens')",
    agentOutput: "Extracted visual layout & hook mechanics. Synthesized 3 on-brand variations: 'Stop running ads like it's 2018. Connect Claude directly to Meta, Google & TikTok.' Creatives staged for preview.",
    badge: "3 Variants Ready",
    adHeadline: "Stop running ads like it's 2018. Connect Claude to Meta & TikTok.",
    adSub: "Generated from Notion 142-day winner · Color tokens: Dark Violet",
    network: "Meta, Google, X"
  },
  {
    id: "resize",
    title: "Batch Placement Resize",
    icon: "📐",
    userPrompt: "Take our winning desktop banner and format for IG Stories 9:16, Feed 1:1, and LinkedIn.",
    agentAction: "adkit_batch_resize_and_adapt(creative_id: 'perfos_hero_01')",
    agentOutput: "Generated 3 multi-platform assets: 9:16 Vertical Video with auto-safe zone captions, 1:1 Square Feed, and 4:5 Mobile Portrait. Dimensions and compression verified against network APIs.",
    badge: "API Validated",
    adHeadline: "Autonomous Ads via MCP Protocol · Zero UI Grunt Work",
    adSub: "3 Formats ready · 9:16 Stories, 1:1 Feed, 4:5 Mobile · Verified",
    network: "All 7 Networks"
  },
  {
    id: "draft",
    title: "Draft Campaign",
    icon: "🚀",
    userPrompt: "We launched our new Ads CLI. Draft a launch campaign for Meta & X targeting developers.",
    agentAction: "adkit_draft_campaign(topic: 'Ads CLI Launch', target: 'devs', budget: '$50/day')",
    agentOutput: "Drafted Campaign 'Ads CLI Launch' with 2 ad sets: Developer Tools Interest + Lookalike 1%. 4 terminal-themed hooks prepared. Staged in dashboard for your 1-click approval.",
    badge: "Ready for Approval",
    adHeadline: "Terminal-Native Ads for Engineers: Manage campaigns from CLI.",
    adSub: "Campaign: 'Ads CLI Launch' · Budget: $50/day · 2 Ad Sets",
    network: "Meta & X Ads"
  }
];

const AUDIENCE_CARDS = [
  {
    icon: "👨‍💻",
    title: "Founders & Solopreneurs",
    desc: "You are growing a product and refuse to pay $10k/mo agency retainers. Run high-converting ad experiments yourself in 10 minutes a week instead of clicking through bloated ad managers."
  },
  {
    icon: "🎯",
    title: "Agencies & Media Buyers",
    desc: "Manage 10+ client ad accounts with autonomous execution. Reclaim hours lost duplicating ad sets, resizing banners, and chasing reporting numbers across Meta, Google, and TikTok."
  },
  {
    icon: "📈",
    title: "Growth Marketers",
    desc: "Scale your creative testing velocity 5x. Uncover competitor evergreen winners, spin up 20 hook variations with your brand kit, and deploy campaigns directly from Claude or Cursor."
  },
  {
    icon: "🎨",
    title: "Brand Managers",
    desc: "Maintain strict typography, color token fidelity, and tone guidelines across thousands of generated static and video creatives while giving media buyers autonomous speed."
  }
];

const FIT_CHECK_YES = [
  "You are sick of wasting 2+ hours a week clicking around in Meta Ads Manager to duplicate, edit, and publish.",
  "You have wanted to run ads but clunky, slow ad network dashboards held you back.",
  "You already use AI agents (Claude Code, Cursor, ChatGPT) for development and want advertising to work the exact same way.",
  "You run ads for multiple brands or clients and want to recover operational margin.",
  "You want an intelligent assistant that drafts, researches, and monitors while you keep the final 1-click approval."
];

const FIT_CHECK_NO = [
  "You expect AI to magically fix a broken product or offer without strategy.",
  "You refuse to review drafted campaigns before they deploy to live accounts.",
  "You genuinely enjoy spending 10 hours a week manually configuring ad manager dropdowns."
];

const FAQS = [
  {
    q: "What can my AI agent actually do with PerfOS & AdKit?",
    a: "Your AI agent gains typed MCP tools to search 500k+ competitor ads, deconstruct winning hooks, generate on-brand static and video variations, inspect live performance metrics, and draft campaigns across Meta, Google, TikTok, LinkedIn, Reddit, X, and Microsoft Ads."
  },
  {
    q: "Do changes go live immediately, or is there an approval step?",
    a: "Every change your agent makes is a draft by default. Campaigns, ad sets, and creatives sit safely in your PerfOS dashboard until you click 'Approve'. Nothing touches your live accounts without your explicit sign-off."
  },
  {
    q: "Will using an MCP get my ad account flagged or banned?",
    a: "No. Unlike unofficial scraping scripts, PerfOS is an approved Meta and Google Tech Partner. All operations use the official platform APIs with built-in rate-limiting, safety gates, and policy safeguards."
  },
  {
    q: "How long does setup take?",
    a: "Less than 3 minutes. Connect your ad accounts in the web console, paste one JSON line into your Claude Desktop, Cursor, or ChatGPT MCP settings, and you are ready to command your agent."
  },
  {
    q: "Can I use PerfOS without an AI agent?",
    a: "Yes! PerfOS includes a full standalone web dashboard where you can browse the Ad Library, use the AI Creative Generator & Cloner, and inspect account metrics directly."
  },
  {
    q: "Which AI agents and IDEs are compatible?",
    a: "PerfOS works natively with Claude Code, Claude Desktop, Cursor IDE, ChatGPT (OpenAI GPTs), Grok (xAI), Codex, OpenClaw, Perplexity, and Hermes Agent."
  }
];

export default function HomePage() {
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playProgress, setPlayProgress] = useState(38);
  const [deployedToast, setDeployedToast] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<"9:16" | "1:1" | "16:9">("1:1");

  const currentWorkflow = WORKFLOW_PROMPTS[activeWorkflow];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => (prev >= 98 ? 0 : prev + 0.5));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleCopyCmd = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText("npx -y @adkit/mcp-server");
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2200);
    }
  };

  const handleDeployDraft = () => {
    setDeployedToast(true);
    setTimeout(() => setDeployedToast(false), 3500);
  };

  const totalSeconds = 15;
  const currentSeconds = ((playProgress / 100) * totalSeconds).toFixed(1);

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f4f4f6] selection:bg-[#d86f82]/25 selection:text-[#f4f4f6] overflow-x-clip">
      <MarketingNavbar />

      {/* Floating Deploy Toast */}
      {deployedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#121318] border border-[#d86f82]/40 text-white shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-[#d86f82]/20 text-[#d86f82] flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <div className="text-xs font-bold text-white">Draft Approved &amp; Deployed!</div>
            <div className="text-[11px] text-zinc-400">Pushed safely to Meta &amp; Google ad network APIs.</div>
          </div>
        </div>
      )}

      <main className="pt-24 pb-20">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center">
          {/* Social Proof Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121318] border border-white/10 mb-6 hover:border-[#d86f82]/40 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-[#d86f82] animate-ping" />
            <span className="text-xs font-medium text-zinc-300">
              “Basically Ahrefs but for advertising”
            </span>
            <span className="text-xs text-[#d86f82] font-semibold flex items-center">
              Explore AdKit 2.0 →
            </span>
          </div>

          {/* Main Headline (Zero Gradient, Solid Daisy Rose Accent) */}
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              The ads toolbox for you &amp; your <span className="text-[#d86f82]">AI agents</span>
            </h1>
          </div>

          <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Research competitors, launch campaigns, and track performance in minutes instead of hours — all from your preferred AI agent, or from the dashboard.
          </p>

          {/* Action CTAs (Solid Daisy Rose & Matte Dark) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-[#d86f82] hover:bg-[#c85c6f] rounded-xl border border-[#d86f82]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Start 7-day Trial</span>
              <span>→</span>
            </Link>

            <button
              onClick={handleCopyCmd}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-mono font-medium text-zinc-300 bg-[#121318] hover:bg-[#181920] rounded-xl border border-white/10 hover:text-white transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span className="text-[#d86f82] font-bold">$</span>
              <span>npx -y @adkit/mcp-server</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                {copiedCmd ? "Copied! ✓" : "Copy"}
              </span>
            </button>
          </div>

          <p className="mt-3.5 text-xs text-zinc-500">
            7-day free trial · Cancel in one click · Bring your own AI keys
          </p>

          {/* Certified Partner Strips */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-2 text-zinc-300">
              <MetaLogo className="w-4 h-4 text-[#d86f82]" />
              Meta Approved Tech Partner
            </span>
            <span className="flex items-center gap-2 text-zinc-300">
              <GoogleLogo className="w-4 h-4 text-[#d86f82]" />
              Google &amp; TikTok Certified
            </span>
            <span className="flex items-center gap-2 text-zinc-300">
              <ClaudeLogo className="w-4 h-4 text-[#d86f82]" />
              Anthropic &amp; OpenAI MCP Native
            </span>
          </div>

          {/* Testimonial Callout Card */}
          <div className="mt-10 max-w-3xl mx-auto p-5 rounded-xl bg-[#121318] border border-white/10 text-left">
            <p className="text-xs sm:text-sm text-zinc-300">
              &quot;My agent analyzed my account using AdKit, found what to optimize, and drafted all the changes on its own. I only had to click &apos;Approve&apos;. The first 30 minutes already saved me 8 hours of work.&quot;
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span className="font-semibold text-white">Gabe Salinas</span>
              <span>·</span>
              <span>Founder &amp; Media Buyer</span>
            </div>
          </div>

          {/* ===================== WORKSPACE SHOWCASE (CLEAN MATTE BLACK) ===================== */}
          <div className="mt-14 sm:mt-16 text-left">
            <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-[#121318] shadow-2xl overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0c0d12]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 font-medium">
                    perfos-agent-session // meta-google-bridge-v2.sock
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#d86f82]/10 border border-[#d86f82]/20 text-[#d86f82] text-xs font-medium font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#d86f82] animate-ping" />
                  <span>Agent active: {currentWorkflow.title}</span>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="p-4 border-b border-white/10 bg-[#15161d] flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold px-1">
                    Modes:
                  </span>
                  {WORKFLOW_PROMPTS.map((wf, idx) => (
                    <button
                      key={wf.id}
                      onClick={() => setActiveWorkflow(idx)}
                      className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer " + (activeWorkflow === idx ? "bg-[#d86f82] text-white border border-[#d86f82]/50" : "bg-[#1c1d26] hover:bg-[#252632] text-zinc-300 border border-white/5")}
                    >
                      <span>{wf.icon}</span>
                      <span>{wf.title}</span>
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-1 bg-[#0c0d12] p-1 rounded-lg border border-white/5">
                  {(['1:1', '9:16', '16:9'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRatio(r)}
                      className={"px-2 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer " + (selectedRatio === r ? "bg-[#d86f82] text-white font-bold" : "text-zinc-400 hover:text-zinc-200")}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                {/* Left: Creative preview */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                        Live Creative Canvas
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#d86f82]/15 text-[#d86f82] border border-[#d86f82]/30 font-bold">
                        {currentWorkflow.badge}
                      </span>
                    </div>

                    <div className="relative aspect-video rounded-lg bg-[#15161d] border border-white/10 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between text-xs text-zinc-400 z-10">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#d86f82]" /> {currentWorkflow.network}
                        </span>
                        <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300">
                          {selectedRatio} Active
                        </span>
                      </div>

                      <div className="my-auto text-center px-3 py-2 rounded-lg bg-[#0c0d12]/90 border border-white/10 z-10">
                        <p className="text-sm font-bold text-white tracking-tight">
                          &quot;{currentWorkflow.adHeadline}&quot;
                        </p>
                        <p className="text-[11px] text-[#d86f82] mt-1.5 font-mono font-medium">
                          {currentWorkflow.adSub}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1 z-10">
                        <span className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px] text-white cursor-pointer"
                          >
                            {isPlaying ? "❚❚" : "▶"}
                          </button>
                          <span>{currentSeconds}s / 15.0s</span>
                        </span>
                        <span className="text-[#d86f82] font-semibold">Live Feed Synced</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#0c0d12] border border-white/5 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Library</span>
                      <span className="text-sm font-bold text-white font-mono">512,400+</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0c0d12] border border-white/5 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">MCP Latency</span>
                      <span className="text-sm font-bold text-[#d86f82] font-mono">&lt; 140ms</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0c0d12] border border-white/5 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Safety Gate</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">100% Draft</span>
                    </div>
                  </div>
                </div>

                {/* Right: Terminal Feed */}
                <div className="lg:col-span-7 flex flex-col justify-between p-5 rounded-xl bg-[#0c0d12] border border-white/10 font-mono text-xs space-y-4">
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-lg bg-[#15161d] border border-white/10 text-zinc-200">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1">
                        <span className="flex items-center gap-1.5 text-[#d86f82] font-bold"><ClaudeLogo className="w-3.5 h-3.5" /> You (via Claude Desktop):</span>
                      </div>
                      <p className="text-sm font-sans font-medium text-white">{currentWorkflow.userPrompt}</p>
                    </div>

                    <div className="p-2.5 rounded-md bg-[#181922] border border-[#d86f82]/20 text-[#d86f82] text-[11px] flex items-center gap-2">
                      <CursorLogo className="w-3.5 h-3.5 text-[#d86f82]" />
                      <span>{currentWorkflow.agentAction}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#15161d] border border-white/10 text-zinc-300 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#d86f82] font-bold">
                        <span className="flex items-center gap-1.5"><ChatGPTLogo className="w-3 h-3 text-[#d86f82]" /> PerfOS Agent Output:</span>
                        <span className="text-emerald-400 font-normal">Status: Staged in Dashboard</span>
                      </div>
                      <p className="text-xs font-sans leading-relaxed text-zinc-200">
                        {currentWorkflow.agentOutput}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10 gap-3">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Safe Mode: 1-Click human verification required
                    </span>
                    <button
                      onClick={handleDeployDraft}
                      className="px-4 py-2 rounded-lg bg-[#d86f82] hover:bg-[#c85c6f] text-white font-bold font-sans text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>✓ Approve &amp; Deploy Draft</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Scrubber */}
              <div className="px-6 pb-6 pt-2">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    setPlayProgress(Math.max(0, Math.min(100, (x / rect.width) * 100)));
                  }}
                  className="relative h-20 w-full bg-[#0c0d12] rounded-xl border border-white/10 p-2 overflow-hidden flex flex-col justify-between cursor-pointer group"
                >
                  <div
                    style={{ left: playProgress + "%" }}
                    className="absolute top-0 bottom-0 w-[2px] bg-[#d86f82] z-30 transition-all duration-75"
                  >
                    <div className="w-3 h-3 bg-[#d86f82] rotate-45 -translate-x-[5px] -translate-y-1.5" />
                  </div>

                  <div className="h-7 w-full rounded bg-[#181922] border border-white/10 flex items-center px-3 gap-2 overflow-hidden">
                    <span className="text-[9px] font-mono text-[#d86f82] font-bold uppercase">Video 1</span>
                    <div className="flex-1 flex gap-1 h-full py-1">
                      <div className="w-1/4 bg-white/10 rounded-sm" />
                      <div className="w-1/3 bg-[#d86f82]/30 rounded-sm border-l border-r border-[#d86f82] text-[8px] font-mono text-white px-1 flex items-center">
                        Hook_Variation_02.mp4
                      </div>
                      <div className="flex-1 bg-white/10 rounded-sm" />
                    </div>
                  </div>

                  <div className="h-6 w-full rounded bg-[#181922] border border-white/10 flex items-center px-3 gap-2">
                    <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">Audio 1</span>
                    <div className="flex-1 flex items-center gap-[3px] h-full overflow-hidden opacity-80">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div
                          key={i}
                          style={{ height: String((Math.sin((i + playProgress * 0.2) * 0.5) + 1.2) * 8 + 2) + "px" }}
                          className="w-1 bg-[#d86f82] rounded-full transition-all duration-75"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 1: 4 PILLARS WORKFLOW ===================== */}
        <section className="py-24 border-t border-white/10 bg-[#08080a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#d86f82] font-semibold">
                What you can do with AdKit
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Your full ad workflow, in one place
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-7 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#d86f82]/40 transition-colors group flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#d86f82]/10 border border-[#d86f82]/20 flex items-center justify-center text-[#d86f82] text-xl">
                    🔍
                  </div>
                  <h3 className="text-lg font-bold text-white">Research</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Browse 500k+ ads or import your competitors. Filter by longevity to uncover true evergreen winners live for 90+ days.
                  </p>
                </div>
                <Link href="/features/ad-library" className="text-xs text-[#d86f82] hover:underline font-semibold flex items-center gap-1">
                  Find what&apos;s working →
                </Link>
              </div>

              <div className="p-7 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#d86f82]/40 transition-colors group flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#d86f82]/10 border border-[#d86f82]/20 flex items-center justify-center text-[#d86f82] text-xl">
                    🎨
                  </div>
                  <h3 className="text-lg font-bold text-white">Create</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Turn your brand kit and competitor winners into 30+ static and video hooks in seconds. 1-click resize for every placement.
                  </p>
                </div>
                <Link href="/features/ai-ads-generator" className="text-xs text-[#d86f82] hover:underline font-semibold flex items-center gap-1">
                  AI Ads Generator →
                </Link>
              </div>

              <div className="p-7 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#d86f82]/40 transition-colors group flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#d86f82]/10 border border-[#d86f82]/20 flex items-center justify-center text-[#d86f82] text-xl">
                    ⚡
                  </div>
                  <h3 className="text-lg font-bold text-white">Launch</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Let your agent draft campaigns, sets, and budgets directly from chat. Review in your dashboard and approve in 1 click.
                  </p>
                </div>
                <Link href="/features/ads-mcp" className="text-xs text-[#d86f82] hover:underline font-semibold flex items-center gap-1">
                  Launch with your agent →
                </Link>
              </div>

              <div className="p-7 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#d86f82]/40 transition-colors group flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#d86f82]/10 border border-[#d86f82]/20 flex items-center justify-center text-[#d86f82] text-xl">
                    📈
                  </div>
                  <h3 className="text-lg font-bold text-white">Analyze</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cut through platform over-reporting. Identify fatigued creatives and scale winning ad sets with real incremental ROAS.
                  </p>
                </div>
                <Link href="/command-center" className="text-xs text-[#d86f82] hover:underline font-semibold flex items-center gap-1">
                  Track real ROAS →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 2: THE 2018 PROBLEM ===================== */}
        <section className="py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                The Problem
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Running ads feels like you&apos;re back in 2018...
              </h2>
              <p className="text-zinc-400 text-base">
                You don&apos;t have hours to waste clicking through ad managers. Let your agent do the boring work so you can focus on strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="p-8 rounded-2xl bg-[#121318] border border-white/10 space-y-5">
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase font-bold">
                  <span>😩</span> Without AdKit
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-0.5">✕</span>
                    <span>Scroll ad libraries and feeds hoping to find inspiration.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-0.5">✕</span>
                    <span>Screenshot competitors into ChatGPT to guess why their ads work.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-0.5">✕</span>
                    <span>Open Photoshop/Canva to make 8 subtle size variations manually.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-0.5">✕</span>
                    <span>Click through 15 dropdowns in Meta Ads Manager just to duplicate a campaign.</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-[#121318] border border-[#d86f82]/40 space-y-5">
                <div className="flex items-center gap-2 text-[#d86f82] font-mono text-xs uppercase font-bold">
                  <span>😎</span> With AdKit
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-zinc-200">
                  <li className="flex items-start gap-3">
                    <span className="text-[#d86f82] font-bold mt-0.5">✓</span>
                    <span>Ask your agent: <em>&quot;What are Notion&apos;s longest-running ads?&quot;</em></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#d86f82] font-bold mt-0.5">✓</span>
                    <span><em>&quot;Clone their top 3 ads into my brand and write 5 hook variations.&quot;</em></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#d86f82] font-bold mt-0.5">✓</span>
                    <span><em>&quot;Resize all 5 for Stories, Feed, and TikTok in 1 click.&quot;</em></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#d86f82] font-bold mt-0.5">✓</span>
                    <span><em>&quot;Draft the campaign on Meta and notify me when it&apos;s ready to review.&quot;</em></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 3: AUDIENCE / OPERATORS ===================== */}
        <section className="py-24 border-t border-white/10 bg-[#08080a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#d86f82] font-semibold">
                Built For Operators
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Designed for speed and control
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {AUDIENCE_CARDS.map((aud, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl bg-[#121318] border border-white/10 space-y-4 hover:border-[#d86f82]/40 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-3xl block">{aud.icon}</span>
                    <h3 className="text-base font-bold text-white">{aud.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{aud.desc}</p>
                  </div>
                  <Link
                    href="/pricing"
                    className="text-xs font-semibold text-[#d86f82] hover:underline pt-3 border-t border-white/5 block"
                  >
                    Start Free Trial →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SECTION 4: A WORD FROM FOUNDER ===================== */}
        <section className="py-20 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-10 rounded-2xl bg-[#121318] border border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#d86f82] flex items-center justify-center text-xl font-bold text-white">
                  N
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">A word from the founder</h3>
                  <p className="text-xs text-zinc-400">Hi there 👋 I&apos;m Nico, the creator of AdKit</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/10 pt-6">
                <p>
                  Before building startups, I was a media buyer. I managed over <strong>$1,000,000 in ads</strong>, sold two startups grown entirely with performance marketing, and helped 1,000+ founders learn Meta Ads through my guides.
                </p>
                <p>
                  I love ads, but running them involves a tremendous amount of repetitive, mind-numbing grunt work 😩 Duplicating ad sets, resizing 20 static banners, copying and pasting copy, and navigating laggy ad managers. I hated every second of it.
                </p>
                <p>
                  So I built AdKit to fix that. To let me and other marketers focus on what actually moves the needle: <strong>the strategy, the thinking, and the creativity</strong> — while letting AI agents handle the manual execution.
                </p>
                <p className="font-semibold text-white pt-2">
                  — Nico, Founder of AdKit
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <span className="text-xs text-zinc-400">Try it risk-free with full access for 7 days.</span>
                <Link
                  href="/pricing"
                  className="px-6 py-2.5 rounded-xl bg-[#d86f82] hover:bg-[#c85c6f] text-white text-xs font-semibold transition-colors"
                >
                  Start 7-day Trial →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 5: HONEST FIT CHECK ===================== */}
        <section className="py-24 border-t border-white/10 bg-[#08080a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#d86f82] font-semibold">
                Fit Assessment
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Is AdKit the right fit for you?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-[#121318] border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-[#d86f82] font-mono text-xs uppercase font-bold">
                  <span>🎯</span> AdKit is made for you if...
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300">
                  {FIT_CHECK_YES.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[#d86f82] font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-[#121318] border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase font-bold">
                  <span>🚫</span> But it might not be a good fit if...
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-400">
                  {FIT_CHECK_NO.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-rose-400 font-bold mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 6: TRANSPARENT PRICING ===================== */}
        <section className="py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#d86f82] font-semibold">
                Transparent Plans
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-zinc-400 text-sm">
                Save 30%+ with annual billing. Cancel anytime with 1 click.
              </p>

              <div className="pt-4 inline-flex items-center gap-2 p-1.5 rounded-xl bg-[#121318] border border-white/10">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={"px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors " + (!annualBilling ? "bg-[#d86f82] text-white shadow-sm" : "text-zinc-400 hover:text-white")}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={"px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors " + (annualBilling ? "bg-[#d86f82] text-white shadow-sm" : "text-zinc-400 hover:text-white")}
                >
                  <span>Yearly</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white font-mono font-bold">
                    Save 30%+
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-2xl bg-[#121318] border border-white/10 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Single Project</h3>
                    <p className="text-xs text-zinc-400 mt-1">Every AdKit tool (ad library, AI studio, and MCP) for one brand.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {annualBilling ? "$29" : "$49"}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">/ month</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300 border-t border-white/10 pt-5">
                    <li className="flex items-center gap-2">✓ Multi-platform Ad Library (500k+ ads)</li>
                    <li className="flex items-center gap-2">✓ Competitor Longevity &amp; Activity Alerts</li>
                    <li className="flex items-center gap-2">✓ AI Ads Generator &amp; Creative Cloner</li>
                    <li className="flex items-center gap-2">✓ Ads MCP Server &amp; Terminal CLI</li>
                    <li className="flex items-center gap-2">✓ Meta, Google, TikTok, LinkedIn ad accounts</li>
                  </ul>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full py-3 text-center text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors"
                >
                  Start 7-Day Trial
                </Link>
              </div>

              <div className="p-8 rounded-2xl bg-[#121318] border-2 border-[#d86f82] relative space-y-6 flex flex-col justify-between">
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#d86f82] text-[10px] font-bold uppercase tracking-wider text-white">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Multiple Projects</h3>
                    <p className="text-xs text-zinc-400 mt-1">For agencies, media buyers, and operators with multiple brands.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {annualBilling ? "$89" : "$149"}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">/ month</span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-200 border-t border-white/10 pt-5">
                    <li className="flex items-center gap-2">✓ <strong>Unlimited</strong> Brands &amp; Client Workspaces</li>
                    <li className="flex items-center gap-2">✓ Unlimited Competitor Ad Search &amp; Downloads</li>
                    <li className="flex items-center gap-2">✓ 1,000 AI Creative Generations / mo</li>
                    <li className="flex items-center gap-2">✓ Multi-Seat Team Access &amp; Dedicated API Keys</li>
                    <li className="flex items-center gap-2">✓ Priority Support &amp; Custom MCP Bridge</li>
                  </ul>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full py-3 text-center text-xs font-bold text-white bg-[#d86f82] hover:bg-[#c85c6f] rounded-xl transition-colors"
                >
                  Start Agency Trial →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 7: FAQS ===================== */}
        <section className="py-24 border-t border-white/10 bg-[#08080a]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#d86f82] font-semibold">
                F.A.Q.
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-[#121318] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-200 hover:text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#d86f82] font-mono text-base font-bold">
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SECTION 8: FINAL CTA ===================== */}
        <section className="py-24 border-t border-white/10 text-center bg-[#08080a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Stop clicking. Start Advertising.
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
              Give your AI agent the ads toolbox it&apos;s missing: research, create, launch, and diagnose from a single chat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-[#d86f82] hover:bg-[#c85c6f] rounded-xl transition-colors"
              >
                Start 7-day Free Trial →
              </Link>
            </div>
            <p className="text-xs text-zinc-500">
              7-day free trial · Cancel in one click · Bring your own AI keys
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
