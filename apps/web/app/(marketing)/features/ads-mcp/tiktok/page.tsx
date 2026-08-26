"use client";
import Link from "next/link";

export default function TikTokAdsMcpPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <Link href="/features/ads-mcp" className="text-xs text-primary hover:underline">
          ← Back to All Ads MCPs
        </Link>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground dark:text-white tracking-tight">
          TikTok Ads MCP Connector
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          Query trending Spark ad hooks, inspect audience demographics, and push short-form video variations.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-foreground dark:text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
        >
          Connect TikTok Ads MCP Now →
        </Link>
      </div>
    </div>
  );
}
