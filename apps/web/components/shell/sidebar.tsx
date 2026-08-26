"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AIAgentsSetupModal } from "./ai-agents-setup-modal";

/* Lock Icon component matching Image #1 */
function LockIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* Settings Gear Icon */
function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname() ?? "/";
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sec: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <>
      <aside
        aria-label="Primary navigation"
        className="hidden w-64 shrink-0 flex-col border-r border-border bg-background text-zinc-300 md:flex select-none"
      >
        {/* Top Project Selector (Exact match to Image #1) */}
        <div className="relative flex h-14 shrink-0 items-center justify-between border-b border-border px-3.5">
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-2 rounded-lg py-1 px-1.5 text-left text-xs font-semibold text-foreground dark:text-white transition-colors hover:bg-white/6 focus:outline-none"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/20 bg-zinc-800 text-[10px] font-bold text-foreground">
              Np
            </span>
            <span className="font-display tracking-tight">New project</span>
            <svg
              className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isProjectDropdownOpen && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Collapse sidebar icon button */}
          <button
            type="button"
            title="Collapse sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground dark:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
              <path d="M9 3v18" strokeWidth="1.5" />
            </svg>
          </button>

          {/* Project switch dropdown menu */}
          {isProjectDropdownOpen && (
            <div className="absolute left-3 top-13 z-50 w-56 rounded-xl border border-border bg-muted p-1.5 shadow-xl shadow-black/80 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Switch Project
              </div>
              <button
                onClick={() => setIsProjectDropdownOpen(false)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-foreground dark:text-white bg-purple-950/40 border border-primary/30"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-zinc-800 text-[9px]">Np</span>
                  New project
                </span>
                <span className="text-primary text-[10px]">Active</span>
              </button>
              <button
                onClick={() => setIsProjectDropdownOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground dark:text-white"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded bg-zinc-800 text-[9px]">Q3</span>
                Q3 Scaling Sprint
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => setIsProjectDropdownOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-primary hover:bg-purple-950/20"
              >
                <span>+</span> Create New Project
              </button>
            </div>
          )}
        </div>

        {/* Main Nav Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Section: INSPIRATION */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("inspiration")}
              className="flex w-full items-center justify-between px-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-zinc-300"
            >
              <span>INSPIRATION</span>
              <svg
                className={cn("h-3 w-3 transition-transform", collapsedSections["inspiration"] ? "-rotate-90" : "")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections["inspiration"] && (
              <div className="space-y-0.5 pt-0.5">
                {[
                  { label: "Competitors", href: "/discovery?view=competitors" },
                  { label: "Ads Library", href: "/discovery?view=library" },
                  { label: "Saved Ads", href: "/discovery?view=saved" },
                  { label: "Activity Feed", href: "/command-center" },
                ].map((item) => {
                  const active = (pathname === item.href.split("?")[0]) && !isSettingsActive;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "bg-purple-950/40 text-primary"
                          : "text-muted-foreground hover:bg-white/4 hover:text-foreground"
                      )}
                    >
                      <LockIcon />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: CREATE */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("create")}
              className="flex w-full items-center justify-between px-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-zinc-300"
            >
              <span>CREATE</span>
              <svg
                className={cn("h-3 w-3 transition-transform", collapsedSections["create"] ? "-rotate-90" : "")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections["create"] && (
              <div className="space-y-0.5 pt-0.5">
                <Link
                  href="/creative"
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                    pathname === "/creative"
                      ? "bg-purple-950/40 text-primary"
                      : "text-muted-foreground hover:bg-white/4 hover:text-foreground"
                  )}
                >
                  <LockIcon />
                  <span>Studio</span>
                </Link>
              </div>
            )}
          </div>

          {/* Section: ADS MANAGER */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("ads_manager")}
              className="flex w-full items-center justify-between px-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-zinc-300"
            >
              <span>ADS MANAGER</span>
              <svg
                className={cn("h-3 w-3 transition-transform", collapsedSections["ads_manager"] ? "-rotate-90" : "")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections["ads_manager"] && (
              <div className="space-y-0.5 pt-0.5">
                <Link
                  href="/accounts"
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                    pathname === "/accounts"
                      ? "bg-purple-950/40 text-primary"
                      : "text-muted-foreground hover:bg-white/4 hover:text-foreground"
                  )}
                >
                  <LockIcon />
                  <span>Accounts</span>
                </Link>
                <Link
                  href="/recommendations"
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                    pathname === "/recommendations"
                      ? "bg-purple-950/40 text-primary"
                      : "text-muted-foreground hover:bg-white/4 hover:text-foreground"
                  )}
                >
                  <LockIcon />
                  <span>Draft Approval</span>
                </Link>
              </div>
            )}
          </div>

          {/* Section: SETTINGS (Matching Image #1 active purple highlight) */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("settings")}
              className="flex w-full items-center justify-between px-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase hover:text-zinc-300"
            >
              <span>SETTINGS</span>
              <svg
                className={cn("h-3 w-3 transition-transform", collapsedSections["settings"] ? "-rotate-90" : "")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections["settings"] && (
              <div className="space-y-0.5 pt-0.5">
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                    isSettingsActive
                      ? "bg-purple-950/30 text-primary"
                      : "text-muted-foreground hover:bg-white/4 hover:text-foreground"
                  )}
                >
                  <GearIcon className={isSettingsActive ? "text-primary" : "text-muted-foreground"} />
                  <span>Settings</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions & User Profile Area (Exact match to Image #1) */}
        <div className="shrink-0 border-t border-border p-3 space-y-3">
          {/* Coral / Orange Gradient CTA Button: AI Agents Setup */}
          <button
            type="button"
            onClick={() => setIsSetupOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2.5 text-xs font-semibold text-foreground dark:text-white shadow-lg shadow-orange-950/40 transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            <span className="text-sm">🤖</span>
            <span>AI Agents Setup</span>
          </button>

          {/* Utility Nav Links */}
          <div className="space-y-0.5 text-xs text-muted-foreground">
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-lg px-2.5 py-1 transition-colors hover:bg-white/4 hover:text-foreground dark:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Help & Feedback</span>
            </Link>

            <a
              href="#docs"
              onClick={(e) => {
                e.preventDefault();
                setIsSetupOpen(true);
              }}
              className="flex items-center justify-between rounded-lg px-2.5 py-1 transition-colors hover:bg-white/4 hover:text-foreground dark:text-white"
            >
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Docs
              </span>
              <span className="text-[10px] text-muted-foreground">↗</span>
            </a>

            <button
              type="button"
              onClick={() => {}}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1 text-left transition-colors hover:bg-white/4 hover:text-foreground dark:text-white"
            >
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                What&apos;s New
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
          </div>

          {/* User Profile Row: prince / pal265354@gmail.com */}
          <div className="relative border-t border-border pt-2.5">
            <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-white/4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-900/60 border border-purple-500/40 text-primary text-xs font-semibold">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground dark:text-white">prince</p>
                  <p className="truncate text-[10px] text-muted-foreground">pal265354@gmail.com</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="rounded p-1 text-muted-foreground hover:text-foreground dark:text-white"
                aria-label="Profile options"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>

            {/* Profile Popover Menu */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-12 left-0 right-0 z-50 rounded-xl border border-border bg-muted p-1.5 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] text-muted-foreground">Signed in as prince</div>
                <Link
                  href="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="block rounded-md px-2 py-1.5 text-xs text-foreground dark:text-white hover:bg-white/5"
                >
                  Workspace Settings
                </Link>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSetupOpen(true);
                  }}
                  className="w-full text-left rounded-md px-2 py-1.5 text-xs text-primary hover:bg-purple-950/20"
                >
                  AI Agent Tokens
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
      <AIAgentsSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
    </>
  );
}
