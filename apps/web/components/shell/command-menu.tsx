"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type CommandRoute = {
  href: string;
  label: string;
};

const routes: CommandRoute[] = [
  { href: "/overview", label: "Overview" },
  { href: "/discovery", label: "Discovery" },
  { href: "/creative", label: "Creative" },
  { href: "/loop", label: "Loop" },
  { href: "/measurement", label: "Measurement" },
  { href: "/accounts", label: "Accounts" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/experiments", label: "Experiments" },
  { href: "/agents", label: "Agents" },
  { href: "/mcp", label: "MCP" },
  { href: "/command-center", label: "Command center" },
  { href: "/chat", label: "Chat" },
  { href: "/settings", label: "Settings" },
  { href: "/connected-apps", label: "Integrations" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function CommandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 9V7a3 3 0 1 0-3 3h2m7-1V7a3 3 0 1 1 3 3h-2m-7 5v2a3 3 0 1 1-3-3h2m7 1v2a3 3 0 1 0 3-3h-2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9h6v6H9z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isOpen = open ?? internalOpen;

  const setMenuOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open]
  );

  const filteredRoutes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return routes;

    return routes.filter(
      (route) =>
        route.label.toLowerCase().includes(normalizedQuery) ||
        route.href.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  useEffect(() => {
    const handleOpen = () => setMenuOpen(true);
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(true);
      }
    };

    window.addEventListener("open-command-menu", handleOpen);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("open-command-menu", handleOpen);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, [setMenuOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setSelectedIndex(0);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigateTo = (route: CommandRoute) => {
    setMenuOpen(false);
    router.push(route.href);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % Math.max(filteredRoutes.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => (index - 1 + Math.max(filteredRoutes.length, 1)) % Math.max(filteredRoutes.length, 1));
    } else if (event.key === "Enter" && filteredRoutes[selectedIndex]) {
      event.preventDefault();
      navigateTo(filteredRoutes[selectedIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setMenuOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-[12vh] backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setMenuOpen(false);
      }}
    >
      <section
        aria-label="Command menu"
        aria-modal="true"
        className="w-full max-w-xl overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-[0_24px_80px_rgba(9,9,11,0.55)]"
        role="dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setMenuOpen(false);
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-border-subtle px-4">
          <span className="h-4 w-4 shrink-0 text-text-muted"><SearchIcon /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages..."
            aria-label="Search dashboard pages"
            className="h-14 min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
          <kbd className="hidden rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-sans text-[10px] text-text-muted sm:inline-flex">esc</kbd>
        </div>

        <div className="border-b border-border-subtle px-2 py-2">
          <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            <CommandIcon />
            <span>Navigate</span>
          </div>
          {filteredRoutes.length > 0 ? (
            <div role="listbox" aria-label="Dashboard pages">
              {filteredRoutes.map((route, index) => (
                <button
                  key={route.href}
                  type="button"
                  role="option"
                  aria-selected={index === selectedIndex}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => navigateTo(route)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none transition duration-normal ease-out active:scale-[0.99]",
                    "focus-visible:ring-2 focus-visible:ring-accent/60",
                    index === selectedIndex
                      ? "bg-accent-muted text-text-primary"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  )}
                >
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-md border", index === selectedIndex ? "border-accent/30 bg-accent/10 text-accent" : "border-border-subtle bg-bg-elevated text-text-muted")}>
                    <ArrowIcon />
                  </span>
                  <span className="flex-1 text-sm font-medium">{route.label}</span>
                  <span className="text-text-muted opacity-0 transition-opacity group-hover:opacity-100 group-aria-selected:opacity-100"><ArrowIcon /></span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-2.5 py-8 text-center text-sm text-text-muted">No pages match “{query}”.</p>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-text-muted">
          <span>Use ↑ ↓ to move</span>
          <span className="flex items-center gap-1.5"><kbd className="rounded border border-border-subtle bg-bg-elevated px-1 py-0.5">↵</kbd> to open</span>
        </div>
      </section>
    </div>
  );
}

export default CommandMenu;
