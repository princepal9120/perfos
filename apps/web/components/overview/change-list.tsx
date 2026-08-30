/* Hallmark · macrostructure: Workbench · tone: modern-minimal · anchor hue: daisy-black
 * pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black
 */
import Link from 'next/link';
import type { ChangeItem } from '@/components/overview/briefing';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-6 text-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-elevated text-muted-foreground font-mono text-sm">
          ⌘
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">
          No changes queued today
        </p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
          Proposed actions show up here after the autonomous loop runs its find,
          score, and create stages.
        </p>
        <Link
          href="/loop"
          className="mt-4 inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          Open Growth Loop
        </Link>
      </div>
    </CardContent>
  );
}

export function ChangeList({
  changes,
  loading = false,
}: {
  changes: ChangeItem[];
  loading?: boolean;
}) {
  if (loading) return <ChangeListSkeleton />;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Today&apos;s queued changes</CardTitle>
          <CardDescription>
            Proposed actions awaiting your review
          </CardDescription>
        </div>
        {changes.length > 0 && (
          <Link
            href="/loop"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Audit trail ↗
          </Link>
        )}
      </CardHeader>

      {changes.length === 0 ? (
        <ChangeListEmpty />
      ) : (
        <CardContent className="divide-y divide-border">
          {changes.map((change) => (
            <div
              key={change.index}
              className="group flex gap-3.5 px-1 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-surface-elevated rounded-lg"
            >
              <span className="mt-px w-5 shrink-0 font-mono text-[11px] font-semibold tabular-nums leading-5 text-muted-foreground transition-colors group-hover:text-primary">
                {String(change.index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-xs font-medium leading-5 text-foreground">
                    {change.title}
                  </p>
                  {change.platform && (
                    <Badge
                      variant="neutral"
                      shape="square"
                      className="uppercase tracking-wider text-[9px]"
                    >
                      {change.platform}
                    </Badge>
                  )}
                </div>
                {change.detail && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {change.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
