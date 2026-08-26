"use client";

import Link from "next/link";
import { useState } from "react";

export default function GoogleAdsCliPage() {
  const [copied, setCopied] = useState(false);
  const cmd = "adkit google deploy --campaign 'Growth Q3' --budget 250";

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="space-y-4 text-center">
        <Link href="/features/ads-cli" className="text-xs text-emerald-400 hover:underline">
          ← Back to All Ads CLI Tools
        </Link>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground dark:text-white tracking-tight">
          Google & YouTube Ads CLI for Developers &amp; Agents
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          Query live metrics, pause underperforming ad sets, and push creative updates to Google & YouTube Ads straight from your terminal or CI/CD jobs.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-mono text-emerald-400 font-bold">Quick Command Execution</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(cmd);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs font-mono px-2.5 py-1 rounded bg-white/8 text-foreground dark:text-white"
          >
            {copied ? "✓ Copied" : "Copy Command"}
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-black/60 font-mono text-xs text-emerald-300 overflow-x-auto">
          <code>$ {cmd}</code>
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-5 rounded-xl bg-card border border-border space-y-2">
          <h3 className="font-bold text-foreground dark:text-white text-sm">Automated CI Deployment</h3>
          <p className="text-muted-foreground">Trigger ad set updates automatically when new landing page variants merge to production.</p>
        </div>
        <div className="p-5 rounded-xl bg-card border border-border space-y-2">
          <h3 className="font-bold text-foreground dark:text-white text-sm">Zero Rate-Limit Friction</h3>
          <p className="text-muted-foreground">Built-in exponential backoff and token caching for Google & YouTube Ads API endpoints.</p>
        </div>
        <div className="p-5 rounded-xl bg-card border border-border space-y-2">
          <h3 className="font-bold text-foreground dark:text-white text-sm">Policy Bound Safeguards</h3>
          <p className="text-muted-foreground">Hard ceilings on maximum daily spend changes so AI agents never overspend.</p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground dark:text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
        >
          Get CLI Access Key →
        </Link>
      </div>
    </div>
  );
}
