"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type AuditDecision =
  | "approved"
  | "rejected"
  | "paused"
  | "auto_applied"
  | "flagged"
  | "overridden"
  | "pending"
  | (string & {});

export interface AuditEntry {
  id?: string;
  timestamp: string | number | Date;
  actor: string;
  action: string;
  target: string;
  decision: AuditDecision;
  detail?: string;
  platform?: "meta" | "google" | "tiktok" | "linkedin" | "x" | string;
  stage?: "find" | "score" | "create" | "launch" | "track" | "double_down" | string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of audit entries to display */
  entries?: AuditEntry[];
  /** Alias for entries */
  items?: AuditEntry[];
  /** Shows loading skeleton when true */
  loading?: boolean;
  /** Custom section title */
  title?: string;
  /** Custom section description */
  description?: string;
  /** Whether to render filter and search controls */
  showFilters?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Callback when an entry row is clicked */
  onEntryClick?: (entry: AuditEntry) => void;
}

const DEFAULT_ENTRIES: AuditEntry[] = [
  {
    id: "aud_01",
    timestamp: "2026-08-26 14:18:02",
    actor: "Safety Policy",
    action: "Pause budget scale +30%",
    target: "Meta / Retargeting Q3 High-Intent",
    decision: "paused",
    detail: "Budget change exceeded single-step ceiling (max +20% allowed per 24h window).",
    platform: "meta",
    stage: "double_down",
  },
  {
    id: "aud_02",
    timestamp: "2026-08-26 13:45:19",
    actor: "Sarah Chen",
    action: "Approve creative draft batch",
    target: "Google / PMax Asset Group Alpha",
    decision: "approved",
    detail: "Human operator approved 4 generated headline variants and 2 video assets.",
    platform: "google",
    stage: "launch",
  },
  {
    id: "aud_03",
    timestamp: "2026-08-26 12:02:44",
    actor: "Loop Agent",
    action: "Kill low-ROAS variation #03",
    target: "TikTok / Spark Ads Prospecting",
    decision: "auto_applied",
    detail: "CPA reached $48.20 vs $22.00 benchmark after 1,200 impressions.",
    platform: "tiktok",
    stage: "double_down",
  },
  {
    id: "aud_04",
    timestamp: "2026-08-26 10:30:11",
    actor: "Optimizer Bot",
    action: "Increase bid cap to $4.20",
    target: "Google / Search Brand Exact",
    decision: "approved",
    detail: "Impression share dropped below 85% with target ROAS > 4.5x.",
    platform: "google",
    stage: "track",
  },
  {
    id: "aud_05",
    timestamp: "2026-08-26 09:15:38",
    actor: "Safety Gate",
    action: "Reject unverified external URL",
    target: "Meta / Advantage+ Catalog",
    decision: "rejected",
    detail: "Destination URL failed domain whitelist verification check.",
    platform: "meta",
    stage: "launch",
  },
  {
    id: "aud_06",
    timestamp: "2026-08-26 08:00:00",
    actor: "Loop Scheduler",
    action: "Execute find & score stages",
    target: "Competitor Swipe Index",
    decision: "auto_applied",
    detail: "Scored 142 discovered creative candidates; queued top 8 for draft generation.",
    platform: "meta",
    stage: "find",
  },
];

function formatTimestamp(ts: string | number | Date): string {
  if (ts instanceof Date) {
    return ts.toISOString().replace("T", " ").substring(0, 19);
  }
  if (typeof ts === "number") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? String(ts) : d.toISOString().replace("T", " ").substring(0, 19);
  }
  return String(ts);
}

function getDecisionMeta(decision: string): {
  variant: "success" | "destructive" | "warning" | "default" | "secondary" | "neutral";
  label: string;
} {
  const norm = decision.toLowerCase().replace(/[\s_-]+/g, "");
  switch (norm) {
    case "approved":
    case "approve":
    case "accepted":
    case "pass":
    case "passed":
      return { variant: "success", label: "Approved" };
    case "rejected":
    case "reject":
    case "denied":
    case "killed":
    case "blocked":
    case "failed":
      return { variant: "destructive", label: "Rejected" };
    case "paused":
    case "pause":
    case "flagged":
    case "escalated":
    case "reviewrequired":
      return { variant: "warning", label: "Paused" };
    case "autoapplied":
    case "applied":
    case "executed":
    case "active":
    case "running":
      return { variant: "default", label: "Auto-applied" };
    case "pending":
    case "queued":
    case "waiting":
    case "dryrun":
      return { variant: "secondary", label: "Pending" };
    case "overridden":
    case "override":
      return { variant: "warning", label: "Overridden" };
    default:
      return {
        variant: "neutral",
        label: decision.charAt(0).toUpperCase() + decision.slice(1).replace(/_/g, " "),
      };
  }
}

/**
 * Skeleton loader matching the exact row layout of the audit log.
 */
export function AuditLogSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#111114] overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col gap-1 p-5 border-b border-white/[0.08]">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-64" />
      </div>

      <div className="divide-y divide-white/[0.04]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:grid sm:grid-cols-[140px_130px_1fr_1fr_100px] items-start sm:items-center gap-2 sm:gap-4 px-4 py-3.5"
          >
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Composed empty state for audit log with contextual copy and reset action.
 */
