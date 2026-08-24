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
  apiPost,
  getRecommendations,
  type Recommendation,
} from "@/lib/api";

// Backend returns DecisionResult (routes.py), not the full Recommendation.
interface DecisionResult {
  recommendation_id: number;
  status: string;
  decision: string;
  reasons: string[];
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const statusVariant: Record<string, BadgeVariant> = {
  pending: "secondary",
  approved: "warning",
  rejected: "outline",
  executed: "success",
  failed: "destructive",
};

const riskVariant: Record<string, BadgeVariant> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

function formatConfidence(value: number): string {
  const pct = value <= 1 ? value * 100 : value;
  return `${Math.round(pct)}%`;
}

function JsonBlock({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown> | null;
}) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [blocked, setBlocked] = useState<Record<number, DecisionResult>>({});

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getRecommendations();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load recommendations. Is the API running in mock mode?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(id: number, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      const result = await apiPost<DecisionResult>(
        `/api/recommendations/${id}/${action}`
      );
      // Reflect the returned status on the row immediately.
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === result.recommendation_id
            ? { ...rec, status: result.status as Recommendation["status"] }
            : rec
        )
      );
      if (result.decision === "block") {
        setBlocked((prev) => ({ ...prev, [result.recommendation_id]: result }));
      } else {
        setBlocked(({ [result.recommendation_id]: _drop, ...rest }) => rest);
      }
    } catch {
      setError(`Failed to ${action} recommendation #${id}. Check that the backend is up.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Recommendations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-proposed actions with evidence, risk and rollback info. Approval is
            policy-gated; approved low-risk actions execute in mock mode instantly.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/20 px-4 py-3 text-sm text-destructive-foreground"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading recommendations">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No recommendations yet. Generate them from the overview briefing or the API.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {recommendations.map((rec) => {
            const isBusy = busyId === rec.id;
            const isPending = rec.status === "pending";
            const blockResult = blocked[rec.id];
            return (
              <li key={rec.id}>
                <Card>
                  <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{rec.type}</CardTitle>
                      <Badge variant={statusVariant[rec.status] ?? "secondary"}>
                        {rec.status}
                      </Badge>
                      <Badge variant={riskVariant[rec.risk] ?? "warning"}>
                        risk: {rec.risk}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        confidence {formatConfidence(rec.confidence)}
                      </span>
                    </div>
                    <CardDescription>{rec.reason}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {blockResult && blockResult.reasons.length > 0 && (
                      <div
                        role="alert"
                        className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-xs text-warning"
                      >
                        Policy blocked this approval:{" "}
                        {blockResult.reasons.join("; ")}. Status unchanged.
                      </div>
                    )}

                    {rec.expected_impact && (
                      <p className="text-sm">
                        <span className="font-medium">Expected impact: </span>
                        {rec.expected_impact}
                      </p>
                    )}

                    <JsonBlock title="Evidence" data={rec.evidence_json} />
                    <JsonBlock
                      title="Proposed changes"
                      data={rec.proposed_changes_json}
                    />

                    {rec.rollback_json &&
                      Object.keys(rec.rollback_json).length > 0 && (
                        <details className="rounded-md border px-3 py-2">
                          <summary className="cursor-pointer text-sm font-medium">
                            Rollback available
                          </summary>
                          <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                            {JSON.stringify(rec.rollback_json, null, 2)}
                          </pre>
                        </details>
                      )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={!isPending || isBusy}
                        onClick={() => void act(rec.id, "approve")}
                      >
                        {isBusy && isPending ? "Approving…" : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!isPending || isBusy}
                        onClick={() => void act(rec.id, "reject")}
                      >
                        Reject
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        created{" "}
                        {new Date(rec.created_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
