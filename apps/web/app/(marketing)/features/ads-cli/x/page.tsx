/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { XLogo } from '@/components/marketing/icons';

export default function XAdsCliPage() {
  const [copied, setCopied] = useState(false);
  const cmd = "perfos x deploy --campaign 'Tech Q3' --budget 200";

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
            <XLogo className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            X (Twitter) Ads CLI for Developers &amp; Agents
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Promoted post management, keyword audience targeting, and real-time CPC control directly from your terminal.
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
