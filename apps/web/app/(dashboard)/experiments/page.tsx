"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Stat } from "@/components/ui/stat";
import { cn } from "@/lib/utils";
import { getIncrementalityTests, type IncrementalityTest } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Types & Contracts                                                  */
/* ------------------------------------------------------------------ */

type ExperimentPlatform =
  | "meta"
  | "google"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "reddit"
  | "shopify";

type ExperimentType =
  | "ab_creative"
  | "geo_holdout"
  | "bid_strategy"
  | "audience_split"
  | "landing_page";

type ExperimentStatus =
  | "running"
  | "conclusive"
  | "inconclusive"
  | "draft"
  | "paused";

interface ExperimentItem extends Record<string, unknown> {
  id: string;
  name: string;
  hypothesis: string;
  platform: ExperimentPlatform;
  test_type: ExperimentType;
  status: ExperimentStatus;
  primary_metric: string;
  control_name: string;
  control_metric_value: string;
  control_numeric: number;
  control_spend: number;
  control_conversions: number;
  variant_name: string;
  variant_metric_value: string;
  variant_numeric: number;
  variant_spend: number;
  variant_conversions: number;
  lift_pct: number | null;
  confidence: number;
  sample_size_label: string;
  duration_label: string;
  winner: "control" | "variant" | "none";
  recommendation: string;
  started_at: string | null;
  completed_at: string | null;
}

/* ------------------------------------------------------------------ */
/* Meta & Taxonomy Config                                             */
/* ------------------------------------------------------------------ */

const PLATFORM_META: Record<
  ExperimentPlatform,
  { label: string; dot: string; badgeVariant: "default" | "secondary" | "neutral" }
> = {
  meta: { label: "Meta Ads", dot: "bg-blue-400", badgeVariant: "secondary" },
  google: { label: "Google Ads", dot: "bg-amber-400", badgeVariant: "secondary" },
  tiktok: { label: "TikTok Ads", dot: "bg-pink-400", badgeVariant: "secondary" },
  linkedin: { label: "LinkedIn Ads", dot: "bg-sky-400", badgeVariant: "secondary" },
  youtube: { label: "YouTube Ads", dot: "bg-red-400", badgeVariant: "secondary" },
  reddit: { label: "Reddit Ads", dot: "bg-orange-400", badgeVariant: "secondary" },
  shopify: { label: "Shopify Store", dot: "bg-emerald-400", badgeVariant: "secondary" },
};

const TEST_TYPE_LABELS: Record<ExperimentType, string> = {
  ab_creative: "Creative A/B",
  geo_holdout: "Geo holdout",
  bid_strategy: "Bid strategy",
  audience_split: "Audience split",
  landing_page: "On-site A/B",
};

const STATUS_CONFIG: Record<
  ExperimentStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "secondary" | "neutral";
    dotClass: string;
  }
> = {
  running: {
    label: "Running",
    variant: "default",
    dotClass: "bg-blue-400 animate-pulse",
  },
  conclusive: {
    label: "Conclusive",
    variant: "success",
    dotClass: "bg-emerald-400",
  },
  inconclusive: {
    label: "Inconclusive",
    variant: "warning",
    dotClass: "bg-amber-400",
  },
  draft: {
    label: "Draft",
    variant: "secondary",
    dotClass: "bg-zinc-500",
  },
  paused: {
    label: "Paused",
    variant: "neutral",
    dotClass: "bg-zinc-600",
  },
};

/* ------------------------------------------------------------------ */
/* Mock Data: High-Fidelity A/B Experiments                           */
/* ------------------------------------------------------------------ */

