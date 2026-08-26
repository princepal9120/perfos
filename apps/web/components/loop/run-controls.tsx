"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LoopRunResult {
  status?: string;
  dry_run?: boolean;
  [key: string]: unknown;
}

interface RunControlsProps {
  /** Called with the parsed response after any run finishes successfully. */
  onComplete?: (result: LoopRunResult) => void;
  className?: string;
}

interface RunState {
  mode: "dry_run" | "live";
  running: boolean;
}

/**
 * Loop run controls: dry-run executes one full cycle read-only; the live run
 * requires confirmation because it can reach connected ad platforms (launch
 * still pauses at the safety gate).
 */
export function RunControls({ onComplete, className }: RunControlsProps) {
  const [run, setRun] = useState<RunState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<{
    mode: "dry_run" | "live";
    seconds: number;
  } | null>(null);
  const startedAt = useRef<number>(0);

  const execute = useCallback(
    async (mode: "dry_run" | "live") => {
      setRun({ mode, running: true });
      setError(null);
      startedAt.current = performance.now();
      try {
        const res = await fetch("/api/loop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dry_run: mode === "dry_run" }),
        });
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            data && typeof data === "object" && "detail" in data
              ? String((data as { detail: unknown }).detail)
              : `Loop failed with status ${res.status}`
          );
        }
        setLastRun({ mode, seconds: (performance.now() - startedAt.current) / 1000 });
        onComplete?.((data && typeof data === "object" ? data : {}) as LoopRunResult);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Loop failed. Is the API running?"
        );
      } finally {
        setRun(null);
      }
    },
    [onComplete]
  );

  return (
    <div className={cn("flex flex-col items-start gap-2 sm:items-end", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => void execute("dry_run")}
          disabled={!!run}
        >
          {run?.mode === "dry_run" ? <Spinner /> : null}
          {run?.mode === "dry_run" ? "Running dry-run…" : "Dry-run"}
        </Button>
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={!!run}
          className="bg-accent text-white hover:bg-accent-hover active:bg-accent-hover"
        >
          {run?.mode === "live" ? <Spinner /> : null}
          {run?.mode === "live" ? "Running loop…" : "Run loop"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="max-w-sm text-xs leading-relaxed text-red-400">
          {error}
        </p>
      )}
      {!error && lastRun && (
        <p className="max-w-sm text-xs tabular-nums text-zinc-500">
          Last run: {lastRun.mode === "dry_run" ? "dry-run" : "live"} finished
          in {lastRun.seconds.toFixed(1)}s
        </p>
      )}

      {confirmOpen && (
        <ConfirmRunDialog
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            void execute("live");
          }}
          busy={!!run}
        />
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
    />
  );
}

function ConfirmRunDialog({
  onConfirm,
  onCancel,
  busy,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-loop-confirm-title"
        aria-describedby="run-loop-confirm-desc"
        className="relative w-full max-w-md rounded-xl border border-white/[0.08] bg-[#18181c] p-6 shadow-lg shadow-black/40"
      >
        <h2 id="run-loop-confirm-title" className="text-base font-semibold tracking-tight text-zinc-100">
          Run the loop on live accounts?
        </h2>
        <p id="run-loop-confirm-desc" className="mt-2 text-sm leading-relaxed text-zinc-400">
          This runs find &rarr; score &rarr; create &rarr; launch &rarr; track
          &rarr; double down against your connected ad platforms. Launch stays
          paused at the safety gate until you approve each action.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button ref={cancelRef} variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={busy}
            className="bg-accent text-white hover:bg-accent-hover active:bg-accent-hover"
          >
            {busy ? <Spinner /> : null}
            {busy ? "Starting…" : "Run now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
