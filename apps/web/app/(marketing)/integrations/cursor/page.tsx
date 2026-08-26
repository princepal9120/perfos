"use client";
import Link from "next/link";

export default function CursorIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <Link href="/integrations" className="text-xs text-indigo-400 hover:underline">
          ← Back to All Integrations
        </Link>
        <h1 className="text-4xl font-display font-bold text-foreground dark:text-white tracking-tight">
          How to connect AdKit with Cursor IDE
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Build, iterate, and deploy ad campaigns right alongside your codebase in Cursor Composer & Agent.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <h2 className="text-sm font-mono uppercase text-indigo-400 font-semibold">
          Cursor MCP Configuration
        </h2>
        <p className="text-xs text-muted-foreground">
          Go to Cursor Settings &gt; Features &gt; MCP &gt; Add New MCP Server. Choose type <code className="text-foreground">command</code> and enter <code className="text-foreground">npx -y @adkit/mcp-server</code>.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-foreground dark:text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          Get Started with Cursor →
        </Link>
      </div>
    </div>
  );
}
