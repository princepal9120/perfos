"use client";

import Link from "next/link";
import { useState } from "react";

const SAMPLE_ADS = [
  {
    brand: "Notion",
    domain: "notion.so",
    platform: "Meta",
    daysActive: 142,
    angle: "Post-it / Visual Sticky Note Workflow",
    ctrEstimate: "4.8%",
    category: "Productivity / SaaS",
    format: "Static 1080x1080",
    hookCopy: "Projects move faster when your docs and tasks live in the exact same workspace.",
    cta: "Try Notion Free",
    evergreen: true
  },
  {
    brand: "Linear",
    domain: "linear.app",
    platform: "LinkedIn",
    daysActive: 98,
    angle: "Keyboard shortcuts & sub-50ms issue tracking",
    ctrEstimate: "3.9%",
    category: "Developer Tools",
    format: "High Contrast Video",
    hookCopy: "Issue tracking designed for software teams that value speed and precision.",
    cta: "See Product Tour",
    evergreen: true
  },
  {
    brand: "Supabase",
    domain: "supabase.com",
    platform: "Google / YouTube",
    daysActive: 180,
    angle: "Firebase Alternative / Open Source Postgres",
    ctrEstimate: "5.2%",
    category: "Infrastructure",
    format: "Shorts Video Hook",
    hookCopy: "Build in a weekend. Scale to millions. The open source Firebase alternative.",
    cta: "Start Your Project",
    evergreen: true
  },
  {
    brand: "Raycast",
    domain: "raycast.com",
    platform: "X / Twitter",
    daysActive: 112,
    angle: "Supercharged Mac Spotlight Replacement",
    ctrEstimate: "4.1%",
    category: "Mac Utility",
    format: "GIF / Motion",
    hookCopy: "Control your tools, clipboard, and AI prompts in a single keystroke.",
    cta: "Download for Mac",
    evergreen: true
  },
  {
    brand: "PostHog",
    domain: "posthog.com",
    platform: "Meta",
    daysActive: 74,
    angle: "All-in-one product analytics without tracking bloat",
    ctrEstimate: "4.4%",
    category: "Analytics",
    format: "Meme / Comic Illustration",
    hookCopy: "Product analytics, session replay, and feature flags. Open source and developer-friendly.",
    cta: "Get Started Free",
    evergreen: false
  },
  {
    brand: "Resend",
    domain: "resend.com",
    platform: "LinkedIn",
    daysActive: 135,
    angle: "Email for developers with React Email templates",
    ctrEstimate: "4.9%",
    category: "Developer Tools",
    format: "Clean Minimalist Dark Code",
    hookCopy: "The best way to reach humans instead of spam folders. Build emails with React.",
    cta: "Send Your First Email",
    evergreen: true
  },
  {
    brand: "Vercel",
    domain: "vercel.com",
    platform: "Google / YouTube",
    daysActive: 210,
    angle: "Next.js zero-config edge deployments",
    ctrEstimate: "5.8%",
    category: "Cloud Hosting",
    format: "Product Demo Video",
    hookCopy: "Develop. Preview. Ship. The frontend cloud platform powering the modern web.",
    cta: "Deploy Now",
    evergreen: true
  },
  {
    brand: "Cursor",
    domain: "cursor.com",
    platform: "X / Twitter",
    daysActive: 160,
    angle: "AI Code Editor built to make you 10x faster",
    ctrEstimate: "6.1%",
    category: "AI / Dev",
    format: "Side-by-side terminal capture",
    hookCopy: "The AI code editor. Forked from VS Code, built for autonomous coding agents.",
    cta: "Download Cursor",
    evergreen: true
  }
];

