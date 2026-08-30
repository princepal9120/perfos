/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MetaLogo } from '@/components/marketing/icons';

export default function MetaAdsCliPage() {
  const [copied, setCopied] = useState(false);
  const cmd = "perfos meta deploy --campaign 'Growth Q3' --budget 250";

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-foreground">
      <div className="space-y-4 text-center">
        <Link
          href="/features/ads-cli"
          className="text-xs text-primary hover:underline font-mono"
        >
          &larr; Back to All Ads CLI Tools
        </Link>
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary">
            <MetaLogo className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Meta Ads CLI for Developers &amp; Agents
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Query live metrics, pause underperforming ad sets, and push creative updates to Meta (Facebook &amp; Instagram) straight from your terminal or CI/CD jobs.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-mono text-primary font-bold">
            Quick Command Execution
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(cmd);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-white/10 text-foreground border border-border transition-colors cursor-pointer"
          >
            {copied ? '✓ Copied' : 'Copy Command'}
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-black/60 font-mono text-xs text-primary overflow-x-auto border border-border">
          <code>$ {cmd}</code>
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
          <h3 className="font-bold text-white text-sm">
            Automated CI Deployment
          </h3>
          <p className="text-zinc-400 leading-relaxed">
            Trigger ad set updates automatically when new landing page variants merge to production.
          </p>
        </div>
        <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
          <h3 className="font-bold text-white text-sm">
            Zero Rate-Limit Friction
          </h3>
          <p className="text-zinc-400 leading-relaxed">
            Built-in exponential backoff and token caching for Meta (Facebook &amp; Instagram) API endpoints.
          </p>
        </div>
        <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
          <h3 className="font-bold text-white text-sm">
            Policy Bound Safeguards
          </h3>
          <p className="text-zinc-400 leading-relaxed">
            Hard ceilings on maximum daily spend changes so AI agents never overspend.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/command-center"
          className="btn-daisy-solid inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-semibold"
        >
          <span>Open Command Center</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
