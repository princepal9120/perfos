"use client";
import Link from "next/link";

export default function PerplexityIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <Link href="/integrations" className="text-xs text-teal-400 hover:underline">
          ← Back to All Integrations
        </Link>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">
          How to connect AdKit with Perplexity AI
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Live web market research and competitor ad analysis synthesized straight into your AdKit swipe files.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg transition-all"
        >
          Connect Perplexity Now →
        </Link>
      </div>
    </div>
  );
}
