/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-canvas text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-mono font-bold text-xs">
                ⌘
              </div>
              <span className="font-display font-bold text-base text-white tracking-tight">
                PerfOS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
                AUTONOMOUS ADS
              </span>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              The full performance ad toolbox for marketers and AI agents. Spy on competitor angles, generate on-brand assets, reconcile Shopify truth, and deploy campaigns seamlessly through MCP &amp; CLI.
            </p>
            <div className="flex items-center gap-3 text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <p className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
              Features
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/discovery"
                  className="hover:text-primary transition-colors"
                >
                  Ad Library &amp; Spy
                </Link>
              </li>
              <li>
                <Link
                  href="/creative"
                  className="hover:text-primary transition-colors"
                >
                  Creative Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/loop"
                  className="hover:text-primary transition-colors"
                >
                  Growth Loop
                </Link>
              </li>
              <li>
                <Link
                  href="/mcp"
                  className="hover:text-primary transition-colors"
                >
                  Ads MCP Server
                </Link>
              </li>
              <li>
                <Link
                  href="/measurement"
                  className="hover:text-primary transition-colors"
                >
                  iROAS Calibration
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing &amp; Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* MCP Platforms Column */}
          <div className="space-y-3">
            <p className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
              Ad Networks
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/mcp"
                  className="hover:text-primary transition-colors"
                >
                  Google Ads
                </Link>
              </li>
              <li>
                <Link
                  href="/mcp"
                  className="hover:text-primary transition-colors"
                >
                  Meta Ads (FB/IG)
                </Link>
              </li>
              <li>
                <Link
                  href="/mcp"
                  className="hover:text-primary transition-colors"
                >
                  LinkedIn Ads
                </Link>
              </li>
              <li>
                <Link
                  href="/mcp"
                  className="hover:text-primary transition-colors"
                >
                  X (Twitter) Ads
                </Link>
              </li>
              <li>
                <Link
                  href="/mcp"
                  className="hover:text-primary transition-colors"
                >
                  TikTok Ads
                </Link>
              </li>
              <li>
                <Link
                  href="/mcp"
                  className="hover:text-primary transition-colors"
                >
                  Reddit Ads
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Integrations Column */}
          <div className="space-y-3">
            <p className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
              AI Agents
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/integrations/claude"
                  className="hover:text-primary transition-colors"
                >
                  Claude Code &amp; Desktop
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations/cursor"
                  className="hover:text-primary transition-colors"
                >
                  Cursor IDE Agent
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations/chatgpt"
                  className="hover:text-primary transition-colors"
                >
                  ChatGPT &amp; Custom GPTs
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations/grok"
                  className="hover:text-primary transition-colors"
                >
                  Grok (xAI)
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations/perplexity"
                  className="hover:text-primary transition-colors"
                >
                  Perplexity Agent
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations"
                  className="hover:text-primary transition-colors font-medium text-primary"
                >
                  View All Integrations &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 font-mono">
            &copy; 2026 PerfOS Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-zinc-500 font-mono text-[11px]">
            <Link
              href="/pricing"
              className="hover:text-zinc-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/pricing"
              className="hover:text-zinc-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/pricing"
              className="hover:text-zinc-300 transition-colors"
            >
              Security
            </Link>
            <Link
              href="/command-center"
              className="text-primary hover:underline transition-colors"
            >
              Command Center &rarr;
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
