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
import { Skeleton } from "@/components/ui/skeleton";
import {
  apiPost,
  generateRecommendations,
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

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "neutral";

const statusVariant: Record<string, BadgeVariant> = {
  pending: "secondary",
  approved: "default",
  rejected: "neutral",
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

/** "budget_shift" -> "Budget shift" */
function humanizeType(type: string): string {
  const words = type.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
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
    <details className="group rounded-md border border-white/[0.08] transition-colors duration-fast hover:border-white/[0.16]">
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-text-secondary transition-colors duration-fast group-open:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-md">
        {title}
      </summary>
      <pre className="overflow-x-auto border-t border-white/[0.08] px-3 py-2 font-mono text-xs leading-relaxed text-text-secondary">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

function RecCard({
  rec,
  busy,
  blockReasons,
  onApprove,
  onReject,
}: {
  rec: Recommendation;
  busy: boolean;
  blockReasons?: string[];
  onApprove: () => void;
  onReject: () => void;
}) {
  const isPending = rec.status === "pending";
  return (
    <Card className="flex flex-col transition-colors duration-normal hover:border-white/[0.16]">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{humanizeType(rec.type)}</CardTitle>
          <Badge variant={statusVariant[rec.status] ?? "secondary"} shape="square">
            {rec.status}
          </Badge>
          <Badge variant={riskVariant[rec.risk] ?? "warning"} shape="square">
            risk: {rec.risk}
          </Badge>
          <span className="text-xs tabular-nums text-text-muted">
            confidence {formatConfidence(rec.confidence)}
          </span>
        </div>
        <CardDescription>{rec.reason}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {blockReasons && blockReasons.length > 0 && (
          <div
            role="alert"
            className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning"
          >
            Policy blocked this approval: {blockReasons.join("; ")}. Status unchanged.
          </div>
        )}

        {rec.expected_impact && (
          <p className="text-sm leading-relaxed">
            <span className="font-medium text-text-secondary">Expected impact: </span>
            {rec.expected_impact}
          </p>
        )}

        <div className="space-y-2">
          <JsonBlock title="Evidence" data={rec.evidence_json} />
          <JsonBlock title="Proposed changes" data={rec.proposed_changes_json} />
          <JsonBlock title="Rollback plan" data={rec.rollback_json} />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-3 py-4">
        <div className="flex items-center gap-2">
          <Button size="sm" disabled={!isPending || busy} onClick={onApprove}>
            {busy && isPending ? "Approving…" : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!isPending || busy}
            onClick={onReject}
          >
            Reject
          </Button>
        </div>
        <time
          dateTime={rec.created_at}
          className="text-xs tabular-nums text-text-muted"
        >
          {new Date(rec.created_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </time>
      </CardFooter>
    </Card>
  );
}

/** Skeleton mirrors the real card shape: header row, badges, body lines, footer. */
function RecSkeleton() {
  return (
    <Card aria-hidden="true" className="p-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-5 w-16 rounded-sm" />
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="ml-auto h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2" />
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/20 bg-accent-muted text-accent"
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4l2.2 2.2m0-12.8l-2.2 2.2m-8.4 8.4l-2.2 2.2" />
          </svg>
        </div>
        <div className="max-w-sm space-y-1">
          <p className="text-sm font-medium text-text-primary">No recommendations yet</p>
          <p className="text-sm leading-relaxed text-text-secondary">
            Run the pipeline once and it will propose budget shifts with evidence,
            risk and a rollback plan.
          </p>
        </div>
        <Button onClick={onGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate recommendations"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [blocked, setBlocked] = useState<Record<number, DecisionResult>>({});

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getRecommendations();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load recommendations. Check that the API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const created = await generateRecommendations();
      setRecommendations(Array.isArray(created) ? created : []);
      setBlocked({});
    } catch {
      setError("Could not generate recommendations. Check that the API is running.");
    } finally {
      setGenerating(false);
    }
  }

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

  const pendingCount = recommendations.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Recommendations
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-text-secondary">
            Actions proposed by the reconcile pipeline, with evidence, risk and a
            rollback plan. Approval is policy-gated; low-risk approvals execute in
            mock mode instantly.
          </p>
        </div>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {!loading && !error && recommendations.length > 0 && (
        <p className="text-xs tabular-nums text-text-muted">
          {recommendations.length} total · {pendingCount} awaiting decision
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive-foreground"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading recommendations">
          <RecSkeleton />
          <RecSkeleton />
        </div>
      ) : recommendations.length === 0 ? (
        !error && <EmptyState onGenerate={() => void handleGenerate()} generating={generating} />
      ) : (
        <ul className="space-y-4">
          {recommendations.map((rec) => (
            <li key={rec.id}>
              <RecCard
                rec={rec}
                busy={busyId === rec.id}
                blockReasons={blocked[rec.id]?.reasons}
                onApprove={() => void act(rec.id, "approve")}
                onReject={() => void act(rec.id, "reject")}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
