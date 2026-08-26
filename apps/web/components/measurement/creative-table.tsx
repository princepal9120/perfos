"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const PLATFORM_LABELS: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  shopify: "Shopify",
  tiktok: "TikTok Ads",
  linkedin: "LinkedIn Ads",
  pinterest: "Pinterest Ads",
  snapchat: "Snapchat Ads",
  amazon: "Amazon Ads",
  reddit: "Reddit Ads",
  twitter: "Twitter Ads",
  youtube: "YouTube Ads",
  amazon_ads: "Amazon DSP",
  x_ads: "X Ads",
};

export type CreativeStatus =
  | "active"
  | "paused"
  | "fatigued"
  | "testing"
  | "winning"
  | "scaling"
  | "learning"
  | "stopped"
  | "archived"
  | (string & {});

export interface CreativeRow {
  id?: string | number;
  creative_id?: string;
  name?: string;
  platform: string;
  roas?: number;
  spend: number;
  status?: CreativeStatus;
  impressions?: number;
  conversions?: number;
  fatigue_score?: number;
  hook_rate?: number;
  media_type?: string;
  thumbnail_url?: string;
}

export type Creative = CreativeRow;
export type CreativeItem = CreativeRow;

export interface CreativeTableProps {
  /** Creatives list to display */
  creatives?: CreativeRow[];
  /** Alias for creatives for backwards compatibility */
  rows?: CreativeRow[];
  /** Loading state flag */
  loading?: boolean;
  /** Optional error message */
  error?: string | null;
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
  /** Optional wrapper class name */
  className?: string;
  /** Optional row click handler */
  onCreativeClick?: (creative: CreativeRow) => void;
}

function formatPlatform(platform: string): string {
  const key = platform?.toLowerCase().trim() ?? "";
  return PLATFORM_LABELS[key] ?? platform;
}

function formatUsd(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "$0";
  return `$${Math.round(amount).toLocaleString()}`;
}

function formatStatus(status?: string, fatigueScore?: number) {
  if (status) {
    const s = status.toLowerCase().trim();
    if (s === "active" || s === "scaling" || s === "winning") {
      return (
        <Badge variant="success" shape="square">
          {s === "winning" ? "Winning" : s === "scaling" ? "Scaling" : "Active"}
        </Badge>
      );
    }
    if (s === "warning" || s === "fatigued" || s === "learning") {
      return (
        <Badge variant="warning" shape="square">
          {s === "fatigued" ? "Fatigued" : s === "learning" ? "Learning" : "Warning"}
        </Badge>
      );
    }
    if (s === "paused" || s === "killed" || s === "stopped") {
      return (
        <Badge variant="secondary" shape="square">
          {s === "killed" ? "Killed" : s === "stopped" ? "Stopped" : "Paused"}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" shape="square">
        {status}
      </Badge>
    );
  }

  if (typeof fatigueScore === "number") {
    if (fatigueScore >= 70) {
      return (
        <Badge variant="destructive" shape="square">
          Fatigued
        </Badge>
      );
    }
    if (fatigueScore >= 40) {
      return (
        <Badge variant="warning" shape="square">
          Fatigue risk
        </Badge>
      );
    }
    return (
      <Badge variant="success" shape="square">
        Fresh
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" shape="square">
      Active
    </Badge>
  );
}

export function CreativeTable({
  creatives,
  rows,
  loading = false,
  error = null,
  title = "Creative performance",
  description = "Cross-channel ad creatives ranked by spend, return on ad spend, and creative status.",
  className,
  onCreativeClick,
}: CreativeTableProps) {
  const normalizedRows = React.useMemo(() => {
    const data = creatives ?? rows ?? [];
    return data.map((r, index) => {
      const spend = typeof r.spend === "number" ? r.spend : 0;
      const conversions = typeof r.conversions === "number" ? r.conversions : 0;
      const roas =
        typeof r.roas === "number"
          ? r.roas
          : spend > 0 && conversions > 0
          ? (conversions * 45) / spend
          : 0;

      return {
        id: String(r.id ?? r.creative_id ?? `creative-${index}`),
        creative_id: r.creative_id,
        name: r.name ?? r.creative_id ?? `Creative #${index + 1}`,
        platform: r.platform || "other",
        spend,
        roas,
        impressions: typeof r.impressions === "number" ? r.impressions : 0,
        conversions,
        fatigue_score: typeof r.fatigue_score === "number" ? r.fatigue_score : 0,
        hook_rate: typeof r.hook_rate === "number" ? r.hook_rate : 0,
        status: r.status ?? "active",
        media_type: r.media_type,
        raw: r,
      };
    });
  }, [creatives, rows]);

  const { sorted, key, dir, toggle } = useTableSort(normalizedRows, {
    key: "spend",
    dir: "desc",
  });

  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="font-display text-base text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="pt-1 text-xs text-muted-foreground">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="p-4">
            <p className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-white/1">
              <TableHead
                sortable
                active={key === "name"}
                dir={dir}
                onSort={() => toggle("name")}
              >
                Creative
              </TableHead>
              <TableHead
                sortable
                active={key === "platform"}
                dir={dir}
                onSort={() => toggle("platform")}
              >
                Platform
              </TableHead>
              <TableHead
                className="text-right"
                sortable
                active={key === "spend"}
                dir={dir}
                onSort={() => toggle("spend")}
              >
                Spend
              </TableHead>
              <TableHead
                className="text-right"
                sortable
                active={key === "roas"}
                dir={dir}
                onSort={() => toggle("roas")}
              >
                ROAS
              </TableHead>
              <TableHead
                className="text-right"
                sortable
                active={key === "status"}
                dir={dir}
                onSort={() => toggle("status")}
              >
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [0, 1, 2, 3, 4].map((i) => (
                <TableRow key={i} className="border-b border-white/4">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-36" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-12" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-5 w-16 rounded-sm" />
                  </TableCell>
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableEmpty colSpan={5}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/3 text-muted-foreground">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    <circle cx="9" cy="9" r="2" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  No creatives found
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Creative metrics sync automatically once ad channels are linked and active.
                </p>
              </TableEmpty>
            ) : (
              sorted.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onCreativeClick?.(row.raw)}
                  className={cn(
                    "border-b border-white/4 transition-colors duration-150 ease-out hover:bg-white/3",
                    onCreativeClick && "cursor-pointer"
                  )}
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-white/3 text-muted-foreground">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polygon points="6 3 20 12 6 21 6 3" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate max-w-[240px] text-xs font-medium text-foreground">
                          {row.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
                          {row.creative_id && (
                            <span className="font-mono">{row.creative_id}</span>
                          )}
                          {row.creative_id && row.conversions > 0 && (
                            <span aria-hidden="true">&bull;</span>
                          )}
                          {row.conversions > 0 && (
                            <span>{row.conversions.toLocaleString()} conv.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" shape="square">
                      {formatPlatform(row.platform)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums text-foreground">
                    {formatUsd(row.spend)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span
                      className={cn(
                        "font-semibold",
                        row.roas >= 3.0
                          ? "text-emerald-400"
                          : row.roas >= 1.8
                          ? "text-blue-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {row.roas > 0 ? `${row.roas.toFixed(2)}x` : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatStatus(row.status, row.fatigue_score)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default CreativeTable;
