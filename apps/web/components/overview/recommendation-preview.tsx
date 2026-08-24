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
        <Link href="/recommendations" className="text-sm font-medium hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="divide-y">
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations yet.</p>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  <span className="mr-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {rec.type}
                  </span>
                  {rec.impact && <span className="font-normal text-muted-foreground">{rec.impact}</span>}
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground">{rec.reason}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {rec.confidence !== null && (
                  <span className="text-xs tabular-nums text-muted-foreground">
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
