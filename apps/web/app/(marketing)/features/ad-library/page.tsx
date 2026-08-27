/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  MetaLogo,
  GoogleLogo,
  LinkedInLogo,
  XLogo,
  TikTokLogo,
  RedditLogo,
} from '@/components/marketing/icons';

const SAMPLE_ADS = [
  {
    brand: 'Notion',
    domain: 'notion.so',
    platform: 'Meta',
    Logo: MetaLogo,
    daysActive: 142,
    angle: 'Post-it / Visual Sticky Note Workflow',
    ctrEstimate: '4.8%',
    category: 'Productivity / SaaS',
    format: 'Static 1080x1080',
    hookCopy:
      'Projects move faster when your docs and tasks live in the exact same workspace.',
    cta: 'Try Notion Free',
    evergreen: true,
  },
  {
    brand: 'Linear',
    domain: 'linear.app',
    platform: 'LinkedIn',
    Logo: LinkedInLogo,
    daysActive: 98,
    angle: 'Keyboard shortcuts & sub-50ms issue tracking',
    ctrEstimate: '3.9%',
    category: 'Developer Tools',
    format: 'High Contrast Video',
    hookCopy:
      'Issue tracking designed for software teams that value speed and precision.',
    cta: 'See Product Tour',
    evergreen: true,
  },
  {
    brand: 'Supabase',
    domain: 'supabase.com',
    platform: 'Google',
    Logo: GoogleLogo,
    daysActive: 180,
    angle: 'Firebase Alternative / Open Source Postgres',
    ctrEstimate: '5.2%',
    category: 'Infrastructure',
    format: 'Shorts Video Hook',
    hookCopy:
      'Build in a weekend. Scale to millions. The open source Firebase alternative.',
    cta: 'Start Your Project',
    evergreen: true,
  },
  {
    brand: 'Raycast',
    domain: 'raycast.com',
    platform: 'X',
    Logo: XLogo,
    daysActive: 112,
    angle: 'Supercharged Mac Spotlight Replacement',
    ctrEstimate: '4.1%',
    category: 'Mac Utility',
    format: 'Motion Preview',
    hookCopy:
      'Control your tools, clipboard, and AI prompts in a single keystroke.',
    cta: 'Download for Mac',
    evergreen: true,
  },
  {
    brand: 'PostHog',
    domain: 'posthog.com',
    platform: 'Reddit',
    Logo: RedditLogo,
    daysActive: 74,
    angle: 'All-in-one product analytics without tracking bloat',
    ctrEstimate: '4.4%',
    category: 'Analytics',
    format: 'Comic Illustration',
    hookCopy:
      'Product analytics, session replay, and feature flags. Open source and developer-friendly.',
    cta: 'Get Started Free',
    evergreen: false,
  },
  {
    brand: 'Resend',
    domain: 'resend.com',
    platform: 'TikTok',
    Logo: TikTokLogo,
    daysActive: 135,
    angle: 'Email for developers with React Email templates',
    ctrEstimate: '4.9%',
    category: 'Developer Tools',
    format: 'Clean Dark Code',
    hookCopy:
      'The best way to reach humans instead of spam folders. Build emails with React.',
    cta: 'Send First Email',
    evergreen: true,
  },
];

