/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MarketingFooter } from '@/components/marketing/footer';
import {
  ChatGPTLogo,
  ClaudeLogo,
  CursorLogo,
  GoogleLogo,
  LinkedInLogo,
  MetaLogo,
  NotionLogo,
  PerfOSLogo,
  TikTokLogo,
} from '@/components/marketing/icons';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Vector Icons for Hallmark Anti-Slop Discipline                     */
/* ------------------------------------------------------------------ */

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LightningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive Workflow Models                                        */
/* ------------------------------------------------------------------ */

const WORKFLOW_PROMPTS = [
  {
    id: 'spy',
    title: 'Spy Competitors',
    Icon: SearchIcon,
    userPrompt: 'What is the longest-running evergreen ad for notion.so?',
    agentAction:
      "perfos_spy_competitor(domain: 'notion.so', min_longevity_days: 90)",
    agentOutput:
      "Discovered top winner: 'Post-it Note Workflow' running active for 142 consecutive days. Directing to /product with 126 live variants. Hook angle: 'Consolidate 12 tools into 1 workspace'.",
    badge: '142 Days Live',
    adHeadline: 'Consolidate 12 fragmented tools into 1 unified workspace.',
    adSub: 'Estimated spend: $42,500+ · 142 days continuous run · 9.4% CTR',
    network: 'Meta & YouTube',
  },
  {
    id: 'kill-scale',
    title: 'Kill or Scale Ads',
    Icon: LightningIcon,
    userPrompt:
      'Audit our Meta Ad Account for the last 14 days. What should we pause or scale?',
    agentAction:
      "perfos_audit_performance(timeframe: '14d', target_roas: 2.5)",
    agentOutput:
      "2 underperformers identified: 'Feature Breakdown V2' (CPA $84.20, ROAS 0.8x) -> Staged Pause. 1 breakout winner: 'Founder Voiceover Reel' (ROAS 4.6x, Spent $1,240) -> Staged +25% Budget scale.",
    badge: 'ROAS 4.6x Scaled',
    adHeadline: 'Founder Story Reel: Why we ditched bloated agencies.',
    adSub: 'ROAS 4.6x · Spent $1,240 · Scaled budget to $150/day',
    network: 'Instagram & TikTok',
  },
  {
    id: 'clone',
    title: 'Clone & Remix',
    Icon: SparklesIcon,
    userPrompt:
      "Clone Notion's 142-day evergreen ad and remix it with our PerfOS Dark Daisy brand kit.",
    agentAction:
      "perfos_clone_creative(source_id: 'notion_142d', brand_kit: 'perfos_tokens')",
    agentOutput:
      "Extracted visual layout & hook mechanics. Synthesized 3 on-brand variations: 'Stop running ads like it's 2018. Connect Claude directly to Meta, Google & TikTok.' Creatives staged for preview.",
    badge: '3 Variants Ready',
    adHeadline:
      "Stop running ads like it's 2018. Connect Claude to Meta & TikTok.",
    adSub: 'Generated from Notion 142-day winner · Color tokens: Dark Daisy',
    network: 'Meta, Google, X',
  },
  {
    id: 'resize',
    title: 'Placement Resize',
    Icon: LayersIcon,
    userPrompt:
      'Take our winning desktop banner and format for IG Stories 9:16, Feed 1:1, and LinkedIn.',
    agentAction: "perfos_batch_resize(creative_id: 'perfos_hero_01')",
    agentOutput:
      'Generated 3 multi-platform assets: 9:16 Vertical Video with auto-safe zone captions, 1:1 Square Feed, and 4:5 Mobile Portrait. Dimensions and compression verified against network APIs.',
    badge: 'API Validated',
    adHeadline: 'Autonomous Ads via MCP Protocol · Zero UI Grunt Work',
    adSub: '3 Formats ready · 9:16 Stories, 1:1 Feed, 4:5 Mobile · Verified',
    network: 'All 7 Networks',
  },
  {
    id: 'draft',
    title: 'Draft Campaign',
    Icon: TerminalIcon,
    userPrompt:
      'We launched our new Ads CLI. Draft a launch campaign for Meta & X targeting developers.',
    agentAction:
      "perfos_draft_campaign(topic: 'Ads CLI Launch', target: 'devs', budget: '$50/day')",
    agentOutput:
      "Drafted Campaign 'Ads CLI Launch' with 2 ad sets: Developer Tools Interest + Lookalike 1%. 4 terminal-themed hooks prepared. Staged in dashboard for your 1-click approval.",
    badge: 'Ready for Approval',
    adHeadline: 'Terminal-Native Ads for Engineers: Manage campaigns from CLI.',
    adSub: "Campaign: 'Ads CLI Launch' · Budget: $50/day · 2 Ad Sets",
    network: 'Meta & X Ads',
  },
];

