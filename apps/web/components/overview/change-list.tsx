import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChangeItem } from "@/components/overview/briefing";

export function ChangeList({ changes }: { changes: ChangeItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Today&apos;s 3 changes</CardTitle>
        <CardDescription>Proposed actions awaiting your review</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {changes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No changes queued today.</p>
        ) : (
          changes.map((change) => (
            <div key={change.index} className="flex gap-4">
              <span className="mt-0.5 w-6 shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                {String(change.index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {change.title}
                  {change.platform && (
                    <span className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {change.platform}
                    </span>
                  )}
                </p>
                {change.detail && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {change.detail}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
