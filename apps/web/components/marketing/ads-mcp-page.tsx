/* Hallmark · component: ads-mcp-platform-page · genre: editorial · theme: postproxy
 * Macrostructure from adkit.so/features/ads-mcp/meta, honest copy, real PerfOS tool names. */
import Link from 'next/link';
import {
  ClaudeLogo,
  CursorLogo,
  ChatGPTLogo,
  PerplexityLogo,
  GitHubLogo,
} from '@/components/marketing/icons';

type Tool = { name: string; desc: string };
type Feature = { cap: string; title: string; prompt: string; reply: string; chip: string };

const AGENTS = [
  { name: 'Claude', Logo: ClaudeLogo },
  { name: 'ChatGPT', Logo: ChatGPTLogo },
  { name: 'Cursor', Logo: CursorLogo },
  { name: 'Perplexity', Logo: PerplexityLogo },
  { name: 'GitHub Copilot', Logo: GitHubLogo },
];

export function AdsMcpPage({
  platform,
  name,
  Logo,
  hero,
  sub,
  problem,
  relief,
  features,
  tools,
  personas,
  faqs,
}: {
  platform: string;
  name: string;
  Logo: (props: { className?: string }) => React.ReactElement;
  hero: string;
  sub: string;
  problem: string;
  relief: string;
  features: Feature[];
  tools: Tool[];
  personas: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}) {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 text-foreground">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <Link
          href="/features/ads-mcp"
          className="inline-block text-xs text-primary hover:underline font-mono"
        >
          &larr; All Ads MCP Servers
        </Link>
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary">
            <Logo className="w-5 h-5" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-[1.05]">
            {hero}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">{sub}</p>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          {AGENTS.map((a) => (
            <div key={a.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <a.Logo className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">{a.name}</span>
            </div>
          ))}
          <span className="text-xs text-muted-foreground font-mono border border-border rounded-full px-2.5 py-0.5">
            + any MCP client
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/command-center"
            className="btn-daisy-solid px-6 py-3 rounded-xl text-xs font-semibold"
          >
            Connect in Command Center &rarr;
          </Link>
          <Link
            href="/mcp"
            className="px-6 py-3 rounded-xl bg-surface hover:bg-surface-elevated text-muted-foreground text-xs font-semibold border border-border transition-colors"
          >
            Server Instances
          </Link>
        </div>
      </section>

      {/* Problem / relief */}
      <section className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-destructive font-semibold">
            Without PerfOS MCP
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed">{problem}</p>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-primary/30 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
            With PerfOS MCP
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed">{relief}</p>
        </div>
      </section>

      {/* What your agent can do — chat rows */}
      <section className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            What your agent can do
          </h2>
          <p className="text-sm text-muted-foreground">Plain-English prompts, draft-first replies. Real PerfOS tools under the hood.</p>
        </div>
        {features.map((f, i) => (
          <div key={i} className="grid md:grid-cols-[1fr_2fr] gap-8 items-center">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                {f.cap}
              </span>
              <h3 className="text-xl font-bold text-foreground tracking-tight">{f.title}</h3>
            </div>
            <ChatBubble feature={f} Logo={Logo} name={name} />
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Connect, prompt, approve
          </h2>
          <p className="text-sm text-muted-foreground">Three steps between your agent and a live account.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', t: 'Connect the server', d: 'Add one JSON block to any MCP client. No API keys in your terminal.' },
            { n: '02', t: 'Tell your agent what to do', d: 'Launch a campaign, cut a fatigued ad, pull results. It drafts every change first.' },
            { n: '03', t: 'Review and approve', d: 'Every mutation sits in your workspace as a draft until you approve it.' },
          ].map((s) => (
            <div key={s.n} className="p-6 rounded-2xl bg-surface border border-border space-y-3">
              <span className="font-mono text-xs text-primary font-bold">{s.n}</span>
              <h3 className="font-bold text-foreground">{s.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <span className="text-xs font-mono text-primary font-bold">claude_desktop_config.json</span>
          </div>
          <pre className="p-4 rounded-xl bg-black/60 font-mono text-xs text-foreground overflow-x-auto text-[11px] leading-relaxed">{`{
  "mcpServers": {
    "perfos": {
      "command": "npx",
      "args": ["-y", "@perfos/mcp-server"],
      "env": {
        "PERFOS_API_KEY": "pk_live_..."
      }
    }
  }
}`}</pre>
        </div>
      </section>

      {/* The honest truth */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-destructive/30 space-y-4">
          <h3 className="font-bold text-foreground text-lg tracking-tight">
            Raw platform MCPs talk straight to the ad API
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Every call hits the platform live. No drafts, no review.</li>
            <li>• One bad request can pause or flag the wrong campaign.</li>
            <li>• No validation layer built for agent-shaped traffic.</li>
          </ul>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-primary/30 space-y-4">
          <h3 className="font-bold text-foreground text-lg tracking-tight">
            PerfOS sits between your agent and the network
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Agent talks to PerfOS; PerfOS talks to the network.</li>
            <li>• Every change becomes a draft. You approve before anything goes live.</li>
            <li>• Validation and dry-run defaults keep bad requests from reaching the account.</li>
          </ul>
        </div>
      </section>

      {/* Included tools */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Included tools
          </h2>
          <p className="text-sm text-muted-foreground">Real <code className="font-mono text-primary">perfos_*</code> MCP endpoints scoped to {name}.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          {tools.map((t) => (
            <div key={t.name} className="p-4 rounded-xl bg-surface border border-border space-y-1.5">
              <span className="text-primary font-mono font-bold">{t.name}</span>
              <p className="text-muted-foreground font-sans text-[11px] leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Who it&apos;s for
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {personas.map((p) => (
            <div key={p.title} className="p-6 rounded-2xl bg-surface border border-border space-y-2">
              <h3 className="font-bold text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Got questions? Good
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.q} className="p-5 rounded-2xl bg-surface border border-border space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">{f.q}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Stop switching tabs. Ship from the chat.
        </h2>
        <p className="text-sm text-muted-foreground">Connect your agent, review the draft, approve when you&apos;re ready.</p>
        <Link href="/command-center" className="btn-daisy-solid inline-block px-8 py-3.5 rounded-xl text-xs font-semibold">
          Open Command Center &rarr;
        </Link>
      </section>
    </div>
  );
}

function ChatBubble({
  feature,
  Logo,
  name,
}: {
  feature: Feature;
  Logo: (props: { className?: string }) => React.ReactElement;
  name: string;
}) {
  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/25 text-primary">
          <Logo className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-foreground font-bold">You</span>
            <span className="text-[10px] font-mono text-muted-foreground">asked in Command Center</span>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-foreground leading-relaxed">
            {feature.prompt}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-mono text-primary font-bold">{feature.chip}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-border text-muted-foreground leading-relaxed">
            {feature.reply}
          </div>
        </div>
      </div>
    </div>
  );
}