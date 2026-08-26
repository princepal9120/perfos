"use client";

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
import type { OptimizerPlan } from "@/lib/api";

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

function label(platform: string) {
  return PLATFORM_LABELS[platform] ?? platform;
}

function usd(n: number) {
  return `$${Math.round(Math.abs(n)).toLocaleString()}`;
}

function signedUsd(n: number) {
  return `${n >= 0 ? "+" : "-"}${usd(n)}`;
}

export interface OptimizerPlanProps {
  plan: OptimizerPlan | null;
  /** Optimizer is computing a fresh plan — shows skeleton matching data shape */
  running?: boolean;
  onRun?: () => void;
  error?: string | null;
}

function PlanSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="flex gap-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-2 w-full max-w-[70%]" />
          <Skeleton className="h-2 w-full max-w-[55%]" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onRun }: { onRun?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-accent">
        {/* sliders icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        No reallocation plan yet. The optimizer shifts budget from low-iROAS
        channels to high-iROAS ones using your calibration factors.
      </p>
      <Button size="sm" onClick={onRun}>
        Run optimizer
      </Button>
    </div>
  );
}

export function OptimizerPlan({ plan, running, onRun, error }: OptimizerPlanProps) {
  const rows = plan
    ? plan.plan.filter((r) => r.current_spend > 0 || r.delta !== 0)
    : [];
  const movers = rows.filter((r) => r.delta !== 0);
  const maxSpend = rows.length
    ? Math.max(...rows.map((r) => Math.max(r.current_spend, r.recommended_spend)), 1)
    : 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="font-display">Reallocation plan</CardTitle>
          <CardDescription className="pt-1.5">
            What-if budget shift toward higher-iROAS channels. Total spend is held constant.
          </CardDescription>
        </div>
        {plan ? (
          <Button variant="outline" size="sm" onClick={onRun}>
            Re-run
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <p className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        {running ? (
          <PlanSkeleton />
        ) : !plan ? (
          !error ? (
            <EmptyState onRun={onRun} />
          ) : null
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-[auto_auto_auto] items-end gap-x-8 gap-y-1">
              <div>
                <p className="text-xs text-text-muted">Total current</p>
                <p className="text-lg font-semibold tracking-tight tabular-nums text-text-primary">
                  {usd(plan.total_current_spend)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Recommended</p>
                <p className="text-lg font-semibold tracking-tight tabular-nums text-text-primary">
                  {usd(plan.total_recommended_spend)}
                </p>
              </div>
              <Badge variant={movers.length > 0 ? "default" : "neutral"}>
                {movers.length > 0
                  ? `${movers.length} channel${movers.length === 1 ? "" : "s"} shifted`
                  : "no shifts suggested"}
              </Badge>
            </div>

            {/* Per-channel rows */}
            <div className="divide-y divide-border-subtle">
              {rows.map((row) => {
                const pct =
                  row.current_spend > 0
                    ? `${row.delta >= 0 ? "+" : "-"}${Math.abs(
                        (row.delta / row.current_spend) * 100
                      ).toFixed(0)}%`
                    : null;
                return (
                  <div
                    key={row.platform}
                    className="-mx-2 space-y-1.5 rounded-sm px-2 py-3 transition-colors duration-normal ease-out hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-text-primary">
                        {label(row.platform)}
                      </span>
                      <span className="flex items-center gap-2 text-sm tabular-nums text-text-secondary">
                        {usd(row.current_spend)}
                        <span aria-hidden className="text-text-muted">&rarr;</span>
                        {usd(row.recommended_spend)}
                        <Badge
                          shape="square"
                          variant={
                            row.delta > 0 ? "up" : row.delta < 0 ? "down" : "neutral"
                          }
                        >
                          {signedUsd(row.delta)}
                          {pct ? ` (${pct})` : ""}
                        </Badge>
                      </span>
                    </div>
                    <div className="space-y-1">
                      {/* current spend bar */}
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-white/25 transition-[width] duration-slow ease-out"
                          style={{
                            width: `${(row.current_spend / maxSpend) * 100}%`,
                          }}
                        />
                      </div>
                      {/* recommended spend bar */}
                      <div
                        className={`h-1.5 rounded-full transition-[width] duration-slow ease-out ${
                          row.delta >= 0 ? "bg-accent" : "bg-accent/50"
                        }`}
                        style={{
                          width: `${(row.recommended_spend / maxSpend) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs tabular-nums text-text-muted">
                      Expected iROAS {row.expected_iroas.toFixed(2)}x
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-text-muted">
              Plan only. Applying changes still requires a policy-approved recommendation.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
