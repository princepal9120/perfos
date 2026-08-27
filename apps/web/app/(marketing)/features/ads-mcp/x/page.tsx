'use client';
import Link from 'next/link';

export default function XAdsMcpPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <Link
          href="/features/ads-mcp"
          className="text-xs text-primary hover:underline"
        >
          ← Back to All Ads MCPs
        </Link>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground dark:text-white tracking-tight">
          X (Twitter) Ads MCP Connector
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          Promoted post management, follower lookalikes, and keyword
          conversation targeting for tech audiences.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-foreground dark:text-white text-xs font-semibold shadow-lg transition-all"
        >
          Connect X Ads MCP Now →
        </Link>
      </div>
    </div>
  );
}
