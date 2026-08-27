'use client';

import Link from 'next/link';
import { CheckIcon, CrossIcon } from '@/components/marketing/icons';

const COMPARISON_ROWS = [
  {
    feature: 'Agentic MCP & CLI Support',
    perfos: 'Native (Claude, Cursor, ChatGPT, Codex)',
    legacyAdManager: 'None (UI Only)',
    otherSpyTools: 'None',
  },
  {
    feature: 'Searchable Competitor Ad Database',
    perfos: '500,000+ ads across 7 networks',
    legacyAdManager: 'Single platform only',
    otherSpyTools: 'Meta only (limited)',
  },
  {
    feature: 'Evergreen Ad Longevity Filter',
    perfos: 'Yes (Filter by 30/60/90+ days)',
    legacyAdManager: 'No',
    otherSpyTools: 'Basic date sorting',
  },
  {
    feature: 'AI Ad Cloner & Hook Adaptation',
    perfos: 'Automated brand kit mapping',
    legacyAdManager: 'No',
    otherSpyTools: 'Download only',
  },
  {
    feature: 'Multi-Platform Single MCP Bridge',
    perfos: 'Meta, Google, TikTok, LinkedIn, Reddit, X',
    legacyAdManager: 'Siloed per vendor',
    otherSpyTools: 'No API',
  },
  {
    feature: 'Pricing Transparency',
    perfos: 'Starts at $29/mo with full MCP',
    legacyAdManager: 'Free tool (eats your time)',
    otherSpyTools: '$199 - $499/mo per seat',
  },
];

export default function ComparePage() {
  return (
    <div className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 bg-white text-zinc-900">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-[#a8455a] bg-[#d86f82]/10 border border-[#d86f82]/20 rounded-full">
          Market Comparison
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-zinc-950 tracking-tight">
          AdKit vs. Legacy Ad Tools &amp; Native Managers
        </h1>
        <p className="text-zinc-600 text-sm sm:text-base">
          See why modern developers, growth teams, and autonomous AI agents
          choose AdKit over legacy ad software.
        </p>
      </div>

      <div className="border border-black/[0.08] rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="grid grid-cols-4 p-5 bg-zinc-50 border-b border-black/[0.06] text-xs font-mono font-bold text-zinc-700">
          <span>Capability</span>
          <span className="text-[#a8455a] font-display text-sm font-bold">
            AdKit / PerfOS
          </span>
          <span>Native Ads Manager</span>
          <span>Legacy Spy Tools</span>
        </div>

        <div className="divide-y divide-black/[0.04]">
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 p-5 text-xs items-center hover:bg-zinc-50/50 transition-colors"
            >
              <span className="font-semibold text-zinc-900">{row.feature}</span>
              <span className="text-[#a8455a] font-bold flex items-center gap-1">
                <CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" />{' '}
                {row.perfos}
              </span>
              <span className="text-muted-foreground">
                {row.legacyAdManager}
              </span>
              <span className="text-muted-foreground">{row.otherSpyTools}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="btn-daisy px-8 py-3.5 rounded-xl text-xs font-semibold"
        >
          Switch to AdKit Free Trial →
        </Link>
      </div>
    </div>
  );
}
