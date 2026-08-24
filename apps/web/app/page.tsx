import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PerfOS — Your AI performance marketer",
};

const FEATURES = [
  {
    title: "Reconcile truth",
    body: (
      <>
        Platforms claim credit. Shopify knows what sold. PerfOS reconciles
        platform-reported conversions against actual revenue and flags every
        dollar of over-counting.
      </>
    ),
    stat: "33.3%",
    statLabel: "over-count caught in demo data",
  },
  {
    title: "Daily briefing",
    body: (
      <>
        One honest summary each morning: spend, revenue, blended ROAS, what
        changed, and why — computed from your numbers, not the platforms'.
      </>
    ),
    stat: "3.9x",
    statLabel: "true blended ROAS, not claimed",
  },
  {
    title: "Safe AI actions",
    body: (
      <>
        Recommendations arrive as structured actions checked by a hard policy
        engine. Nothing touches your ad accounts without your approval — and
        every action logs a rollback plan.
      </>
    ),
    stat: ">25%",
    statLabel: "budget swings blocked by policy",
  },
];

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
        P
      </span>
      <span className="text-sm font-semibold tracking-tight">PerfOS</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Logo />
          <Link
            href="/overview"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open console
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-24 text-center sm:pt-32">
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Your AI performance marketer.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Connect Google + Meta + Shopify. See what actually happened to your
            money.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/overview"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See the demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Mock mode &middot; zero credentials &middot; demo data included
          </p>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-px overflow-hidden rounded-lg border border-border bg-border px-0 pb-0 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="bg-card p-8">
              <h2 className="text-base font-semibold tracking-tight">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
              <p className="mt-6 text-2xl font-semibold tabular-nums tracking-tight">
                {feature.stat}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {feature.statLabel}
              </p>
            </article>
          ))}
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-24 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Stop trusting the platforms' homework.
          </h2>
          <div className="mt-8">
            <Link
              href="/overview"
              className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open the console
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <Logo />
          <span>PerfOS &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
