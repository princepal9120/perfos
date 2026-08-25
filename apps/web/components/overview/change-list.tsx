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
          <p className="text-xs text-zinc-500">No changes queued today.</p>
        ) : (
          changes.map((change) => (
            <div key={change.index} className="flex gap-3.5">
              <span className="mt-0.5 w-5 shrink-0 font-mono text-xs font-semibold tabular-nums text-zinc-500">
                {String(change.index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-200">
                  {change.title}
                  {change.platform && (
                    <span className="ml-2 rounded border border-white/10 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                      {change.platform}
                    </span>
                  )}
                </p>
                {change.detail && (
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
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
