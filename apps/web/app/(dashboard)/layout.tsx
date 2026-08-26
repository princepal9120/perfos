"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/shell/sidebar";
import Topbar from "@/components/shell/topbar";
import CommandMenu from "@/components/shell/command-menu";
import { FloatingAiAssistant } from "@/components/shell/floating-ai-assistant";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground antialiased">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main id="main-content" className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Copilot Action Button */}
      <FloatingAiAssistant />

      {/* Command Palette */}
      <CommandMenu />
    </div>
  );
}
