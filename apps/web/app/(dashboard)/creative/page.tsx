"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { getAnomalies, getCreatives, type Anomaly, type CreativePerformance } from "@/lib/api";

function fmtMoney(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fatigueVariant(score: number) {
  if (score > 0.7) return <Badge variant="destructive">{score.toFixed(2)} fatigued</Badge>;
  if (score > 0.5) return <Badge variant="warning">{score.toFixed(2)} warming</Badge>;
  return <Badge variant="success">{score.toFixed(2)} fresh</Badge>;
}

export default function CreativePage() {
  const [creatives, setCreatives] = useState<CreativePerformance[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [creativeRows, anomalyRows] = await Promise.all([getCreatives(), getAnomalies()]);
        if (!cancelled) {
          setCreatives(creativeRows);
          setAnomalies(anomalyRows);
        }
      } catch {
        if (!cancelled) setError("Failed to load creative analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Creative Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Fatigue detection and per-creative performance across channels.
        </p>
      </div>

      {error ? (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-5 text-sm text-red-600">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Creative performance</CardTitle>
          <CardDescription>Sorted by fatigue score, highest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creative</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Hook rate</TableHead>
                <TableHead className="text-right">Fatigue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : creatives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    No creative rows yet.
                  </TableCell>
                </TableRow>
              ) : (
                creatives.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-medium">{c.creative_id}</TableCell>
                    <TableCell className="capitalize">{c.platform.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{fmtMoney(c.spend)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Math.round(c.conversions).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(c.hook_rate * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">{fatigueVariant(c.fatigue_score)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anomaly detection</CardTitle>
          <CardDescription>Deterministic drift alerts on spend and efficiency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {anomalies.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No anomalies detected.</p>
          ) : (
            anomalies.map((a) => (
              <div
                key={`${a.platform}-${a.metric}-${a.detail}`}
                className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">
                      {a.platform.replace(/_/g, " ")}
                    </span>
                    <Badge variant="outline">{a.metric}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.detail}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge
                    variant={
                      a.severity === "high" ? "destructive" : a.severity === "medium" ? "warning" : "secondary"
                    }
                  >
                    {a.severity}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{a.detected_at}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
