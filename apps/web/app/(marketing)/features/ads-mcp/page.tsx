"use client";

import Link from "next/link";
import { useState } from "react";

const PLATFORMS = [
  { name: "Meta Ads MCP", slug: "meta", color: "bg-blue-500", desc: "Inspect campaigns, fetch ad insights, update creative sets, and adjust ad set daily budgets via Claude/Cursor." },
  { name: "Google Ads MCP", slug: "google", color: "bg-amber-500", desc: "Manage Search, Performance Max, and YouTube campaigns with direct keyword and bidding tool endpoints." },
  { name: "TikTok Ads MCP", slug: "tiktok", color: "bg-rose-500", desc: "Query trending Spark ad hooks, inspect audience demographics, and push short-form video variations." },
  { name: "LinkedIn Ads MCP", slug: "linkedin", color: "bg-sky-500", desc: "B2B title targeting, lead gen form optimization, and company audience segmentation directly in your IDE." },
  { name: "Reddit Ads MCP", slug: "reddit", color: "bg-orange-500", desc: "Subreddit targeting intelligence, post creative management, and conversation placement controls." },
  { name: "X Ads MCP", slug: "x", color: "bg-zinc-300", desc: "Promoted tweet management, follower lookalikes, and keyword interest targeting for tech audiences." }
];

export default function AdsMcpPage() {
  const [copied, setCopied] = useState(false);

  const mcpConfigJson = JSON.stringify({
    mcpServers: {
      adkit: {
        command: "npx",
        args: ["-y", "@adkit/mcp-server"],
        env: {
          ADKIT_API_KEY: "adk_live_your_secret_key_here"
        }
      }
    }
  }, null, 2);

  const copyConfig = () => {
    navigator.clipboard.writeText(mcpConfigJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
          Standard Model Context Protocol
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight">
          Manage your Ads from any <span className="bg-linear-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">AI Agent</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg">
          Connect Meta, Google, TikTok, LinkedIn, and Reddit directly to Claude Code, Cursor, ChatGPT, and Codex. One unified MCP configuration for your entire growth stack.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            href="/pricing"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
          >
            Get Your MCP API Key →
          </Link>
          <Link
            href="/features/ads-cli"
            className="px-6 py-3 rounded-xl bg-white/4 hover:bg-white/8 text-zinc-300 text-xs font-semibold border border-white/10"
          >
            Terminal Ads CLI
          </Link>
        </div>
      </div>

      {/* JSON MCP Config Box */}
      <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-[#111218] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/6 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 font-bold">claude_desktop_config.json / .cursor/mcp.json</span>
          </div>
          <button
            onClick={copyConfig}
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/12 text-zinc-200 border border-white/10 transition-colors"
          >
            {copied ? "✓ Copied!" : "📋 Copy MCP JSON"}
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-black/60 font-mono text-xs text-purple-300 overflow-x-auto">
          <code>{mcpConfigJson}</code>
        </pre>
      </div>

      {/* Platform Cards Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Available Network MCP Connectors
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Native tool schemas for full autonomous campaign governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map((plat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#111218] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${plat.color}`} />
                  <h3 className="font-display font-bold text-white text-base">
                    {plat.name}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {plat.desc}
                </p>
              </div>

              <Link
                href={`/features/ads-mcp/${plat.slug}`}
                className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center gap-1"
              >
                View MCP Tool Schema & Docs →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
