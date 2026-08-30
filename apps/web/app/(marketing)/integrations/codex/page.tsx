/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';

export default function CodexIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-foreground">
      <div className="space-y-4 text-center">
        <Link
          href="/integrations"
          className="text-xs text-primary hover:underline font-mono"
        >
          &larr; Back to All Integrations
        </Link>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Connect PerfOS with Codex &amp; OpenCode
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Standardized tool calls and CLI hooks for automated agent execution pipelines and continuous growth loops.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-2xl">
        <h2 className="text-xs font-mono uppercase text-primary font-semibold tracking-wider">
          CLI &amp; Stdio Configuration
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Run <code className="text-primary font-mono bg-card px-1.5 py-0.5 rounded border border-border">npx -y @perfos/mcp-server</code> inside your terminal agent or configure Codex subagents to invoke PerfOS tools directly.
        </p>
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
