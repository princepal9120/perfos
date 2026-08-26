"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdsCliPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install -g @adkit/cli");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          Terminal-Native Ad Management
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-foreground dark:text-white tracking-tight">
          The <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Ads CLI</span> for Growth Engineers
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Query metrics, launch experiments, and automate campaign deployments directly from your terminal or CI/CD pipelines with zero browser latency.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={handleCopy}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground dark:text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all font-mono"
          >
            {copied ? "✓ Copied!" : "$ npm install -g @adkit/cli"}
          </button>
          <Link
            href="/features/ads-mcp"
            className="px-6 py-3 rounded-xl bg-white/4 hover:bg-white/8 text-zinc-300 text-xs font-semibold border border-border"
          >
            Explore Ads MCP
          </Link>
        </div>
      </div>

      {/* Terminal Simulator Box */}
      <div className="max-w-3xl mx-auto rounded-2xl bg-background border border-border p-4 font-mono text-xs shadow-2xl space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2 text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2">zsh — adkit-cli</span>
        </div>
        <div className="text-zinc-300 space-y-2">
          <p><span className="text-emerald-400">$</span> adkit spy --domain notion.so --duration 90d</p>
          <p className="text-muted-foreground">→ Discovered 14 evergreen ads running &gt; 90 days on Meta &amp; LinkedIn.</p>
          <p><span className="text-emerald-400">$</span> adkit clone --ad-id 489201 --remix --brand-kit perfos.json</p>
          <p className="text-muted-foreground">✓ Synthesized 10 on-brand creative variants into ./staged-creatives/</p>
          <p><span className="text-emerald-400">$</span> adkit deploy --network meta --campaign &quot;Indie Launch Q3&quot; --budget 150</p>
          <p className="text-emerald-300 font-bold">✓ Successfully deployed 5 ad sets to Meta Ads API. Live in 3 minutes.</p>
        </div>
      </div>
    </div>
  );
}