const AUDIENCE_CARDS = [
  {
    Icon: TerminalIcon,
    title: 'Founders & Solopreneurs',
    desc: 'You are growing a product and refuse to pay $10k/mo agency retainers. Run high-converting ad experiments yourself in 10 minutes a week instead of clicking through bloated ad managers.',
  },
  {
    Icon: TargetIcon,
    title: 'Agencies & Media Buyers',
    desc: 'Manage 10+ client ad accounts with autonomous execution. Reclaim hours lost duplicating ad sets, resizing banners, and chasing reporting numbers across Meta, Google, and TikTok.',
  },
  {
    Icon: ChartBarIcon,
    title: 'Growth Engineers',
    desc: 'Scale your creative testing velocity 5x. Uncover competitor evergreen winners, spin up 20 hook variations with your brand kit, and deploy campaigns directly from Claude or Cursor.',
  },
  {
    Icon: PaletteIcon,
    title: 'Brand Managers',
    desc: 'Maintain strict typography, color token fidelity, and tone guidelines across thousands of generated static and video creatives while giving media buyers autonomous speed.',
  },
];

const FIT_CHECK_YES = [
  'You are sick of wasting 2+ hours a week clicking around in Meta Ads Manager to duplicate, edit, and publish.',
  'You want to run profitable ads but clunky, slow ad network dashboards held you back.',
  'You already use AI agents (Claude Code, Cursor, ChatGPT) for engineering and want advertising to work the exact same way.',
  'You manage ad spend for multiple brands and need deterministic Shopify revenue reconciliation.',
  'You want an intelligent operator that drafts, researches, and monitors while you keep the final 1-click approval gate.',
];

const FIT_CHECK_NO = [
  'You expect AI to magically fix a broken product or offer without strategy.',
  'You refuse to review drafted campaigns before they deploy to live accounts.',
  'You genuinely enjoy spending 10 hours a week manually configuring ad manager dropdowns.',
];

const FAQS = [
  {
    q: 'What can my AI agent actually do with PerfOS?',
    a: 'Your AI agent gains typed MCP tools to search 500k+ competitor ads, deconstruct winning hooks, generate on-brand static and video variations, reconcile spend against Shopify orders, and draft campaigns across Meta, Google, TikTok, LinkedIn, Reddit, X, and Microsoft Ads.',
  },
  {
    q: 'Do changes go live immediately, or is there an approval step?',
    a: "Every change your agent makes is a draft by default. Campaigns, ad sets, and creatives sit safely in your PerfOS dashboard until you click 'Approve'. Nothing touches your live accounts without your explicit sign-off.",
  },
  {
    q: 'Will using PerfOS MCP get my ad account flagged or banned?',
    a: 'No. PerfOS uses official platform APIs with built-in rate-limiting, safety gates, and policy safeguards. All operations are signed and verifiable.',
  },
  {
    q: 'How long does setup take?',
    a: 'Less than 3 minutes. Connect your ad accounts in the web console, paste one JSON line into your Claude Desktop, Cursor, or ChatGPT MCP settings, and you are ready to command your agent.',
  },
  {
    q: 'Can I use PerfOS without an AI agent?',
    a: 'Yes. PerfOS includes a full standalone web dashboard where you can browse the Ad Library, use the AI Creative Generator & Cloner, inspect true blended MER, and manage ad accounts directly.',
  },
  {
    q: 'Which AI agents and IDEs are compatible?',
    a: 'PerfOS works natively with Claude Code, Claude Desktop, Cursor IDE, ChatGPT (OpenAI GPTs), Grok (xAI), Codex, OpenClaw, Perplexity, and Hermes Agent.',
  },
];

