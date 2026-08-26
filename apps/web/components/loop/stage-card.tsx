import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StageStatus = "pending" | "active" | "done" | "error";

const statusMeta: Record<StageStatus, { label: string; badge: "secondary" | "default" | "success" | "destructive"; dot: string }> = {
  pending: { label: "Queued", badge: "secondary", dot: "bg-zinc-600" },
  active: { label: "Running", badge: "default", dot: "bg-accent animate-pulse" },
  done: { label: "Done", badge: "success", dot: "bg-emerald-500" },
  error: { label: "Failed", badge: "destructive", dot: "bg-red-500" },
};

export interface StageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description?: string;
  count?: number;
  status?: StageStatus;
}

/**
 * One pipeline stage (find → score → create → …) as a compact card:
 * sentence-case label, tabular-nums count, status chip.
 */
function StageCard({
  label,
  description,
  count,
  status = "pending",
  className,
  ...props
}: StageCardProps) {
  const meta = statusMeta[status];

  return (
    <div
      className={cn(
        "group rounded-lg border bg-bg-surface p-4 transition-[border-color,background-color] duration-150 ease-out",
        "hover:border-border-hover hover:bg-bg-elevated focus-within:border-border-hover",
        status === "active" && "border-blue-500/40",
        status === "done" && "border-white/[0.08]",
        status === "pending" && "border-white/[0.06] opacity-70",
        status === "error" && "border-red-500/30",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dot)} aria-hidden />
          <span className="truncate text-sm font-medium text-text-primary">{label}</span>
        </span>
        <Badge variant={meta.badge} aria-live="polite">
          {meta.label}
        </Badge>
      </div>

      <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
        {count ?? "—"}
      </p>
      {description ? (
        <p className="mt-0.5 truncate text-xs text-text-muted">{description}</p>
      ) : null}
    </div>
  );
}

/** Skeleton matching StageCard layout for loading states. */
function StageCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-bg-surface p-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-8 w-12" />
      <Skeleton className="mt-1.5 h-3 w-24" />
    </div>
  );
}

export { StageCard, StageCardSkeleton };
