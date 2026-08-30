'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusMode = 'mock' | 'live';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Mode to display: 'mock' (default) or 'live' */
  mode?: StatusMode;
  /** Alias for mode */
  status?: StatusMode;
  /** Alias for mode */
  variant?: StatusMode;
  /** Convenience boolean prop for live mode */
  live?: boolean;
  /** Optional custom label overriding default text */
  label?: string;
  /** Whether the status dot should pulse */
  pulse?: boolean;
}

/**
 * StatusPill renders a compact indicator pill showing 'Mock data' (emerald) by default,
 * or 'Live' (blue) when set to live mode.
 */
export function StatusPill({
  mode,
  status,
  variant,
  live,
  label,
  pulse = false,
  className,
  children,
  ...props
}: StatusPillProps) {
  const isLive = Boolean(
    live || mode === 'live' || status === 'live' || variant === 'live',
  );
  const currentMode: StatusMode = isLive ? 'live' : 'mock';

  const defaultLabel = currentMode === 'live' ? 'Live' : 'Mock data';
  const displayLabel = children ?? label ?? defaultLabel;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-4 tracking-tight select-none transition-colors',
        currentMode === 'live'
          ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        className,
      )}
      {...props}
    >
      <span
        className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              currentMode === 'live' ? 'bg-blue-400' : 'bg-emerald-400',
            )}
          />
        )}
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            currentMode === 'live' ? 'bg-blue-400' : 'bg-emerald-400',
          )}
        />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusPill;
