"use client";

import Link from "next/link";

const AGENTS = [
  { name: "Claude Code & Desktop", slug: "claude", icon: "🤖", desc: "Native MCP stdio and SSE configuration for Claude Desktop and Claude CLI." },
  { name: "Cursor IDE", slug: "cursor", icon: "⚡", desc: "Launch and monitor ad creatives without ever leaving your VS Code / Cursor workflow." },
  { name: "ChatGPT & GPT-4o", slug: "chatgpt", icon: "🧠", desc: "Custom GPT actions and MCP bridge for OpenAI ChatGPT Pro & Team users." },
  { name: "Grok (xAI)", slug: "grok", icon: "🚀", desc: "Leverage real-time X post trend analysis with direct AdKit campaign tool actions." },
  { name: "Codex & OpenCode", slug: "codex", icon: "⚙️", desc: "Autonomous agentic coding tools with complete AdKit API and MCP schema hooks." },
  { name: "OpenClaw & ClawStack", slug: "openclaw", icon: "🐾", desc: "Open-source AI execution runtime with pre-built AdKit growth skill wrappers." },
  { name: "Perplexity AI", slug: "perplexity", icon: "🔍", desc: "Live competitor research synthesis with structured AdKit swipe file persistence." },
  { name: "Hermes Agent", slug: "hermes", icon: "🛡️", desc: "Self-hosted local LLM agent execution for private ad campaign management." }
];

export default function IntegrationsIndexPage() {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
          AI Agent Ecosystem
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight">
          Works with every <span className="bg-linear-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">AI Agent</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg">
          Add one line of config to your favorite IDE, agent framework, or desktop assistant to unlock autonomous ad management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {AGENTS.map((agent, i) => (
          <Link
            key={i}
            href={`/integrations/${agent.slug}`}
            className="p-6 rounded-2xl bg-[#111218] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group hover:-translate-y-1"
          >
            <div className="space-y-3">
              <span className="text-3xl">{agent.icon}</span>
              <h3 className="font-display font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {agent.desc}
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300">
              Setup Guide →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
