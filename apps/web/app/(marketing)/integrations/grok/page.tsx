"use client";
import Link from "next/link";

export default function GrokIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <Link href="/integrations" className="text-xs text-pink-400 hover:underline">
          ← Back to All Integrations
        </Link>
        <h1 className="text-4xl font-display font-bold text-foreground dark:text-white tracking-tight">
          How to connect AdKit with Grok (xAI)
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Harness real-time trending discourse on X to launch responsive ad creative angles in real time.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-foreground dark:text-white text-xs font-semibold shadow-lg transition-all"
        >
          Connect Grok Now →
        </Link>
      </div>
    </div>
  );
}
