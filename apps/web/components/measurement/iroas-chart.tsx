"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  facebook: "Meta Ads",
  instagram: "Instagram Ads",
  bing: "Microsoft Advertising",
  microsoft: "Microsoft Advertising",
};

export interface IroasDataPoint {
  platform: string;
  iroas: number;
  reported_roas?: number;
  calibration?: number;
}

export type IroasChartItem = IroasDataPoint;

export interface IroasChartProps {
  data?: IroasDataPoint[];
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
  title?: string;
  description?: string;
}

function formatPlatform(platform: string): string {
  const key = platform.toLowerCase().trim();
  if (PLATFORM_LABELS[key]) return PLATFORM_LABELS[key];
  return platform
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function ChartSkeleton() {
  return (
    <div className="space-y-4 py-1" aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 pb-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5 rounded-lg border border-white/4 bg-white/1.5 p-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2 rounded-lg border border-white/4 bg-white/1.5 p-3.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyChartState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white/3 text-muted-foreground">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      </div>
      <h4 className="mt-3 text-sm font-semibold text-foreground">No calibration data</h4>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Run incrementality tests or connect conversion webhooks to calculate calibrated incremental ROAS.
      </p>
      {onRefresh && (
        <Button size="sm" variant="outline" className="mt-4" onClick={onRefresh}>
          Refresh data
        </Button>
      )}
    </div>
  );
}

export function IroasChart({
  data = [],
  loading = false,
  onRefresh,
  className,
  title = "Incremental ROAS by platform",
  description = "Incrementality-adjusted return on ad spend versus reported in-platform metrics.",
}: IroasChartProps) {
  const safeData = React.useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const maxIroas = React.useMemo(() => {
    if (!safeData.length) return 4;
    const peak = Math.max(
      ...safeData.map((d) => {
        const iroasVal = typeof d.iroas === "number" && !isNaN(d.iroas) ? d.iroas : 0;
        const reportedVal =
          typeof d.reported_roas === "number" && !isNaN(d.reported_roas) ? d.reported_roas : iroasVal;
        return Math.max(iroasVal, reportedVal);
      }),
      1
    );
    return Math.max(peak * 1.15, 2);
  }, [safeData]);

  const sorted = React.useMemo(() => {
    return [...safeData].sort((a, b) => (b.iroas || 0) - (a.iroas || 0));
  }, [safeData]);

  const topChannel = sorted[0];
  const avgIroas =
    sorted.length > 0
      ? sorted.reduce((acc, curr) => acc + (curr.iroas || 0), 0) / sorted.length
      : 0;

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
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <ChartSkeleton />
        ) : sorted.length === 0 ? (
          <EmptyChartState onRefresh={onRefresh} />
        ) : (
          <>
            {/* Quick KPI Overview */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-white/2 p-3">
                <span className="text-[11px] font-medium text-muted-foreground">Top performer</span>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {topChannel ? formatPlatform(topChannel.platform) : "—"}
                </p>
                {topChannel && (
                  <span className="text-xs font-semibold tabular-nums text-blue-400">
                    {topChannel.iroas.toFixed(2)}x iROAS
                  </span>
                )}
              </div>
              <div className="rounded-lg border border-border bg-white/2 p-3">
                <span className="text-[11px] font-medium text-muted-foreground">Average iROAS</span>
                <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                  {avgIroas.toFixed(2)}x
                </p>
                <span className="text-[11px] text-muted-foreground">Across {sorted.length} channels</span>
              </div>
              <div className="col-span-2 rounded-lg border border-border bg-white/2 p-3 sm:col-span-1">
                <span className="text-[11px] font-medium text-muted-foreground">Active channels</span>
                <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                  {sorted.length}
                </p>
                <span className="text-[11px] text-muted-foreground">Calibrated via holdouts</span>
              </div>
            </div>

            {/* Horizontal Bar Chart List */}
            <div className="space-y-2.5 pt-1">
              {sorted.map((item) => {
                const iroasVal = typeof item.iroas === "number" && !isNaN(item.iroas) ? item.iroas : 0;
                const reportedVal =
                  typeof item.reported_roas === "number" && !isNaN(item.reported_roas)
                    ? item.reported_roas
                    : null;

                const iroasPct = Math.min(Math.max((iroasVal / maxIroas) * 100, 4), 100);
                const reportedPct =
                  reportedVal !== null
                    ? Math.min(Math.max((reportedVal / maxIroas) * 100, 4), 100)
                    : null;

                const calibrationPct =
                  item.calibration !== undefined && !isNaN(item.calibration)
                    ? Math.round(item.calibration * 100)
                    : reportedVal && reportedVal > 0
                    ? Math.round((iroasVal / reportedVal) * 100)
                    : null;

                return (
                  <div
                    key={item.platform}
                    className="group rounded-lg border border-white/4 bg-white/1.5 p-3.5 transition-colors duration-150 ease-out hover:border-border hover:bg-white/3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground transition-colors group-hover:text-foreground dark:text-white">
                          {formatPlatform(item.platform)}
                        </span>
                        {calibrationPct !== null && (
                          <Badge
                            variant={
                              calibrationPct >= 80
                                ? "success"
                                : calibrationPct >= 50
                                ? "warning"
                                : "destructive"
                            }
                            shape="square"
                          >
                            {calibrationPct}% calibration
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {reportedVal !== null && (
                          <span className="text-muted-foreground">
                            Reported:{" "}
                            <span className="tabular-nums text-zinc-300">
                              {reportedVal.toFixed(2)}x
                            </span>
                          </span>
                        )}
                        <span className="font-semibold text-foreground">
                          iROAS:{" "}
                          <span className="tabular-nums text-blue-400">
                            {iroasVal.toFixed(2)}x
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {/* Reported ROAS ghost bar */}
                      {reportedPct !== null && (
                        <div className="flex items-center gap-2">
                          <span className="w-16 shrink-0 text-[10px] text-muted-foreground">
                            Reported
                          </span>
                          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/4">
                            <div
                              className="h-full rounded-full bg-zinc-600 transition-all duration-300 ease-out"
                              style={{ width: `${reportedPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Calibrated iROAS horizontal bar (primary accent blue-500) */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-[10px] font-medium text-muted-foreground">
                          iROAS
                        </span>
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/6">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out hover:bg-blue-400"
                            style={{ width: `${iroasPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Chart Scale Reference */}
              <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                <span className="tabular-nums">0.00x</span>
                <span className="tabular-nums">{(maxIroas / 2).toFixed(2)}x</span>
                <span className="tabular-nums">{maxIroas.toFixed(2)}x max</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default IroasChart;