export default function HomePage() {
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playProgress, setPlayProgress] = useState(38);
  const [deployedToast, setDeployedToast] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<'9:16' | '1:1' | '16:9'>(
    '1:1',
  );

  const currentWorkflow = WORKFLOW_PROMPTS[activeWorkflow];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => (prev >= 98 ? 0 : prev + 0.5));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleCopyCmd = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText('npx -y @perfos/mcp-server');
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
    <div className="min-h-screen bg-canvas text-foreground selection:bg-primary/25 selection:text-foreground overflow-x-clip">
      <MarketingNavbar />

      {/* Deploy Notification Toast */}
      {deployedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-surface border border-primary/40 text-white shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono font-bold text-xs">
            ✓
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              Draft Approved &amp; Deployed
            </div>
            <div className="text-[11px] text-zinc-400">
              Pushed safely to Meta &amp; Google ad network APIs.
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 pb-20">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center">
          {/* Social Proof Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border mb-6 hover:border-primary/40 transition-colors">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-zinc-300">
              Autonomous Growth Engine &middot; Reconciled with Shopify
            </span>
            <span className="text-xs text-primary font-semibold flex items-center">
              PerfOS Console &rarr;
            </span>
          </div>

          {/* Main Headline */}
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              The performance ads toolbox for you &amp; your{' '}
              <span className="text-primary">AI agents</span>
            </h1>
          </div>

          <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Research competitor longevity, remix winning hooks, audit platform over-reporting, and deploy campaigns in minutes — directly from your AI agent, or from the central command center.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/command-center"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl border border-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Open Command Center</span>
              <span>&rarr;</span>
            </Link>

            <button
              onClick={handleCopyCmd}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-mono font-medium text-zinc-300 bg-surface hover:bg-[#181920] rounded-xl border border-border hover:text-white transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span className="text-primary font-bold">$</span>
              <span>npx -y @perfos/mcp-server</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                {copiedCmd ? 'Copied! ✓' : 'Copy'}
              </span>
            </button>
          </div>

          <p className="mt-3.5 text-xs text-zinc-500 font-mono">
            7-day trial &middot; 100% Policy-Gated Drafts &middot; Bring your own AI keys
          </p>

          {/* Verified Partner Strips */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-400 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-2 text-zinc-300">
              <MetaLogo className="w-4 h-4 text-primary" />
              Meta Approved Tech Partner
            </span>
            <span className="flex items-center gap-2 text-zinc-300">
              <GoogleLogo className="w-4 h-4 text-primary" />
              Google &amp; TikTok Certified
            </span>
            <span className="flex items-center gap-2 text-zinc-300">
              <ClaudeLogo className="w-4 h-4 text-primary" />
              Anthropic &amp; OpenAI MCP Native
            </span>
          </div>

          {/* Operator Quote Callout */}
          <div className="mt-10 max-w-3xl mx-auto p-5 rounded-xl bg-surface border border-border text-left">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              &quot;PerfOS connected Claude Code directly to our Meta and Google ad accounts. It audited our spend against Shopify, flagged $14k in over-claimed conversions, and drafted 6 replacement hooks in minutes.&quot;
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span className="font-semibold text-white">Engineering Lead</span>
              <span>&middot;</span>
              <span>High-Growth DTC Brand ($2.4M/yr ad spend)</span>
            </div>
          </div>

          {/* ===================== WORKSPACE SHOWCASE ===================== */}
          <div className="mt-14 sm:mt-16 text-left">
            <div className="mx-auto w-full max-w-6xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-canvas">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 font-medium">
                    perfos-agent-session // meta-google-bridge-v2.sock
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Agent active: {currentWorkflow.title}</span>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="p-4 border-b border-border bg-surface-elevated flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold px-1">
                    Modes:
                  </span>
                  {WORKFLOW_PROMPTS.map((wf, idx) => (
                    <button
                      key={wf.id}
                      onClick={() => setActiveWorkflow(idx)}
                      className={
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ' +
                        (activeWorkflow === idx
                          ? 'bg-primary text-white border border-primary/50'
                          : 'bg-[#1c1d26] hover:bg-[#252632] text-zinc-300 border border-white/5')
                      }
                    >
                      <wf.Icon className="w-3.5 h-3.5" />
                      <span>{wf.title}</span>
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-1 bg-canvas p-1 rounded-lg border border-white/5">
                  {(['1:1', '9:16', '16:9'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRatio(r)}
                      className={
                        'px-2 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer ' +
                        (selectedRatio === r
                          ? 'bg-primary text-white font-bold'
                          : 'text-zinc-400 hover:text-zinc-200')
                      }
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
                  <div className="p-4 rounded-xl bg-canvas border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                        Live Creative Canvas
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-bold">
                        {currentWorkflow.badge}
                      </span>
                    </div>

                    <div className="relative aspect-video rounded-lg bg-surface-elevated border border-border p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between text-xs text-zinc-400 z-10">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary" />{' '}
                          {currentWorkflow.network}
                        </span>
                        <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300">
                          {selectedRatio} Active
                        </span>
                      </div>

                      <div className="my-auto text-center px-3 py-2 rounded-lg bg-canvas/90 border border-border z-10">
                        <p className="text-sm font-bold text-white tracking-tight">
                          &quot;{currentWorkflow.adHeadline}&quot;
                        </p>
                        <p className="text-[11px] text-primary mt-1.5 font-mono font-medium">
                          {currentWorkflow.adSub}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1 z-10">
                        <span className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-[10px] text-white cursor-pointer"
                          >
                            {isPlaying ? '❚❚' : '▶'}
                          </button>
                          <span>{currentSeconds}s / 15.0s</span>
                        </span>
                        <span className="text-primary font-semibold">
                          Live Feed Synced
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-canvas border border-white/5 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Total Library
                      </span>
                      <span className="text-sm font-bold text-white font-mono">
                        512,400+
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-canvas border border-white/5 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        MCP Latency
                      </span>
                      <span className="text-sm font-bold text-primary font-mono">
                        &lt; 140ms
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-canvas border border-white/5 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Safety Gate
                      </span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        100% Draft
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Terminal Feed */}
                <div className="lg:col-span-7 flex flex-col justify-between p-5 rounded-xl bg-canvas border border-border font-mono text-xs space-y-4">
                  <div className="space-y-3.5">
                    <div className="p-3 rounded-lg bg-surface-elevated border border-border text-zinc-200">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1">
                        <span className="flex items-center gap-1.5 text-primary font-bold">
                          <ClaudeLogo className="w-3.5 h-3.5" /> You (via Claude Desktop):
                        </span>
                      </div>
                      <p className="text-sm font-sans font-medium text-white">
                        {currentWorkflow.userPrompt}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-md bg-surface-elevated border border-primary/20 text-primary text-[11px] flex items-center gap-2">
                      <CursorLogo className="w-3.5 h-3.5 text-primary" />
                      <span>{currentWorkflow.agentAction}</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-elevated border border-border text-zinc-300 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-primary font-bold">
                        <span className="flex items-center gap-1.5">
                          <ChatGPTLogo className="w-3 h-3 text-primary" />{' '}
                          PerfOS Agent Output:
                        </span>
                        <span className="text-emerald-400 font-normal">
                          Status: Staged in Dashboard
                        </span>
                      </div>
                      <p className="text-xs font-sans leading-relaxed text-zinc-200">
                        {currentWorkflow.agentOutput}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border gap-3">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Safe Mode: 1-Click human verification required
                    </span>
                    <button
                      onClick={handleDeployDraft}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold font-sans text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
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
                    setPlayProgress(
                      Math.max(0, Math.min(100, (x / rect.width) * 100)),
                    );
                  }}
                  className="relative h-20 w-full bg-canvas rounded-xl border border-border p-2 overflow-hidden flex flex-col justify-between cursor-pointer group"
                >
                  <div
                    style={{ left: playProgress + '%' }}
                    className="absolute top-0 bottom-0 w-[2px] bg-primary z-30 transition-all duration-75"
                  >
                    <div className="w-3 h-3 bg-primary rotate-45 -translate-x-[5px] -translate-y-1.5" />
                  </div>

                  <div className="h-7 w-full rounded bg-surface-elevated border border-border flex items-center px-3 gap-2 overflow-hidden">
                    <span className="text-[9px] font-mono text-primary font-bold uppercase">
                      Video Track
                    </span>
                    <div className="flex-1 flex gap-1 h-full py-1">
                      <div className="w-1/4 bg-white/10 rounded-sm" />
                      <div className="w-1/3 bg-primary/30 rounded-sm border-l border-r border-primary text-[8px] font-mono text-white px-1 flex items-center">
                        Hook_Variation_02.mp4
                      </div>
                      <div className="flex-1 bg-white/10 rounded-sm" />
                    </div>
                  </div>

                  <div className="h-6 w-full rounded bg-surface-elevated border border-border flex items-center px-3 gap-2">
                    <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">
                      Audio Wave
                    </span>
                    <div className="flex-1 flex items-center gap-[3px] h-full overflow-hidden opacity-80">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            height:
                              String(
                                (Math.sin((i + playProgress * 0.2) * 0.5) +
                                  1.2) *
                                  8 +
                                  2,
                              ) + 'px',
                          }}
                          className="w-1 bg-primary rounded-full transition-all duration-75"
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
        <section className="py-24 border-t border-border bg-canvas">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Core Modules
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Your full performance ad workflow, unified
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-colors group flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <SearchIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Research</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Browse 500k+ ads across Meta &amp; Google. Filter by longevity to uncover true evergreen winners live for 90+ days.
                  </p>
                </div>
                <Link
                  href="/discovery"
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Explore Spy Library &rarr;
                </Link>
              </div>

              <div className="p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-colors group flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Create</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Turn your brand tokens and competitor winner DNA into 30+ static and video hook angles. 1-click resize for every placement.
                  </p>
                </div>
                <Link
                  href="/creative"
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Creative Studio &rarr;
                </Link>
              </div>

              <div className="p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-colors group flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <LightningIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Launch</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Let your agent draft campaigns, ad sets, and budgets directly from chat. Review in your dashboard and approve in 1 click.
                  </p>
                </div>
                <Link
                  href="/recommendations"
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Draft Approvals &rarr;
                </Link>
              </div>

              <div className="p-7 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-colors group flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <ChartBarIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Reconcile</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cut through ad platform over-reporting with Shopify single-source-of-truth revenue reconciliation and true incremental ROAS.
                  </p>
                </div>
                <Link
                  href="/command-center"
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Command Center &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 2: THE AD MANAGER FRICTION ===================== */}
        <section className="py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-semibold">
                The Contrast
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Modern software engineering vs. Manual ad buying
              </h2>
              <p className="text-zinc-400 text-base">
                You build products with Cursor and Claude in seconds. Why spend hours in clunky ad manager dropdowns?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="p-8 rounded-2xl bg-surface border border-border space-y-5">
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase font-bold">
                  <span className="text-rose-400 font-mono font-bold">[MANUAL]</span>
                  <span>Without PerfOS</span>
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-zinc-400">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-0.5">&times;</span>
                    <span>
                      Endlessly scroll ad libraries hoping to find relevant inspiration.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-0.5">&times;</span>
                    <span>
                      Screenshot competitor ads into chat to manually guess why they work.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-0.5">&times;</span>
                    <span>
                      Manually edit and resize 10 format variations across Canva and Photoshop.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-0.5">&times;</span>
                    <span>
                      Click through 20 nested dropdowns in Meta Ads Manager just to test a new hook.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-surface border border-primary/40 space-y-5">
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase font-bold">
                  <span className="text-primary font-mono font-bold">[AUTONOMOUS]</span>
                  <span>With PerfOS</span>
                </div>
                <ul className="space-y-4 text-xs sm:text-sm text-zinc-200">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">&check;</span>
                    <span>
                      Prompt your agent: &quot;Find Notion&apos;s longest-running evergreen ads.&quot;
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">&check;</span>
                    <span>
                      &quot;Clone the top winner, match our brand tokens, and synthesize 4 hook angles.&quot;
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">&check;</span>
                    <span>
                      &quot;Batch resize for 9:16 Stories, 1:1 Feed, and 4:5 Mobile with 1 command.&quot;
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">&check;</span>
                    <span>
                      &quot;Draft the campaign on Meta and Google &mdash; alert me when ready for sign-off.&quot;
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 3: AUDIENCE / OPERATORS ===================== */}
        <section className="py-24 border-t border-border bg-canvas">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Built For Operators
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Designed for high velocity and total control
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {AUDIENCE_CARDS.map((aud, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl bg-surface border border-border space-y-4 hover:border-primary/40 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                      <aud.Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {aud.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {aud.desc}
                    </p>
                  </div>
                  <Link
                    href="/command-center"
                    className="text-xs font-semibold text-primary hover:underline pt-3 border-t border-white/5 block"
                  >
                    Open Console &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SECTION 4: HONEST FIT CHECK ===================== */}
        <section className="py-24 border-t border-border bg-canvas">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Fit Assessment
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Is PerfOS the right fit for your team?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase font-bold">
                  <span>[YES] PerfOS is built for you if:</span>
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300">
                  {FIT_CHECK_YES.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-primary font-bold mt-0.5">&check;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase font-bold">
                  <span>[NO] Not a good fit if:</span>
                </div>
                <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-400">
                  {FIT_CHECK_NO.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-rose-400 font-bold mt-0.5">&times;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 5: TRANSPARENT PRICING ===================== */}
        <section className="py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Transparent Plans
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-zinc-400 text-sm">
                Save 30%+ with annual billing. Cancel anytime with 1 click.
              </p>

              <div className="pt-4 inline-flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-border">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={
                    'px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ' +
                    (!annualBilling
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white')
                  }
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={
                    'px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ' +
                    (annualBilling
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white')
                  }
                >
                  <span>Yearly</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white font-mono font-bold">
                    Save 30%+
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-2xl bg-surface border border-border space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Single Workspace
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Full PerfOS toolbox (Ad Library, AI Studio, and MCP server) for one brand.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {annualBilling ? '$29' : '$49'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      / month
                    </span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-300 border-t border-border pt-5">
                    <li className="flex items-center gap-2">
                      ✓ Multi-platform Ad Library (500k+ ads)
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Competitor Longevity &amp; Activity Alerts
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ AI Ads Generator &amp; Creative Cloner
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Ads MCP Server &amp; Terminal CLI
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Meta, Google, TikTok, LinkedIn ad accounts
                    </li>
                  </ul>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full py-3 text-center text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl border border-border transition-colors"
                >
                  Start 7-Day Trial
                </Link>
              </div>

              <div className="p-8 rounded-2xl bg-surface border-2 border-primary relative space-y-6 flex flex-col justify-between">
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary text-[10px] font-bold uppercase tracking-wider text-white font-mono">
                  Scale
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Multi-Workspace Agency
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      For agencies, media buyers, and growth operators with multiple client accounts.
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {annualBilling ? '$89' : '$149'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      / month
                    </span>
                  </div>
                  <ul className="space-y-3 text-xs text-zinc-200 border-t border-border pt-5">
                    <li className="flex items-center gap-2">
                      ✓ <strong>Unlimited</strong> Brands &amp; Client Workspaces
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Unlimited Competitor Ad Search &amp; Downloads
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ 1,000 AI Creative Generations / mo
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Multi-Seat Team Access &amp; Dedicated API Keys
                    </li>
                    <li className="flex items-center gap-2">
                      ✓ Priority Support &amp; Custom MCP Bridge
                    </li>
                  </ul>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full py-3 text-center text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
                >
                  Start Agency Trial &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 6: FAQS ===================== */}
        <section className="py-24 border-t border-border bg-canvas">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
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
                  className="rounded-xl border border-border bg-surface overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-200 hover:text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-primary font-mono text-base font-bold">
                      {openFaq === i ? '−' : '+'}
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

        {/* ===================== SECTION 7: FINAL CTA ===================== */}
        <section className="py-24 border-t border-border text-center bg-canvas">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Stop clicking. Start Advertising.
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
              Give your AI agent the ads toolbox it&apos;s missing: research, create, launch, and diagnose from a single chat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/command-center"
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl border border-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Launch PerfOS Command Center</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
