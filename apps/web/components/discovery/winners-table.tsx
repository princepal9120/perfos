"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  useTableSort,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ScoredCompetitorAd {
  id?: string | number;
  platform?: string;
  advertiser?: string;
  advertiserName?: string;
  brand?: string;
  hook?: string;
  body?: string;
  headline?: string;
  copy?: string;
  title?: string;
  score?: number | string | null;
  runtimeDays?: number | string | null;
  runtime_days?: number | string | null;
  daysActive?: number | string | null;
  days_active?: number | string | null;
  delta?: number | string | null;
  deltaPercent?: number | string | null;
  delta_percent?: number | string | null;
  change?: number | string | null;
  tier?: string | null;
  format?: string | null;
  url?: string | null;
  [key: string]: unknown;
}

export interface WinnersTableProps {
  /** Array of plain competitor ad objects */
  winners?: ScoredCompetitorAd[] | readonly Record<string, unknown>[];
  /** Alias for winners */
  data?: ScoredCompetitorAd[] | readonly Record<string, unknown>[];
  /** Alias for winners */
  items?: ScoredCompetitorAd[] | readonly Record<string, unknown>[];
  /** Alias for winners */
  ads?: ScoredCompetitorAd[] | readonly Record<string, unknown>[];
  /** Shows skeleton shimmer rows matching the table shape */
  loading?: boolean;
  /** Optional container class name */
  className?: string;
  /** Callback when an ad row is clicked */
  onSelectAd?: (ad: ScoredCompetitorAd) => void;
  /** Custom empty state action */
  onEmptyAction?: () => void;
  /** Custom empty state action label */
  emptyActionLabel?: string;
}

export interface NormalizedRow extends Record<string, unknown> {
  id: string;
  platform: string;
  advertiser: string;
  hook: string;
  score: number;
  runtimeDays: number;
  delta: number;
  raw: Record<string, unknown>;
}

const DEFAULT_WINNERS: ScoredCompetitorAd[] = [
  {
    id: "win-1",
    platform: "meta",
    advertiser: "HexClad Cookware",
    hook: "Gordon Ramsay explains why hybrid stainless steel is the only cookware in his home kitchen.",
    score: 96,
    runtimeDays: 84,
    delta: 24.8,
    tier: "top_performer",
  },
  {
    id: "win-2",
    platform: "tiktok",
    advertiser: "Gymshark",
    hook: "POV: You finally tested the squat-proof leggings with 300lbs on the barbell.",
    score: 93,
    runtimeDays: 52,
    delta: 18.2,
    tier: "viral_winner",
  },
  {
    id: "win-3",
    platform: "meta",
    advertiser: "Athletic Greens",
    hook: "Why 80+ top health researchers take AG1 before their morning coffee.",
    score: 91,
    runtimeDays: 120,
    delta: 14.5,
    tier: "evergreen",
  },
  {
    id: "win-4",
    platform: "youtube",
    advertiser: "Ridge Wallet",
    hook: "Your bulky leather wallet is ruining your posture (and RFID security).",
    score: 88,
    runtimeDays: 68,
    delta: 11.0,
    tier: "scaler",
  },
  {
    id: "win-5",
    platform: "google",
    advertiser: "Huel Nutrition",
    hook: "Complete nutrition in under 60 seconds: 40g plant protein, 27 vitamins, zero prep.",
    score: 85,
    runtimeDays: 45,
    delta: 8.4,
    tier: "consistent",
  },
  {
    id: "win-6",
    platform: "linkedin",
    advertiser: "Linear App",
    hook: "The issue tracking tool software engineering teams actually look forward to opening.",
    score: 82,
    runtimeDays: 38,
    delta: 6.2,
    tier: "niche_winner",
  },
];

function normalizeRow(item: Record<string, unknown>, index: number): NormalizedRow {
  const platform = String(
    item.platform ?? item.channel ?? item.network ?? item.source ?? "meta"
  ).toLowerCase();

  const advertiser = String(
    item.advertiser ??
      item.advertiserName ??
      item.advertiser_name ??
      item.brand ??
      item.company ??
      "Unknown advertiser"
  );

  const hook = String(
    item.hook ??
      item.body ??
      item.headline ??
      item.copy ??
      item.title ??
      item.text ??
      "Proven high-converting hook variation"
  );

  const scoreNum = Number(item.score ?? item.performance_score ?? item.rating ?? 0);
  const score = Number.isFinite(scoreNum) ? scoreNum : 0;

  const runtimeNum = Number(
    item.runtimeDays ??
      item.runtime_days ??
      item.runtime ??
      item.daysActive ??
      item.days_active ??
      item.durationDays ??
      item.duration_days ??
      0
  );
  const runtimeDays = Number.isFinite(runtimeNum) ? runtimeNum : 0;

  const deltaNum = Number(
    item.delta ??
      item.deltaPercent ??
      item.delta_percent ??
      item.change ??
      0
  );
  const delta = Number.isFinite(deltaNum) ? deltaNum : 0;

  const id = String(item.id ?? item.ad_id ?? item.uuid ?? `ad-${platform}-${index}`);

  return {
    id,
    platform,
    advertiser,
    hook,
    score,
    runtimeDays,
    delta,
    raw: item,
  };
}

