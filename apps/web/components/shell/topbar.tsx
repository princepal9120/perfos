"use client";

import type { ReactNode } from "react";
import StatusPill from "@/components/shell/status-pill";

export interface TopbarProps {
  onOpenCommand?: () => void;
  statusPill?: ReactNode;
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function Topbar({ onOpenCommand, statusPill }: TopbarProps) {
  function handleOpenCommand() {
    if (onOpenCommand) {
      onOpenCommand();
      return;
    }

    window.dispatchEvent(new CustomEvent("open-command-menu"));
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-deep px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate font-display text-sm font-semibold tracking-tight text-zinc-200">
          PerfOS Mock
        </span>
        <span aria-hidden="true" className="text-zinc-500">
          /
        </span>
        <span className="hidden text-xs text-zinc-500 sm:inline">Workspace</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleOpenCommand}
          aria-label="Open command menu"
          className="group flex h-8 items-center gap-2 rounded-md border border-border-subtle bg-bg-surface px-2.5 text-xs text-zinc-400 outline-none transition duration-normal ease-out hover:border-border-hover hover:bg-bg-elevated hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.98]"
        >
          <SearchIcon />
          <span className="hidden sm:inline">Search or jump to</span>
          <kbd className="hidden rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-sans text-[10px] text-zinc-500 sm:inline">
            ⌘K
          </kbd>
        </button>

        {statusPill ?? <StatusPill />}

        <button
          type="button"
          aria-label="Open profile menu"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 font-display text-[11px] font-semibold text-blue-400 outline-none transition duration-normal ease-out hover:border-blue-400/60 hover:bg-blue-500/20 focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.98]"
        >
          PM
        </button>
      </div>
    </header>
  );
}

export default Topbar;
