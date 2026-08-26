"use client";

import Link from "next/link";

const COMPARISON_ROWS = [
  {
    feature: "Agentic MCP & CLI Support",
    perfos: "Native (Claude, Cursor, ChatGPT, Codex)",
    legacyAdManager: "None (UI Only)",
    otherSpyTools: "None"
  },
  {
    feature: "Searchable Competitor Ad Database",
    perfos: "500,000+ ads across 7 networks",
    legacyAdManager: "Single platform only",
    otherSpyTools: "Meta only (limited)"
  },
  {
    feature: "Evergreen Ad Longevity Filter",
    perfos: "Yes (Filter by 30/60/90+ days)",
    legacyAdManager: "No",
    otherSpyTools: "Basic date sorting"
  },
  {
    feature: "AI Ad Cloner & Hook Adaptation",
    perfos: "Automated brand kit mapping",
    legacyAdManager: "No",
    otherSpyTools: "Download only"
  },
  {
    feature: "Multi-Platform Single MCP Bridge",
    perfos: "Meta, Google, TikTok, LinkedIn, Reddit, X",
    legacyAdManager: "Siloed per vendor",
    otherSpyTools: "No API"
  },
  {
    feature: "Pricing Transparency",
    perfos: "Starts at $49/mo with full MCP",
    legacyAdManager: "Free tool (eats your time)",
    otherSpyTools: "$199 - $499/mo per seat"
  }
];

export default function ComparePage() {
  return (
    <div className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
          Market Comparison
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
          AdKit vs. Legacy Ad Tools &amp; Native Managers
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          See why modern developers, growth teams, and autonomous AI agents choose AdKit over legacy ad software.
        </p>
      </div>

      <div className="border border-white/10 rounded-2xl bg-[#111218] overflow-hidden">
        <div className="grid grid-cols-4 p-5 bg-black/40 border-b border-white/10 text-xs font-mono font-bold text-zinc-300">
          <span>Capability</span>
          <span className="text-purple-400 font-display text-sm font-bold">AdKit / PerfOS</span>
          <span>Native Ads Manager</span>
          <span>Legacy Spy Tools</span>
        </div>

        <div className="divide-y divide-white/4">
          {COMPARISON_ROWS.map((row, i) => (
            <div key={i} className="grid grid-cols-4 p-5 text-xs items-center">
              <span className="font-semibold text-zinc-200">{row.feature}</span>
              <span className="text-purple-300 font-bold">{row.perfos}</span>
              <span className="text-zinc-500">{row.legacyAdManager}</span>
              <span className="text-zinc-500">{row.otherSpyTools}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
        >
          Switch to AdKit Free Trial →
        </Link>
      </div>
    </div>
  );
}