function formatPlatform(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("meta") || p.includes("facebook") || p.includes("instagram")) return "Meta";
  if (p.includes("tiktok")) return "TikTok";
  if (p.includes("google")) return "Google";
  if (p.includes("youtube")) return "YouTube";
  if (p.includes("linkedin")) return "LinkedIn";
  if (p.includes("twitter") || p === "x") return "X";
  if (p.includes("reddit")) return "Reddit";
  if (p.includes("pinterest")) return "Pinterest";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta.toFixed(1)}%`;
  if (delta < 0) return `${delta.toFixed(1)}%`;
  return "0.0%";
}

function TableSkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} className="border-b border-white/[0.04]">
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-3.5 w-64 max-w-full" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-10" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-5 w-14 rounded-sm" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function WinnersTable({
  winners,
  data,
  items,
  ads,
  loading = false,
  className,
  onSelectAd,
  onEmptyAction,
  emptyActionLabel,
}: WinnersTableProps) {
  const propList = winners ?? data ?? items ?? ads;

  const normalized = React.useMemo<NormalizedRow[]>(() => {
    const raw: readonly Record<string, unknown>[] =
      propList !== undefined
        ? (propList as readonly Record<string, unknown>[])
        : loading
        ? []
        : DEFAULT_WINNERS;

    return raw.map((item, idx) => normalizeRow(item, idx));
  }, [propList, loading]);

  const { sorted, key, dir, toggle } = useTableSort<NormalizedRow>(normalized, {
    key: "score",
    dir: "desc",
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border-subtle bg-bg-surface",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border-subtle bg-white/[0.02]">
            <TableHead
              sortable
              active={key === "platform"}
              dir={dir}
              onSort={() => toggle("platform")}
              className="px-4"
            >
              Platform
            </TableHead>
            <TableHead
              sortable
              active={key === "advertiser"}
              dir={dir}
              onSort={() => toggle("advertiser")}
              className="px-4"
            >
              Advertiser
            </TableHead>
            <TableHead
              sortable
              active={key === "hook"}
              dir={dir}
              onSort={() => toggle("hook")}
              className="px-4"
            >
              Hook
            </TableHead>
            <TableHead
              sortable
              active={key === "score"}
              dir={dir}
              onSort={() => toggle("score")}
              className="px-4"
            >
              Score
            </TableHead>
            <TableHead
              sortable
              active={key === "runtimeDays"}
              dir={dir}
              onSort={() => toggle("runtimeDays")}
              className="px-4"
            >
              Runtime days
            </TableHead>
            <TableHead
              sortable
              active={key === "delta"}
              dir={dir}
              onSort={() => toggle("delta")}
              className="px-4"
            >
              Delta
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeletonRows count={5} />
          ) : sorted.length === 0 ? (
            <TableEmpty colSpan={6} className="py-12">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-muted">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">
                No winning ads found
              </p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-muted">
                Run a discovery scan across Meta, TikTok, and Google ad libraries to
                surface top-performing competitor creative.
              </p>
              {onEmptyAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEmptyAction}
                  className="mt-4"
                >
                  {emptyActionLabel ?? "Run discovery scan"}
                </Button>
              )}
            </TableEmpty>
          ) : (
            sorted.map((row: NormalizedRow) => (
              <TableRow
                key={row.id}
                onClick={onSelectAd ? () => onSelectAd(row.raw) : undefined}
                className={cn(
                  "border-b border-white/[0.04] transition-colors duration-150 ease-out hover:bg-white/[0.04]",
                  onSelectAd && "cursor-pointer"
                )}
              >
                {/* Platform */}
                <TableCell className="whitespace-nowrap px-4 py-3.5 align-middle">
                  <Badge variant="outline" shape="square" className="text-xs">
                    {formatPlatform(row.platform)}
                  </Badge>
                </TableCell>

                {/* Advertiser */}
                <TableCell className="px-4 py-3.5 align-middle">
                  <div className="flex items-center gap-2.5">
                    <div
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-[10px] font-semibold text-zinc-300 uppercase"
                    >
                      {row.advertiser.charAt(0)}
                    </div>
                    <span className="truncate font-medium text-zinc-100">
                      {row.advertiser}
                    </span>
                  </div>
                </TableCell>

                {/* Hook (truncated) */}
                <TableCell className="max-w-[240px] px-4 py-3.5 align-middle sm:max-w-[320px] md:max-w-[400px]">
                  <p
                    title={row.hook}
                    className="truncate text-xs leading-relaxed text-zinc-300 transition-colors hover:text-zinc-100"
                  >
                    “{row.hook}”
                  </p>
                </TableCell>

                {/* Score (tabular-nums) */}
                <TableCell className="whitespace-nowrap px-4 py-3.5 align-middle">
                  <div className="inline-flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        row.score >= 90 ? "text-blue-400" : "text-zinc-100"
                      )}
                    >
                      {Math.round(row.score)}
                    </span>
                    <span className="text-[10px] text-zinc-500">/100</span>
                  </div>
                </TableCell>

                {/* Runtime days */}
                <TableCell className="whitespace-nowrap px-4 py-3.5 align-middle text-sm font-medium tabular-nums text-zinc-300">
                  {row.runtimeDays}d
                </TableCell>

                {/* Delta */}
                <TableCell className="whitespace-nowrap px-4 py-3.5 align-middle">
                  <Badge
                    shape="square"
                    variant={row.delta > 0 ? "up" : row.delta < 0 ? "down" : "neutral"}
                  >
                    {formatDelta(row.delta)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default WinnersTable;
