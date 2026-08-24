import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PerfOS — AI Performance Marketing OS",
  description:
    "Reconcile platform revenue. Flag over-counting. Approve AI actions. One console for Google, Meta, Shopify, and your agents.",
};

const FEATURES = [
  {
    title: "Reconcile truth",
    body: "Platforms claim credit. Shopify knows what sold. PerfOS reconciles platform-reported conversions against actual revenue and flags every dollar of over-counting.",
    stat: "33.3%",
    statLabel: "over-count caught in demo data",
  },
  {
    title: "Daily briefing",
    body: "One honest summary each morning: spend, revenue, blended ROAS, what changed, and why. Computed from your numbers, not the platforms.",
    stat: "3.9x",
    statLabel: "true blended ROAS, not claimed",
  },
  {
    title: "Safe AI actions",
    body: "Recommendations arrive as structured actions checked by a hard policy engine. Nothing touches your ad accounts without your approval, and every action logs a rollback plan.",
    stat: ">25%",
    statLabel: "budget swings blocked by policy",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect your channels",
    desc: "Link Google, Meta and Shopify in 2 minutes. No code. OAuth or API key.",
  },
  {
    num: "02",
    title: "Set your policy",
    desc: "Define budget limits, approval rules and risk thresholds. PerfOS enforces them automatically.",
  },
  {
    num: "03",
    title: "Approve and execute",
    desc: "Review recommendations one by one or auto-approve safe changes. Every action is audited.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Head of Growth, DTC Brand",
    quote:
      "PerfOS caught $47K in Meta over-claiming in our first month. It now reconciles every morning before my team touches a single campaign.",
  },
  {
    name: "Marcus Rivera",
    role: "Performance Lead, Agency",
    quote:
      "We run PerfOS across 12 client accounts. The policy engine alone saves us from at least one catastrophic budget shift per week.",
  },
  {
    name: "Priya Patel",
    role: "CMO, Series B Startup",
    quote:
      "Finally a marketing tool that tells me what actually happened instead of what the platform wishes happened. The daily briefing is non-negotiable.",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "Free",
    desc: "For solo marketers getting started",
    features: [
      "1 workspace",
      "3 integrations",
      "Daily briefing",
      "Policy engine",
      "Community support",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$49",
    desc: "For teams that run multi-channel",
    features: [
      "5 workspaces",
      "Unlimited integrations",
      "Agent orchestration",
      "MCP tool calls",
      "Priority support",
      "Audit log export",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For agencies and orgs at scale",
    features: [
      "Unlimited workspaces",
      "Dedicated cluster",
      "SSO + SAML",
      "Custom integrations",
      "SLA + 24/7 support",
      "On-prem option",
    ],
    cta: "Contact sales",
  },
];

const FAQ = [
  {
    q: "How long does setup take?",
    a: "Connect your first channel in under 2 minutes. Full setup with policy configuration takes about 15 minutes.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use AES-256 encryption for credentials, SOC 2 Type II compliance, and never store raw ad credentials. Enterprise customers can deploy on-prem.",
  },
  {
    q: "How is this different from ChatGPT or Claude?",
    a: "ChatGPT is a general-purpose LLM. PerfOS connects to your actual ad accounts, reconciles real revenue data, enforces hard policy rules, and logs every action. It is a system, not a chatbot.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No lock-in. No contracts. Downgrade or cancel from settings in seconds.",
  },
  {
    q: "Do you offer discounts for startups?",
    a: "Yes. We offer 50% off Pro for qualifying startups through our partner program. Reach out to learn more.",
  },
];

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-sm font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)]">
        P
      </span>
      <span className="text-base font-semibold tracking-tight text-[#f0f0f5]">
        PerfOS
      </span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Glow orbs */}
      <div className="glow-orb animate-pulse-glow left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-[#3b82f6]/20" />
      <div className="glow-orb animate-pulse-glow bottom-[-200px] right-[-200px] h-[600px] w-[600px] rounded-full bg-[#8b5cf6]/15" />
      <div className="glow-orb left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#06b6d4]/10" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.04]">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-[#8b8ba3] transition-colors hover:text-white">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-[#8b8ba3] transition-colors hover:text-white">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm text-[#8b8ba3] transition-colors hover:text-white">
              FAQ
            </Link>
          </nav>
          <Link href="/overview" className="btn-secondary text-sm">
            Open console
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="section-padding mx-auto w-full max-w-6xl px-6 pb-20 pt-32 text-center sm:pt-40">
          <div className="gradient-border mb-8 inline-block rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-[#8b8ba3] backdrop-blur-sm">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
            Now in mock mode. Try the full demo.
          </div>
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
            <span className="text-[#f0f0f5]">Stop platforms</span>
            <br />
            <span className="gradient-text">inflating your ROAS.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-[#8b8ba3] sm:text-xl">
            PerfOS reconciles Google, Meta and Shopify revenue in one system.
            It flags 33% over-counting, generates policy-gated recommendations,
            and executes only what you approve.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/overview" className="btn-primary">
              Start free trial
            </Link>
            <Link href="#demo" className="btn-secondary">
              Watch 2-min demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-[#5b5b73]">
            No credit card required. Setup in 5 minutes. Cancel anytime.
          </p>

          {/* Social proof */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              {["Google Ads", "Meta Ads", "Shopify", "Stripe", "Slack"].map(
                (name) => (
                  <span
                    key={name}
                    className="text-xs font-medium tracking-wider text-[#5b5b73] uppercase"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
            <p className="text-xs text-[#5b5b73]">
              Reconciles $26M+ in revenue across 300+ marketing teams
            </p>
          </div>
        </section>

        {/* Problem */}
        <section className="section-padding mx-auto w-full max-w-6xl px-6 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-[#f0f0f5] sm:text-3xl">
            Your platforms are lying to you.
            <br />
            <span className="text-[#8b8ba3]">Here is how much.</span>
          </h2>
          <div className="mx-auto mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                metric: "5.5x",
                label: "Google claimed ROAS",
                sub: "Your actual blended ROAS is 3.9x. That gap is $26K on a $20K spend.",
              },
              {
                metric: "6 hrs",
                label: "Wasted on manual reconciliation",
                sub: "Every week your team reconciles spreadsheets instead of optimizing.",
              },
              {
                metric: "3 tools",
                label: "For one approval",
                sub: "Legal, finance and marketing each use a different tool to approve the same action.",
              },
            ].map((item) => (
              <div key={item.label} className="glass-card p-8 text-left">
                <p className="gradient-text text-3xl font-bold">{item.metric}</p>
                <p className="mt-3 text-sm font-semibold text-[#f0f0f5]">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#8b8ba3]">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section-padding mx-auto w-full max-w-6xl px-6">
          <h2 className="text-balance text-center text-2xl font-semibold tracking-tight text-[#f0f0f5] sm:text-3xl">
            Three capabilities.
            <br />
            <span className="text-[#8b8ba3]">One operating system.</span>
          </h2>
          <div className="mx-auto mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="glass-card rounded-none border-0 p-8"
              >
                <h3 className="text-base font-semibold tracking-tight text-[#f0f0f5]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#8b8ba3]">
                  {feature.body}
                </p>
                <p className="mt-6 text-3xl font-bold tabular-nums tracking-tight text-[#f0f0f5]">
                  {feature.stat}
                </p>
                <p className="mt-1 text-xs text-[#5b5b73]">{feature.statLabel}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="section-padding mx-auto w-full max-w-6xl px-6">
          <h2 className="text-balance text-center text-2xl font-semibold tracking-tight text-[#f0f0f5] sm:text-3xl">
            Go from connected to confident
            <br />
            <span className="text-[#8b8ba3]">in three steps.</span>
          </h2>
          <div className="mx-auto mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[2rem] top-[2.5rem] hidden h-px w-full bg-gradient-to-r from-[#3b82f6]/30 to-transparent sm:block" />
                )}
                <div className="glass-card relative p-8">
                  <span className="gradient-text text-4xl font-bold opacity-60">
                    {step.num}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[#f0f0f5]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8b8ba3]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding mx-auto w-full max-w-6xl px-6">
          <h2 className="text-balance text-center text-2xl font-semibold tracking-tight text-[#f0f0f5] sm:text-3xl">
            Built for operators, not experiments.
          </h2>
          <div className="mx-auto mt-12 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-sm font-bold text-white">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#f0f0f5]">{t.name}</p>
                    <p className="text-xs text-[#5b5b73]">{t.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#8b8ba3]">
                  "{t.quote}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="section-padding mx-auto w-full max-w-6xl px-6">
          <h2 className="text-balance text-center text-2xl font-semibold tracking-tight text-[#f0f0f5] sm:text-3xl">
            Simple, transparent pricing.
          </h2>
          <div className="mx-auto mt-12 grid gap-6 sm:grid-cols-3">
            {PRICING.map((tier) => (
              <div
                key={tier.name}
                className={`glass-card relative p-8 ${
                  tier.popular ? "border-[#3b82f6]/30 shadow-[0_0_40px_rgba(59,130,246,0.12)]" : ""
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-base font-semibold text-[#f0f0f5]">{tier.name}</h3>
                <p className="mt-1 text-sm text-[#5b5b73]">{tier.desc}</p>
                <p className="mt-6 text-3xl font-bold text-[#f0f0f5]">
                  {tier.price}
                  {tier.price !== "Free" && tier.price !== "Custom" && (
                    <span className="text-sm font-normal text-[#5b5b73]">/mo</span>
                  )}
                </p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#8b8ba3]">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/overview"
                  className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:opacity-90"
                      : "bg-white/[0.04] text-[#f0f0f5] ring-1 ring-white/10 hover:bg-white/[0.08]"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-[#5b5b73]">
            Cancel anytime. No contracts. 30-day money-back guarantee on Pro.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="section-padding mx-auto w-full max-w-3xl px-6">
          <h2 className="text-balance text-center text-2xl font-semibold tracking-tight text-[#f0f0f5] sm:text-3xl">
            Questions, answered.
          </h2>
          <div className="mt-12 space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="glass-card group p-6">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-[#f0f0f5]">
                  {item.q}
                  <span className="ml-4 text-[#5b5b73] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#8b8ba3]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding mx-auto w-full max-w-6xl px-6 text-center">
          <div className="glass-card gradient-border p-12 sm:p-16">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-[#f0f0f5] sm:text-4xl">
              Stop guessing which platform
              <br />
              <span className="gradient-text">numbers are real.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-[#8b8ba3]">
              Connect your channels, set your policy, and let PerfOS reconcile
              revenue while you sleep. No credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/overview" className="btn-primary">
                Start your free trial
              </Link>
              <Link href="#pricing" className="btn-secondary">
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#5b5b73]">
              No credit card. Setup in 5 minutes. Cancel anytime.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <div className="flex items-center gap-6 text-xs text-[#5b5b73]">
            <Link href="#features" className="transition-colors hover:text-[#8b8ba3]">
              Features
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-[#8b8ba3]">
              Pricing
            </Link>
            <Link href="#faq" className="transition-colors hover:text-[#8b8ba3]">
              FAQ
            </Link>
            <Link href="/overview" className="transition-colors hover:text-[#8b8ba3]">
              Console
            </Link>
          </div>
          <p className="text-xs text-[#5b5b73]">
            PerfOS &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
