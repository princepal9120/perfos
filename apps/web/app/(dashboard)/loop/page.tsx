"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STAGES = [
  { id: "find", label: "Find", desc: "Discover winning ads from spy sources" },
  { id: "score", label: "Score", desc: "Rank candidates by predicted performance" },
  { id: "create", label: "Create", desc: "Generate draft creatives from winners" },
  { id: "launch", label: "Launch", desc: "Draft-first launch through the safety gate" },
  { id: "track", label: "Track", desc: "Pull ROAS for launched ads" },
  { id: "double_down", label: "Double Down", desc: "Scale winners / kill losers by policy" },
] as const;

interface LoopResult {
  status?: string;
  dry_run?: boolean;
  [key: string]: unknown;
}

export default function LoopPage() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoopResult | null>(null);

  const runLoop = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
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
            : `Loop failed with status ${res.status}`,
        );
      }
      setResult((data && typeof data === "object" ? data : {}) as LoopResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Loop failed. Is the API running?");
    } finally {
      setRunning(false);
    }
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">The Loop</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find &rarr; score &rarr; create &rarr; launch &rarr; track &rarr;
            double down. Every external write goes through the safety gate and
            stays paused until a human approves.
          </p>
        </div>
        <Button onClick={() => void runLoop()} disabled={running}>
          {running ? "Running…" : "Run Loop (dry-run)"}
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

      <section aria-label="Loop stages">
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage, i) => (
            <Card key={stage.id} aria-label={`Stage ${i + 1}: ${stage.label}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Badge variant={result ? "success" : "outline"}>
                    {result ? (stage.id === "launch" ? "paused" : "ok") : "idle"}
                  </Badge>
                </div>
                <CardTitle className="text-sm">{stage.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs leading-relaxed">
                  {stage.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </ol>
      </section>

      <section aria-label="Loop run output" className="mt-6">
        <h3 className="mb-3 text-sm font-semibold">Last run</h3>
        {!result ? (
          <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No run yet. Hit &ldquo;Run Loop (dry-run)&rdquo; to execute one full
            cycle without touching live accounts.
          </p>
        ) : (
          <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
