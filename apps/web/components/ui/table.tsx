"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      {/* tabular-nums inherits into every cell — metrics align vertically */}
      <table
        className={cn("w-full caption-bottom tabular-nums text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("[&_tr]:border-b [&_tr]:border-border-subtle", className)}
      {...props}
    />
  );
}

function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-white/[0.04] transition-colors duration-150 ease-out",
        "hover:bg-white/[0.03]",
        className
      )}
      {...props}
    />
  );
}

type SortDir = "asc" | "desc";

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Renders an accessible sort button inside the header cell. */
  sortable?: boolean;
  /** Marks this column as the active sort column (arrow highlighted). */
  active?: boolean;
  /** Current direction for the active column. */
  dir?: SortDir;
  onSort?: () => void;
}

function TableHead({
  className,
  sortable,
  active,
  dir,
  onSort,
  children,
  ...props
}: TableHeadProps) {
  const label = (
    <span
      className={cn(
        "text-xs font-medium text-text-muted",
        active && "text-text-primary"
      )}
    >
      {children}
    </span>
  );

  if (!sortable) {
    return (
      <th
        className={cn("h-10 px-3 text-left align-middle font-medium", className)}
        {...props}
      >
        {label}
      </th>
    );
  }

  return (
    <th
      aria-sort={
        active ? (dir === "asc" ? "ascending" : "descending") : undefined
      }
      className={cn("h-10 px-3 text-left align-middle font-medium", className)}
      {...props}
    >
      <button
        type="button"
        onClick={onSort}
        className={cn(
          "group inline-flex select-none items-center gap-1.5 rounded-sm px-1 py-0.5 -mx-1",
          "transition-colors duration-150 ease-out hover:text-text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          active && "text-text-primary"
        )}
      >
        {label}
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={cn(
            "h-3 w-3 shrink-0 text-text-muted transition-transform duration-200 ease-out",
            active ? "opacity-100" : "opacity-40 group-hover:opacity-70",
            active && dir === "asc" && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 4.5 6 7.5l3-3" />
        </svg>
      </button>
    </th>
  );
}

function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-3 py-3 align-middle text-text-secondary", className)}
      {...props}
    />
  );
}

/** Full-width empty-state slot: render your composed empty UI inside. */
function TableEmpty({
  colSpan = 1,
  className,
  children,
}: {
  colSpan?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn("px-3 py-14", className)}>
        <div className="flex flex-col items-center justify-center text-center">
          {children}
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Sorting                                                             */
/* ------------------------------------------------------------------ */

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean")
    return Number(a) - Number(b);
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Sort state for ui/table. Usage:
 *   const { sorted, key, dir, toggle } = useTableSort(rows, { key: "spend", dir: "desc" });
 *   <TableHead sortable active={key === "spend"} dir={dir} onSort={() => toggle("spend")}>
 */
function useTableSort<T extends Record<string, unknown>>(
  rows: readonly T[],
  initial: { key: keyof T & string; dir?: SortDir }
) {
  const [key, setKey] = React.useState<keyof T & string>(initial.key);
  const [dir, setDir] = React.useState<SortDir>(initial.dir ?? "desc");

  const sorted = React.useMemo(() => {
    if (!key) return [...rows];
    return [...rows].sort((a, b) =>
      dir === "asc"
        ? compareValues(a[key], b[key])
        : -compareValues(a[key], b[key])
    );
  }, [rows, key, dir]);

  const toggle = React.useCallback(
    (next: keyof T & string) => {
      setKey((prevKey) => {
        if (prevKey === next) {
          setDir((d) => (d === "asc" ? "desc" : "asc"));
          return prevKey;
        }
        setDir("desc");
        return next;
      });
    },
    []
  );

  return { sorted, key, dir, toggle };
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  useTableSort,
};
