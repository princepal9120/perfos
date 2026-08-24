"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import {
  callTool,
  dispatchAllAgents,
  runPipeline,
  setWorkspaceId,
  type DispatchResult,
  type PipelineResult,
  type StatusEntry,
  type ToolCall,
} from "@/lib/api";

const TOOLS: { name: string; label: string; description: string }[] = [
  {
    name: "google_ads.fetch_campaigns",
    label: "Google Ads",
    description: "Pull campaigns with spend, impressions, clicks and conversions.",
  },
  {
    name: "meta_ads.fetch_adsets",
    label: "Meta Ads",
    description: "Pull ad sets with spend and conversion metrics.",
  },
  {
    name: "shopify.fetch_orders",
    label: "Shopify",
    description: "Fetch recent store orders as the source of truth for revenue.",
  },
  {
    name: "slack.send_message",
    label: "Slack",
    description: "Send the digest or an alert to a channel.",
  },
  {
    name: "linear.create_issue",
    label: "Linear",
    description: "Create a follow-up issue on the growth board.",
  },
  {
    name: "github.create_pr",
    label: "GitHub",
    description: "Open a pull request to apply approved changes.",
  },
];

function fmtMoney(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(value: number | null | undefined) {
  return `${Number(value ?? 0)}%`;
}

function fmtMer(value: number | null | undefined) {
  return `${Number(value ?? 0).toFixed(2)}x`;
}

function fmtTime(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function statusDotClass(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "connected" || s === "active") return "bg-emerald-500";
  if (s === "error") return "bg-red-500";
  // idle / paused / disabled / unknown
  return "bg-amber-500";
}

function StatusList({ title, entries }: { title: string; entries: StatusEntry[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">None registered.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {entries.map((e) => (
            <li key={e.name} className="flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(e.status)}`}
                aria-hidden="true"
              />
              <span className="truncate font-medium">{e.name}</span>
              <span className="ml-auto text-xs capitalize text-muted-foreground">
                {e.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RiskBadge({ risk }: { risk?: string }) {
  if (!risk) return null;
  const variant =
    risk === "high" ? "destructive" : risk === "medium" ? "warning" : "success";
  return <Badge variant={variant}>{risk} risk</Badge>;
}

export default function CommandCenterPage() {
  const [pipeline, setPipeline] = useState<PipelineResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<Record<string, ToolCall>>({});

  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("perfos_workspace_id");
      setWorkspaceId(stored ? Number(stored) || 1 : 1);
    }
  }, []);

  const runFullPipeline = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await runPipeline();
      setPipeline(result);
    } catch {
      setError("Pipeline failed. Is the API running?");
    } finally {
      setRunning(false);
    }
  }, []);

  async function handleToolCall(name: string) {
    setBusyTool(name);
    setError(null);
    try {
      const result = await callTool(name);
      setToolResults((prev) => ({ ...prev, [name]: result }));
    } catch {
      setError(`Tool call failed for ${name}.`);
    } finally {
      setBusyTool(null);
    }
  }

  async function handleDispatchAll() {
    setDispatching(true);
    setError(null);
    try {
      const result = await dispatchAllAgents();
      setDispatchResult(result);
    } catch {
      setError("Agent dispatch failed.");
    } finally {
      setDispatching(false);
    }
  }

  const summary = pipeline?.reconcile_summary;

  return (
    <div>
      {/* Hero */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Command Center
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One click to run your full performance marketing stack.
          </p>
        </div>
        <Button size="lg" onClick={() => void runFullPipeline()} disabled={running}>
          {running ? "Running pipeline…" : "Run Full Pipeline"}
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-destructive/40 bg-destructive/20 px-4 py-3 text-sm text-destructive-foreground"
        >
          {error}
        </div>
      )}

      {/* Pipeline result */}
      <section aria-label="Pipeline results">
        {!pipeline ? (
          running ? (
            <div className="space-y-2" aria-busy="true" aria-label="Running pipeline">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No pipeline run yet. Hit Run Full Pipeline to reconcile spend,
              generate recommendations and check every connection.
            </p>
          )
        ) : (
          <Card className="card-premium">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">Latest pipeline run</CardTitle>
                  <CardDescription className="text-xs">
                    Ran at {fmtTime(pipeline.pipeline_run_at)}
                  </CardDescription>
                </div>
                <Badge variant="success">completed</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Spend" value={fmtMoney(summary?.spend)} />
                <Stat label="Claimed" value={fmtMoney(summary?.claimed)} />
                <Stat
                  label="Actual"
                  value={fmtMoney(summary?.actual)}
                  sub={`MER ${fmtMer(summary?.mer)}`}
                />
                <Stat
                  label="Over-count"
                  value={fmtPct(summary?.over_count_pct)}
                  sub={
                    Number(summary?.over_count_pct ?? 0) > 15
                      ? "Tracking integrity flagged."
                      : "Within tolerance."
                  }
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Recommendations
                </p>
                {pipeline.recommendations.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No recommendations pending.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {pipeline.recommendations.map((rec) => (
                      <li
                        key={`${rec.id ?? rec.type}-${rec.reason}`}
                        className="rounded-md border border-border px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{rec.type}</Badge>
                          <RiskBadge risk={rec.risk} />
                          {rec.confidence != null && (
                            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                              confidence {Math.round(rec.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm">{rec.reason}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <StatusList title="Agents" entries={pipeline.agents_status} />
                <StatusList title="MCP servers" entries={pipeline.mcp_servers} />
                <StatusList title="Integrations" entries={pipeline.integrations} />
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Tool calls */}
      <section aria-label="Tool calls" className="mt-8">
        <h3 className="text-sm font-semibold">Tools</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Call any connected integration directly. Results are mocked in demo mode.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool) => {
            const last = toolResults[tool.name];
            return (
              <Card key={tool.name} className="card-premium flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm">{tool.label}</CardTitle>
                  <CardDescription className="font-mono text-[11px] leading-relaxed">
                    {tool.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                  {last && (
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={last.status === "ok" ? "success" : "destructive"}>
                          {last.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {fmtTime(last.called_at)}
                        </span>
                      </div>
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-4 text-muted-foreground">
                        {JSON.stringify(last.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleToolCall(tool.name)}
                    disabled={busyTool === tool.name}
                  >
                    {busyTool === tool.name ? "Calling…" : "Call"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Agents */}
      <section aria-label="Agent dispatch" className="mt-8 max-w-md">
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-sm">Agents</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Dispatch every connected agent at once. Each agent records a new
              last-run timestamp.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-between gap-3">
            <Button onClick={() => void handleDispatchAll()} disabled={dispatching}>
              {dispatching ? "Dispatching…" : "Dispatch All Agents"}
            </Button>
            {dispatchResult && (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={dispatchResult.count > 0 ? "success" : "secondary"}>
                  {dispatchResult.count} dispatched
                </Badge>
                {fmtTime(dispatchResult.called_at)}
              </span>
            )}
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
