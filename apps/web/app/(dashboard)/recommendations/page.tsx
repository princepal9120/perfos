"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  approveRecommendation,
  generateRecommendations,
  getRecommendations,
  rejectRecommendation,
  type Recommendation,
  type Risk,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

type RecStatus = "pending" | "approved" | "rejected" | "executed" | "failed";

interface ExtendedRecommendation extends Recommendation {
  platform?: "meta" | "google" | "tiktok" | "shopify" | "linkedin" | "multi";
  spend_delta?: string;
  roas_delta?: string;
  projected_monthly_value?: string;
}

interface DecisionResult {
  recommendation_id: number;
  status: string;
  decision: string;
  reasons: string[];
}

// ---------------------------------------------------------------------------
// Realistic Mock Fallback Data (Agent-first, real draft copy)
// ---------------------------------------------------------------------------

const MOCK_RECOMMENDATIONS: ExtendedRecommendation[] = [
  {
    id: 101,
    workspace_id: 1,
    type: "budget_shift",
    platform: "meta",
    reason:
      "Meta 7-day click-through ROAS dropped to 1.12x from audience saturation, while Google Search Brand and Core Non-Brand campaigns are capped at 94% impression share with marginal iROAS of 3.42x.",
    expected_impact:
      "+$3,400/wk net revenue (+0.48 blended iROAS); projected CAC reduction from $48.20 to $39.80",
    spend_delta: "-$850/day Meta, +$850/day Google",
    roas_delta: "+0.48x",
    projected_monthly_value: "+$13,600",
    confidence: 0.94,
    risk: "low",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    evidence_json: {
      source_campaign: "Meta - Prospecting & Retargeting Broad (US)",
      target_campaign: "Google Search - High Intent Core Non-Brand",
      current_meta_marginal_iroas: 1.12,
      google_marginal_iroas: 3.42,
      lost_impression_share_budget: "38.2%",
      attribution_window: "7d_click_1d_view",
      lookback_days: 14,
    },
    proposed_changes_json: {
      action: "reallocate_daily_budget",
      meta_current_daily_budget: 1750,
      meta_recommended_daily_budget: 900,
      google_current_daily_budget: 1200,
      google_recommended_daily_budget: 2050,
      net_spend_change: 0,
      execution_mode: "direct_api_sync",
    },
    rollback_json: {
      trigger_condition: "Blended MER drops below 2.40x over rolling 48-hour window",
      auto_revert: true,
      checkpoint_hours: 48,
      previous_budgets: { meta_daily: 1750, google_daily: 1200 },
    },
  },
  {
    id: 102,
    workspace_id: 1,
    type: "scale_creative",
    platform: "tiktok",
    reason:
      'Creative variant "Founder Story v3" (ID #TK-8831) achieved 4.2% hook rate (vs 1.8% account benchmark) and 3.18x iROAS with $4.2k spend over the last 5 days.',
    expected_impact:
      "+$6,800/wk incremental revenue with projected 2.85x marginal ROAS across US smart discovery",
    spend_delta: "+$240/day (+40%)",
    roas_delta: "+0.32x",
    projected_monthly_value: "+$27,200",
    confidence: 0.91,
    risk: "medium",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    evidence_json: {
      creative_id: "TK-8831-UGC-FOUNDER-V3",
      hook_rate_3s: "4.21% (benchmark: 1.80%)",
      hold_rate_6s: "32.4%",
      conversions_5d: 148,
      cost_per_acquisition: "$28.40 (target: $42.00)",
      engagement_lift: "+84% vs account median",
    },
    proposed_changes_json: {
      action: "scale_adgroup_budget",
      target_adgroup: "TikTok - US Smart+ UGC Creators",
      current_daily_budget: 600,
      recommended_daily_budget: 840,
      pacing: "accelerated_dayparting",
    },
    rollback_json: {
      trigger_condition: "CPA exceeds $38.00 on rolling 72-hour window",
      auto_revert: true,
      max_loss_cap_usd: 500,
    },
  },
  {
    id: 103,
    workspace_id: 1,
    type: "pause_decay",
    platform: "meta",
    reason:
      'Frequency on "Meta - DABA Catalog Dynamic" reached 5.8 per user over 14 days; CPM increased +62% and first-time buyer conversion rate fell -44%.',
    expected_impact:
      "Save $1,450/wk in wasted spend; redirect budget into top-performing static winner assets",
    spend_delta: "-$210/day",
    roas_delta: "+0.22x blended",
    projected_monthly_value: "+$5,800 saved",
    confidence: 0.96,
    risk: "low",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    evidence_json: {
      adset_id: "META-DABA-CATALOG-9021",
      frequency_14d: 5.82,
      cpm_trend_7d: "+62.4%",
      fatigue_score: "8.4 / 10",
      wasted_spend_last_3d: "$620.00",
      creative_exhaustion_rate: "78%",
    },
    proposed_changes_json: {
      action: "pause_adset",
      target_adset: "Meta - DABA Catalog Dynamic",
      reallocate_budget_to: "Meta - ASC Static Winners (Batch 4)",
    },
    rollback_json: {
      trigger_condition: "Manual review or dynamic catalog feed creative refresh",
      auto_revert: false,
    },
  },
  {
    id: 104,
    workspace_id: 1,
    type: "bid_cap_adjust",
    platform: "google",
    reason:
      "Demand Gen YouTube Shorts campaign is bidding aggressively above marginal revenue yield on weekend inventory; lowering tCPA forces algorithm toward high-propensity lookalikes.",
    expected_impact:
      "+$1,850/wk efficiency gain; +14.2% conversions at equivalent overall weekly spend",
    spend_delta: "$0 net (bid cap only)",
    roas_delta: "+0.35x",
    projected_monthly_value: "+$7,400",
    confidence: 0.88,
    risk: "medium",
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    evidence_json: {
      campaign_name: "Google Demand Gen - Shorts Video Lookalikes 2%",
      current_target_cpa: "$54.00",
      recommended_target_cpa: "$42.00",
      recent_realized_cpa: "$49.10",
      smart_bidding_model: "Response Curve v4",
    },
    proposed_changes_json: {
      action: "update_bidding_strategy",
      bidding_type: "Target CPA",
      new_tcpa_usd: 42.0,
      bid_strategy_id: "DEMAND_GEN_SMART_CPA_01",
    },
    rollback_json: {
      trigger_condition: "Impression volume drops >30% within 48 hours",
      fallback_tcpa_usd: 48.0,
      auto_revert: true,
    },
  },
  {
    id: 105,
    workspace_id: 1,
    type: "placement_prune",
    platform: "meta",
    reason:
      "Audience Network placement generated 22,400 clicks with 89% bounce rate and 0 attributed conversions, consuming 11.2% of Advantage+ campaign budget.",
    expected_impact:
      "Eliminate $720/wk click fraud / accidental tap spend; direct budget into Instagram Reels",
    spend_delta: "-$105/day redirected",
    roas_delta: "+0.18x",
    projected_monthly_value: "+$2,880 saved",
    confidence: 0.98,
    risk: "low",
    status: "approved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    evidence_json: {
      placement: "Meta Audience Network (Rewarding / Interstitial)",
      clicks_30d: 22400,
      bounce_rate: "89.4%",
      assisted_conversions: 0,
      budget_drain_pct: "11.2%",
    },
    proposed_changes_json: {
      action: "exclude_placement",
      excluded_placements: ["Audience Network (all sub-placements)"],
      target_campaign: "Meta - Advantage+ Shopping Core",
    },
    rollback_json: {
      trigger_condition: "Total unique reach declines >15% over 7 days",
      auto_revert: true,
    },
  },
  {
    id: 106,
    workspace_id: 1,
    type: "audience_expand",
    platform: "linkedin",
    reason:
      "High-value B2B pipeline velocity slowed; 420 Tier-1 enterprise accounts showing active buying intent signals on G2 are unreached on paid social.",
    expected_impact:
      "Estimated 18-24 qualified pipeline opportunities in next 30 days with $350k+ pipeline value",
    spend_delta: "+$350/day",
    roas_delta: "+2.40x pipeline ROAS",
    projected_monthly_value: "+$38,000 pipeline",
    confidence: 0.85,
    risk: "high",
    status: "rejected",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    evidence_json: {
      matched_accounts_count: 420,
      intent_source: "G2 + 6sense high intent segment",
      projected_cpm: "$68.00",
      decision_maker_titles: ["VP Marketing", "Head of Growth", "Director of Media"],
    },
    proposed_changes_json: {
      action: "create_campaign",
      campaign_name: "LinkedIn - ABM Tier 1 High Intent ICP",
      initial_daily_budget: 350,
      format: "Single Image Sponsored Content + Document Ad",
    },
    rollback_json: {
      trigger_condition: "Cost per qualified lead exceeds $350 after 14 days",
      auto_revert: false,
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers & Formatting
// ---------------------------------------------------------------------------

function humanizeType(type: string): string {
  const words = type.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatConfidence(value: number): string {
  const pct = value <= 1 ? value * 100 : value;
  return `${Math.round(pct)}%`;
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return isoString;
  }
}

const statusBadgeConfig: Record<
  RecStatus,
  { label: string; variant: "default" | "secondary" | "success" | "neutral" | "destructive" }
> = {
  pending: { label: "Pending review", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "neutral" },
  executed: { label: "Executed", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
};

const riskBadgeConfig: Record<Risk, { label: string; variant: "success" | "warning" | "destructive" }> = {
  low: { label: "Low risk", variant: "success" },
  medium: { label: "Med risk", variant: "warning" },
  high: { label: "High risk", variant: "destructive" },
};

const platformBadgeConfig: Record<string, { label: string; color: string }> = {
  meta: { label: "Meta", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
  google: { label: "Google", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  tiktok: { label: "TikTok", color: "text-pink-400 border-pink-500/20 bg-pink-500/10" },
  shopify: { label: "Shopify", color: "text-green-400 border-green-500/20 bg-green-500/10" },
  linkedin: { label: "LinkedIn", color: "text-sky-400 border-sky-500/20 bg-sky-500/10" },
  multi: { label: "Multi-channel", color: "text-purple-400 border-purple-500/20 bg-purple-500/10" },
};

// ---------------------------------------------------------------------------
// Sub-components: JsonBlock (Collapsible inspector)
// ---------------------------------------------------------------------------

function JsonBlock({
  title,
  data,
  defaultOpen = false,
}: {
  title: string;
  data: Record<string, unknown> | null;
  defaultOpen?: boolean;
}) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-white/[0.08] bg-[#0c0c0f] transition-colors duration-150 hover:border-white/[0.16]"
    >
      <summary className="flex cursor-pointer select-none items-center justify-between px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors duration-150 group-open:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-lg">
        <span>{title}</span>
        <span className="text-[10px] text-zinc-500 transition-transform duration-150 group-open:rotate-180">
          ▼
        </span>
      </summary>
      <div className="border-t border-white/[0.08] p-3">
        <pre className="max-h-52 overflow-x-auto font-mono text-[11px] leading-relaxed text-zinc-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Sub-components: RecCard (C25 Component)
// ---------------------------------------------------------------------------

interface RecCardProps {
  rec: ExtendedRecommendation;
  busy: boolean;
  blockReasons?: string[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onReopen?: (id: number) => void;
}

function RecCard({
  rec,
  busy,
  blockReasons,
  onApprove,
  onReject,
  onReopen,
}: RecCardProps) {
  const isPending = rec.status === "pending";
  const isApproved = rec.status === "approved" || rec.status === "executed";

  const statusConfig = statusBadgeConfig[(rec.status as RecStatus) || "pending"] ?? statusBadgeConfig.pending;
  const riskConfig = riskBadgeConfig[rec.risk] ?? riskBadgeConfig.low;
  const platformConfig =
    rec.platform && platformBadgeConfig[rec.platform]
      ? platformBadgeConfig[rec.platform]
      : null;

  return (
    <Card className="flex flex-col border border-white/[0.08] bg-[#111114] transition-all duration-200 hover:border-white/[0.16] shadow-sm">
      <CardHeader className="gap-2.5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-zinc-200">
              {humanizeType(rec.type)}
            </span>

            {platformConfig && (
              <span
                className={cn(
                  "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium tracking-wide",
                  platformConfig.color
                )}
              >
                {platformConfig.label}
              </span>
            )}

            <Badge variant={statusConfig.variant} shape="square">
              {statusConfig.label}
            </Badge>

            <Badge variant={riskConfig.variant} shape="square">
              {riskConfig.label}
            </Badge>
          </div>

          {/* Right confidence & timestamp */}
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums font-mono text-zinc-400">
              <span className="text-zinc-500">confidence</span> {formatConfidence(rec.confidence)}
            </span>
            <span className="text-zinc-600">·</span>
            <time
              dateTime={rec.created_at}
              className="text-xs tabular-nums text-zinc-500"
              title={new Date(rec.created_at).toLocaleString()}
            >
              {formatTimeAgo(rec.created_at)}
            </time>
          </div>
        </div>

        {/* Reason / Rationale */}
        <CardDescription className="text-xs leading-relaxed text-zinc-300 font-normal">
          {rec.reason}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3.5 pt-0">
        {/* Block notification if policy-rejected */}
        {blockReasons && blockReasons.length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3.5 py-2 text-xs leading-relaxed text-amber-300"
          >
            <span className="font-semibold text-amber-200">Policy constraint: </span>
            {blockReasons.join("; ")}. Execution held for manual safety check.
          </div>
        )}

        {/* Highlighted Expected Impact Banner */}
        {rec.expected_impact && (
          <div className="flex items-start gap-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-blue-400">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-400/90">
                Expected impact
              </p>
              <p className="mt-0.5 text-xs font-medium leading-relaxed text-zinc-200">
                {rec.expected_impact}
              </p>
            </div>
            {rec.projected_monthly_value && (
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-zinc-500">Est. value</p>
                <p className="font-mono text-xs font-semibold tabular-nums text-emerald-400">
                  {rec.projected_monthly_value}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Expandable Diagnostic Inspection Panes */}
        <div className="space-y-2 pt-1">
          <JsonBlock title="Evidence & attribution signals" data={rec.evidence_json} />
          <JsonBlock title="Proposed parameter diffs" data={rec.proposed_changes_json} />
          <JsonBlock title="Automated rollback guardrails" data={rec.rollback_json} />
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-[#0c0c0f]/50 px-5 py-3">
        {/* Actions based on state */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <Button
                size="sm"
                variant="default"
                disabled={busy}
                onClick={() => onApprove(rec.id)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm active:scale-[0.98]"
              >
                {busy ? (
                  <>
                    <svg
                      className="h-3.5 w-3.5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Approving…</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Approve</span>
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onReject(rec.id)}
                className="text-zinc-300 hover:text-white border-white/10 hover:border-white/20 active:scale-[0.98]"
              >
                Reject
              </Button>
            </>
          ) : isApproved ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Approved — queued for sync
              </span>
              {onReopen && (
                <button
                  type="button"
                  onClick={() => onReopen(rec.id)}
                  className="text-[11px] text-zinc-500 underline hover:text-zinc-300 transition-colors ml-1"
                >
                  Revert
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Rejected by operator
              </span>
              {onReopen && (
                <button
                  type="button"
                  onClick={() => onReopen(rec.id)}
                  className="text-[11px] text-zinc-400 underline hover:text-zinc-200 transition-colors ml-1"
                >
                  Reopen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer meta tag */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <span>#REC-{rec.id}</span>
          <span>·</span>
          <span className="text-zinc-600">
            {rec.risk === "low" ? "Auto-apply eligible" : "Manual review required"}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Skeleton & Empty States
// ---------------------------------------------------------------------------

function RecSkeleton() {
  return (
    <Card className="border border-white/[0.08] bg-[#111114]">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 bg-white/[0.06]" />
            <Skeleton className="h-4 w-16 bg-white/[0.06]" />
            <Skeleton className="h-4 w-14 bg-white/[0.06]" />
          </div>
          <Skeleton className="h-3 w-20 bg-white/[0.06]" />
        </div>
        <Skeleton className="h-3 w-full bg-white/[0.06]" />
        <Skeleton className="h-3 w-4/5 bg-white/[0.06]" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-14 w-full rounded-lg bg-white/[0.04]" />
        <Skeleton className="h-8 w-full rounded-lg bg-white/[0.04]" />
        <Skeleton className="h-8 w-full rounded-lg bg-white/[0.04]" />
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-white/[0.08] py-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 bg-white/[0.06]" />
          <Skeleton className="h-8 w-16 bg-white/[0.06]" />
        </div>
        <Skeleton className="h-3 w-24 bg-white/[0.06]" />
      </CardFooter>
    </Card>
  );
}

function EmptyRecommendations({
  onGenerate,
  onResetFilters,
  generating,
  hasFilters,
}: {
  onGenerate: () => void;
  onResetFilters?: () => void;
  generating: boolean;
  hasFilters: boolean;
}) {
  return (
    <Card className="border-dashed border-white/[0.12] bg-[#111114]/50 py-12 text-center">
      <CardContent className="flex flex-col items-center justify-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4l2.2 2.2m0-12.8l-2.2 2.2m-8.4 8.4l-2.2 2.2" />
          </svg>
        </div>
        <div className="max-w-md space-y-1">
          <p className="text-sm font-semibold text-zinc-100">
            {hasFilters ? "No matching recommendations" : "No recommendations in queue"}
          </p>
          <p className="text-xs leading-relaxed text-zinc-400">
            {hasFilters
              ? "No recommendations match your current status or search filter. Try clearing your filters to see all queued actions."
              : "Run the reconcile and attribution analysis pipeline to generate actionable budget shifts, creative rotations, and bid cap adjustments."}
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {hasFilters && onResetFilters ? (
            <Button size="sm" variant="outline" onClick={onResetFilters}>
              Clear filters
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm"
          >
            {generating ? "Generating analysis…" : "Generate recommendations"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<ExtendedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [blocked, setBlocked] = useState<Record<number, DecisionResult>>({});

  // Filter states
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load from API with automatic fallback to mock state
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations();
      if (Array.isArray(data) && data.length > 0) {
        setRecommendations(data as ExtendedRecommendation[]);
      } else {
        // Fall back to rich mock data if backend returned empty array
        setRecommendations(MOCK_RECOMMENDATIONS);
      }
    } catch {
      // Backend not running or offline: graceful fallback to local mock state
      setRecommendations(MOCK_RECOMMENDATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Generate fresh recommendations
  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const created = await generateRecommendations();
      if (Array.isArray(created) && created.length > 0) {
        setRecommendations(created as ExtendedRecommendation[]);
      } else {
        setRecommendations(MOCK_RECOMMENDATIONS);
      }
      setBlocked({});
    } catch {
      // Fall back locally on backend error
      setRecommendations(MOCK_RECOMMENDATIONS);
    } finally {
      setGenerating(false);
    }
  }

  // Act on recommendation (Approve / Reject)
  async function handleAction(id: number, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    const targetStatus: RecStatus = action === "approve" ? "approved" : "rejected";

    // Optimistically update local status immediately
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status: targetStatus } : rec))
    );

    try {
      if (action === "approve") {
        const result = await approveRecommendation(id);
        if (result?.decision === "block") {
          setBlocked((prev) => ({ ...prev, [id]: result }));
        } else {
          setBlocked(({ [id]: _drop, ...rest }) => rest);
        }
      } else {
        await rejectRecommendation(id);
        setBlocked(({ [id]: _drop, ...rest }) => rest);
      }
    } catch {
      // Backend offline or error: local state is already updated, no crash
    } finally {
      setBusyId(null);
    }
  }

  // Reopen/revert recommendation
  function handleReopen(id: number) {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status: "pending" } : rec))
    );
    setBlocked(({ [id]: _drop, ...rest }) => rest);
  }

  // Bulk approve all pending low-risk recommendations
  async function handleApproveAllLowRisk() {
    const pendingLowRisk = recommendations.filter(
      (r) => r.status === "pending" && r.risk === "low"
    );
    if (pendingLowRisk.length === 0) return;

    setRecommendations((prev) =>
      prev.map((r) =>
        r.status === "pending" && r.risk === "low" ? { ...r, status: "approved" } : r
      )
    );

    // Trigger API in background for each
    for (const rec of pendingLowRisk) {
      try {
        await approveRecommendation(rec.id);
      } catch {
        // Safe ignore on local mode
      }
    }
  }

  // Counts & stats
  const totalCount = recommendations.length;
  const pendingCount = recommendations.filter((r) => r.status === "pending").length;
  const approvedCount = recommendations.filter(
    (r) => r.status === "approved" || r.status === "executed"
  ).length;
  const rejectedCount = recommendations.filter((r) => r.status === "rejected").length;
  const lowRiskPendingCount = recommendations.filter(
    (r) => r.status === "pending" && r.risk === "low"
  ).length;

  // Filtered recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      // Status filter
      if (statusFilter === "pending" && rec.status !== "pending") return false;
      if (
        statusFilter === "approved" &&
        rec.status !== "approved" &&
        rec.status !== "executed"
      )
        return false;
      if (statusFilter === "rejected" && rec.status !== "rejected") return false;

      // Risk filter
      if (riskFilter !== "all" && rec.risk !== riskFilter) return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesReason = rec.reason.toLowerCase().includes(query);
        const matchesType = rec.type.toLowerCase().includes(query);
        const matchesImpact = rec.expected_impact?.toLowerCase().includes(query) ?? false;
        const matchesPlatform = rec.platform?.toLowerCase().includes(query) ?? false;
        if (!matchesReason && !matchesType && !matchesImpact && !matchesPlatform) {
          return false;
        }
      }

      return true;
    });
  }, [recommendations, statusFilter, riskFilter, searchQuery]);

  const hasActiveFilters =
    statusFilter !== "all" || riskFilter !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            Recommendations
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 max-w-2xl">
            Policy-gated action queue proposed by the reconcile and attribution models. Low-risk
            approvals execute automatically with rollback guardrails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lowRiskPendingCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleApproveAllLowRisk()}
              className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              Approve all low risk ({lowRiskPendingCount})
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void load()}
            disabled={loading}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >
            {generating ? "Analyzing…" : "Run analysis"}
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border border-white/[0.08] bg-[#111114] p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Pending decision
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-zinc-100">
              {pendingCount}
            </span>
            <span className="text-[11px] text-zinc-500">of {totalCount} total</span>
          </div>
        </Card>

        <Card className="border border-white/[0.08] bg-[#111114] p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Approved changes
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-emerald-400">
              {approvedCount}
            </span>
            <span className="text-[11px] text-zinc-500">active/queued</span>
          </div>
        </Card>

        <Card className="border border-white/[0.08] bg-[#111114] p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Projected monthly value
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-blue-400">
              +$28.4k
            </span>
            <span className="text-[11px] text-emerald-400/90 font-mono">+14.8%</span>
          </div>
        </Card>

        <Card className="border border-white/[0.08] bg-[#111114] p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Avg confidence
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-zinc-100">
              92.8%
            </span>
            <span className="text-[11px] text-zinc-500">high accuracy</span>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-y border-white/[0.08] py-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
              statusFilter === "all"
                ? "bg-white/[0.08] text-zinc-100"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            )}
          >
            All <span className="tabular-nums text-zinc-500">({totalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
              statusFilter === "pending"
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            )}
          >
            Pending <span className="tabular-nums text-zinc-500">({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
              statusFilter === "approved"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            )}
          >
            Approved <span className="tabular-nums text-zinc-500">({approvedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
              statusFilter === "rejected"
                ? "bg-white/[0.08] text-zinc-300"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            )}
          >
            Rejected <span className="tabular-nums text-zinc-500">({rejectedCount})</span>
          </button>
        </div>

        {/* Search & Risk Selector */}
        <div className="flex items-center gap-2">
          {/* Risk selector */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as "all" | "low" | "medium" | "high")}
            className="rounded-lg border border-white/[0.08] bg-[#111114] px-2.5 py-1 text-xs text-zinc-300 focus:border-blue-500/50 focus:outline-none"
          >
            <option value="all">All risk levels</option>
            <option value="low">Low risk only</option>
            <option value="medium">Medium risk only</option>
            <option value="high">High risk only</option>
          </select>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter actions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 rounded-lg border border-white/[0.08] bg-[#111114] px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none sm:w-48"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error notification banner */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
        >
          {error}
        </div>
      )}

      {/* Recommendation Card List */}
      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading recommendations">
          <RecSkeleton />
          <RecSkeleton />
          <RecSkeleton />
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <EmptyRecommendations
          onGenerate={() => void handleGenerate()}
          onResetFilters={() => {
            setStatusFilter("all");
            setRiskFilter("all");
            setSearchQuery("");
          }}
          generating={generating}
          hasFilters={hasActiveFilters}
        />
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <RecCard
              key={rec.id}
              rec={rec}
              busy={busyId === rec.id}
              blockReasons={blocked[rec.id]?.reasons}
              onApprove={(id) => void handleAction(id, "approve")}
              onReject={(id) => void handleAction(id, "reject")}
              onReopen={(id) => handleReopen(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
