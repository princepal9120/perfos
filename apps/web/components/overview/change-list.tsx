import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChangeItem } from "@/components/overview/briefing";

function ChangeListSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent className="space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3.5">
            <Skeleton className="mt-0.5 h-4 w-5 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-44 max-w-full" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="h-3 w-full max-w-md" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ChangeListEmpty() {
  return (
    <CardContent>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle bg-white/2 px-6 py-10 text-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-bg-elevated text-text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </span>
        <p className="mt-3 text-sm font-medium text-text-primary">No changes queued today</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-text-muted">
          Proposed actions show up here after the daily loop runs its find, score, and create stages.
        </p>
        <Link
          href="/loop"
          className="mt-4 inline-flex items-center gap-1 rounded-md border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary transition-colors duration-normal ease-out hover:border-border-hover hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
        >
          Open the loop
        </Link>
      </div>
    </CardContent>
  );
}

export function ChangeList({ changes, loading = false }: { changes: ChangeItem[]; loading?: boolean }) {
  if (loading) return <ChangeListSkeleton />;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Today&apos;s queued changes</CardTitle>
          <CardDescription>Proposed actions awaiting your review</CardDescription>
        </div>
        {changes.length > 0 && (
          <Link href="/loop" className="text-xs font-medium text-text-muted transition-colors duration-normal ease-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm">
            Audit trail
          </Link>
        )}
      </CardHeader>

      {changes.length === 0 ? (
        <ChangeListEmpty />
      ) : (
        <CardContent className="-mx-1 divide-y divide-white/6">
          {changes.map((change) => (
            <div
              key={change.index}
              className="group flex gap-3.5 rounded-lg px-1 py-3 first:pt-0 last:pb-0 transition-colors duration-normal ease-out hover:bg-white/3"
            >
              <span className="mt-px w-5 shrink-0 font-mono text-[11px] font-semibold tabular-nums leading-5 text-text-muted transition-colors duration-normal ease-out group-hover:text-accent">
                {String(change.index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-xs font-medium leading-5 text-zinc-200">{change.title}</p>
                  {change.platform && (
                    <Badge variant="neutral" shape="square" className="uppercase tracking-wider">
                      {change.platform}
                    </Badge>
                  )}
                </div>
                {change.detail && (
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{change.detail}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
