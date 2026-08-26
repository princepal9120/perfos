"use client";
import Link from "next/link";

export default function ChatGptIntegrationPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <Link href="/integrations" className="text-xs text-emerald-400 hover:underline">
          ← Back to All Integrations
        </Link>
        <h1 className="text-4xl font-display font-bold text-foreground dark:text-white tracking-tight">
          How to connect AdKit with ChatGPT
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Turn ChatGPT into your 24/7 autonomous performance media buyer.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <h2 className="text-sm font-mono uppercase text-emerald-400 font-semibold">
          Custom GPT & API Key Setup
        </h2>
        <p className="text-xs text-muted-foreground">
          Use our official AdKit GPT in the GPT Store or connect the AdKit OpenAPI schema directly to your Custom GPT actions.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground dark:text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
        >
          Connect ChatGPT Now →
        </Link>
      </div>
    </div>
  );
}
