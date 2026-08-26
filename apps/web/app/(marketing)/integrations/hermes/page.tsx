"use client";
import Link from "next/link";

export default function HermesIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <Link href="/integrations" className="text-xs text-purple-400 hover:underline">
          ← Back to All Integrations
        </Link>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">
          How to connect AdKit with Hermes Agent
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Run private local LLMs over your ad metrics and creative library with complete data sovereignty.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg transition-all"
        >
          Connect Hermes Now →
        </Link>
      </div>
    </div>
  );
}
