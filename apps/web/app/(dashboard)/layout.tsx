"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/shell/sidebar";
import Topbar from "@/components/shell/topbar";
import CommandMenu from "@/components/shell/command-menu";
import PageHeader from "@/components/shell/page-header";
import StatusPill from "@/components/shell/status-pill";
import EmptyState from "@/components/shell/empty-state";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#09090b] text-zinc-100">
      {/* Exactly ONE sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#09090b]">
          <div className="mx-auto w-full max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandMenu />
    </div>
  );
}
