"use client";

import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StageCard, type StageStatus } from "@/components/loop/stage-card";
import { RunControls, type LoopRunResult } from "@/components/loop/run-controls";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Stage definitions & initial mock state                             */
/* ------------------------------------------------------------------ */

interface StageDef {
  id: string;
  stageKey: string;
  stepNumber: string;
  label: string;
  shortDesc: string;
  description: string;
  defaultCount: number;
}

const STAGES: readonly StageDef[] = [
  {
    id: "find",
    stageKey: "find",
    stepNumber: "01",
    label: "Find",
    shortDesc: "Discover spy ads",
    description: "Competitor ad library scraping across Meta and Google",
    defaultCount: 42,
  },
  {
    id: "score",
    stageKey: "score",
    stepNumber: "02",
    label: "Score",
    shortDesc: "Classify winners",
    description: "Longevity, angle DNA, and predicted conversion ranking",
    defaultCount: 18,
  },
  {
    id: "create",
    stageKey: "create",
    stepNumber: "03",
    label: "Create",
    shortDesc: "Remix variants",
    description: "Brief formulation and synthetic hook script generation",
    defaultCount: 6,
  },
  {
    id: "launch",
    stageKey: "launch",
    stepNumber: "04",
    label: "Launch",
    shortDesc: "Deploy drafts",
    description: "Draft-first deployment held at safety gate for approval",
    defaultCount: 6,
  },
  {
    id: "track",
    stageKey: "track",
    stepNumber: "05",
    label: "Track",
    shortDesc: "Measure iROAS",
    description: "Shopify truth reconciliation and geo-lift calibration",
    defaultCount: 6,
  },
  {
    id: "double_down",
    stageKey: "double-down",
    stepNumber: "06",
    label: "Double down",
    shortDesc: "Scale or kill",
    description: "Automated budget reallocation based on real margin",
    defaultCount: 3,
  },
];

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  decision: "allow" | "paused" | "blocked" | "dry_run" | "executed";
  detail: string;
}

const INITIAL_AUDIT_LOG: AuditEntry[] = [
  {
    id: "aud-007",
    timestamp: "2026-08-26 11:38:08",
    actor: "agent:double_down",
    action: "double_down.budget_shift",
    target: "scale_winners:3",
    decision: "allow",
    detail: "Emitted 3 budget scale proposals for top-performing UGC creatives",
  },
  {
    id: "aud-006",
    timestamp: "2026-08-26 11:38:07",
    actor: "agent:track",
    action: "track.iroas_reconcile",
    target: "shopify_orders:30d",
    decision: "allow",
    detail: "Reconciled platform ROAS (3.4x) vs true incremental ROAS (2.28x)",
  },
  {
    id: "aud-005",
    timestamp: "2026-08-26 11:38:06",
    actor: "policy:safety_gate",
    action: "launch.safety_gate_intercept",
    target: "meta_campaign:draft_scale",
    decision: "paused",
    detail: "Paused 6 draft campaigns; awaiting manual operator confirmation",
  },
  {
    id: "aud-004",
    timestamp: "2026-08-26 11:38:05",
    actor: "agent:create",
    action: "create.clipgen_batch",
    target: "assets:6_variants",
    decision: "allow",
    detail: "Generated 6 hook remixes with synthetic voiceover scripts",
  },
  {
    id: "aud-003",
    timestamp: "2026-08-26 11:38:04",
    actor: "agent:score",
    action: "score.tier_classification",
    target: "winners:18",
    decision: "allow",
    detail: "Scored 18 Tier-1 winners based on 14+ day ad longevity",
  },
  {
    id: "aud-002",
    timestamp: "2026-08-26 11:38:03",
    actor: "agent:find",
    action: "discovery.find_stage",
    target: "meta_ads_spy:100",
    decision: "allow",
    detail: "Fetched 42 candidate ads across active competitor domains",
  },
  {
    id: "aud-001",
    timestamp: "2026-08-26 11:38:02",
    actor: "system:scheduler",
    action: "loop.tick",
    target: "all_stages",
    decision: "dry_run",
    detail: "Executed periodic dry-run cycle across Meta and Google pipelines",
  },
];

