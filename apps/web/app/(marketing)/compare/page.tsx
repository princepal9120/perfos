/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { CheckIcon, CrossIcon } from '@/components/marketing/icons';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingFooter } from '@/components/marketing/footer';

const COMPARISON_ROWS = [
  {
    feature: 'Agentic MCP & CLI Protocol',
    perfos: 'Native (Claude, Cursor, ChatGPT, Codex)',
    legacyAdManager: 'None (Manual UI Dropdowns)',
    otherSpyTools: 'None (Closed Web Only)',
  },
  {
    feature: 'Supported Ad Channels',
    perfos: 'Google, Meta, LinkedIn, X, TikTok, Reddit',
    legacyAdManager: '1 Siloed Platform',
    otherSpyTools: 'Meta only (partial)',
  },
  {
    feature: 'Searchable Ad Library Database',
    perfos: '500,000+ ads with longevity scoring',
    legacyAdManager: 'Single platform only',
    otherSpyTools: 'Limited scraped preview',
  },
  {
    feature: 'Evergreen Longevity Detection',
    perfos: 'Yes (Filter by 30/60/90+ days continuous run)',
    legacyAdManager: 'No',
    otherSpyTools: 'Basic date sorting',
  },
  {
    feature: 'Shopify Revenue Reconciliation',
    perfos: 'Deterministic Truth vs Platform Over-Claims',
    legacyAdManager: 'Self-attributed view-through claims',
    otherSpyTools: 'No store data connection',
  },
  {
    feature: 'AI Hook Remixing & Batch Resize',
    perfos: 'Automated brand token adaptation',
    legacyAdManager: 'No creative generation',
    otherSpyTools: 'Download media only',
  },
  {
    feature: 'Safety Policy & Approvals',
    perfos: '100% Policy-Gated Draft Verification',
    legacyAdManager: 'Manual change staging',
    otherSpyTools: 'No campaign publishing',
  },
  {
    feature: 'Pricing & Value',
    perfos: 'Starts at $29/mo with full MCP & tools',
    legacyAdManager: 'Free tool (eats 10+ hrs/week)',
    otherSpyTools: '$199 – $499/mo per seat',
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-canvas text-foreground selection:bg-primary/25 selection:text-foreground overflow-x-clip">
      <MarketingNavbar />

      <main className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
            Market Comparison
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            PerfOS vs. Legacy Ad Tools &amp; Native Managers
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            See why modern developers, growth engineers, and autonomous AI agents choose PerfOS over fragmented legacy ad software.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="border border-border rounded-2xl bg-surface shadow-2xl overflow-hidden">
          <div className="grid grid-cols-4 p-4 sm:p-5 bg-canvas border-b border-border text-xs font-mono font-bold text-zinc-400">
            <span>Capability</span>
            <span className="text-primary font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              PerfOS (Autonomous)
            </span>
            <span className="text-zinc-400">Native Ads Manager</span>
            <span className="text-zinc-400">Legacy Spy Tools</span>
          </div>

          <div className="divide-y divide-white/5">
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 p-4 sm:p-5 text-xs items-center hover:bg-white/2 transition-colors"
              >
                <span className="font-semibold text-white">{row.feature}</span>
                <span className="text-primary font-semibold flex items-center gap-1.5">
                  <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{row.perfos}</span>
                </span>
                <span className="text-zinc-400">
                  {row.legacyAdManager}
                </span>
                <span className="text-zinc-500">{row.otherSpyTools}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/command-center"
            className="btn-daisy-solid inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-semibold"
          >
            <span>Launch PerfOS Command Center</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
