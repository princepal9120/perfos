'use client';

import Link from 'next/link';
import { PerfOSLogo } from '@/components/marketing/icons';

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#08080a] text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#d86f82] flex items-center justify-center text-white">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="font-display font-bold text-base text-white tracking-tight">
                PerfOS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#d86f82]/10 text-[#d86f82] border border-[#d86f82]/20 font-semibold">
                BY ADKIT
              </span>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              The full performance ad toolbox for marketers and AI agents. Spy
              on competitor angles, generate on-brand assets, and deploy
              campaigns seamlessly through MCP &amp; CLI.
            </p>
            <div className="flex items-center gap-3 text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
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
                  href="/features/ad-library"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Ad Library &amp; Spy
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ai-ads-generator"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  AI Ad Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ads-cloner"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Competitor Cloner
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ads-mcp"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Ads MCP Server
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ads-cli"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Ads Terminal CLI
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Pricing &amp; ROI
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
                  href="/features/ads-mcp/meta"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Meta Ads (FB/IG)
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ads-mcp/google"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Google &amp; YouTube
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ads-mcp/tiktok"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  TikTok Ads
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ads-mcp/linkedin"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  LinkedIn Ads
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ads-mcp/reddit"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Reddit Ads
                </Link>
              </li>
              <li>
                <Link
                  href="/features/ads-mcp/x"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  X (Twitter) Ads
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
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Claude Code &amp; Desktop
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations/cursor"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Cursor IDE Agent
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations/chatgpt"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  ChatGPT &amp; Custom GPTs
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations/grok"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Grok (xAI)
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations/perplexity"
                  className="hover:text-[#d86f82] transition-colors"
                >
                  Perplexity Agent
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations"
                  className="hover:text-[#d86f82] transition-colors font-medium text-[#d86f82]"
                >
                  View All (8+) →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500">
            © 2026 PerfOS AdKit Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-zinc-500">
            <Link
              href="/pricing"
              className="hover:text-zinc-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/pricing"
              className="hover:text-zinc-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/pricing"
              className="hover:text-zinc-300 transition-colors"
            >
              Security
            </Link>
            <Link
              href="/command-center"
              className="hover:text-zinc-300 transition-colors"
            >
              Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
