"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  /** Match the path exactly instead of also matching subpaths */
  exact?: boolean;
  icon: ReactNode;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

function Icon({ children }: { children: ReactNode }) {
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
      {children}
    </svg>
  );
}

const sections: NavSection[] = [
  {
    label: "Pipeline",
    items: [
      {
        href: "/overview",
        label: "Overview",
        exact: true,
        icon: (
          <Icon>
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
          </Icon>
        ),
      },
      {
        href: "/discovery",
        label: "Discovery",
        icon: (
          <Icon>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </Icon>
        ),
      },
      {
        href: "/creative",
        label: "Create",
        icon: (
          <Icon>
            <path d="M4 4h16v16H4zM12 8v8M8 12h8" />
          </Icon>
        ),
      },
      {
        href: "/loop",
        label: "Loop",
        icon: (
          <Icon>
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </Icon>
        ),
      },
      {
        href: "/measurement",
        label: "Measurement",
        icon: (
          <Icon>
            <path d="M3 3v18h18M7 15l4-6 4 3 5-8" />
          </Icon>
        ),
      },
    ],
  },
  {
    label: "Operate",
    items: [
      {
        href: "/accounts",
        label: "Accounts",
        icon: (
          <Icon>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L13 4.5M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L11 19.5" />
          </Icon>
        ),
      },
      {
        href: "/recommendations",
        label: "Recommendations",
        icon: (
          <Icon>
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
          </Icon>
        ),
      },
      {
        href: "/experiments",
        label: "Experiments",
        icon: (
          <Icon>
            <path d="M9 3h6M10 3v5.2L4.9 17.6A2 2 0 0 0 6.7 20.5h10.6a2 2 0 0 0 1.8-2.9L14 8.2V3M7.5 15h9" />
          </Icon>
        ),
      },
      {
        href: "/agents",
        label: "Agents",
        icon: (
          <Icon>
            <path d="M5 5h14v14H5zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
            <circle cx="12" cy="12" r="2.5" />
          </Icon>
        ),
      },
      {
        href: "/mcp",
        label: "MCP",
        icon: (
          <Icon>
            <path d="M4 4h16v6H4zM4 14h16v6H4zM7 7h.01M7 17h.01" />
          </Icon>
        ),
      },
      {
        href: "/command-center",
        label: "Command center",
        icon: (
          <Icon>
            <path d="M4 5h16v14H4zM7 9l3 3-3 3M13 15h4" />
          </Icon>
        ),
      },
      {
        href: "/creative",
        label: "Creative",
        icon: (
          <Icon>
            <path d="M4 4h16v16H4zM4 15l4-4 3 3 5-5 4 4" />
            <circle cx="9" cy="9" r="1.25" />
          </Icon>
        ),
      },
      {
        href: "/integrations",
        label: "Integrations",
        icon: (
          <Icon>
            <path d="M8 8h8v8H8zM3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4z" />
          </Icon>
        ),
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        href: "/chat",
        label: "Chat",
        icon: (
          <Icon>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
          </Icon>
        ),
      },
      {
        href: "/settings",
        label: "Settings",
        icon: (
          <Icon>
            <circle cx="7" cy="7" r="3" />
            <circle cx="17" cy="17" r="3" />
            <path d="M20 7h-9M14 17H5" />
          </Icon>
        ),
      },
    ],
  },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href, item.exact ?? false);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg py-1.5 pl-3 pr-2.5 text-sm font-medium",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        "transition duration-normal ease-out active:scale-[0.98]",
        active
          ? "bg-accent-muted text-text-primary"
          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
      )}
    >
      {/* Active marker: accent left border */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-y-[5px] left-0 w-[2px] rounded-full bg-accent"
        />
      )}
      <span className={cn("shrink-0", active ? "text-accent" : "text-text-muted")}>
        {item.icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden w-60 shrink-0 flex-col border-r border-border-subtle bg-surface md:flex"
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border-subtle px-4">
        <Link
          href="/overview"
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border-hover bg-bg-elevated font-display text-xs font-semibold text-text-primary">
            P
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-text-primary">
            PerfOS
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-2 py-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="pb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-subtle px-4 py-3">
        <p className="text-[11px] font-medium text-text-muted">PerfOS mock workspace</p>
      </div>
    </aside>
  );
}
