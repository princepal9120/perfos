"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createIncrementalityTest,
  getIncrementalityTests,
  getIroas,
  postReallocate,
  runIncrementalityTest,
  type IncrementalityTest,
  type IroasRow,
  type OptimizerPlan,
} from "@/lib/api";

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

export default function MeasurementPage() {
  const [iroas, setIroas] = useState<IroasRow[]>([]);
  const [tests, setTests] = useState<IncrementalityTest[]>([]);
  const [plan, setPlan] = useState<OptimizerPlan | null>(null);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [iroasRows, testRows] = await Promise.all([
        getIroas(),
        getIncrementalityTests(),
      ]);
      setIroas(iroasRows);
      setTests(testRows);
    } catch {
      setError("Could not load measurement data. Check that the backend is up.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const launchTest = useCallback(async () => {
    setLaunching(true);
    setError(null);
    try {
      const draft = await createIncrementalityTest({
        platform: "tiktok",
        test_type: "geo_holdout",
        markets_treated: ["CA", "TX"],
        markets_control: ["NY", "FL"],
      });
      await runIncrementalityTest(draft.id);
      await load();
    } catch {
      setError("Failed to launch incrementality test.");
    } finally {
      setLaunching(false);
    }
  }, [load]);

  const runOptimizer = useCallback(async () => {
    setError(null);
    try {
      setPlan(await postReallocate());
    } catch {
      setError("Failed to compute reallocation plan.");
    }
  }, []);

  const maxSpend =
    plan && plan.plan.length > 0
      ? Math.max(...plan.plan.map((r) => Math.max(r.current_spend, r.recommended_spend)))
      : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Unified Measurement</h2>
          <p className="text-sm text-muted-foreground">
            iROAS calibration, incrementality testing and budget optimization in one loop.
          </p>
        </div>
        <Button onClick={runOptimizer}>Run optimizer</Button>
      </div>

      {error ? (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-5 text-sm text-red-600">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>iROAS by channel</CardTitle>
          <CardDescription>
            Reported ROAS vs incrementality-corrected ROAS (calibration factors).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Reported ROAS</TableHead>
                <TableHead className="text-right">Calibration</TableHead>
                <TableHead className="text-right">iROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {iroas.map((row) => (
                <TableRow key={row.platform}>
                  <TableCell className="font-medium">{label(row.platform)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.reported_roas.toFixed(2)}x
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Badge variant="secondary">{(row.calibration * 100).toFixed(0)}%</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {row.iroas.toFixed(2)}x
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Incrementality tests</CardTitle>
            <CardDescription>Geo holdouts and conversion lift experiments.</CardDescription>
          </div>
          <Button variant="outline" onClick={launchTest} disabled={launching}>
            {launching ? "Launching..." : "Launch test"}
          </Button>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No tests yet. Launch a geo holdout to calibrate channel iROAS.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{label(t.platform)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.test_type.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === "completed"
                            ? "success"
                            : t.status === "running"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {t.lift_pct === null ? "-" : `${t.lift_pct > 0 ? "+" : ""}${t.lift_pct.toFixed(2)}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {plan ? (
        <Card>
          <CardHeader>
            <CardTitle>Budget optimizer plan</CardTitle>
            <CardDescription>
              What-if reallocation toward higher-iROAS channels. Current total{" "}
              ${plan.total_current_spend.toLocaleString()} stays the same.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.plan
              .filter((r) => r.current_spend > 0 || r.delta !== 0)
              .map((row) => (
                <div key={row.platform} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label(row.platform)}</span>
                    <span className="tabular-nums text-muted-foreground">
                      ${row.current_spend.toLocaleString()}
                      {" -> "}
                      ${row.recommended_spend.toLocaleString()}
                      <span
                        className={`ml-2 font-semibold ${
                          row.delta >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {row.delta >= 0 ? "+" : ""}
                        {row.delta.toLocaleString()}
                      </span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div
                      className="h-2 rounded bg-blue-500/70"
                      style={{ width: `${(row.current_spend / maxSpend) * 100}%` }}
                    />
                    <div
                      className="h-2 rounded bg-accent-blue/70"
                      style={{ width: `${(row.recommended_spend / maxSpend) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            <p className="pt-1 text-xs text-muted-foreground">
              Plan only. Applying changes still requires a policy-approved recommendation.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
