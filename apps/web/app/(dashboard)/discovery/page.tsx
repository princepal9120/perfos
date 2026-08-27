'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { AdDetail } from '@/components/ad-library/ad-detail';
import {
  AdFilters,
  type AdFilterValue,
} from '@/components/ad-library/ad-filters';
import { AdGrid } from '@/components/ad-library/ad-grid';
import { CompetitorTable } from '@/components/ad-library/competitor-table';
import { SavedBoards } from '@/components/ad-library/saved-boards';
import { AdPreview, type WinningAd } from '@/components/discovery/ad-preview';
import {
  type Persona,
  PersonaPicker,
} from '@/components/discovery/persona-picker';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import {
  type AdLibraryBoard,
  type AdLibraryCompetitor,
  type AdLibraryItem,
  type AdLibraryQuery,
  type CloneResult,
  cloneAd,
  getAdLibrary,
  getAdLibraryCompetitors,
  getSavedAds,
  saveAd,
  searchAdLibrary,
  syncCompetitor,
  trackCompetitor,
  unsaveAd,
  untrackCompetitor,
} from '@/lib/api';
import { cn } from '@/lib/utils';

type Tab = 'library' | 'competitors' | 'saved';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'library', label: 'Ads Library (Swipe File)', icon: '🔍' },
  { id: 'competitors', label: 'Competitor Tracking', icon: '🏢' },
  { id: 'saved', label: 'Saved Ads (Boards)', icon: '📌' },
];

const COUNTRIES = ['US', 'GB', 'CA', 'AU', 'IN', 'DE'];

const EMPTY_FILTERS: AdFilterValue = {
  q: '',
  platform: '',
  tier: '',
  minRuntimeDays: '',
  sort: 'recent',
};