export default function AdLibraryPage() {
  const [filter, setFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [savedAds, setSavedAds] = useState<string[]>([]);
  const [selectedAd, setSelectedAd] = useState<(typeof SAMPLE_ADS)[0] | null>(null);

  const toggleSave = (brand: string) => {
    if (savedAds.includes(brand)) {
      setSavedAds(savedAds.filter(b => b !== brand));
    } else {
      setSavedAds([...savedAds, brand]);
    }
  };

  const filteredAds = SAMPLE_ADS.filter(ad => {
    if (filter !== "all" && ad.platform.toLowerCase() !== filter.toLowerCase()) return false;
    if (durationFilter === "evergreen" && !ad.evergreen) return false;
    if (durationFilter === "90" && ad.daysActive < 90) return false;
    if (durationFilter === "120" && ad.daysActive < 120) return false;
    if (search && !ad.brand.toLowerCase().includes(search.toLowerCase()) && !ad.angle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-primary text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          500,000+ Tracked Competitor Ads
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-foreground dark:text-white tracking-tight leading-[1.08]">
          The Ad Library for <span className="bg-linear-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">SaaS & Mobile Apps</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Stop scrolling through laggy Meta & Google ad libraries. Search 500k+ ads, filter by active longevity, and uncover competitor money-makers that have run for 90+ consecutive days.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-linear-to-r from-primary to-primary-dark hover:from-purple-500 hover:to-indigo-500 text-white dark:text-white text-xs font-semibold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]"
          >
            Start Free Search Trial (7 Days) →
          </Link>
          <Link
            href="/features/ads-cloner"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/4 hover:bg-white/8 text-zinc-300 text-xs font-semibold border border-border transition-colors"
          >
            Remix Competitor Winner 🧬
          </Link>
        </div>
      </div>

      {/* Interactive Spy Simulator Engine */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-6 shadow-2xl shadow-black/5 dark:shadow-purple-950/20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3 w-full lg:w-96 bg-black/40 border border-border rounded-xl px-3.5 py-2">
            <span className="text-muted-foreground">🔍</span>
            <input
              type="text"
              placeholder="Search by brand, category, or hook angle..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-border">
              {["all", "Meta", "LinkedIn", "Google", "X"].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setFilter(plat)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    filter === plat
                      ? "bg-primary text-white dark:text-white shadow"
                      : "text-muted-foreground hover:text-foreground dark:text-white"
                  }`}
                >
                  {plat === "all" ? "All Networks" : plat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-border">
              {[
                { id: "all", label: "Any Duration" },
                { id: "90", label: "90+ Days" },
                { id: "120", label: "120+ Days" },
                { id: "evergreen", label: "Evergreen Only ⭐" }
              ].map((dur) => (
                <button
                  key={dur.id}
                  onClick={() => setDurationFilter(dur.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    durationFilter === dur.id
                      ? "bg-indigo-600 text-foreground dark:text-white shadow"
                      : "text-muted-foreground hover:text-foreground dark:text-white"
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Grid of Searchable Ads */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAds.map((ad, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-black/40 border border-border hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group hover:shadow-lg hover:shadow-purple-950/30"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-foreground dark:text-white">
                      {ad.brand}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {ad.domain}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                    ad.daysActive >= 100
                      ? "bg-purple-500/15 text-primary border-primary/30"
                      : "bg-white/5 text-muted-foreground border-border"
                  }`}>
                    {ad.daysActive}d active
                  </span>
                </div>

                <div
                  onClick={() => setSelectedAd(ad)}
                  className="h-44 rounded-lg bg-linear-to-br from-purple-950/20 via-zinc-900 to-indigo-950/20 border border-white/5 flex flex-col justify-between p-3.5 text-left cursor-pointer group-hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/8 text-zinc-300">
                      {ad.format}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      CTR ~{ad.ctrEstimate}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground line-clamp-3 leading-snug">
                      &quot;{ad.hookCopy}&quot;
                    </p>
                  </div>
                  <div className="text-[10px] text-primary font-medium flex items-center justify-between">
                    <span>Angle: {ad.angle}</span>
                    <span className="underline">View details</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="text-foreground font-medium">{ad.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Category:</span>
                    <span className="text-foreground">{ad.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primary CTA:</span>
                    <span className="text-zinc-300 font-mono text-[11px]">{ad.cta}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex gap-2">
                <Link
                  href={`/features/ads-cloner?source=${encodeURIComponent(ad.brand)}`}
                  className="flex-1 py-2 text-center rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Remix Angle</span> ⚡
                </Link>
                <button
                  onClick={() => toggleSave(ad.brand)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    savedAds.includes(ad.brand)
                      ? "bg-primary text-white dark:text-white"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300"
                  }`}
                >
                  {savedAds.includes(ad.brand) ? "✓ Saved" : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Ad Modal Dialog */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {selectedAd.brand[0]}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground dark:text-white">{selectedAd.brand}</h3>
                  <p className="text-xs text-muted-foreground">{selectedAd.domain} · Active on {selectedAd.platform}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAd(null)}
                className="text-muted-foreground hover:text-foreground dark:text-white p-2 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-2">
                <span className="text-xs font-mono uppercase text-primary font-semibold">Full Primary Hook Copy</span>
                <p className="text-sm text-foreground leading-relaxed">&quot;{selectedAd.hookCopy}&quot;</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white/2 border border-white/4">
                  <span className="text-muted-foreground block">Days Running</span>
                  <span className="text-primary font-bold text-base">{selectedAd.daysActive} days</span>
                </div>
                <div className="p-3 rounded-lg bg-white/2 border border-white/4">
                  <span className="text-muted-foreground block">Estimated CTR</span>
                  <span className="text-emerald-400 font-bold text-base">{selectedAd.ctrEstimate}</span>
                </div>
                <div className="p-3 rounded-lg bg-white/2 border border-white/4">
                  <span className="text-muted-foreground block">Format Type</span>
                  <span className="text-foreground font-semibold text-sm">{selectedAd.format}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedAd(null)}
                className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground dark:text-white"
              >
                Close
              </button>
              <Link
                href={`/features/ads-cloner?source=${encodeURIComponent(selectedAd.brand)}`}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary text-white dark:text-white text-xs font-semibold"
              >
                Remix for My Brand →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Feature Pillar Deep-Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-card border border-border space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-primary text-2xl">
            ⏱️
          </div>
          <h3 className="font-display font-bold text-foreground dark:text-white text-lg">Longevity Filter</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Eliminate low-budget test creatives from your research. When an ad has been active for 90+ consecutive days across Meta and Google, you can bet it&apos;s profitable.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl">
            📁
          </div>
          <h3 className="font-display font-bold text-foreground dark:text-white text-lg">Swipe File Sync</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Organize winning creatives into categorized folders. Export structured JSON schemas directly to Claude or Cursor through our native Ads MCP server.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border space-y-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-2xl">
            📬
          </div>
          <h3 className="font-display font-bold text-foreground dark:text-white text-lg">Weekly Competitor Digests</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automated alerts sent to Slack or email whenever competitors launch new angles, scale budgets, or shut down fatigued ad variants.
          </p>
        </div>
      </div>
    </div>
  );
}
