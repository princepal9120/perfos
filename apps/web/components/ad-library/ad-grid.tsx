'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdLibraryItem } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface AdGridProps {
  items: AdLibraryItem[];
  loading?: boolean;
  selectedId?: string | null;
  onSelect: (ad: AdLibraryItem) => void;
  onToggleSave: (ad: AdLibraryItem) => void;
  emptyLabel?: string;
}

const TIER_LABELS: Record<string, string> = {
  high_conf: 'High confidence',
  winner: 'Winner',
  emerging: 'Emerging',
  loser: 'Loser',
};

const TIER_VARIANTS: Record<
  string,
  'success' | 'default' | 'warning' | 'neutral'
> = {
  high_conf: 'success',
  winner: 'default',
  emerging: 'warning',
  loser: 'neutral',
};

/** Shared by ad-detail and competitor-table so tier styling stays in one place. */
export function TierBadge({
  tier,
  className,
}: {
  tier: string | null;
  className?: string;
}) {
  if (!tier) return null;
  return (
    <Badge
      variant={TIER_VARIANTS[tier] ?? 'secondary'}
      shape="square"
      className={className}
    >
      {TIER_LABELS[tier] ?? tier}
    </Badge>
  );
}

export function formatAdDate(value: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const VIDEO_PATTERN = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function AdMedia({
  url,
  advertiser,
}: {
  url: string | null;
  advertiser: string;
}) {
  const [failed, setFailed] = React.useState(false);

  if (!url || failed) {
    return (
      <div className="flex h-40 w-full items-center justify-center border-b border-border bg-white/2">
        <span className="text-2xl font-semibold uppercase text-muted-foreground">
          {advertiser.charAt(0) || '?'}
        </span>
      </div>
    );
  }

  if (VIDEO_PATTERN.test(url)) {
    return (
      <video
        src={url}
        muted
        playsInline
        preload="metadata"
        aria-label={`Video creative from ${advertiser}`}
        onError={() => setFailed(true)}
        className="h-40 w-full border-b border-border object-cover"
      />
    );
  }

  return (
    // Remote creative URLs come from ad libraries on unknown hosts, so next/image is not usable.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`Creative from ${advertiser}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-40 w-full border-b border-border object-cover"
    />
  );
}

function SaveToggle({
  ad,
  onToggleSave,
}: {
  ad: AdLibraryItem;
  onToggleSave: (ad: AdLibraryItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggleSave(ad)}
      aria-pressed={ad.saved}
      aria-label={
        ad.saved
          ? `Remove ${ad.advertiser} ad from saved`
          : `Save ${ad.advertiser} ad`
      }
      title={ad.saved ? 'Remove from saved' : 'Save to board'}
      className={cn(
        'absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur transition-colors',
        ad.saved
          ? 'text-blue-400 hover:text-blue-300'
          : 'text-muted-foreground hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
      )}
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={ad.saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

function AdCard({
  ad,
  selected,
  onSelect,
  onToggleSave,
}: {
  ad: AdLibraryItem;
  selected: boolean;
  onSelect: (ad: AdLibraryItem) => void;
  onToggleSave: (ad: AdLibraryItem) => void;
}) {
  const runtime = Math.max(0, Math.round(ad.runtime_days));
  const variants = ad.variant_count ?? 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card transition-colors',
        selected
          ? 'border-blue-500/60'
          : 'border-border hover:border-primary/30',
      )}
    >
      <SaveToggle ad={ad} onToggleSave={onToggleSave} />

      <button
        type="button"
        onClick={() => onSelect(ad)}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/50"
      >
        <AdMedia url={ad.creative_url} advertiser={ad.advertiser} />

        <div className="space-y-2 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-semibold text-foreground dark:text-white">
              {ad.advertiser || 'Unknown advertiser'}
            </span>
            <TierBadge tier={typeof ad.tier === 'string' ? ad.tier : null} />
          </div>

          <p className="line-clamp-2 min-h-8 text-[11px] leading-relaxed text-muted-foreground">
            {ad.title || ad.body || 'No hook captured'}
          </p>

          <div className="flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
            <span className="font-medium tabular-nums text-zinc-300">
              {runtime}d live
            </span>
            <span className="tabular-nums">{variants} variants</span>
            {ad.score !== null && (
              <span className="font-semibold tabular-nums text-foreground dark:text-white">
                {Math.round(ad.score)}/100
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

function AdCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-4 w-16 rounded-sm" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between border-t border-border pt-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

export function AdGrid({
  items,
  loading = false,
  selectedId = null,
  onSelect,
  onToggleSave,
  emptyLabel,
}: AdGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white/4 text-muted-foreground">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 15l4-4 5 5 3-3 6 6" />
            <circle cx="8.5" cy="8.5" r="1.5" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-medium text-foreground dark:text-white">
          {emptyLabel ?? 'No ads yet'}
        </p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Search a competitor or sync a tracked brand to start building your
          swipe file.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((ad) => (
        <AdCard
          key={ad.ad_id}
          ad={ad}
          selected={ad.ad_id === selectedId}
          onSelect={onSelect}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}

export default AdGrid;