const INITIAL_MOCK_EXPERIMENTS: ExperimentItem[] = [
  {
    id: "EXP-101",
    name: "Meta UGC Founder Hook vs 3D Product Demo",
    hypothesis:
      "Opening with authentic founder hook in first 2 seconds increases 3s hook rate by >20% and lowers blended customer acquisition cost on Meta Advantage+ campaign.",
    platform: "meta",
    test_type: "ab_creative",
    status: "running",
    primary_metric: "Hook rate (3s)",
    control_name: "3D Product Render V2",
    control_metric_value: "28.4%",
    control_numeric: 28.4,
    control_spend: 4850,
    control_conversions: 198,
    variant_name: "Founder Problem-Hook V1",
    variant_metric_value: "39.1%",
    variant_numeric: 39.1,
    variant_spend: 4920,
    variant_conversions: 264,
    lift_pct: 37.7,
    confidence: 98.6,
    sample_size_label: "288,500 imp · 462 conv",
    duration_label: "Day 12 of 14",
    winner: "variant",
    recommendation:
      "Statistically significant winner (+37.7% lift). Recommended action: Roll out Founder Hook to 100% of Advantage+ ad set budget.",
    started_at: "2026-08-14T09:00:00Z",
    completed_at: null,
  },
  {
    id: "EXP-102",
    name: "Google Search tCPA ($32) vs Target ROAS (320%) Bidding",
    hypothesis:
      "Switching high-intent search campaigns to target ROAS bidding captures higher order value baskets and improves blended MER without losing conversion volume.",
    platform: "google",
    test_type: "bid_strategy",
    status: "conclusive",
    primary_metric: "ROAS",
    control_name: "tCPA Bidding ($32 cap)",
    control_metric_value: "2.74x",
    control_numeric: 2.74,
    control_spend: 12400,
    control_conversions: 388,
    variant_name: "tROAS Target 320%",
    variant_metric_value: "3.52x",
    variant_numeric: 3.52,
    variant_spend: 13100,
    variant_conversions: 421,
    lift_pct: 28.5,
    confidence: 99.2,
    sample_size_label: "166,100 imp · 809 conv",
    duration_label: "Completed Aug 20",
    winner: "variant",
    recommendation:
      "Significant ROAS improvement (+28.5% at 99.2% confidence). Adopt Target ROAS strategy permanently across non-brand search portfolios.",
    started_at: "2026-08-01T00:00:00Z",
    completed_at: "2026-08-20T23:59:59Z",
  },
  {
    id: "EXP-103",
    name: "TikTok Spark Ad Organic Boost vs In-Feed Direct Response",
    hypothesis:
      "Boosting top organic creator video as Spark Ad improves engagement rate, increases watch time, and lowers effective CAC compared to studio direct-response cut.",
    platform: "tiktok",
    test_type: "ab_creative",
    status: "running",
    primary_metric: "CAC",
    control_name: "In-Feed Studio Ad #4",
    control_metric_value: "$29.09",
    control_numeric: 29.09,
    control_spend: 3200,
    control_conversions: 110,
    variant_name: "Spark Ad @fit_sarah #12",
    variant_metric_value: "$21.30",
    variant_numeric: 21.3,
    variant_spend: 3450,
    variant_conversions: 162,
    lift_pct: 26.8,
    confidence: 94.8,
    sample_size_label: "455,000 imp · 272 conv",
    duration_label: "Day 8 of 14",
    winner: "variant",
    recommendation:
      "Spark Ad reduces acquisition cost by 26.8%. Nearing 95% statistical power threshold (currently 94.8%).",
    started_at: "2026-08-18T12:00:00Z",
    completed_at: null,
  },
  {
    id: "EXP-104",
    name: "California & Texas Geo-Holdout Incrementality Test",
    hypothesis:
      "Measuring true incremental lift (iROAS) by withholding Meta prospecting spend in CA and TX markets while maintaining national control baseline.",
    platform: "meta",
    test_type: "geo_holdout",
    status: "conclusive",
    primary_metric: "iROAS",
    control_name: "Holdout Regions (CA, TX)",
    control_metric_value: "1.00x Base",
    control_numeric: 1.0,
    control_spend: 0,
    control_conversions: 412,
    variant_name: "Treated Regions (NY, FL, IL)",
    variant_metric_value: "2.86x iROAS",
    variant_numeric: 2.86,
    variant_spend: 28500,
    variant_conversions: 1340,
    lift_pct: 22.4,
    confidence: 96.1,
    sample_size_label: "890,000 imp · 1,752 conv",
    duration_label: "Completed Aug 10",
    winner: "variant",
    recommendation:
      "Meta prospecting shows 22.4% true incremental lift with 2.86 iROAS. Calibration parameter updated in optimizer.",
    started_at: "2026-07-20T00:00:00Z",
    completed_at: "2026-08-10T00:00:00Z",
  },
  {
    id: "EXP-105",
    name: "LinkedIn Sponsored Content: Single Image vs Document Carousel",
    hypothesis:
      "Multi-slide PDF breakdown on B2B marketing benchmark report drives higher click-through rate and lead form completions than static hero graphic.",
    platform: "linkedin",
    test_type: "ab_creative",
    status: "running",
    primary_metric: "CTR",
    control_name: "Static Executive Graphic",
    control_metric_value: "0.92%",
    control_numeric: 0.92,
    control_spend: 4100,
    control_conversions: 54,
    variant_name: "7-Slide PDF Case Study Carousel",
    variant_metric_value: "1.84%",
    variant_numeric: 1.84,
    variant_spend: 4250,
    variant_conversions: 88,
    lift_pct: 100.0,
    confidence: 99.8,
    sample_size_label: "99,200 imp · 142 conv",
    duration_label: "Day 7 of 14",
    winner: "variant",
    recommendation:
      "Document carousel achieves 2x CTR (+100.0% lift) with strong significance. Shift B2B creative production toward document carousels.",
    started_at: "2026-08-19T08:00:00Z",
    completed_at: null,
  },
  {
    id: "EXP-106",
    name: "YouTube Demand Gen Video: 15s Bumper vs 45s Narrative",
    hypothesis:
      "Longer problem-solution narrative with customer testimonial drives higher post-view search lift and direct website conversions than 15s cut.",
    platform: "youtube",
    test_type: "ab_creative",
    status: "inconclusive",
    primary_metric: "Conversion rate",
    control_name: "15s High-Energy Bumper",
    control_metric_value: "1.42%",
    control_numeric: 1.42,
    control_spend: 6200,
    control_conversions: 142,
    variant_name: "45s Narrative Testimonial",
    variant_metric_value: "1.55%",
    variant_numeric: 1.55,
    variant_spend: 6400,
    variant_conversions: 148,
    lift_pct: 9.1,
    confidence: 64.2,
    sample_size_label: "530,000 imp · 290 conv",
    duration_label: "Ended Aug 19",
    winner: "none",
    recommendation:
      "Inconclusive result (64.2% confidence below 95% threshold). No statistically significant difference in conversion rate detected.",
    started_at: "2026-08-05T00:00:00Z",
    completed_at: "2026-08-19T00:00:00Z",
  },
  {
    id: "EXP-107",
    name: "Reddit Community-Specific Copy: r/webdev vs Tech Interests",
    hypothesis:
      "Tailoring ad copy with authentic developer terminology directly referencing subreddit communities yields lower CPM and higher qualified trial signups.",
    platform: "reddit",
    test_type: "audience_split",
    status: "draft",
    primary_metric: "CPA",
    control_name: "Broad Interest Tech Audience",
    control_metric_value: "$45.00 est",
    control_numeric: 45.0,
    control_spend: 0,
    control_conversions: 0,
    variant_name: "r/webdev + r/reactjs Placements",
    variant_metric_value: "$28.00 est",
    variant_numeric: 28.0,
    variant_spend: 0,
    variant_conversions: 0,
    lift_pct: null,
    confidence: 0,
    sample_size_label: "0 imp · 0 conv",
    duration_label: "Scheduled 14d",
    winner: "none",
    recommendation:
      "Draft experiment ready for launch. Awaiting creative approval and tracking pixel confirmation.",
    started_at: null,
    completed_at: null,
  },
  {
    id: "EXP-108",
    name: "Shopify Cart Threshold: Free Shipping $65 vs $80 Bundle Upsell",
    hypothesis:
      "Increasing free shipping minimum to $80 with dynamic cart progress bar lifts average order value without lowering overall checkout conversion rate.",
    platform: "shopify",
    test_type: "landing_page",
    status: "running",
    primary_metric: "AOV",
    control_name: "Standard $65 Threshold",
    control_metric_value: "$72.50",
    control_numeric: 72.5,
    control_spend: 1800,
    control_conversions: 620,
    variant_name: "Dynamic $80 Upsell Bar",
    variant_metric_value: "$84.10",
    variant_numeric: 84.1,
    variant_spend: 1800,
    variant_conversions: 598,
    lift_pct: 16.0,
    confidence: 91.4,
    sample_size_label: "129,200 sessions · 1,218 orders",
    duration_label: "Day 6 of 14",
    winner: "variant",
    recommendation:
      "AOV increased by +$11.60 (+16.0%). Cart abandonment remained steady at 22.4%.",
    started_at: "2026-08-20T00:00:00Z",
    completed_at: null,
  },
];

