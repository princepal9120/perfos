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

  tiktok: "TikTok Ads",
  linkedin: "LinkedIn Ads",
  reddit: "Reddit Ads",
  x_ads: "X Ads",
};

export interface AnomalyItem {
  id?: string | number;
  platform: string;
  metric: string;
  severity: "low" | "moderate" | "medium" | "high" | "critical" | string;
  detected_at: string;
  detail: string;
}

export interface AnomalyListProps {
  items: AnomalyItem[];
  loading?: boolean;
  onDismiss?: (id: string | number) => void;
  className?: string;
}

function formatPlatform(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
}

function getSeverityBadge(severity: string) {
  const s = severity.toLowerCase();
  if (s === "high" || s === "critical") {
    return (
      <Badge variant="destructive" shape="square">
        High severity
      </Badge>
    );
  }
  if (s === "moderate" || s === "medium" || s === "warning") {
    return (
      <Badge variant="warning" shape="square">
        Moderate
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" shape="square">
      Low
    </Badge>
  );
}

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function AnomalySkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border border-white/4 bg-white/1.5 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-full max-w-[85%]" />
        </div>
      ))}
    </div>
  );
}

function EmptyAnomalyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <h4 className="mt-3 text-sm font-semibold text-zinc-100">Tracking integrity clean</h4>
      <p className="mt-1 max-w-sm text-xs text-zinc-400">
        No active anomalies detected across channels. Platform attribution reconciles within expected bounds.
      </p>
    </div>
  );
}

export function AnomalyList({ items, loading, onDismiss, className }: AnomalyListProps) {
  return (
    <Card className={cn("border-white/8 bg-[#111114]", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="font-display text-base text-zinc-100">
              Attribution & spend anomalies
            </CardTitle>
            {items.length > 0 && (
              <Badge variant="warning" shape="pill">
                {items.length} active
              </Badge>
            )}
          </div>
          <CardDescription className="pt-1 text-xs text-zinc-400">
            Automated alerts for attribution spikes, tracking drop-offs, and platform over-reporting.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <AnomalySkeleton />
        ) : items.length === 0 ? (
          <EmptyAnomalyState />
        ) : (
          <div className="divide-y divide-white/4">
            {items.map((item, index) => {
              const itemId = item.id ?? `${item.platform}-${item.metric}-${index}`;
              return (
                <div
                  key={itemId}
                  className="group flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 transition-colors duration-150 ease-out"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" shape="square">
                        {formatPlatform(item.platform)}
                      </Badge>
                      {getSeverityBadge(item.severity)}
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                        {item.metric.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] tabular-nums text-zinc-500">
                        {formatTimestamp(item.detected_at)}
                      </span>
                      {onDismiss && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-300"
                          onClick={() => onDismiss(itemId)}
                        >
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AnomalyList;
