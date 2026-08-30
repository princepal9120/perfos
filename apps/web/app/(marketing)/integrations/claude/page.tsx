/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ClaudeLogo } from '@/components/marketing/icons';

export default function ClaudeIntegrationPage() {
  const [copied, setCopied] = useState(false);
  const snippet = `{
  "mcpServers": {
    "perfos": {
      "command": "npx",
      "args": ["-y", "@perfos/mcp-server"],
      "env": {
        "PERFOS_API_KEY": "pk_live_your_key_here"
      }
    }
  }
}`;

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
            <ClaudeLogo className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Connect PerfOS with Claude (Code &amp; Desktop)
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Follow this 60-second setup guide to give Claude native tools to analyze competitors, create ad creatives, and deploy campaigns across Google, Meta, LinkedIn, X, TikTok, and Reddit.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-2xl">
        <h2 className="text-xs font-mono uppercase text-primary font-semibold tracking-wider">
          Step 1: Add MCP Config
        </h2>
        <p className="text-xs text-muted-foreground">
          Open your{' '}
          <code className="text-foreground bg-card px-1.5 py-0.5 rounded font-mono border border-border">
            claude_desktop_config.json
          </code>{' '}
          or project{' '}
          <code className="text-foreground bg-card px-1.5 py-0.5 rounded font-mono border border-border">
            .claude/settings.json
          </code>
          :
        </p>
        <div className="relative">
          <pre className="p-4 rounded-xl bg-black/60 font-mono text-xs text-primary overflow-x-auto border border-border">
            <code>{snippet}</code>
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(snippet);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="absolute top-3 right-3 text-xs font-mono px-2.5 py-1 rounded bg-surface-elevated text-foreground hover:bg-white/10 border border-border cursor-pointer transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-2xl">
        <h2 className="text-xs font-mono uppercase text-primary font-semibold tracking-wider">
          Step 2: Try Your First Prompt
        </h2>
        <div className="p-4 rounded-xl bg-card border border-border font-mono text-xs text-foreground leading-relaxed">
          &quot;Claude, audit our active Meta and Google ad accounts. Reconcile spend against Shopify store revenue, identify fatigued creatives, and synthesize 3 new hook angles.&quot;
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
