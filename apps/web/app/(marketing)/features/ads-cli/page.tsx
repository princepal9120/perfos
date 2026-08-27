/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdsCliPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('npm install -g @perfos/cli');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 text-foreground">
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
          Terminal-Native Ad Ops
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
          The{' '}
          <span className="text-primary">
            Ads CLI
          </span>{' '}
          for Growth Engineers
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Query metrics, launch experiments, and automate campaign deployments directly from your terminal or CI/CD pipelines with zero browser latency.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <button
            onClick={handleCopy}
            className="btn-daisy-solid px-6 py-3.5 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{copied ? '✓ Copied!' : '$ npm install -g @perfos/cli'}</span>
          </button>
          <Link
            href="/command-center"
            className="px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-elevated text-zinc-300 text-xs font-semibold border border-border transition-colors"
          >
            Open Web Console &rarr;
          </Link>
        </div>
      </div>

      {/* Terminal Output Block */}
      <div className="max-w-3xl mx-auto rounded-2xl bg-surface border border-border p-6 font-mono text-xs shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3 text-muted-foreground text-[11px]">
          <span>perfos-cli // v1.2.0</span>
          <span className="text-primary">Connected to Meta, Google, LinkedIn, X, TikTok, Reddit</span>
        </div>
        <div className="text-zinc-300 space-y-3">
          <p>
            <span className="text-primary font-bold">$</span> perfos spy --domain notion.so --duration 90d
          </p>
          <p className="text-muted-foreground text-[11px]">
            &rarr; Discovered 14 evergreen ads running &gt; 90 days across Meta &amp; Google.
          </p>
          <p>
            <span className="text-primary font-bold">$</span> perfos clone --ad-id 489201 --remix --brand-kit perfos.json
          </p>
          <p className="text-muted-foreground text-[11px]">
            ✓ Synthesized 10 on-brand creative variants into ./staged-creatives/
          </p>
          <p>
            <span className="text-primary font-bold">$</span> perfos reconcile --source shopify
          </p>
          <p className="text-emerald-400 font-bold text-[11px]">
            ✓ Reconciled $18,450 ad spend vs $48,200 store revenue (MER 2.61x).
          </p>
          <p>
            <span className="text-primary font-bold">$</span> perfos deploy --network meta --campaign &quot;Growth Q3&quot; --budget 150 --draft-only
          </p>
          <p className="text-emerald-400 font-bold text-[11px]">
            ✓ Staged 5 ad sets to Meta Ads API. Awaiting human approval sign-off.
          </p>
        </div>
      </div>
    </div>
  );
}
