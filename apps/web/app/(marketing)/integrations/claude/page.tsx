"use client";
import Link from "next/link";
import { useState } from "react";

export default function ClaudeIntegrationPage() {
  const [copied, setCopied] = useState(false);
  const snippet = `{
  "mcpServers": {
    "adkit": {
      "command": "npx",
      "args": ["-y", "@adkit/mcp-server"],
      "env": {
        "ADKIT_API_KEY": "adk_live_your_key_here"
      }
    }
  }
}`;

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <Link href="/integrations" className="text-xs text-primary hover:underline">
          ← Back to All Integrations
        </Link>
        <h1 className="text-4xl font-display font-bold text-foreground dark:text-white tracking-tight">
          How to connect AdKit with Claude (Code & Desktop)
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Follow this 60-second setup guide to give Claude native tools to analyze competitors, create ad creatives, and deploy campaigns.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <h2 className="text-sm font-mono uppercase text-primary font-semibold">
          Step 1: Add MCP Config
        </h2>
        <p className="text-xs text-muted-foreground">
          Open your <code className="text-foreground bg-black/40 px-1 py-0.5 rounded">claude_desktop_config.json</code> or project <code className="text-foreground bg-black/40 px-1 py-0.5 rounded">.claude/settings.json</code>:
        </p>
        <div className="relative">
          <pre className="p-4 rounded-xl bg-black/60 font-mono text-xs text-primary overflow-x-auto">
            <code>{snippet}</code>
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(snippet);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="absolute top-3 right-3 text-xs font-mono px-2.5 py-1 rounded bg-white/10 text-foreground dark:text-white hover:bg-white/20"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <h2 className="text-sm font-mono uppercase text-primary font-semibold">
          Step 2: Try Your First Prompt
        </h2>
        <div className="p-4 rounded-xl bg-black/40 border border-border font-mono text-xs text-foreground">
          &quot;Claude, check our active Meta ad account. Identify the ad set with the highest CPA and recommend 3 competitor hooks to replace fatigued creatives.&quot;
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary text-white dark:text-white text-xs font-semibold shadow-lg shadow-primary/30 transition-all"
        >
          Get Started with Claude MCP →
        </Link>
      </div>
    </div>
  );
}