export function AuditLogEmpty({
  message,
  onReset,
  className,
}: {
  message?: string;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400">
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
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <h4 className="mt-3 text-sm font-medium text-zinc-100">
        No audit entries found
      </h4>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-400">
        {message ||
          "Actions taken by loop agents and human operators will be recorded here with timestamped decision records."}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors duration-150 ease-out hover:border-white/[0.16] hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 active:scale-[0.98]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/**
 * Audit log: A chronological list of automated and manual loop actions.
 * Features sentence-case headers, monospace zinc-500 timestamps, row hover states,
 * structured decision chips, and expandable decision rationale.
 */
export function AuditLog({
  entries,
  items,
  loading = false,
  title = "Loop audit log",
  description = "Chronological record of automated loop executions and safety gate decisions",
  showFilters = true,
  emptyMessage,
  onEntryClick,
  className,
  ...props
}: AuditLogProps) {
  const data = entries ?? items ?? DEFAULT_ENTRIES;

  const [search, setSearch] = React.useState("");
  const [selectedDecision, setSelectedDecision] = React.useState<string>("all");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const filteredEntries = React.useMemo(() => {
    return data.filter((entry) => {
      const matchesDecision =
        selectedDecision === "all" ||
        entry.decision.toLowerCase() === selectedDecision.toLowerCase() ||
        (selectedDecision === "auto_applied" &&
          entry.decision.toLowerCase().includes("auto"));

      if (!matchesDecision) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        entry.actor.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.target.toLowerCase().includes(q) ||
        (entry.detail && entry.detail.toLowerCase().includes(q)) ||
        (entry.platform && entry.platform.toLowerCase().includes(q))
      );
    });
  }, [data, search, selectedDecision]);

  if (loading) {
    return <AuditLogSkeleton className={className} />;
  }

  const toggleExpand = (id: string, entry: AuditEntry) => {
    setExpandedId((prev) => (prev === id ? null : id));
    onEntryClick?.(entry);
  };

  const decisionFilters = [
    { key: "all", label: "All" },
    { key: "approved", label: "Approved" },
    { key: "auto_applied", label: "Auto-applied" },
    { key: "paused", label: "Paused" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#111114] overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/[0.08] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono tabular-nums">
            <span>
              {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        {showFilters && data.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {decisionFilters.map((f) => {
                const isActive = selectedDecision === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedDecision(f.key)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 ease-out",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
                      isActive
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                        : "bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200"
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Filter by keyword…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-[#18181c] px-3 py-1 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                aria-label="Filter audit entries"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredEntries.length === 0 ? (
        <div className="p-5">
          <AuditLogEmpty
            message={
              search || selectedDecision !== "all"
                ? "No audit records match your active search or decision filter."
                : emptyMessage
            }
            onReset={
              search || selectedDecision !== "all"
                ? () => {
                    setSearch("");
                    setSelectedDecision("all");
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid sm:grid-cols-[140px_130px_1fr_1fr_100px] items-center gap-4 px-4 py-2.5 bg-white/[0.02] text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
            <span>Timestamp</span>
            <span>Actor</span>
            <span>Action</span>
            <span>Target</span>
            <span className="text-right">Decision</span>
          </div>

          {/* Table Rows */}
          {filteredEntries.map((entry, index) => {
            const rowId = entry.id || `audit-entry-${index}`;
            const isExpanded = expandedId === rowId;
            const meta = getDecisionMeta(entry.decision);
            const formattedTime = formatTimestamp(entry.timestamp);

            return (
              <div key={rowId} className="transition-colors duration-150 ease-out">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(rowId, entry)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpand(rowId, entry);
                    }
                  }}
                  className={cn(
                    "group flex flex-col sm:grid sm:grid-cols-[140px_130px_1fr_1fr_100px] items-start sm:items-center gap-2 sm:gap-4 px-4 py-3 cursor-pointer",
                    "hover:bg-white/[0.04] transition-colors duration-150 ease-out",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50",
                    isExpanded && "bg-white/[0.02]"
                  )}
                  aria-expanded={isExpanded}
                >
                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-zinc-500 tabular-nums">
                      {formattedTime}
                    </span>
                  </div>

                  {/* Actor */}
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-zinc-300 truncate block">
                      {entry.actor}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="min-w-0">
                    <span className="text-xs text-zinc-200 font-medium line-clamp-1">
                      {entry.action}
                    </span>
                  </div>

                  {/* Target */}
                  <div className="min-w-0">
                    <span className="text-xs text-zinc-400 line-clamp-1">
                      {entry.target}
                    </span>
                  </div>

                  {/* Decision */}
                  <div className="flex sm:justify-end items-center gap-1.5 w-full sm:w-auto justify-between pt-1 sm:pt-0">
                    <Badge variant={meta.variant} shape="square">
                      {meta.label}
                    </Badge>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.04] text-xs text-zinc-400 space-y-2">
                    {entry.detail && (
                      <div className="flex items-start gap-2">
                        <span className="text-zinc-500 font-medium shrink-0">
                          Rationale:
                        </span>
                        <span className="text-zinc-300 leading-relaxed">
                          {entry.detail}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 font-mono pt-1">
                      {entry.stage && (
                        <span>
                          Stage: <span className="text-zinc-400">{entry.stage}</span>
                        </span>
                      )}
                      {entry.platform && (
                        <span>
                          Platform:{" "}
                          <span className="text-zinc-400 uppercase">
                            {entry.platform}
                          </span>
                        </span>
                      )}
                      {entry.id && (
                        <span>
                          ID: <span className="text-zinc-400">{entry.id}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AuditLog;
