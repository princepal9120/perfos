/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { XLogo } from '@/components/marketing/icons';

export default function GrokIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-foreground">
      <div className="space-y-4 text-center">
        <Link
          href="/integrations"
          className="text-xs text-primary hover:underline font-mono"
        >
          &larr; Back to All Integrations
        </Link>
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary">
            <XLogo className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Connect PerfOS with Grok (xAI)
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Harness real-time trending discourse on X to synthesize responsive ad creative angles and manage campaigns with policy-gated safety.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-2xl">
        <h2 className="text-xs font-mono uppercase text-primary font-semibold tracking-wider">
          Grok Tool Actions &amp; MCP Bridge
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Connect your PerfOS workspace API key to Grok agent workflows for continuous competitor surveillance and automated ad draft generation.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/command-center"
          className="btn-daisy-solid inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-semibold"
        >
          <span>Connect Grok via Command Center</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
