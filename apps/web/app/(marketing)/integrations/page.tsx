/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import {
  ClaudeLogo,
  CursorLogo,
  ChatGPTLogo,
  PerplexityLogo,
} from '@/components/marketing/icons';

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

const AGENTS = [
  {
    name: 'Claude Code & Desktop',
    slug: 'claude',
    Logo: ClaudeLogo,
    desc: 'Native MCP stdio and SSE configuration for Claude Desktop and Claude CLI.',
  },
  {
    name: 'Cursor IDE Agent',
    slug: 'cursor',
    Logo: CursorLogo,
    desc: 'Launch and monitor ad campaigns without ever leaving your VS Code / Cursor workflow.',
  },
  {
    name: 'ChatGPT & Custom GPTs',
    slug: 'chatgpt',
    Logo: ChatGPTLogo,
    desc: 'Conversational ad ops and MCP bridge for OpenAI ChatGPT Pro & Team users.',
  },
  {
    name: 'Codex & OpenCode',
    slug: 'codex',
    Logo: TerminalIcon,
    desc: 'Autonomous agentic coding tools with complete PerfOS API and MCP schema hooks.',
  },
  {
    name: 'Perplexity Agent',
    slug: 'perplexity',
    Logo: PerplexityLogo,
    desc: 'Live competitor research synthesis with structured PerfOS swipe file persistence.',
  },
  {
    name: 'OpenClaw & Hermes',
    slug: 'openclaw',
    Logo: ZapIcon,
    desc: 'Open-source and local LLM runtime with pre-built PerfOS growth skill wrappers.',
  },
];

export default function IntegrationsIndexPage() {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 text-foreground">
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
          AI Agent Ecosystem
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
          Works with your favorite{' '}
          <span className="text-primary">
            AI Agent
          </span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Add one line of config to your favorite IDE, agent framework, or desktop assistant to unlock autonomous ad management across Google, Meta, LinkedIn, X, TikTok, and Reddit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENTS.map((agent, i) => (
          <Link
            key={i}
            href={`/integrations/${agent.slug}`}
            className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group hover:-translate-y-0.5 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <agent.Logo className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-primary transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {agent.desc}
              </p>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline pt-2 border-t border-border flex items-center gap-1">
              Setup Guide &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
