/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';

export default function MicrosoftAdsMcpPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-foreground">
      <div className="text-center space-y-4">
        <Link
          href="/features/ads-mcp"
          className="text-xs text-primary hover:underline font-mono"
        >
          &larr; Back to All Ads MCPs
        </Link>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Microsoft Advertising MCP Connector
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Bing Search and Copilot ad inventory management via MCP agent tools.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-6 shadow-2xl">
        <h2 className="text-base font-bold text-white">
          Included Tools for AI Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
            <span className="text-primary font-bold">
              perfos_microsoft_get_campaigns
            </span>
            <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
              Fetch Bing Search &amp; Audience network campaign delivery and conversions.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
            <span className="text-primary font-bold">
              perfos_microsoft_update_bids
            </span>
            <p className="text-zinc-400 font-sans text-[11px] leading-relaxed">
              Automated bid management with safety ceiling limits.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/command-center"
          className="btn-daisy-solid inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-semibold"
        >
          <span>Connect via Command Center</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
