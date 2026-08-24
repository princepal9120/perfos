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
    href: "/agents",
    label: "Agents",
    icon: <Icon d="M5 5h14v14H5zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" circle />,
  },
  {
    href: "/integrations",
    label: "Integrations",
    icon: <Icon d="M9 7V2M15 7V2M6 7h12v5a6 6 0 0 1-12 0V7zM12 18v4" />,
  },
  {
    href: "/command-center",
    label: "Command Center",
    icon: <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
];

const exploreNav: NavItem[] = [
  {
    href: "/mcp",
    label: "MCP",
    icon: <Icon d="M8 8h8v8H8zM3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4z" />,
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
  "/agents": "Agents",
  "/integrations": "Integrations",
  "/command-center": "Command Center",
  "/mcp": "MCP Servers",
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
        <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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
                "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                item.href === "/mcp" && "hidden md:flex",
                collapsed ? "justify-center px-2 py-2" : "",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>
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
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-[56px]" : "w-[196px]"
        )}
        aria-label="Sidebar"
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border px-2.5",
            collapsed ? "justify-center" : "justify-between gap-1.5"
          )}
        >
          {collapsed ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#53b1fd] text-sm font-bold text-white">
              P
            </span>
          ) : (
            <>
              <Link href="/overview" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#53b1fd] text-[13px] font-bold text-white">
                  P
                </span>
                <span className="text-sm font-semibold tracking-tight">PerfOS</span>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Collapse sidebar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path d="M11 4H4v16h7M13 12h8M13 12l3-3M13 12l3 3" /></svg>
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-1.5 py-2.5">
          <NavSection label="Menu" items={menuNav} pathname={pathname} collapsed={collapsed} />
          <NavSection label="Explore" items={exploreNav} pathname={pathname} collapsed={collapsed} />
          <NavSection label="Account" items={accountNav} pathname={pathname} collapsed={collapsed} />
        </div>

        {/* Plan card */}
        {!collapsed && (
          <div className="border-t border-sidebar-border px-2 py-2">
            <div className="flex items-center justify-between gap-1.5 rounded-lg border border-sidebar-border bg-muted/60 px-2 py-1.5 text-xs">
              <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                Demo
              </span>
              <span className="truncate text-[11px] font-semibold">PerfOS Mock</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Console</span>
            <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden="true">
              /
            </span>
            <h1 className="font-display text-base font-semibold tracking-tight">{title}</h1>
          </nav>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden="true" />
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
