import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecommendationItem } from "@/components/overview/briefing";

const riskVariant: Record<string, "success" | "warning" | "destructive"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

export function RecommendationPreview({
  recommendations,
}: {
  recommendations: RecommendationItem[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Top actions from today&apos;s analysis</CardDescription>
        </div>
        <Link href="/recommendations" className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          View all
        </Link>
      </CardHeader>
      <CardContent className="divide-y divide-white/6">
        {recommendations.length === 0 ? (
          <p className="text-xs text-zinc-500">No recommendations yet.</p>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded border border-white/10 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    {rec.type.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs font-medium text-zinc-200">
                    {rec.reason}
                  </p>
                </div>
                {rec.impact && (
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    {rec.impact}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2.5 pt-0.5">
                {rec.confidence !== null && (
                  <span className="text-xs tabular-nums text-zinc-500">
                    {Math.round(rec.confidence)}%
                  </span>
                )}
                <Badge variant={riskVariant[rec.risk] ?? "warning"}>{rec.risk}</Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
