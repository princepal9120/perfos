"use client";
import Link from "next/link";

export default function CodexIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <Link href="/integrations" className="text-xs text-cyan-400 hover:underline">
          ← Back to All Integrations
        </Link>
        <h1 className="text-4xl font-display font-bold text-foreground dark:text-white tracking-tight">
          How to connect AdKit with Codex & OpenCode
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Standardized tool calls and CLI hooks for automated agent execution pipelines.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-foreground dark:text-white text-xs font-semibold shadow-lg transition-all"
        >
          Connect Codex Now →
        </Link>
      </div>
    </div>
  );
}