const VIDEO_PATTERN = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function describeError(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Feed the ad-frame preview from the canonical library shape. */
function toPreviewAd(ad: AdLibraryItem): WinningAd {
  return {
    id: ad.ad_id,
    platform: ad.platform || 'meta',
    advertiser: ad.advertiser,
    headline: ad.title,
    body: ad.body,
    score: ad.score,
    tier: typeof ad.tier === 'string' ? ad.tier : null,
    runtimeDays: Math.max(0, Math.round(ad.runtime_days)),
    mediaType:
      ad.creative_url && VIDEO_PATTERN.test(ad.creative_url)
        ? 'video'
        : 'image',
    thumbnailUrl: ad.creative_url,
    ctaText: ad.cta,
    firstSeen: ad.first_seen_at,
    lastSeen: ad.last_seen_at,
    landingUrl: ad.landing_url,
    bookmarked: ad.saved,
  };
}

function DiscoveryContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('library');

  useEffect(() => {
    const v = searchParams.get('view');
    if (v === 'competitors' || v === 'library' || v === 'saved') {
      setActiveTab(v);
    }
  }, [searchParams]);

  const [persona, setPersona] = useState<Persona>('saas');
  const [country, setCountry] = useState<string>('US');
  const [filters, setFilters] = useState<AdFilterValue>(EMPTY_FILTERS);
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  const [libraryItems, setLibraryItems] = useState<AdLibraryItem[]>([]);
  const [libraryTotal, setLibraryTotal] = useState<number>(0);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(true);
  const [libraryVersion, setLibraryVersion] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);

  const [savedItems, setSavedItems] = useState<AdLibraryItem[]>([]);
  const [savedBoards, setSavedBoards] = useState<AdLibraryBoard[]>([]);
  const [savedLoading, setSavedLoading] = useState<boolean>(true);
  const [savedVersion, setSavedVersion] = useState<number>(0);
  const [activeBoard, setActiveBoard] = useState<string | null>(null);

  const [competitors, setCompetitors] = useState<AdLibraryCompetitor[]>([]);
  const [competitorsLoading, setCompetitorsLoading] = useState<boolean>(true);
  const [competitorVersion, setCompetitorVersion] = useState<number>(0);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cloneResult, setCloneResult] = useState<CloneResult | null>(null);
  const [cloning, setCloning] = useState<string | null>(null);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 6000);
  }

  // Only the free-text field is debounced; the selects re-query immediately.
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(filters.q.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  const libraryQuery = useMemo<AdLibraryQuery>(() => {
    const minDays = Number(filters.minRuntimeDays);
    return {
      q: debouncedQuery || undefined,
      platform: filters.platform || undefined,
      tier: filters.tier || undefined,
      min_runtime_days:
        Number.isFinite(minDays) && minDays > 0 ? minDays : undefined,
      sort: (filters.sort || 'recent') as AdLibraryQuery['sort'],
      limit: 60,
    };
  }, [
    debouncedQuery,
    filters.platform,
    filters.tier,
    filters.minRuntimeDays,
    filters.sort,
  ]);

  useEffect(() => {
    let cancelled = false;
    setLibraryLoading(true);
    getAdLibrary(libraryQuery)
      .then((page) => {
        if (cancelled) return;
        setLibraryItems(page.items);
        setLibraryTotal(page.total);
      })
      .catch((err) => {
        if (!cancelled)
          setError(describeError(err, 'Could not load the ad library.'));
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [libraryQuery, libraryVersion]);

  useEffect(() => {
    let cancelled = false;
    setSavedLoading(true);
    getSavedAds(activeBoard ?? undefined)
      .then((page) => {
        if (cancelled) return;
        setSavedItems(page.items);
        setSavedBoards(page.boards);
      })
      .catch((err) => {
        if (!cancelled)
          setError(describeError(err, 'Could not load your saved ads.'));
      })
      .finally(() => {
        if (!cancelled) setSavedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeBoard, savedVersion]);

  useEffect(() => {
    let cancelled = false;
    setCompetitorsLoading(true);
    getAdLibraryCompetitors()
      .then((page) => {
        if (!cancelled) setCompetitors(page.items);
      })
      .catch((err) => {
        if (!cancelled)
          setError(describeError(err, 'Could not load competitors.'));
      })
      .finally(() => {
        if (!cancelled) setCompetitorsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [competitorVersion]);

  const visibleAds = activeTab === 'saved' ? savedItems : libraryItems;

  const selectedAd = useMemo(
    () => visibleAds.find((ad) => ad.ad_id === selectedId) ?? null,
    [visibleAds, selectedId],
  );

  const kpis = useMemo(() => {
    const scored = libraryItems.filter((ad) => ad.score !== null);
    const avgScore = scored.length
      ? scored.reduce((acc, ad) => acc + (ad.score ?? 0), 0) / scored.length
      : 0;
    const avgRuntime = libraryItems.length
      ? libraryItems.reduce(
          (acc, ad) => acc + Math.max(0, ad.runtime_days),
          0,
        ) / libraryItems.length
      : 0;
    return {
      libraryTotal,
      tracked: competitors.filter((c) => c.tracked).length,
      avgScore: Number(avgScore.toFixed(1)),
      avgRuntime: `${avgRuntime.toFixed(1)}d`,
    };
  }, [libraryItems, libraryTotal, competitors]);

  /** Live Meta Ad Library search — a headless browser run that can take minutes. */
  async function runSearch() {
    const query = filters.q.trim();
    if (!query) {
      setError('Enter a competitor or keyword before running a live search.');
      return;
    }
    setSearching(true);
    setError(null);
    setNotice(null);
    try {
      const page = await searchAdLibrary({
        query,
        country,
        limit: 30,
        persona,
        platforms: filters.platform ? [filters.platform] : undefined,
      });
      setLibraryItems(page.items);
      setLibraryTotal(page.total);
      setSelectedId(page.items[0]?.ad_id ?? null);
      setCompetitorVersion((v) => v + 1);
      flash(
        page.total
          ? `Pulled ${page.total} live ads for “${query}”.`
          : `No live ads matched “${query}”.`,
      );
    } catch (err) {
      setError(describeError(err, 'The live ad-library search failed.'));
    } finally {
      setSearching(false);
    }
  }

  /** Optimistic save toggle: flip both lists first, restore them if the call rejects. */
  async function handleToggleSave(ad: AdLibraryItem) {
    const board = activeBoard ?? 'default';
    const nextSaved = !ad.saved;
    const savedSnapshot = savedItems;

    setLibraryItems((prev) =>
      prev.map((item) =>
        item.ad_id === ad.ad_id ? { ...item, saved: nextSaved } : item,
      ),
    );
    setSavedItems((prev) =>
      nextSaved
        ? prev.some((item) => item.ad_id === ad.ad_id)
          ? prev
          : [{ ...ad, saved: true }, ...prev]
        : prev.filter((item) => item.ad_id !== ad.ad_id),
    );

    try {
      if (nextSaved) {
        await saveAd(ad.ad_id, board);
      } else {
        await unsaveAd(ad.ad_id, board);
      }
      setSavedVersion((v) => v + 1);
    } catch (err) {
      setLibraryItems((prev) =>
        prev.map((item) =>
          item.ad_id === ad.ad_id ? { ...item, saved: ad.saved } : item,
        ),
      );
      setSavedItems(savedSnapshot);
      setError(
        describeError(
          err,
          nextSaved ? 'Could not save that ad.' : 'Could not unsave that ad.',
        ),
      );
    }
  }

  /** Remix an ad's hook into your own variants. The guard matters because a clone
   *  can drive paid generation, so a double-fire costs money, not just a request. */
  async function handleClone(ad: AdLibraryItem) {
    if (cloning) return;
    setCloning(ad.ad_id);
    setCloneResult(null);
    flash(`Cloning hooks from “${ad.advertiser || ad.ad_id}”…`);
    try {
      setCloneResult(await cloneAd(ad.ad_id));
    } catch (err) {
      setError(
        describeError(err, `Could not clone “${ad.advertiser || ad.ad_id}”.`),
      );
    } finally {
      setCloning(null);
    }
  }

  async function handleTrack(name: string) {
    try {
      await trackCompetitor(name);
      setCompetitorVersion((v) => v + 1);
      flash(`Now tracking ${name}.`);
    } catch (err) {
      setError(describeError(err, `Could not track ${name}.`));
    }
  }

  async function handleUntrack(name: string) {
    try {
      await untrackCompetitor(name);
      setCompetitorVersion((v) => v + 1);
      flash(`Stopped tracking ${name}.`);
    } catch (err) {
      setError(describeError(err, `Could not untrack ${name}.`));
    }
  }

  /** Re-scans one brand against the live Meta ad library, so it is slow by design. */
  async function handleSync(name: string) {
    setSyncing(name);
    setError(null);
    try {
      const result = await syncCompetitor(name, country);
      setCompetitorVersion((v) => v + 1);
      setLibraryVersion((v) => v + 1);
      flash(`${name}: ${result.added} new ads, ${result.total} in library.`);
    } catch (err) {
      setError(describeError(err, `Could not sync ${name}.`));
    } finally {
      setSyncing(null);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-2.5 text-xs text-red-200">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {searching && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-950/40 px-4 py-2.5 text-xs text-blue-200">
          <svg
            className="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span>
            Scanning the Meta ad library for “{filters.q.trim()}” in {country}.
            This drives a headless browser and can take a few minutes — you can
            keep browsing while it runs.
          </span>
        </div>
      )}

      {notice && (
        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-950/40 px-4 py-2.5 text-xs text-blue-200 shadow-md">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span>{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-blue-400 hover:text-foreground dark:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {cloneResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Cloned hooks from {cloneResult.source.advertiser}
            </CardTitle>
            <CardDescription className="text-xs">
              Original: {cloneResult.source.hook || '(no hook)'} · score{' '}
              {cloneResult.source.score} ({cloneResult.source.tier})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cloneResult.variants.map((line, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-white/4 px-3 py-2 text-xs text-zinc-200"
              >
                {line}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCloneResult(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground dark:text-white">
            {activeTab === 'competitors'
              ? 'Competitor Tracking'
              : activeTab === 'saved'
                ? 'Saved Ads & Boards'
                : 'Ads Library & Swipe File'}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {activeTab === 'competitors'
              ? 'Track rival brands, sync their live ad rotations, and watch creative velocity.'
              : activeTab === 'saved'
                ? 'Curated creative boards, swipe files, and one-click studio cloning.'
                : 'Search public ad libraries, isolate long-running winner DNA, and clone proven hooks.'}
          </p>
        </div>
        {activeTab !== 'saved' && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Country
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-8 rounded-md border border-border bg-white/4 px-2 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-card">
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Navigation Subtabs (Matching Sidebar: Ads Library / Competitors / Saved Ads) */}
      <div className="flex items-center gap-1 border-b border-border pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
              activeTab === tab.id
                ? 'border-b-2 border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:text-foreground',
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Ads in library"
          value={kpis.libraryTotal}
          sub="Matching the current filters"
          className="border-border bg-background"
        />
        <Stat
          label="Tracked competitors"
          value={kpis.tracked}
          sub={`${competitors.length} advertisers seen in total`}
          className="border-border bg-background"
        />
        <Stat
          label="Average winner score"
          value={kpis.avgScore}
          sub="Ad Oracle heuristic composite"
          className="border-border bg-background"
        />
        <Stat
          label="Average ad runtime"
          value={kpis.avgRuntime}
          sub="Observed active duration across platforms"
          className="border-border bg-background"
        />
      </div>

      {/* Persona drives the scoring model used by a live search. */}
      <Card className="border-border bg-background">
        <CardContent className="pt-5">
          <PersonaPicker value={persona} onChange={setPersona} />
        </CardContent>
      </Card>

      {activeTab === 'competitors' ? (
        <CompetitorTable
          items={competitors}
          loading={competitorsLoading}
          syncing={syncing}
          onSync={handleSync}
          onTrack={handleTrack}
          onUntrack={handleUntrack}
          onAdd={handleTrack}
        />
      ) : activeTab === 'saved' ? (
        <div className="space-y-6">
          <SavedBoards
            boards={savedBoards}
            active={activeBoard}
            onSelect={setActiveBoard}
          />
          <AdGrid
            items={savedItems}
            loading={savedLoading}
            selectedId={selectedId}
            onSelect={(ad) => setSelectedId(ad.ad_id)}
            onToggleSave={handleToggleSave}
            emptyLabel="Nothing saved on this board yet"
          />
          <AdDetail
            ad={selectedAd}
            onClose={() => setSelectedId(null)}
            onToggleSave={handleToggleSave}
            onClone={handleClone}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {selectedAd && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <AdPreview
                  ad={toPreviewAd(selectedAd)}
                  isBookmarked={selectedAd.saved}
                  onClone={() => handleClone(selectedAd)}
                  onSaveToBoard={() => handleToggleSave(selectedAd)}
                />
              </div>
              <div className="lg:col-span-5">
                <AdDetail
                  ad={selectedAd}
                  onClose={() => setSelectedId(null)}
                  onToggleSave={handleToggleSave}
                  onClone={handleClone}
                />
              </div>
            </div>
          )}

          <Card className="border-border bg-background">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    Scored competitor ads
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Filters query the ads already collected. Search pulls fresh
                    ones from the live Meta ad library.
                  </CardDescription>
                </div>
                <AdFilters
                  value={filters}
                  onChange={setFilters}
                  onSearch={runSearch}
                  searching={searching}
                />
              </div>
            </CardHeader>
            <CardContent>
              <AdGrid
                items={libraryItems}
                loading={libraryLoading}
                selectedId={selectedId}
                onSelect={(ad) => setSelectedId(ad.ad_id)}
                onToggleSave={handleToggleSave}
                emptyLabel="No ads yet — search a competitor or keyword to pull live ads from the Meta Ad Library"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-xs text-muted-foreground">
          Loading Discovery...
        </div>
      }
    >
      <DiscoveryContent />
    </Suspense>
  );
}
