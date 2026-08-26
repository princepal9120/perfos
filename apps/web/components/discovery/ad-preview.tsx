"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type AdPlatform = "meta" | "tiktok" | "google" | "linkedin" | "x" | "reddit" | string;
export type WinnerTier = "high_conf" | "winner" | "emerging" | "loser" | string;
export type MediaType = "video" | "image" | "carousel" | string;

export interface SpendRange {
  min?: number;
  max?: number;
  currency?: string;
  formatted?: string;
}

export interface WinningAd {
  id?: string | number;
  platform: AdPlatform;
  advertiser?: string | null;
  headline?: string | null;
  body?: string | null;
  score?: number | null;
  tier?: WinnerTier | null;
  estimatedSpend?: SpendRange | string | null;
  spendMin?: number | null;
  spendMax?: number | null;
  spendRange?: string | null;
  runtimeDays?: number | null;
  daysRunning?: number | null;
  mediaType?: MediaType | null;
  thumbnailUrl?: string | null;
  ctaText?: string | null;
  hook?: string | null;
  angle?: string | null;
  firstSeen?: string | null;
  lastSeen?: string | null;
  countries?: string[] | null;
  landingUrl?: string | null;
  bookmarked?: boolean;
}

export interface AdPreviewProps {
  ad?: WinningAd | null;
  onClone?: (ad: WinningAd) => void;
  onBookmark?: (ad: WinningAd) => void;
  onSaveToBoard?: (ad: WinningAd) => void;
  onViewDetails?: (ad: WinningAd) => void;
  isBookmarked?: boolean;
  className?: string;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `$${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    return `$${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}k`;
  }
  return `$${amount.toLocaleString()}`;
}

function getSpendDisplay(ad: WinningAd): string {
  if (typeof ad.spendRange === "string" && ad.spendRange.trim()) {
    return ad.spendRange;
  }
  if (typeof ad.estimatedSpend === "string" && ad.estimatedSpend.trim()) {
    return ad.estimatedSpend;
  }
  if (ad.estimatedSpend && typeof ad.estimatedSpend === "object") {
    if (ad.estimatedSpend.formatted) return ad.estimatedSpend.formatted;
    if (typeof ad.estimatedSpend.min === "number" && typeof ad.estimatedSpend.max === "number") {
      return `${formatCurrency(ad.estimatedSpend.min)} – ${formatCurrency(ad.estimatedSpend.max)}`;
    }
    if (typeof ad.estimatedSpend.min === "number") {
      return `>${formatCurrency(ad.estimatedSpend.min)}`;
    }
  }
  if (typeof ad.spendMin === "number" && typeof ad.spendMax === "number") {
    return `${formatCurrency(ad.spendMin)} – ${formatCurrency(ad.spendMax)}`;
  }
  if (typeof ad.spendMin === "number") {
    return `>${formatCurrency(ad.spendMin)}`;
  }
  return "$2.5k – $12k";
}

function getScoreMeta(score?: number | null, tier?: string | null): {
  badgeVariant: "success" | "default" | "warning" | "destructive" | "secondary";
  label: string;
} {
  const normalizedTier = tier?.toLowerCase();
  const num = typeof score === "number" ? Math.round(score) : null;

  if (normalizedTier === "high_conf" || (num !== null && num >= 75)) {
    return { badgeVariant: "success", label: "High confidence" };
  }
  if (normalizedTier === "winner" || (num !== null && num >= 60)) {
    return { badgeVariant: "default", label: "Proven winner" };
  }
  if (normalizedTier === "emerging" || (num !== null && num >= 45)) {
    return { badgeVariant: "warning", label: "Emerging" };
  }
  if (normalizedTier === "loser" || (num !== null && num < 45)) {
    return { badgeVariant: "destructive", label: "Low signal" };
  }
  return { badgeVariant: "secondary", label: "Unscored" };
}

function getPlatformLabel(platform: string): string {
  const p = platform.toLowerCase();
  switch (p) {
    case "meta":
    case "facebook":
    case "instagram":
      return "Meta";
    case "tiktok":
      return "TikTok";
    case "google":
    case "youtube":
      return "Google";
    case "linkedin":
      return "LinkedIn";
    case "x":
    case "twitter":
      return "X";
    case "reddit":
      return "Reddit";
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
}

/**
 * Single winning ad preview card: platform badge, advertiser, headline/body,
 * score chip, longevity, estimated spend range, and clone action.
 */
export function AdPreview({
  ad,
  onClone,
  onBookmark,
  onSaveToBoard,
  onViewDetails,
  isBookmarked: controlledBookmarked,
  className,
}: AdPreviewProps) {
  const [internalBookmarked, setInternalBookmarked] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  if (!ad) {
    return <AdPreviewEmpty className={className} />;
  }

  const isBookmarked = controlledBookmarked ?? ad.bookmarked ?? internalBookmarked;
  const runtime = ad.runtimeDays ?? ad.daysRunning ?? null;
  const scoreMeta = getScoreMeta(ad.score, ad.tier);
  const spendDisplay = getSpendDisplay(ad);
  const platformLabel = getPlatformLabel(ad.platform);
  const advertiserName = ad.advertiser || "Verified competitor";
  const headlineText = ad.headline || null;
  const bodyText = ad.body || "No ad copy captured for this creative.";
  const ctaLabel = ad.ctaText || "Learn more";
  const mediaType = (ad.mediaType || "video").toLowerCase();

  const handleBookmarkToggle = () => {
    setInternalBookmarked(!isBookmarked);
    onBookmark?.(ad);
  };

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border border-white/[0.08] bg-[#111114] shadow-sm transition-[border-color,box-shadow,background-color] duration-150 ease-out hover:border-white/[0.16] hover:bg-[#141418] focus-within:border-border-hover focus-within:ring-2 focus-within:ring-blue-500/40",
        className
      )}
    >
      <div>
        {/* Top Header Bar */}
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Badge variant="outline" className="text-zinc-200 border-white/10 bg-white/[0.03]">
                {platformLabel}
              </Badge>
              {runtime !== null && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium tabular-nums text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {runtime}d active
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {typeof ad.score === "number" && (
                <Badge variant={scoreMeta.badgeVariant} className="tabular-nums font-semibold">
                  {Math.round(ad.score)} · {scoreMeta.label}
                </Badge>
              )}
              <button
                type="button"
                onClick={handleBookmarkToggle}
                aria-label={isBookmarked ? "Remove bookmark" : "Save ad to swipe file"}
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-md border text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                  isBookmarked
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-100"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={isBookmarked ? "0" : "1.5"}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between gap-2">
            <h4 className="truncate font-display text-sm font-semibold tracking-tight text-zinc-100">
              {advertiserName}
            </h4>
            {ad.countries && ad.countries.length > 0 && (
              <span className="shrink-0 text-[11px] font-mono text-zinc-500 uppercase">
                {ad.countries.slice(0, 3).join(", ")}
              </span>
            )}
          </div>
        </CardHeader>

        {/* Media / Creative Stage */}
        <div className="relative mx-4 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0c0c0f]">
          {ad.thumbnailUrl ? (
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.thumbnailUrl}
                alt={`Ad creative from ${advertiserName}`}
                className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 shadow-inner">
                {mediaType === "video" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                )}
              </div>
              <span className="mt-2 text-[11px] font-medium capitalize text-zinc-400">
                {mediaType} creative DNA
              </span>
            </div>
          )}

          {/* Overlaid Hook/Angle Pill */}
          {(ad.hook || ad.angle) && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5">
              {ad.hook && (
                <span className="inline-flex items-center rounded border border-white/10 bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-200 backdrop-blur-md">
                  Hook: {ad.hook}
                </span>
              )}
              {ad.angle && (
                <span className="inline-flex items-center rounded border border-blue-500/20 bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-medium text-blue-300 backdrop-blur-md">
                  Angle: {ad.angle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Copy & Content */}
        <CardContent className="p-4 pt-3.5 space-y-2.5">
          {headlineText && (
            <h5 className="font-display text-xs font-semibold leading-snug text-zinc-100">
              {headlineText}
            </h5>
          )}

          <div className="space-y-1">
            <p
              className={cn(
                "text-xs leading-relaxed text-zinc-300 transition-all",
                !expanded && "line-clamp-3"
              )}
            >
              {bodyText}
            </p>
            {bodyText.length > 140 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                {expanded ? "Show less" : "Show full copy"}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            <span className="text-[11px] text-zinc-500">CTA button</span>
            <span className="inline-flex items-center rounded border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[11px] font-medium text-zinc-300">
              {ctaLabel}
            </span>
          </div>
        </CardContent>
      </div>

      {/* Spend & Action Footer */}
      <CardFooter className="flex flex-col gap-3 border-t border-white/[0.08] bg-white/[0.01] p-4 pt-3">
        <div className="flex w-full items-center justify-between text-xs">
          <span className="text-zinc-400">Est. ad spend</span>
          <span className="font-medium text-zinc-200 tabular-nums">{spendDisplay}</span>
        </div>

        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (onSaveToBoard ? onSaveToBoard(ad) : onViewDetails?.(ad))}
            className="w-full text-xs"
          >
            Save to board
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onClone?.(ad)}
            className="w-full text-xs bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700"
          >
            Clone in Studio
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

/** Skeleton layout matching AdPreview */
export function AdPreviewSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col justify-between border border-white/[0.08] bg-[#111114] p-4", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-3 w-4/5" />
        <SkeletonText lines={2} />
      </div>
      <div className="mt-4 space-y-2 border-t border-white/[0.08] pt-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

/** Composed empty state when no ad is selected */
export function AdPreviewEmpty({
  onSelectAction,
  className,
}: {
  onSelectAction?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col items-center justify-center border border-dashed border-white/[0.08] bg-[#111114] p-8 text-center", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-zinc-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
      <h4 className="mt-3 font-display text-sm font-semibold tracking-tight text-zinc-100">
        No winning ad selected
      </h4>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-400">
        Select an ad from discovery or the swipe file table to preview its creative DNA, longevity, and spend.
      </p>
      {onSelectAction && (
        <Button variant="outline" size="sm" onClick={onSelectAction} className="mt-4 text-xs">
          Browse winners
        </Button>
      )}
    </Card>
  );
}
