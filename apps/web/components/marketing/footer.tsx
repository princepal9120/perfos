"use client";

import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background text-muted-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-foreground dark:text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="font-display font-bold text-base text-foreground dark:text-white tracking-tight">
                PerfOS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-primary border border-purple-500/20">
                AdKit Suite
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
              The full performance ad toolbox for marketers and AI agents. Spy on competitor angles, generate on-brand assets, and deploy campaigns seamlessly through MCP & CLI.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <p className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono">
              Features
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/features/ad-library" className="hover:text-primary transition-colors">
                  Ad Library & Spy
                </Link>
              </li>
              <li>
                <Link href="/features/ai-ads-generator" className="hover:text-primary transition-colors">
                  AI Ad Generator
                </Link>
              </li>
              <li>
                <Link href="/features/ads-cloner" className="hover:text-primary transition-colors">
                  Competitor Cloner
                </Link>
              </li>
              <li>
                <Link href="/features/ads-mcp" className="hover:text-primary transition-colors">
                  Ads MCP Server
                </Link>
              </li>
              <li>
                <Link href="/features/ads-cli" className="hover:text-primary transition-colors">
                  Ads Terminal CLI
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing & ROI
                </Link>
              </li>
            </ul>
          </div>

          {/* MCP Platforms Column */}
          <div className="space-y-3">
            <p className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono">
              Ad Networks
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/features/ads-mcp/meta" className="hover:text-primary transition-colors">
                  Meta Ads (FB/IG)
                </Link>
              </li>
              <li>
                <Link href="/features/ads-mcp/google" className="hover:text-primary transition-colors">
                  Google & YouTube
                </Link>
              </li>
              <li>
                <Link href="/features/ads-mcp/tiktok" className="hover:text-primary transition-colors">
                  TikTok Ads
                </Link>
              </li>
              <li>
                <Link href="/features/ads-mcp/linkedin" className="hover:text-primary transition-colors">
                  LinkedIn Ads
                </Link>
              </li>
              <li>
                <Link href="/features/ads-mcp/reddit" className="hover:text-primary transition-colors">
                  Reddit Ads
                </Link>
              </li>
              <li>
                <Link href="/features/ads-mcp/x" className="hover:text-primary transition-colors">
                  X (Twitter) Ads
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Integrations Column */}
          <div className="space-y-3">
            <p className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono">
              AI Agents
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/integrations/claude" className="hover:text-primary transition-colors">
                  Claude Code & Desktop
                </Link>
              </li>
              <li>
                <Link href="/integrations/cursor" className="hover:text-primary transition-colors">
                  Cursor IDE Agent
                </Link>
              </li>
              <li>
                <Link href="/integrations/chatgpt" className="hover:text-primary transition-colors">
                  ChatGPT & Custom GPTs
                </Link>
              </li>
              <li>
                <Link href="/integrations/grok" className="hover:text-primary transition-colors">
                  Grok (xAI)
                </Link>
              </li>
              <li>
                <Link href="/integrations/perplexity" className="hover:text-primary transition-colors">
                  Perplexity Agent
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-primary transition-colors font-medium text-primary">
                  View All (8+) →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} PerfOS AdKit Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground dark:hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/pricing" className="hover:text-foreground dark:hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/pricing" className="hover:text-foreground dark:hover:text-zinc-300 transition-colors">
              Security
            </Link>
            <Link href="/command-center" className="hover:text-foreground dark:hover:text-zinc-300 transition-colors">
              Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
