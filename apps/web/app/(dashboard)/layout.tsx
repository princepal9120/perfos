"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  icon: ReactNode;
};

function Icon({ d, circle }: { d: string; circle?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      {circle ? <circle cx="12" cy="12" r="2.5" /> : null}
      <path d={d} />
    </svg>
  );
}

const menuNav: NavItem[] = [
  {
    href: "/overview",
    label: "Overview",
    exact: true,
    icon: <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  },
  {
    href: "/accounts",
    label: "Accounts",
    icon: <Icon d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L13 4.5M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L11 19.5" />,
  },
  {
    href: "/recommendations",
    label: "Recommendations",
    icon: <Icon d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
  },
  {
    href: "/experiments",
    label: "Experiments",
    icon: <Icon d="M9 3h6M10 3v5.2L4.9 17.6A2 2 0 0 0 6.7 20.5h10.6a2 2 0 0 0 1.8-2.9L14 8.2V3M7.5 15h9" />,
  },
  {
    href: "/measurement",
    label: "Measurement",
    icon: <Icon d="M12 3a9 9 0 0 1 9 9M12 3a9 9 0 0 0-9 9m9-9v4m9 5h-4M3 12h4m5 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />,
  },
  {
    href: "/creative",
    label: "Creative",
    icon: <Icon d="M4 4h16v16H4zM4 15l4-4 3 3 5-5 4 4" />,
  },
  {
    href: "/agents",
    label: "Agents",
    icon: <Icon d="M5 5h14v14H5zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" circle />,
  },
  {
    href: "/integrations",
    label: "Integrations",
    icon: <Icon d="M8 8h8v8H8zM3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4z" />,
  },
  {
    href: "/mcp",
    label: "MCP",
    icon: <Icon d="M8 8h8v8H8zM3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4z" />,
  },
  {
    href: "/command-center",
    label: "Command",
    icon: <Icon d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
  },
];

const accountNav: NavItem[] = [
  {
    href: "/settings",
    label: "Settings",
    icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 6.6 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 13.4H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.8 6.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17.4 4.8l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />,
  },
];

const TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/": "Overview",
  "/accounts": "Accounts",
  "/recommendations": "Recommendations",
  "/experiments": "Experiments",
  "/measurement": "Measurement",
  "/creative": "Creative Analytics",
  "/agents": "Agents",
  "/mcp": "MCP Servers",
  "/integrations": "Integrations",
  "/command-center": "Command Center",
  "/settings": "Settings",
};

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({
  label,
  items,
  pathname,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5b5b73]">
          {label}
        </p>
      )}
      <nav className="space-y-0.5" aria-label={label}>
        {items.map((item) => {
          const active = isActive(pathname, item.href, item.exact ?? false);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50",
                item.href === "/command-center" && "hidden md:flex",
                collapsed ? "justify-center px-2 py-2" : "",
                active
                  ? "bg-white/[0.06] text-white"
                  : "text-[#8b8ba3] hover:bg-white/[0.04] hover:text-[#f0f0f5]"
              )}
            >
              <span className={cn("shrink-0", active ? "text-[#3b82f6]" : "text-[#5b5b73]")}>
                {item.icon}
              </span>
              {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  const title =
    TITLES[pathname] ??
    TITLES[Object.keys(TITLES).find((k) => k !== "/" && pathname.startsWith(k)) ?? ""] ??
    "PerfOS";

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#050508] text-[#f0f0f5]">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a12]/80 backdrop-blur-xl transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-[56px]" : "w-[196px]"
        )}
        aria-label="Sidebar"
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-white/[0.06] px-2.5",
            collapsed ? "justify-center" : "justify-between gap-1.5"
          )}
        >
          {collapsed ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-sm font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)]">
              P
            </span>
          ) : (
            <>
              <Link href="/overview" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50 rounded-lg">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-[13px] font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)]">
                  P
                </span>
                <span className="text-sm font-semibold tracking-tight text-[#f0f0f5]">PerfOS</span>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#5b5b73] hover:bg-white/[0.06] hover:text-[#f0f0f5] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50"
                aria-label="Collapse sidebar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path d="M11 4H4v16h7M13 12h8M13 12l3-3M13 12l3 3" /></svg>
              </button>
            </>
          )}
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-1.5 py-2.5">
          <NavSection label="Menu" items={menuNav} pathname={pathname} collapsed={collapsed} />
          <NavSection label="Account" items={accountNav} pathname={pathname} collapsed={collapsed} />
        </div>

        {!collapsed && (
          <div className="border-t border-white/[0.06] px-2 py-2">
            <div className="flex items-center justify-between gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-xs">
              <span className="rounded bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                Demo
              </span>
              <span className="truncate text-[11px] font-semibold text-[#f0f0f5]">PerfOS Mock</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0a12]/60 px-4 backdrop-blur-xl sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <span className="hidden text-[#5b5b73] sm:inline">Console</span>
            <span className="hidden text-[#5b5b73]/40 sm:inline" aria-hidden="true">/</span>
            <h1 className="text-base font-semibold tracking-tight text-[#f0f0f5]">{title}</h1>
          </nav>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
              Mock data
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
