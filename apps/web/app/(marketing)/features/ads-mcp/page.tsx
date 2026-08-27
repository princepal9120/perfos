/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  GoogleLogo,
  MetaLogo,
  LinkedInLogo,
  XLogo,
  TikTokLogo,
  RedditLogo,
} from '@/components/marketing/icons';

const PLATFORMS = [
  {
    name: 'Google Ads MCP',
    slug: 'google',
    Logo: GoogleLogo,
    desc: 'Manage Search, Performance Max, and YouTube campaigns with direct keyword, RSA, and bidding tool endpoints.',
  },
  {
    name: 'Meta Ads MCP',
    slug: 'meta',
    Logo: MetaLogo,
    desc: 'Inspect campaigns, fetch ad insights, update creative sets, and adjust ad set daily budgets via Claude/Cursor.',
  },
  {
    name: 'LinkedIn Ads MCP',
    slug: 'linkedin',
    Logo: LinkedInLogo,
    desc: 'B2B title targeting, lead gen form optimization, and company audience segmentation directly in your IDE.',
  },
  {
    name: 'X (Twitter) Ads MCP',
    slug: 'x',
    Logo: XLogo,
    desc: 'Promoted tweet management, follower lookalikes, and keyword interest targeting for tech audiences.',
  },
  {
    name: 'TikTok Ads MCP',
    slug: 'tiktok',
    Logo: TikTokLogo,
    desc: 'Query trending Spark ad hooks, inspect audience demographics, and push short-form video variations.',
  },
  {
    name: 'Reddit Ads MCP',
    slug: 'reddit',
    Logo: RedditLogo,
    desc: 'Subreddit targeting intelligence, post creative management, and conversation placement controls.',
  },
];

export default function AdsMcpPage() {
  const [copied, setCopied] = useState(false);

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        perfos: {
          command: 'npx',
          args: ['-y', '@perfos/mcp-server'],
          env: {
            PERFOS_API_KEY: 'pk_live_your_secret_key_here',
          },
        },
      },
    },
    null,
    2,
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(mcpConfigJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 text-foreground">
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
          Standard Model Context Protocol
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
          Manage your Ads from any{' '}
          <span className="text-primary">
            AI Agent
          </span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Connect Google, Meta, LinkedIn, X, TikTok, and Reddit directly to Claude Code, Cursor, ChatGPT, and Codex. One unified MCP configuration for your entire performance stack.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/command-center"
            className="btn-daisy-solid px-6 py-3 rounded-xl text-xs font-semibold"
          >
            Open Command Center &rarr;
          </Link>
          <Link
            href="/mcp"
            className="px-6 py-3 rounded-xl bg-surface hover:bg-surface-elevated text-zinc-300 text-xs font-semibold border border-border transition-colors"
          >
            Server Instances
          </Link>
        </div>
      </div>

      {/* JSON MCP Config Box */}
      <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-primary font-bold">
              claude_desktop_config.json / .cursor/mcp.json
            </span>
          </div>
          <button
            onClick={copyConfig}
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-white/10 text-foreground border border-border transition-colors cursor-pointer"
          >
            {copied ? '✓ Copied!' : 'Copy MCP JSON'}
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-black/60 font-mono text-xs text-primary overflow-x-auto border border-border">
          <code>{mcpConfigJson}</code>
        </pre>
      </div>

      {/* Platform Cards Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Available Network MCP Connectors (6)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Native tool schemas for full autonomous campaign governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map((plat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <plat.Logo className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-white text-base">
                    {plat.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {plat.desc}
                </p>
              </div>

              <Link
                href="/mcp"
                className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1 pt-2 border-t border-border"
              >
                Connect in Workspace &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
