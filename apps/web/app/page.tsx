import type { Metadata } from "next";
import Link from "next/link";
import LandingChat from "./landing-chat";

export const metadata: Metadata = {
  title: "PerfOS — AI Performance Marketing OS",
  description:
    "Reconcile platform revenue. Flag over-counting. Approve AI actions. One console for Google, Meta, Shopify, and your agents.",
};

// ponytail: every stat below comes from the seeded demo dataset; none invented.
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
];

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 border border-white/15 font-display text-xs font-semibold text-white">
        P
      </span>
      <span className="font-display text-sm font-semibold tracking-tight text-zinc-100">
        PerfOS
      </span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#09090b] text-zinc-100 selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            <Link
              href="#reconcile"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              Reconcile
            </Link>
            <Link
              href="#how"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              How it works
            </Link>
          </nav>
          <Link
            href="/overview"
            className="rounded-md border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-100 transition-colors hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            Open console
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-x-clip">
        {/* Hero — left-anchored; agent box sits beside the pitch instead of below it */}
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-20 pt-20 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <p className="-ml-px mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-zinc-900/80 px-3 py-1 text-xs text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Interactive demo mode active
            </p>

            <h1 className="[overflow-wrap:anywhere] min-w-0 text-balance break-words font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
              Stop platforms inflating your ROAS.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              PerfOS reconciles Google, Meta, and Shopify revenue in one deterministic
              system. It flags over-counting, generates policy-gated recommendations,
              and executes only what you approve.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/overview"
                className="btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Start free trial
              </Link>
              <Link
                href="#reconcile"
                className="btn-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              No credit card required · Setup in 5 minutes · Cancel anytime
            </p>
          </div>

          <div className="min-w-0 lg:pl-4">
            <LandingChat />
          </div>

          <div className="border-t border-white/[0.06] pt-8 lg:col-span-2 lg:flex lg:items-baseline lg:justify-between">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Integrated with source-of-truth platforms
            </p>
            <div className="mt-4 flex flex-wrap gap-8 text-xs font-medium text-zinc-400 lg:mt-0">
              {["Google Ads", "Meta Ads", "Shopify", "Stripe", "Slack"].map((name) => (
                <span key={name} className="tracking-wide">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Problem — stat ledger rows instead of another card grid */}
        <section id="reconcile" className="section-padding border-t border-white/[0.06] bg-[#0c0c0f]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Your platforms are over-crediting themselves.
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Here is what happens when attribution is self-reported instead of reconciled.
              </p>
            </div>

            <dl className="mt-12 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {[
                {
                  metric: "5.5x vs 3.9x",
                  label: "Claimed vs actual ROAS",
                  sub: "The platform claims 5.5x. Your true blended ROAS is 3.9x. That gap is $26K unverified revenue on $20K spend in the demo dataset.",
                },
                {
                  metric: "33.3%",
                  label: "Over-count flagged",
                  sub: "Share of platform-reported conversions that do not reconcile against Shopify order data.",
                },
                {
                  metric: "6 hrs → 0",
                  label: "Weekly spreadsheet time",
                  sub: "The manual cross-check of Shopify order logs against ad dashboards happens automatically each morning.",
                },
              ].map((item) => (
                <div key={item.label} className="grid gap-2 py-6 md:grid-cols-[16rem_1fr]">
                  <dt className="order-2 font-display text-xl font-semibold tracking-tight text-white md:order-1">
                    <span className="tabular-nums">{item.metric}</span>
                    <span className="block text-sm font-normal text-zinc-500">{item.label}</span>
                  </dt>
                  <dd className="order-1 max-w-prose text-sm leading-relaxed text-zinc-400 md:order-2">
                    {item.sub}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Features — asymmetric bento: first tile spans full width */}
        <section className="section-padding border-t border-white/[0.06]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Three core engines. One operating system.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {FEATURES.map((feature, i) => (
                <article
                  key={feature.title}
                  className={`surface-card p-6 ${i === 0 ? "md:col-span-2 md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-8" : ""}`}
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight text-zinc-100">
                      {feature.title}
                    </h3>
                    <p className={`mt-3 text-sm leading-relaxed text-zinc-400 ${i === 0 ? "max-w-prose" : ""}`}>
                      {feature.body}
                    </p>
                  </div>
                  <div
                    className={
                      i === 0
                        ? "md:border-l md:border-white/[0.08] md:pl-8 md:text-right"
                        : "mt-6 border-t border-white/[0.06] pt-4"
                    }
                  >
                    <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-white">
                      {feature.stat}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{feature.statLabel}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — timeline, not cards */}
        <section id="how" className="section-padding border-t border-white/[0.06] bg-[#0c0c0f]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                How PerfOS works
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                From raw channel connections to verified actions in minutes.
              </p>
            </div>

            <ol className="relative mt-12 space-y-8 border-l border-white/[0.1] pl-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8 md:border-l-0 md:border-t md:pl-0 md:pt-8">
              {STEPS.map((step) => (
                <li key={step.num} className="relative">
                  <span
                    className="absolute -left-[2.19rem] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-blue-500/40 bg-[#0c0c0f] md:-top-[2.31rem] md:left-0"
                    aria-hidden="true"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-500">{step.num}</span>
                  <h3 className="mt-2 font-display text-base font-semibold text-zinc-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section-padding border-t border-white/[0.06]">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Frequently asked questions
            </h2>

            <div className="mt-10 space-y-3">
              {FAQ.map((item) => (
                <details key={item.q} className="surface-card group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-zinc-200 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      className="ml-4 font-mono text-zinc-500 transition-transform duration-150 ease-out group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-400">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA — split row, not centred stack */}
        <section className="section-padding border-t border-white/[0.06] bg-[#0c0c0f]">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Stop guessing which numbers are real.
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-400">
                Connect your ad channels, set your policy limits, and let PerfOS reconcile
                revenue across Google, Meta, and Shopify.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/overview" className="btn-primary">
                Start your free trial
              </Link>
              <a href="#faq" className="btn-secondary">
                Read the FAQ
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo />
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link href="#reconcile" className="hover:text-zinc-300">Reconcile</Link>
            <Link href="#how" className="hover:text-zinc-300">How it works</Link>
            <Link href="#faq" className="hover:text-zinc-300">FAQ</Link>
            <Link href="/overview" className="hover:text-zinc-300">Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
