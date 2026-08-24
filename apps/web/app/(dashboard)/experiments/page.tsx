"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createExperiment, getExperiments, type Experiment } from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variant =
    normalized === "completed" || normalized === "won" || normalized === "active"
      ? "success"
      : normalized === "lost" || normalized === "failed"
        ? "destructive"
        : normalized === "running"
          ? "default"
          : "warning";
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hypothesis, setHypothesis] = useState("");
  const [metric, setMetric] = useState("");
  const [control, setControl] = useState("{}");
  const [variant, setVariant] = useState("{}");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getExperiments()
      .then((rows) => {
        if (!cancelled) setExperiments(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load experiments. Is the API running in mock mode?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const rows = await getExperiments();
      setExperiments(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError("Could not load experiments. Check that the backend is up.");
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!hypothesis.trim()) {
        setError("Hypothesis is required.");
        return;
      }
      let controlJson: Record<string, unknown>;
      let variantJson: Record<string, unknown>;
      try {
        controlJson = JSON.parse(control) as Record<string, unknown>;
        variantJson = JSON.parse(variant) as Record<string, unknown>;
      } catch {
        setError("Control and variant must be valid JSON objects.");
        return;
      }
      setSaving(true);
      setError(null);
      try {
        await createExperiment({
          hypothesis: hypothesis.trim(),
          primary_metric: metric.trim() || undefined,
          control_json: controlJson,
          variant_json: variantJson,
        });
        setHypothesis("");
        setMetric("");
        setControl("{}");
        setVariant("{}");
        await refresh();
      } catch {
        setError("Failed to create experiment. Check that the backend is up.");
      } finally {
        setSaving(false);
      }
    },
    [control, hypothesis, metric, refresh, variant]
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Experiments</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A/B test history and creation. Every change should be measured before it scales.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-destructive/40 bg-destructive/20 px-4 py-3 text-sm text-destructive-foreground"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_1fr]">
        <Card aria-label="Create experiment">
          <CardHeader>
            <CardTitle>New experiment</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Define a hypothesis and what you expect control vs variant to do to the primary metric.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="exp-hypothesis" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Hypothesis
                </label>
                <textarea
                  id="exp-hypothesis"
                  rows={3}
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="Moving CTA above the fold lifts checkout conversion"
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label htmlFor="exp-metric" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Primary metric
                </label>
                <input
                  id="exp-metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  placeholder="blended_mer"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="exp-control" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Control (JSON)
                </label>
                <textarea
                  id="exp-control"
                  rows={3}
                  value={control}
                  onChange={(e) => setControl(e.target.value)}
                  spellCheck={false}
                  className={`${inputCls} resize-none font-mono`}
                />
              </div>
              <div>
                <label htmlFor="exp-variant" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Variant (JSON)
                </label>
                <textarea
                  id="exp-variant"
                  rows={3}
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  spellCheck={false}
                  className={`${inputCls} resize-none font-mono`}
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Creating…" : "Create experiment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section aria-label="Experiment history">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">History</h3>
            <Button variant="outline" onClick={() => void refresh()}>
              Refresh
            </Button>
          </div>
          {loading ? (
            <div className="space-y-2" aria-busy="true" aria-label="Loading experiments">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : experiments.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No experiments yet. Create your first one on the left.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Hypothesis</TableHead>
                    <TableHead>Primary metric</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experiments.map((experiment) => (
                    <TableRow key={experiment.id}>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDate(experiment.created_at)}
                      </TableCell>
                      <TableCell className="max-w-sm px-4 py-3 font-medium">
                        {experiment.hypothesis}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                        {experiment.primary_metric}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={experiment.status} />
                      </TableCell>
                      <TableCell className="max-w-[16rem] truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                        {experiment.result_json ? JSON.stringify(experiment.result_json) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
