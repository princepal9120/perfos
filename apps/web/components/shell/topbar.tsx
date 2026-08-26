"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import StatusPill from "@/components/shell/status-pill";

export interface TopbarProps {
  onOpenCommand?: () => void;
  statusPill?: ReactNode;
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
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
  const pathname = usePathname() ?? "/";

  const getTitle = () => {
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/discovery")) return "Inspiration & Discovery";
    if (pathname.includes("/creative")) return "Studio";
    if (pathname.includes("/accounts")) return "Ad Accounts";
    if (pathname.includes("/recommendations")) return "Draft Approval";
    if (pathname.includes("/measurement")) return "Measurement & iROAS";
    if (pathname.includes("/agents")) return "AI Agents";
    if (pathname.includes("/loop")) return "Optimization Loop";
    if (pathname.includes("/command-center")) return "Activity Feed";
    if (pathname.includes("/chat")) return "Agent Chat";
    return "Overview";
  };

  function handleOpenCommand() {
    if (onOpenCommand) {
      onOpenCommand();
      return;
    }

    window.dispatchEvent(new CustomEvent("open-command-menu"));
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#0c0d12] px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="truncate font-display text-sm font-semibold tracking-tight text-zinc-100">
          {getTitle()}
        </span>
        <span aria-hidden="true" className="text-zinc-600 text-xs">
          /
        </span>
        <span className="hidden text-xs text-zinc-400 sm:inline">New project</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleOpenCommand}
          aria-label="Open command menu"
          className="group flex h-8 items-center gap-2 rounded-lg border border-white/8 bg-[#14151e] px-2.5 text-xs text-zinc-400 outline-none transition duration-150 ease-out hover:border-white/20 hover:bg-[#1a1b26] hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-purple-500/50 active:scale-[0.98]"
        >
          <SearchIcon />
          <span className="hidden sm:inline">Search or jump to</span>
          <kbd className="hidden rounded border border-white/10 bg-[#1e202c] px-1.5 py-0.5 font-sans text-[10px] text-zinc-400 sm:inline">
            ⌘K
          </kbd>
        </button>

        {statusPill ?? <StatusPill />}

        <button
          type="button"
          aria-label="Open profile menu"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 font-display text-xs font-semibold text-purple-300 outline-none transition duration-150 ease-out hover:border-purple-400/60 hover:bg-purple-500/20 focus-visible:ring-2 focus-visible:ring-purple-500/60 active:scale-[0.98]"
        >
          P
        </button>
      </div>
    </header>
  );
}

export default Topbar;
