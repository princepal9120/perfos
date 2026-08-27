/* Hallmark · macrostructure: Workbench · tone: modern-minimal · anchor hue: daisy-black
 * pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black
 */
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type * as React from 'react';
import { Suspense, useState } from 'react';
import { cn } from '@/lib/utils';
import { AIAgentsSetupModal } from './ai-agents-setup-modal';

/* ------------------------------------------------------------------ */
/* Vector Icons                                                       */
/* ------------------------------------------------------------------ */

function CommandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function OverviewIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function LoopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function StudioIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" />
      <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" />
    </svg>
  );
}

function PlugIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v6" />
      <path d="m19 13-4-4" />
      <path d="M10 20l4-4" />
      <path d="m2 22 3-3" />
      <path d="M9.5 9.5 6 6" />
      <path d="m6 18 6-6" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation Items Data                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  view?: string | null;
  badge?: string;
  Icon: (props: { className?: string }) => React.JSX.Element;
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-transparent',
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <item.Icon
          className={active ? 'text-primary' : 'text-muted-foreground'}
        />
        <span className="truncate">{item.label}</span>
      </div>
      {item.badge && (
        <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function InspirationLinksComponent({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') ?? 'library';

  const items: NavItem[] = [
    {
      label: 'Ads Library',
      href: '/discovery?view=library',
      view: 'library',
      Icon: LayersIcon,
    },
    {
      label: 'Competitor Watch',
      href: '/discovery?view=competitors',
      view: 'competitors',
      Icon: TargetIcon,
    },
    {
      label: 'Saved Boards',
      href: '/discovery?view=saved',
      view: 'saved',
      Icon: BookmarkIcon,
    },
  ];

  return (
    <>
      {items.map((item) => {
        const active = pathname === '/discovery' && currentView === item.view;
        return <NavLink key={item.label} item={item} active={active} />;
      })}
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname() ?? '/';
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (sec: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  return (
    <>
      <aside
        aria-label="Primary navigation"
        className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface text-foreground md:flex select-none"
      >
        {/* Top Project Selector */}
        <div className="relative flex h-14 shrink-0 items-center justify-between border-b border-border px-3.5">
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-2 rounded-lg py-1 px-1.5 text-left text-xs font-semibold text-foreground transition-colors hover:bg-surface-elevated focus:outline-none"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-[10px] font-bold text-primary">
              ⌘
            </span>
            <span className="font-display tracking-tight text-foreground">
              Demo DTC Brand
            </span>
            <svg
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground transition-transform',
                isProjectDropdownOpen && 'rotate-180',
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <span
            className="flex h-2 w-2 rounded-full bg-emerald-500"
            title="Connected to API"
          />

          {/* Project switch dropdown menu */}
          {isProjectDropdownOpen && (
            <div className="absolute left-3 top-13 z-50 w-56 rounded-xl border border-border bg-surface-elevated p-1.5 shadow-xl shadow-black/80 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace
              </div>
              <button
                onClick={() => setIsProjectDropdownOpen(false)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground bg-primary/10 border border-primary/30"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-primary/20 text-[9px] text-primary">
                    DTC
                  </span>
                  Demo DTC Brand
                </span>
                <span className="text-primary text-[10px]">Active</span>
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => setIsProjectDropdownOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-primary hover:bg-primary/10"
              >
                <span>+</span> Connect New Ad Account
              </button>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Section: COPILOT & CORE */}
          <div className="space-y-1">
            <div className="px-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              COPILOT & CORE
            </div>
            <div className="space-y-0.5">
              <NavLink
                item={{
                  label: 'Command Center',
                  href: '/command-center',
                  badge: 'ChatGPT',
                  Icon: CommandIcon,
                }}
                active={pathname === '/command-center' || pathname === '/chat'}
              />
              <NavLink
                item={{
                  label: 'Daily Briefing',
                  href: '/overview',
                  Icon: OverviewIcon,
                }}
                active={pathname === '/overview'}
              />
              <NavLink
                item={{
                  label: 'Growth Loop',
                  href: '/loop',
                  badge: 'Auto',
                  Icon: LoopIcon,
                }}
                active={pathname === '/loop'}
              />
            </div>
          </div>

          {/* Section: INTELLIGENCE & CREATIVE */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('intel')}
              className="flex w-full items-center justify-between px-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground"
            >
              <span>INTELLIGENCE & CREATIVE</span>
              <svg
                className={cn(
                  'h-3 w-3 transition-transform',
                  collapsedSections['intel'] ? '-rotate-90' : '',
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {!collapsedSections['intel'] && (
              <div className="space-y-0.5 pt-0.5">
                <Suspense
                  fallback={
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      Loading...
                    </div>
                  }
                >
                  <InspirationLinksComponent pathname={pathname} />
                </Suspense>
                <NavLink
                  item={{
                    label: 'Creative Studio',
                    href: '/creative',
                    Icon: StudioIcon,
                  }}
                  active={pathname === '/creative'}
                />
              </div>
            )}
          </div>

          {/* Section: MEDIA & OPTIMIZATION */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('media')}
              className="flex w-full items-center justify-between px-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground"
            >
              <span>MEDIA & OPTIMIZATION</span>
              <svg
                className={cn(
                  'h-3 w-3 transition-transform',
                  collapsedSections['media'] ? '-rotate-90' : '',
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {!collapsedSections['media'] && (
              <div className="space-y-0.5 pt-0.5">
                <NavLink
                  item={{
                    label: 'Draft Approvals',
                    href: '/recommendations',
                    Icon: CheckCircleIcon,
                  }}
                  active={pathname === '/recommendations'}
                />
                <NavLink
                  item={{
                    label: 'Ad Accounts',
                    href: '/accounts',
                    Icon: CreditCardIcon,
                  }}
                  active={pathname === '/accounts'}
                />
                <NavLink
                  item={{
                    label: 'Measurement & iROAS',
                    href: '/measurement',
                    Icon: ChartIcon,
                  }}
                  active={pathname === '/measurement'}
                />
              </div>
            )}
          </div>

          {/* Section: INFRA & INTEGRATIONS */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('infra')}
              className="flex w-full items-center justify-between px-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground"
            >
              <span>INFRA & AGENTS</span>
              <svg
                className={cn(
                  'h-3 w-3 transition-transform',
                  collapsedSections['infra'] ? '-rotate-90' : '',
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {!collapsedSections['infra'] && (
              <div className="space-y-0.5 pt-0.5">
                <NavLink
                  item={{
                    label: 'AI Agents Fleet',
                    href: '/agents',
                    Icon: BotIcon,
                  }}
                  active={pathname === '/agents'}
                />
                <NavLink
                  item={{
                    label: 'Connected Apps',
                    href: '/connected-apps',
                    Icon: PlugIcon,
                  }}
                  active={pathname === '/connected-apps'}
                />
                <NavLink
                  item={{
                    label: 'MCP Servers',
                    href: '/mcp',
                    Icon: TerminalIcon,
                  }}
                  active={pathname === '/mcp'}
                />
                <NavLink
                  item={{
                    label: 'Settings',
                    href: '/settings',
                    Icon: GearIcon,
                  }}
                  active={pathname === '/settings'}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions & User Profile Area */}
        <div className="shrink-0 border-t border-border p-3 space-y-3 bg-surface">
          {/* AI Agents Setup CTA Button */}
          <button
            type="button"
            onClick={() => setIsSetupOpen(true)}
            className="btn-daisy-solid flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-xs"
          >
            <span>🤖</span>
            <span>AI Agents Setup</span>
          </button>

          {/* User Profile Row */}
          <div className="relative border-t border-border pt-2">
            <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-surface-elevated">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold font-mono">
                  P
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    prince
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    pal265354@gmail.com
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Profile options"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>

            {/* Profile Popover Menu */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-12 left-0 right-0 z-50 rounded-xl border border-border bg-surface-elevated p-1.5 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] text-muted-foreground">
                  Signed in as prince
                </div>
                <Link
                  href="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="block rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-muted"
                >
                  Workspace Settings
                </Link>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSetupOpen(true);
                  }}
                  className="w-full text-left rounded-md px-2 py-1.5 text-xs text-primary hover:bg-primary/10"
                >
                  AI Agent API Tokens
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full text-left rounded-md px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-950/20"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* AI Agents Setup Modal */}
      <AIAgentsSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
      />
    </>
  );
}
