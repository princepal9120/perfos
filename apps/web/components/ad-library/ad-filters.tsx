'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

export interface AdFilterValue {
  q: string;
  platform: string;
  tier: string;
  minRuntimeDays: string;
  sort: string;
}

export interface AdFiltersProps {
  value: AdFilterValue;
  onChange: (v: AdFilterValue) => void;
  onSearch: () => void;
  searching?: boolean;
}

const CONTROL =
  'h-8 rounded-md border border-border bg-white/4 px-2 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50';

const PLATFORMS: [string, string][] = [
  ['', 'All platforms'],
  ['meta', 'Meta'],
  ['tiktok', 'TikTok'],
  ['google', 'Google'],
  ['linkedin', 'LinkedIn'],
  ['x', 'X'],
];

const TIERS: [string, string][] = [
  ['', 'All tiers'],
  ['high_conf', 'High confidence'],
  ['winner', 'Winner'],
  ['emerging', 'Emerging'],
  ['loser', 'Loser'],
];

const SORTS: [string, string][] = [
  ['recent', 'Most recent'],
  ['score', 'Highest score'],
  ['runtime', 'Longest running'],
  ['variants', 'Most variants'],
];

export function AdFilters({
  value,
  onChange,
  onSearch,
  searching = false,
}: AdFiltersProps) {
  function set<K extends keyof AdFilterValue>(key: K, next: AdFilterValue[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-56">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={value.q}
          onChange={(e) => set('q', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSearch();
            }
          }}
          placeholder="Search advertisers, hooks, copy…"
          aria-label="Search the ad library"
          className={`${CONTROL} w-full pl-8 text-foreground placeholder:text-muted-foreground`}
        />
      </div>

      <select
        value={value.platform}
        onChange={(e) => set('platform', e.target.value)}
        aria-label="Filter by platform"
        className={CONTROL}
      >
        {PLATFORMS.map(([v, label]) => (
          <option key={v} value={v} className="bg-card">
            {label}
          </option>
        ))}
      </select>

      <select
        value={value.tier}
        onChange={(e) => set('tier', e.target.value)}
        aria-label="Filter by tier"
        className={CONTROL}
      >
        {TIERS.map(([v, label]) => (
          <option key={v} value={v} className="bg-card">
            {label}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value.minRuntimeDays}
        onChange={(e) => set('minRuntimeDays', e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
          }
        }}
        placeholder="Min days"
        aria-label="Minimum runtime in days"
        className={`${CONTROL} w-24 tabular-nums placeholder:text-muted-foreground`}
      />

      <select
        value={value.sort}
        onChange={(e) => set('sort', e.target.value)}
        aria-label="Sort results"
        className={CONTROL}
      >
        {SORTS.map(([v, label]) => (
          <option key={v} value={v} className="bg-card">
            {label}
          </option>
        ))}
      </select>

      <Button
        size="sm"
        onClick={onSearch}
        disabled={searching}
        className="bg-primary text-white dark:text-white hover:bg-primary"
      >
        {searching ? (
          <>
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
            Searching…
          </>
        ) : (
          'Search'
        )}
      </Button>
    </div>
  );
}

export default AdFilters;
