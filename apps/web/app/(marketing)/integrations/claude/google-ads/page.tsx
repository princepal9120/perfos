/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GoogleLogo, ClaudeLogo } from '@/components/marketing/icons';

export default function ClaudeGoogleadsPage() {
  const [copied, setCopied] = useState(false);
  const prompt =
    'Analyze our active Google Ads & YouTube campaigns. Find the 3 highest spending ad sets from the past 14 days, report their CTR and ROAS, and recommend creative variations from our top competitor swipe file.';

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-foreground">
      <div className="space-y-4 text-center">
        <Link
          href="/integrations/claude"
          className="text-xs text-primary hover:underline font-mono"
        >
          &larr; Back to Claude Integration
        </Link>
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary">
            <GoogleLogo className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Manage Google Ads with Claude
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Equip Claude with direct, typed tools to query metrics, spy on competitor Google Ads &amp; YouTube creatives, and push fresh variants on autopilot.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-mono text-primary font-bold">
            Example Claude Prompt
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(prompt);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs font-mono px-2.5 py-1 rounded bg-surface-elevated hover:bg-white/10 text-foreground border border-border transition-colors cursor-pointer"
          >
            {copied ? '✓ Copied' : 'Copy Prompt'}
          </button>
        </div>
        <p className="p-4 rounded-xl bg-black/60 font-mono text-xs text-foreground border border-border leading-relaxed">
          &quot;{prompt}&quot;
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/command-center"
          className="btn-daisy-solid inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-semibold"
        >
          <span>Launch Claude in Command Center</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