export default function AdLibraryPage() {
  const [filter, setFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [savedAds, setSavedAds] = useState<string[]>([]);
  const [selectedAd, setSelectedAd] = useState<(typeof SAMPLE_ADS)[0] | null>(
    null,
  );

  const toggleSave = (brand: string) => {
    if (savedAds.includes(brand)) {
      setSavedAds(savedAds.filter((b) => b !== brand));
    } else {
      setSavedAds([...savedAds, brand]);
    }
  };

  const filteredAds = SAMPLE_ADS.filter((ad) => {
    if (filter !== 'all' && ad.platform.toLowerCase() !== filter.toLowerCase())
      return false;
    if (durationFilter === 'evergreen' && !ad.evergreen) return false;
    if (durationFilter === '90' && ad.daysActive < 90) return false;
    if (durationFilter === '120' && ad.daysActive < 120) return false;
    if (
      search &&
      !ad.brand.toLowerCase().includes(search.toLowerCase()) &&
      !ad.angle.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 text-foreground">
      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          500,000+ Tracked Competitor Ads
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
          The Ad Library for{' '}
          <span className="text-primary">
            SaaS &amp; DTC Brands
          </span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Stop scrolling through laggy Meta &amp; Google ad libraries. Search 500k+ ads, filter by active longevity, and uncover competitor evergreen winners running for 90+ consecutive days.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link
            href="/command-center"
            className="btn-daisy-solid w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-semibold"
          >
            Open Live Ad Search &rarr;
          </Link>
          <Link
            href="/features/ads-cloner"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-elevated text-zinc-300 text-xs font-semibold border border-border transition-colors"
          >
            Remix Competitor Winner
          </Link>
        </div>
      </div>

      {/* Interactive Spy Simulator Engine */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3 w-full lg:w-96 bg-card border border-border rounded-xl px-3.5 py-2">
            <span className="text-muted-foreground font-mono">⌘</span>
            <input
              type="text"
              placeholder="Search by brand, category, or hook angle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
              {['all', 'Google', 'Meta', 'LinkedIn', 'X', 'TikTok', 'Reddit'].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setFilter(plat)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    filter === plat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {plat === 'all' ? 'All Networks' : plat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
              {[
                { id: 'all', label: 'Any Duration' },
                { id: '90', label: '90+ Days' },
                { id: '120', label: '120+ Days' },
                { id: 'evergreen', label: 'Evergreen Only' },
              ].map((dur) => (
                <button
                  key={dur.id}
                  onClick={() => setDurationFilter(dur.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    durationFilter === dur.id
                      ? 'bg-surface-elevated text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Grid of Searchable Ads */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                      <ad.Logo className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      {ad.brand}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {ad.domain}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      ad.daysActive >= 100
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {ad.daysActive}d active
                  </span>
                </div>

                <div
                  onClick={() => setSelectedAd(ad)}
                  className="h-40 rounded-lg bg-surface-elevated border border-border flex flex-col justify-between p-3.5 text-left cursor-pointer group-hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-zinc-300">
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
                    <span className="text-foreground font-medium">
                      {ad.platform}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Category:</span>
                    <span className="text-foreground">{ad.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primary CTA:</span>
                    <span className="text-zinc-300 font-mono text-[11px]">
                      {ad.cta}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex gap-2">
                <Link
                  href={`/features/ads-cloner?source=${encodeURIComponent(ad.brand)}`}
                  className="flex-1 py-2 text-center rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Remix Angle &rarr;</span>
                </Link>
                <button
                  onClick={() => toggleSave(ad.brand)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    savedAds.includes(ad.brand)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-surface-elevated text-zinc-300'
                  }`}
                >
                  {savedAds.includes(ad.brand) ? '✓ Saved' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Ad Modal Dialog */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold">
                  <selectedAd.Logo className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedAd.brand}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedAd.domain} · Active on {selectedAd.platform}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAd(null)}
                className="text-muted-foreground hover:text-foreground p-2 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <span className="text-xs font-mono uppercase text-primary font-semibold">
                  Full Primary Hook Copy
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  &quot;{selectedAd.hookCopy}&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <span className="text-muted-foreground block font-mono text-[11px]">
                    Days Running
                  </span>
                  <span className="text-primary font-bold text-base font-mono">
                    {selectedAd.daysActive} days
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <span className="text-muted-foreground block font-mono text-[11px]">
                    Estimated CTR
                  </span>
                  <span className="text-emerald-400 font-bold text-base font-mono">
                    {selectedAd.ctrEstimate}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <span className="text-muted-foreground block font-mono text-[11px]">
                    Format Type
                  </span>
                  <span className="text-foreground font-semibold text-xs">
                    {selectedAd.format}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedAd(null)}
                className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
              <Link
                href={`/features/ads-cloner?source=${encodeURIComponent(selectedAd.brand)}`}
                className="btn-daisy-solid px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Remix for My Brand &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
