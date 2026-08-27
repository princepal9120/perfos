/* Hallmark · macrostructure: Workbench · tone: modern-minimal · anchor hue: daisy-black
 * pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import StatusPill from '@/components/shell/status-pill';

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
  const pathname = usePathname() ?? '/';

  const getTitle = () => {
    if (pathname.includes('/command-center') || pathname === '/chat')
      return 'Central Command Center';
    if (pathname.includes('/overview')) return 'Daily Briefing & Overview';
    if (pathname.includes('/loop')) return 'Autonomous Growth Loop';
    if (pathname.includes('/discovery')) return 'Inspiration & Spy Library';
    if (pathname.includes('/creative')) return 'Creative Studio';
    if (pathname.includes('/recommendations')) return 'Draft Approvals';
    if (pathname.includes('/accounts')) return 'Ad Accounts';
    if (pathname.includes('/measurement')) return 'Measurement & iROAS';
    if (pathname.includes('/agents')) return 'AI Agents Fleet';
    if (pathname.includes('/connected-apps')) return 'Connected Apps';
    if (pathname.includes('/mcp')) return 'MCP Servers';
    if (pathname.includes('/settings')) return 'Workspace Settings';
    return 'Overview';
  };

  function handleOpenCommand() {
    if (onOpenCommand) {
      onOpenCommand();
      return;
    }

    window.dispatchEvent(new CustomEvent('open-command-menu'));
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="truncate font-display text-sm font-semibold tracking-tight text-foreground">
          {getTitle()}
        </span>
        <span aria-hidden="true" className="text-zinc-600 text-xs">
          /
        </span>
        <span className="hidden text-xs text-muted-foreground sm:inline font-mono">
          Demo DTC Brand
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {pathname !== '/command-center' && (
          <Link
            href="/command-center"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
          >
            <span>⌘</span>
            <span>Command Center</span>
          </Link>
        )}

        <button
          type="button"
          onClick={handleOpenCommand}
          aria-label="Open command menu"
          className="group flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs text-muted-foreground outline-none transition duration-150 ease-out hover:border-white/20 hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary active:scale-[0.98]"
        >
          <SearchIcon />
          <span className="hidden sm:inline">Search or jump to</span>
          <kbd className="hidden rounded border border-border bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>

        {statusPill ?? <StatusPill />}

        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-bold text-primary">
          P
        </div>
      </div>
    </header>
  );
}

export default Topbar;