/* ------------------------------------------------------------------ */
/* Stage-flow sub-component (C18)                                     */
/* ------------------------------------------------------------------ */

interface StageFlowItem {
  id: string;
  stepNumber: string;
  label: string;
  shortDesc: string;
  status: "idle" | "running" | "ok" | "paused" | "error";
  count?: number;
}

function StageFlow({
  stages,
  className,
}: {
  stages: StageFlowItem[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Pipeline sequence
          </h3>
          <p className="text-xs text-muted-foreground">
            Continuous closed-loop orchestration cycle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Gate paused
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex min-w-[760px] items-stretch gap-2.5">
          {stages.map((stage, idx) => {
            const isLast = idx === stages.length - 1;
            const isLaunch = stage.id === "launch";

            return (
              <React.Fragment key={stage.id}>
                <div
                  className={cn(
                    "group relative flex flex-1 flex-col justify-between rounded-lg border bg-card p-3.5 transition-all duration-150 ease-out",
                    "hover:border-white/16 hover:bg-muted",
                    stage.status === "running" && "border-blue-500/40 shadow-sm shadow-blue-500/10",
                    stage.status === "paused" && "border-amber-500/30",
                    stage.status === "ok" && "border-border",
                    stage.status === "idle" && "border-border opacity-80",
                    stage.status === "error" && "border-red-500/40"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground group-hover:text-accent">
                        {stage.stepNumber}
                      </span>
                      {stage.status === "running" ? (
                        <Badge variant="default" shape="square">
                          Running
                        </Badge>
                      ) : stage.status === "paused" || (isLaunch && stage.status === "ok") ? (
                        <Badge variant="warning" shape="square">
                          Paused
                        </Badge>
                      ) : stage.status === "ok" ? (
                        <Badge variant="success" shape="square">
                          OK
                        </Badge>
                      ) : stage.status === "error" ? (
                        <Badge variant="destructive" shape="square">
                          Error
                        </Badge>
                      ) : (
                        <Badge variant="secondary" shape="square">
                          Idle
                        </Badge>
                      )}
                    </div>

                    <h4 className="mt-2 text-xs font-semibold text-foreground">
                      {stage.label}
                    </h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {stage.shortDesc}
                    </p>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between border-t border-white/4 pt-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Yield
                    </span>
                    <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                      {stage.count !== undefined ? stage.count : "—"}
                    </span>
                  </div>
                </div>

                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="flex shrink-0 items-center justify-center text-zinc-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Audit-log sub-component (C19)                                      */
/* ------------------------------------------------------------------ */

interface AuditLogProps {
  entries: AuditEntry[];
  className?: string;
}

function AuditLog({ entries, className }: AuditLogProps) {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (filter !== "all" && entry.decision !== filter) {
        return false;
      }
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        entry.action.toLowerCase().includes(q) ||
        entry.actor.toLowerCase().includes(q) ||
        entry.target.toLowerCase().includes(q) ||
        entry.detail.toLowerCase().includes(q)
      );
    });
  }, [entries, filter, query]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Audit trail</CardTitle>
          <CardDescription>
            Immutable event log of loop orchestrations and policy checks
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter actions or targets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder-zinc-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear filter"
                className="absolute right-2 top-2 text-xs text-muted-foreground hover:text-zinc-300"
              >
                &times;
              </button>
            )}
          </div>

          <div className="inline-flex rounded-md border border-border bg-background p-0.5 text-xs">
            {(
              [
                { id: "all", label: "All" },
                { id: "paused", label: "Paused" },
                { id: "allow", label: "Allowed" },
                { id: "dry_run", label: "Dry-run" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === tab.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-left text-xs">
            <thead>
              <tr className="border-y border-border bg-white/2">
                <th className="px-4 py-2.5 font-medium text-muted-foreground">
                  Timestamp
                </th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Actor</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">
                  Action
                </th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">
                  Target
                </th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">
                  Decision
                </th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No matching audit trail events found.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="transition-colors duration-150 ease-out hover:bg-white/4"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {entry.timestamp}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-zinc-300">
                      {entry.actor}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                      {entry.action}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted-foreground">
                      {entry.target}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {entry.decision === "allow" && (
                        <Badge variant="success" shape="square">
                          Allowed
                        </Badge>
                      )}
                      {entry.decision === "paused" && (
                        <Badge variant="warning" shape="square">
                          Safety paused
                        </Badge>
                      )}
                      {entry.decision === "blocked" && (
                        <Badge variant="destructive" shape="square">
                          Blocked
                        </Badge>
                      )}
                      {entry.decision === "dry_run" && (
                        <Badge variant="secondary" shape="square">
                          Dry-run
                        </Badge>
                      )}
                      {entry.decision === "executed" && (
                        <Badge variant="default" shape="square">
                          Executed
                        </Badge>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {entry.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Last run JSON viewer                                               */
/* ------------------------------------------------------------------ */

function LastRunViewer({
  result,
  onTriggerDryRun,
  running,
}: {
  result: LoopRunResult | null;
  onTriggerDryRun: () => void;
  running: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!result) return;
    void navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle>Last run output</CardTitle>
          <CardDescription>
            Raw JSON payload returned by the loop orchestrator
          </CardDescription>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <Badge variant="neutral" shape="square">
              {result.dry_run ? "dry-run" : "live"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2.5 text-xs text-zinc-300 hover:text-foreground"
            >
              {copied ? "Copied" : "Copy JSON"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!result ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white/2 px-6 py-12 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <p className="mt-3 text-sm font-medium text-foreground">
              No loop execution recorded in this session
            </p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Run a dry-run to execute one complete cycle across all six stages
              without making changes to connected ad networks.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onTriggerDryRun}
              disabled={running}
              className="mt-4"
            >
              {running ? "Running cycle…" : "Execute dry-run now"}
            </Button>
          </div>
        ) : (
          <div className="relative">
            <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-background p-4 font-mono text-xs leading-relaxed text-zinc-300 scrollbar-thin">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main Loop Page (C20)                                               */
/* ------------------------------------------------------------------ */

export default function LoopPage() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoopRunResult | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(INITIAL_AUDIT_LOG);

  // Execute dry-run directly
  const runLoopDryRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/loop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dry_run: true }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data && typeof data === "object" && "detail" in data
            ? String((data as { detail: unknown }).detail)
            : `Loop failed with status ${res.status}`
        );
      }

      const payload = (data && typeof data === "object" ? data : {}) as LoopRunResult;
      setResult(payload);

      // Prepend fresh audit record
      const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
      const newEntry: AuditEntry = {
        id: `aud-${Date.now()}`,
        timestamp: nowStr,
        actor: "user:operator",
        action: "loop.execute_dry_run",
        target: "all_stages",
        decision: "dry_run",
        detail: `Completed full 6-stage dry-run. ${
          payload.stages && typeof payload.stages === "object"
            ? Object.entries(payload.stages)
                .map(([k, v]) => `${k}:${v}`)
                .join(" ")
            : "All stages verified"
        }`,
      };
      setAuditEntries((prev) => [newEntry, ...prev]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Loop failed. Is the API running?"
      );
    } finally {
      setRunning(false);
    }
  }, []);

  // Handler when RunControls completes
  const handleRunComplete = useCallback((resPayload: LoopRunResult) => {
    setResult(resPayload);
    setError(null);

    const isDryRun = resPayload.dry_run !== false;
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    const newEntry: AuditEntry = {
      id: `aud-${Date.now()}`,
      timestamp: nowStr,
      actor: "user:operator",
      action: isDryRun ? "loop.execute_dry_run" : "loop.execute_live",
      target: "all_stages",
      decision: isDryRun ? "dry_run" : "allow",
      detail: `Orchestrator completed ${isDryRun ? "dry-run" : "live run"}. Launch paused at safety gate.`,
    };
    setAuditEntries((prev) => [newEntry, ...prev]);
  }, []);

  // Compute stage statuses and counts
  const stageFlowItems = useMemo<StageFlowItem[]>(() => {
    const stageCounts = (result?.stages as Record<string, number> | undefined) ?? {};

    return STAGES.map((stg) => {
      let count = stageCounts[stg.stageKey] ?? stageCounts[stg.id] ?? (result ? 0 : stg.defaultCount);
      let status: StageFlowItem["status"] = "idle";

      if (running) {
        status = "running";
      } else if (result) {
        if (stg.id === "launch") {
          status = "paused";
        } else {
          status = "ok";
        }
      } else {
        status = stg.id === "launch" ? "paused" : "ok";
      }

      return {
        id: stg.id,
        stepNumber: stg.stepNumber,
        label: stg.label,
        shortDesc: stg.shortDesc,
        status,
        count,
      };
    });
  }, [result, running]);

  const stageCardStatuses = useMemo<Record<string, { count: number; status: StageStatus }>>(() => {
    const stageCounts = (result?.stages as Record<string, number> | undefined) ?? {};

    const map: Record<string, { count: number; status: StageStatus }> = {};
    for (const stg of STAGES) {
      const count = stageCounts[stg.stageKey] ?? stageCounts[stg.id] ?? (result ? 0 : stg.defaultCount);
      let status: StageStatus = "done";

      if (running) {
        status = "active";
      } else if (result) {
        status = "done";
      } else {
        status = "done";
      }

      map[stg.id] = { count, status };
    }
    return map;
  }, [result, running]);

  return (
    <div className="space-y-8">
      {/* Top Header & Run Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              The loop
            </h2>
            <Badge variant="default" shape="square">
              Autonomous cycle
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Find &rarr; score &rarr; create &rarr; launch &rarr; track &rarr; double down.
            Every external platform write is gated by safety policies and stays paused until human confirmation.
          </p>
        </div>

        <RunControls onComplete={handleRunComplete} />
      </div>

      {/* Safety Gate Banner */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </span>
          <div>
            <p className="text-xs font-medium text-foreground">
              Safety gate active
            </p>
            <p className="text-[11px] text-muted-foreground">
              Draft campaigns and budget changes remain paused until manually approved. Zero unexpected live spend.
            </p>
          </div>
        </div>
        <Badge variant="secondary" shape="square" className="hidden sm:inline-flex">
          Policy enforcement: strict
        </Badge>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-400"
        >
          {error}
        </div>
      )}

      {/* Stage Flow (C18) */}
      <StageFlow stages={stageFlowItems} />

      {/* Stage Cards Grid (StageCard) */}
      <section aria-label="Loop stage details">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Stage metrics
          </h3>
          <span className="text-xs text-muted-foreground">
            Click dry-run to refresh stage yields
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage) => {
            const cardData = stageCardStatuses[stage.id] ?? {
              count: stage.defaultCount,
              status: "done",
            };

            return (
              <StageCard
                key={stage.id}
                label={stage.label}
                description={stage.description}
                count={cardData.count}
                status={cardData.status}
              />
            );
          })}
        </div>
      </section>

      {/* Audit Log (C19) */}
      <AuditLog entries={auditEntries} />

      {/* Last Run Output */}
      <LastRunViewer
        result={result}
        onTriggerDryRun={() => void runLoopDryRun()}
        running={running}
      />
    </div>
  );
}
