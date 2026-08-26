"use client";
import Link from "next/link";

export default function OpenClawIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <Link href="/integrations" className="text-xs text-primary hover:underline">
          ← Back to All Integrations
        </Link>
        <h1 className="text-4xl font-display font-bold text-foreground dark:text-white tracking-tight">
          How to connect AdKit with OpenClaw
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Pre-built claw skill wrappers for continuous ad discovery and autonomous campaign execution.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary text-white dark:text-white text-xs font-semibold shadow-lg transition-all"
        >
          Connect OpenClaw Now →
        </Link>
      </div>
    </div>
  );
}