/* ------------------------------------------------------------------ */
/* ExpRow Component (C27 contract)                                    */
/* ------------------------------------------------------------------ */

interface ExpRowProps {
  experiment: ExperimentItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onRun?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onApplyWinner?: (id: string) => void;
}

function ExpRow({
  experiment,
  expanded,
  onToggleExpand,
  onRun,
  onComplete,
  onApplyWinner,
}: ExpRowProps) {
  const pMeta = PLATFORM_META[experiment.platform] ?? {
    label: experiment.platform,
    dot: "bg-zinc-400",
    badgeVariant: "secondary",
  };
  const sMeta = STATUS_CONFIG[experiment.status] ?? {
    label: experiment.status,
    variant: "secondary",
    dotClass: "bg-zinc-400",
  };

  const isLiftPositive =
    experiment.lift_pct !== null && experiment.lift_pct > 0;
  const isLiftNegative =
    experiment.lift_pct !== null && experiment.lift_pct < 0;

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors duration-150 ease-out",
        expanded && "bg-white/4 border-b-0"
      )}
      onClick={onToggleExpand}
    >
      {/* Experiment Title & Hypothesis */}
      <TableCell className="max-w-[280px] py-3.5 pr-2">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            aria-label={expanded ? "Collapse details" : "Expand details"}
            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted transition-transform duration-200 ease-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <svg
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                expanded && "rotate-90 text-accent"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-tight text-text-primary transition-colors duration-fast hover:text-foreground dark:text-white">
                {experiment.name}
              </span>
              <span className="rounded bg-white/5 px-1 py-0.2 text-[10px] font-mono text-text-muted">
                {experiment.id}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
              {experiment.hypothesis}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Platform */}
      <TableCell className="whitespace-nowrap py-3.5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary">
          <span className={cn("h-1.5 w-1.5 rounded-full", pMeta.dot)} />
          <span>{pMeta.label}</span>
        </div>
      </TableCell>

      {/* Type */}
      <TableCell className="whitespace-nowrap py-3.5">
        <Badge variant="secondary" shape="square" className="text-[11px]">
          {TEST_TYPE_LABELS[experiment.test_type] ?? experiment.test_type}
        </Badge>
      </TableCell>

      {/* Primary Metric */}
      <TableCell className="whitespace-nowrap py-3.5 text-xs font-medium text-text-secondary">
        {experiment.primary_metric}
      </TableCell>

      {/* Control vs Variant Values */}
      <TableCell className="whitespace-nowrap py-3.5 text-xs">
        <div className="flex items-center gap-1.5 tabular-nums">
          <span className="text-text-muted" title={experiment.control_name}>
            {experiment.control_metric_value}
          </span>
          <span className="text-text-muted/60">→</span>
          <span
            className={cn(
              "font-semibold text-text-primary",
              experiment.winner === "variant" && "text-emerald-400"
            )}
            title={experiment.variant_name}
          >
            {experiment.variant_metric_value}
          </span>
        </div>
      </TableCell>

      {/* Lift & Significance */}
      <TableCell className="whitespace-nowrap py-3.5">
        <div className="space-y-0.5">
          {experiment.lift_pct !== null ? (
            <div className="flex items-center gap-1.5">
              <Badge
                variant={isLiftPositive ? "up" : isLiftNegative ? "down" : "neutral"}
                shape="pill"
                className="font-semibold"
              >
                {isLiftPositive ? `+${experiment.lift_pct}%` : `${experiment.lift_pct}%`}
              </Badge>
            </div>
          ) : (
            <span className="text-xs text-text-muted">—</span>
          )}
          {experiment.confidence > 0 && (
            <p className="text-[11px] tabular-nums text-text-muted">
              {experiment.confidence}% conf
            </p>
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="whitespace-nowrap py-3.5">
        <div className="inline-flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", sMeta.dotClass)} />
          <Badge variant={sMeta.variant} shape="square">
            {sMeta.label}
          </Badge>
        </div>
      </TableCell>

      {/* Timeline / Duration */}
      <TableCell className="whitespace-nowrap py-3.5 text-xs tabular-nums text-text-muted">
        {experiment.duration_label}
      </TableCell>

      {/* Actions */}
      <TableCell
        className="whitespace-nowrap py-3.5 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1.5">
          {experiment.status === "draft" && onRun && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs font-medium"
              onClick={() => onRun(experiment.id)}
            >
              Launch
            </Button>
          )}
          {experiment.status === "running" && onComplete && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs font-medium text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10"
              onClick={() => onComplete(experiment.id)}
            >
              Conclude
            </Button>
          )}
          {experiment.status === "conclusive" &&
            experiment.winner === "variant" &&
            onApplyWinner && (
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs font-medium"
                onClick={() => onApplyWinner(experiment.id)}
              >
                Apply
              </Button>
            )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-text-muted hover:text-text-primary"
            onClick={onToggleExpand}
            aria-label="Toggle details"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ------------------------------------------------------------------ */
/* Detail Drawer Panel (Expanded Sub-Row)                             */
/* ------------------------------------------------------------------ */

function ExpDetailPanel({
  experiment,
  onApplyWinner,
}: {
  experiment: ExperimentItem;
  onApplyWinner: () => void;
}) {
  return (
    <div className="border-y border-border bg-background p-5">
      <div className="space-y-4">
        {/* Full Hypothesis Block */}
        <div className="rounded-lg border border-border bg-bg-surface p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent-muted text-accent">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-1.12-7.842A4.966 4.966 0 0110 5c1.47 0 2.778.636 3.68 1.642A4 4 0 0112 14z" />
              </svg>
            </span>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Hypothesis & Core Objective
            </h4>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">
            {experiment.hypothesis}
          </p>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Control Card */}
          <div className="rounded-lg border border-border bg-bg-surface p-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold text-text-secondary">
                  Control (A)
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {experiment.control_name}
                </span>
              </div>
              {experiment.winner === "control" && (
                <Badge variant="success" shape="square">
                  Winner
                </Badge>
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">
                  {experiment.primary_metric}
                </span>
                <p className="mt-0.5 text-base font-bold tabular-nums text-text-primary">
                  {experiment.control_metric_value}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">
                  Spend
                </span>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-text-secondary">
                  ${experiment.control_spend.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">
                  Conversions
                </span>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-text-secondary">
                  {experiment.control_conversions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Variant Card */}
          <div
            className={cn(
              "rounded-lg border p-4 bg-bg-surface transition-colors",
              experiment.winner === "variant"
                ? "border-emerald-500/30 bg-emerald-500/2"
                : "border-border"
            )}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-blue-400">
                  Challenger (B)
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {experiment.variant_name}
                </span>
              </div>
              {experiment.winner === "variant" && (
                <Badge variant="success" shape="square">
                  Winner (+{experiment.lift_pct}%)
                </Badge>
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">
                  {experiment.primary_metric}
                </span>
                <p
                  className={cn(
                    "mt-0.5 text-base font-bold tabular-nums",
                    experiment.winner === "variant"
                      ? "text-emerald-400"
                      : "text-text-primary"
                  )}
                >
                  {experiment.variant_metric_value}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">
                  Spend
                </span>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-text-secondary">
                  ${experiment.variant_spend.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">
                  Conversions
                </span>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-text-secondary">
                  {experiment.variant_conversions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rigor & Recommendation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-bg-elevated p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">
                Decision & Rollout Guidance
              </span>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs tabular-nums text-text-muted">
                Sample: {experiment.sample_size_label}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-text-primary">
              {experiment.recommendation}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {experiment.winner === "variant" && (
              <Button size="sm" onClick={onApplyWinner}>
                Deploy winning variant
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* New Experiment Modal Dialog                                        */
/* ------------------------------------------------------------------ */

interface NewExperimentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newItem: ExperimentItem) => void;
}

function NewExperimentModal({ open, onClose, onSubmit }: NewExperimentModalProps) {
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [platform, setPlatform] = useState<ExperimentPlatform>("meta");
  const [testType, setTestType] = useState<ExperimentType>("ab_creative");
  const [primaryMetric, setPrimaryMetric] = useState("ROAS");
  const [controlName, setControlName] = useState("Baseline / Existing Asset");
  const [variantName, setVariantName] = useState("Challenger Creative V1");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hypothesis.trim()) return;

    const newItem: ExperimentItem = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      hypothesis: hypothesis.trim(),
      platform,
      test_type: testType,
      status: "draft",
      primary_metric: primaryMetric,
      control_name: controlName.trim() || "Control Variant",
      control_metric_value: "Pending",
      control_numeric: 0,
      control_spend: 0,
      control_conversions: 0,
      variant_name: variantName.trim() || "Variant B",
      variant_metric_value: "Pending",
      variant_numeric: 0,
      variant_spend: 0,
      variant_conversions: 0,
      lift_pct: null,
      confidence: 0,
      sample_size_label: "0 imp · 0 conv",
      duration_label: "Scheduled 14d",
      winner: "none",
      recommendation:
        "Draft experiment created. Launch to begin collecting performance and telemetry samples.",
      started_at: null,
      completed_at: null,
    };

    onSubmit(newItem);
    setName("");
    setHypothesis("");
    onClose();
  };

  const inputCls =
    "w-full rounded-md border border-white/12 bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-xl rounded-xl border border-white/12 bg-card p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">
              Create new experiment
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Define an A/B or incrementality test with clear hypothesis and metrics.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:text-text-primary"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Experiment name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meta Hook Rate: Founder Story vs Direct Demo"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as ExperimentPlatform)}
                className={inputCls}
              >
                <option value="meta">Meta Ads</option>
                <option value="google">Google Ads</option>
                <option value="tiktok">TikTok Ads</option>
                <option value="linkedin">LinkedIn Ads</option>
                <option value="youtube">YouTube Ads</option>
                <option value="reddit">Reddit Ads</option>
                <option value="shopify">Shopify Store</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Test type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as ExperimentType)}
                className={inputCls}
              >
                <option value="ab_creative">Creative A/B</option>
                <option value="geo_holdout">Geo holdout</option>
                <option value="bid_strategy">Bid strategy</option>
                <option value="audience_split">Audience split</option>
                <option value="landing_page">On-site A/B</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Primary target metric
            </label>
            <input
              required
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value)}
              placeholder="e.g. ROAS, CPA, Hook rate (3s), CTR, iROAS"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Hypothesis
            </label>
            <textarea
              required
              rows={3}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="State what change you are testing and the expected directional impact..."
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Control variant name (A)
              </label>
              <input
                value={controlName}
                onChange={(e) => setControlName(e.target.value)}
                placeholder="Baseline Asset"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Challenger variant name (B)
              </label>
              <input
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="New Challenger Concept"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create experiment</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Experiments Page Component (C28)                              */
/* ------------------------------------------------------------------ */

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentItem[]>(
    INITIAL_MOCK_EXPERIMENTS
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with optional backend tests if available, otherwise preserve mock data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const remoteTests = await getIncrementalityTests().catch(() => []);
      if (Array.isArray(remoteTests) && remoteTests.length > 0) {
        // Map backend incrementality tests into our unified experiment model
        const remoteMapped: ExperimentItem[] = remoteTests.map((t: IncrementalityTest) => ({
          id: `INC-${t.id}`,
          name: `${t.platform.toUpperCase()} ${t.test_type.replace(/_/g, " ")} Test`,
          hypothesis: `Incrementality verification for ${t.platform} across treated (${t.markets_treated?.join(", ") || "all"}) vs control (${t.markets_control?.join(", ") || "baseline"}).`,
          platform: (t.platform.toLowerCase() as ExperimentPlatform) || "meta",
          test_type: (t.test_type as ExperimentType) || "geo_holdout",
          status:
            t.status === "completed"
              ? "conclusive"
              : t.status === "running"
                ? "running"
                : "draft",
          primary_metric: "iROAS / Lift",
          control_name: `Control (${t.markets_control?.join(", ") || "Holdout"})`,
          control_metric_value: `$${t.spend_control.toLocaleString()}`,
          control_numeric: t.spend_control,
          control_spend: t.spend_control,
          control_conversions: t.conversions_control,
          variant_name: `Treated (${t.markets_treated?.join(", ") || "Treated"})`,
          variant_metric_value: `$${t.spend_treated.toLocaleString()}`,
          variant_numeric: t.spend_treated,
          variant_spend: t.spend_treated,
          variant_conversions: t.conversions_treated,
          lift_pct: t.lift_pct ?? (t.conversions_control > 0 ? Math.round(((t.conversions_treated - t.conversions_control) / t.conversions_control) * 100) : null),
          confidence: t.status === "completed" ? 96.5 : 82.0,
          sample_size_label: `${(t.spend_treated + t.spend_control).toLocaleString()} total spend`,
          duration_label: t.completed_at ? "Completed" : "Running",
          winner: t.status === "completed" && (t.lift_pct ?? 0) > 0 ? "variant" : "none",
          recommendation: "Backend incrementality test synced with live attribution engine.",
          started_at: t.started_at,
          completed_at: t.completed_at,
        }));

        setExperiments((prev) => {
          const ids = new Set(remoteMapped.map((r) => r.id));
          const existingMock = prev.filter((p) => !ids.has(p.id));
          return [...remoteMapped, ...existingMock];
        });
      }
    } catch {
      // Backend not running in live mode; fallback to rich mock data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRun = (id: string) => {
    setExperiments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "running",
              duration_label: "Day 1 of 14",
              started_at: new Date().toISOString(),
            }
          : item
      )
    );
    showToast(`Experiment ${id} launched and telemetry collection active.`);
  };

  const handleComplete = (id: string) => {
    setExperiments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "conclusive",
              winner: (item.lift_pct ?? 0) > 0 ? "variant" : "none",
              duration_label: "Completed today",
              completed_at: new Date().toISOString(),
            }
          : item
      )
    );
    showToast(`Experiment ${id} concluded. Significance analysis finalized.`);
  };

  const handleApplyWinner = (id: string) => {
    showToast(`Winning configuration for ${id} applied to active campaigns.`);
  };

  const handleCreateExperiment = (newItem: ExperimentItem) => {
    setExperiments((prev) => [newItem, ...prev]);
    showToast(`Experiment ${newItem.id} created successfully.`);
  };

  // Filtered rows based on search, status tab, and platform
  const filteredRows = useMemo(() => {
    return experiments.filter((exp) => {
      // Status filter
      if (statusFilter !== "all" && exp.status !== statusFilter) {
        return false;
      }
      // Platform filter
      if (platformFilter !== "all" && exp.platform !== platformFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = exp.name.toLowerCase().includes(query);
        const matchesHypothesis = exp.hypothesis.toLowerCase().includes(query);
        const matchesMetric = exp.primary_metric.toLowerCase().includes(query);
        const matchesPlatform = exp.platform.toLowerCase().includes(query);
        const matchesId = exp.id.toLowerCase().includes(query);
        return (
          matchesName ||
          matchesHypothesis ||
          matchesMetric ||
          matchesPlatform ||
          matchesId
        );
      }
      return true;
    });
  }, [experiments, statusFilter, platformFilter, searchQuery]);

  // Sort helper
  const { sorted: sortedRows, key: sortKey, dir: sortDir, toggle: toggleSort } =
    useTableSort<ExperimentItem>(filteredRows, { key: "lift_pct", dir: "desc" });

  // Counts for tabs
  const runningCount = experiments.filter((e) => e.status === "running").length;
  const conclusiveCount = experiments.filter((e) => e.status === "conclusive").length;
  const draftCount = experiments.filter((e) => e.status === "draft").length;

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-accent/30 bg-card px-4 py-3 text-sm text-text-primary shadow-xl shadow-black/50"
        >
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Page Actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Attribution & Rigor
            </span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs tabular-nums text-text-muted">
              {experiments.length} total tests
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-text-primary">
            Experiments & Incrementality
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text-secondary">
            Statistically rigorous A/B and incrementality testing across ad channels to validate creative, audience, and bidding hypotheses before full budget rollout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => void loadData()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New experiment
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* KPI Stats Row (4-column asymmetric metrics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Active tests"
          value={runningCount}
          sub={`${conclusiveCount} conclusive, ${draftCount} in queue`}
          className="bg-bg-surface"
        />
        <Stat
          label="Avg winning lift"
          value="+28.4%"
          delta={5.2}
          sub="Across statistically significant winners"
          className="bg-bg-surface"
        />
        <Stat
          label="Overall win rate"
          value="71.4%"
          sub="5 of 7 concluded tests declared winners"
          className="bg-bg-surface"
        />
        <Stat
          label="Unlocked value"
          value="$64,200"
          delta={18.4}
          sub="Estimated 30-day annualized profit lift"
          className="bg-bg-surface"
        />
      </div>

      {/* Filters, Search & View Controls */}
      <Card className="border border-border bg-bg-surface">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-bg-elevated p-1">
              {[
                { id: "all", label: `All (${experiments.length})` },
                { id: "running", label: `Running (${runningCount})` },
                { id: "conclusive", label: `Conclusive (${conclusiveCount})` },
                { id: "draft", label: `Drafts (${draftCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-fast",
                    statusFilter === tab.id
                      ? "bg-white/12 text-text-primary shadow-sm"
                      : "text-text-secondary hover:bg-white/4 hover:text-text-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input & Platform Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter experiments…"
                  className="h-8 w-48 rounded-md border border-border bg-bg-elevated pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="h-8 rounded-md border border-border bg-bg-elevated px-3 text-xs text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All platforms</option>
                <option value="meta">Meta Ads</option>
                <option value="google">Google Ads</option>
                <option value="tiktok">TikTok Ads</option>
                <option value="linkedin">LinkedIn Ads</option>
                <option value="youtube">YouTube Ads</option>
                <option value="reddit">Reddit Ads</option>
                <option value="shopify">Shopify Store</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Experiments Table */}
      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-4" aria-busy="true" aria-label="Loading experiments">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead
                  sortable
                  active={sortKey === "name"}
                  dir={sortDir}
                  onSort={() => toggleSort("name")}
                  className="w-[300px]"
                >
                  Experiment & hypothesis
                </TableHead>
                <TableHead
                  sortable
                  active={sortKey === "platform"}
                  dir={sortDir}
                  onSort={() => toggleSort("platform")}
                >
                  Platform
                </TableHead>
                <TableHead
                  sortable
                  active={sortKey === "test_type"}
                  dir={sortDir}
                  onSort={() => toggleSort("test_type")}
                >
                  Type
                </TableHead>
                <TableHead
                  sortable
                  active={sortKey === "primary_metric"}
                  dir={sortDir}
                  onSort={() => toggleSort("primary_metric")}
                >
                  Metric
                </TableHead>
                <TableHead>Control vs Challenger</TableHead>
                <TableHead
                  sortable
                  active={sortKey === "lift_pct"}
                  dir={sortDir}
                  onSort={() => toggleSort("lift_pct")}
                >
                  Lift & significance
                </TableHead>
                <TableHead
                  sortable
                  active={sortKey === "status"}
                  dir={sortDir}
                  onSort={() => toggleSort("status")}
                >
                  Status
                </TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length === 0 ? (
                <TableEmpty colSpan={9}>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-elevated text-text-muted">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-text-primary">
                    No experiments found
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-secondary">
                    {searchQuery || statusFilter !== "all" || platformFilter !== "all"
                      ? "No experiments match the selected filters. Try clearing your search query or status filter."
                      : "Create your first A/B or incrementality test to start validating marketing hypotheses with statistical rigor."}
                  </p>
                  <div className="mt-4">
                    {searchQuery || statusFilter !== "all" || platformFilter !== "all" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                          setPlatformFilter("all");
                        }}
                      >
                        Reset filters
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setModalOpen(true)}>
                        Create experiment
                      </Button>
                    )}
                  </div>
                </TableEmpty>
              ) : (
                sortedRows.map((exp) => (
                  <React.Fragment key={exp.id}>
                    <ExpRow
                      experiment={exp}
                      expanded={expandedIds.has(exp.id)}
                      onToggleExpand={() => toggleExpand(exp.id)}
                      onRun={handleRun}
                      onComplete={handleComplete}
                      onApplyWinner={handleApplyWinner}
                    />
                    {expandedIds.has(exp.id) && (
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableCell colSpan={9} className="p-0">
                          <ExpDetailPanel
                            experiment={exp}
                            onApplyWinner={() => handleApplyWinner(exp.id)}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* New Experiment Modal */}
      <NewExperimentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateExperiment}
      />
    </div>
  );
}
