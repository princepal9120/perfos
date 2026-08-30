'use client';

import * as React from 'react';
import { formatAdDate, TierBadge } from '@/components/ad-library/ad-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdLibraryCompetitor } from '@/lib/api';

export interface CompetitorTableProps {
  items: AdLibraryCompetitor[];
  loading?: boolean;
  syncing?: string | null;
  onSync: (name: string) => void;
  onTrack: (name: string) => void;
  onUntrack: (name: string) => void;
  onAdd: (name: string) => void;
}

function Spinner() {
  return (
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
  );
}

function AddCompetitor({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = React.useState('');

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Add competitor brand…"
        aria-label="Competitor brand name"
        className="h-8 w-48 rounded-md border border-border bg-white/4 px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:w-56"
      />
      <Button
        size="sm"
        onClick={submit}
        disabled={name.trim() === ''}
        className="bg-primary text-white dark:text-white hover:bg-primary"
      >
        Track
      </Button>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-10" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-20 rounded-sm" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-7 w-28 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function CompetitorTable({
  items,
  loading = false,
  syncing = null,
  onSync,
  onTrack,
  onUntrack,
  onAdd,
}: CompetitorTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground dark:text-white">
            Competitors
          </h3>
          <p className="text-xs text-muted-foreground">
            Tracked brands sync on demand; untracked brands are ones already
            seen in the library.
          </p>
        </div>
        <AddCompetitor onAdd={onAdd} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="px-4">Competitor</TableHead>
              <TableHead className="px-4">Ads</TableHead>
              <TableHead className="px-4">Avg score</TableHead>
              <TableHead className="px-4">Top tier</TableHead>
              <TableHead className="px-4">Last seen</TableHead>
              <TableHead className="px-4">Last synced</TableHead>
              <TableHead className="px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingRows />
            ) : items.length === 0 ? (
              <TableEmpty colSpan={7} className="py-12">
                <p className="text-sm font-medium text-foreground dark:text-white">
                  No competitors yet
                </p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  Add a brand above to start pulling its live ads into your
                  library.
                </p>
              </TableEmpty>
            ) : (
              items.map((competitor) => (
                <TableRow key={competitor.name}>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full border border-border bg-white/5 text-[10px] font-semibold uppercase text-zinc-300"
                      >
                        {competitor.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-medium text-foreground dark:text-white">
                          {competitor.name}
                        </span>
                        {competitor.domain && (
                          <span className="block truncate font-mono text-[10px] text-muted-foreground">
                            {competitor.domain}
                          </span>
                        )}
                      </div>
                      {!competitor.tracked && (
                        <Badge variant="neutral" shape="square">
                          untracked
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-4 py-3.5 text-xs font-medium tabular-nums text-zinc-300">
                    {competitor.ad_count}
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold tabular-nums text-foreground dark:text-white">
                    {competitor.avg_score === null
                      ? '—'
                      : competitor.avg_score.toFixed(1)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-4 py-3.5">
                    {typeof competitor.top_tier === 'string' ? (
                      <TierBadge tier={competitor.top_tier} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-4 py-3.5 text-xs tabular-nums text-muted-foreground">
                    {formatAdDate(competitor.last_seen_at)}
                  </TableCell>

                  {/* A null last_synced_at means two different things: a tracked brand awaiting
                      its first sync, versus an observed-only brand that has nothing to sync. */}
                  <TableCell className="whitespace-nowrap px-4 py-3.5">
                    {competitor.last_synced_at ? (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatAdDate(competitor.last_synced_at)}
                      </span>
                    ) : competitor.tracked ? (
                      <Badge variant="warning" shape="square">
                        Never
                      </Badge>
                    ) : (
                      <span
                        title="Not tracked — nothing to sync"
                        className="text-xs text-muted-foreground/60"
                      >
                        —
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSync(competitor.name)}
                        disabled={syncing === competitor.name}
                        aria-label={`Sync ads for ${competitor.name}`}
                      >
                        {syncing === competitor.name ? (
                          <>
                            <Spinner />
                            Syncing…
                          </>
                        ) : (
                          'Sync'
                        )}
                      </Button>
                      {competitor.tracked ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUntrack(competitor.name)}
                          aria-label={`Stop tracking ${competitor.name}`}
                        >
                          Untrack
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTrack(competitor.name)}
                          aria-label={`Track ${competitor.name}`}
                        >
                          Track
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default CompetitorTable;
