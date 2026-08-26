"use client";
import Link from "next/link";

export default function MetaAdsMcpPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <Link href="/features/ads-mcp" className="text-xs text-purple-400 hover:underline">
          ← Back to All Ads MCPs
        </Link>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
          Meta Ads MCP Connector
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
          Equip Claude, Cursor, and ChatGPT with typed tools to query campaigns, analyze spend, clone top creatives, and adjust budgets on Meta Ads in real-time.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#111218] border border-white/10 space-y-6">
        <h2 className="text-base font-display font-bold text-white">
          Included Tools for AI Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-black/40 border border-white/6 space-y-1">
            <span className="text-blue-400 font-bold">adkit_meta_get_campaigns</span>
            <p className="text-zinc-400 font-sans text-[11px]">List active, paused, and archived campaigns with live spend & ROAS.</p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/6 space-y-1">
            <span className="text-blue-400 font-bold">adkit_meta_update_budget</span>
            <p className="text-zinc-400 font-sans text-[11px]">Safely reallocate budget between ad sets with policy bounds.</p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/6 space-y-1">
            <span className="text-blue-400 font-bold">adkit_meta_spy_competitor</span>
            <p className="text-zinc-400 font-sans text-[11px]">Query active competitor ad history and creative duration.</p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/6 space-y-1">
            <span className="text-blue-400 font-bold">adkit_meta_create_variant</span>
            <p className="text-zinc-400 font-sans text-[11px]">Draft and stage new creative hooks for manual or auto approval.</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
        >
          Connect Meta Ads MCP Now →
        </Link>
      </div>
    </div>
  );
}
