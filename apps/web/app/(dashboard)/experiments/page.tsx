"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  completeIncrementalityTest,
  createIncrementalityTest,
  getIncrementalityTests,
  runIncrementalityTest,
  type AdChannel,
  type IncrementalityTest,
  type TestType,
} from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variant =
    normalized === "completed"
      ? "success"
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
  if (!iso) return "n/a";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

const PLATFORMS: { id: string; name: string }[] = [
  { id: "google", name: "Google Ads" },
  { id: "meta", name: "Meta Ads" },
  { id: "tiktok", name: "TikTok Ads" },
  { id: "linkedin", name: "LinkedIn Ads" },
  { id: "pinterest", name: "Pinterest Ads" },
  { id: "snapchat", name: "Snapchat Ads" },
  { id: "amazon", name: "Amazon Ads" },
  { id: "reddit", name: "Reddit Ads" },
  { id: "twitter", name: "X Ads" },
  { id: "youtube", name: "YouTube Ads" },
];

const TEST_TYPES: TestType[] = ["geo_holdout", "conversion_lift", "ab"];

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

export default function ExperimentsPage() {
  const [tests, setTests] = useState<IncrementalityTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<AdChannel>("meta");
  const [testType, setTestType] = useState<TestType>("geo_holdout");
  const [treated, setTreated] = useState("CA, TX");
  const [control, setControl] = useState("NY, FL");
  const [spendTreated, setSpendTreated] = useState("40000");
  const [spendControl, setSpendControl] = useState("38000");
  const [convTreated, setConvTreated] = useState("2100");
  const [convControl, setConvControl] = useState("1900");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = await getIncrementalityTests();
      setTests(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError("Could not load incrementality tests. Check that the backend is up.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getIncrementalityTests()
      .then((rows) => {
        if (!cancelled) setTests(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load incrementality tests. Is the API running in mock mode?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSaving(true);
      setError(null);
      try {
        await createIncrementalityTest({
          platform: platform as AdChannel,
          test_type: testType,
          markets_treated: treated.split(",").map((s) => s.trim()).filter(Boolean),
          markets_control: control.split(",").map((s) => s.trim()).filter(Boolean),
          spend_treated: Number(spendTreated) || 0,
          spend_control: Number(spendControl) || 0,
          conversions_treated: Number(convTreated) || 0,
          conversions_control: Number(convControl) || 0,
        });
        await refresh();
      } catch {
        setError("Failed to create test. Check that the backend is up.");
      } finally {
        setSaving(false);
      }
    },
    [control, convControl, convTreated, platform, refresh, spendControl, spendTreated, testType, treated],
  );

  const runTest = useCallback(
    async (id: number) => {
      try {
        await runIncrementalityTest(id);
        await refresh();
      } catch {
        setError("Failed to run test.");
      }
    },
    [refresh],
  );

  const completeTest = useCallback(
    async (id: number) => {
      try {
        await completeIncrementalityTest(id);
        await refresh();
      } catch {
        setError("Failed to complete test.");
      }
    },
    [refresh],
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Incrementality Tests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Geo-holdout and lift experiments that calibrate the model. Every budget
          decision should be backed by a test.
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
        <Card aria-label="Create incrementality test">
          <CardHeader>
            <CardTitle>New test</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Define treated vs control markets and the spend or conversion counts.
              Lift is computed when you run it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as AdChannel)}
                    className={inputCls}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as TestType)}
                    className={inputCls}
                  >
                    {TEST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Treated markets
                  </label>
                  <input
                    value={treated}
                    onChange={(e) => setTreated(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Control markets
                  </label>
                  <input
                    value={control}
                    onChange={(e) => setControl(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Spend treated
                  </label>
                  <input
                    value={spendTreated}
                    onChange={(e) => setSpendTreated(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Spend control
                  </label>
                  <input
                    value={spendControl}
                    onChange={(e) => setSpendControl(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Conversions treated
                  </label>
                  <input
                    value={convTreated}
                    onChange={() => {}}
                    onInput={(e) => setConvTreated((e.target as HTMLInputElement).value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Conversions control
                  </label>
                  <input
                    value={convControl}
                    onChange={() => {}}
                    onInput={(e) => setConvControl((e.target as HTMLInputElement).value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Creating…" : "Create test"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section aria-label="Test history">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">History</h3>
            <Button variant="outline" onClick={() => void refresh()}>
              Refresh
            </Button>
          </div>
          {loading ? (
            <div className="space-y-2" aria-busy="true" aria-label="Loading tests">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : tests.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No tests yet. Create your first incrementality test on the left.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Lift</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap px-4 py-3 font-medium">
                        {t.platform}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                        {t.test_type}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                        {t.lift_pct != null ? `${t.lift_pct}%` : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatDate(t.started_at)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        <div className="flex gap-2">
                          {t.status !== "running" && t.status !== "completed" && (
                            <Button
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={() => void runTest(t.id)}
                            >
                              Run
                            </Button>
                          )}
                          {t.status === "running" && (
                            <Button
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={() => void completeTest(t.id)}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
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
