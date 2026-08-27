'use client';
import Link from 'next/link';

export default function GoogleAdsMcpPage() {
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
          Google Ads MCP Connector
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          Manage Search, Performance Max, and YouTube ad assets directly through
          AI agent tools.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
        <h2 className="text-base font-display font-bold text-foreground dark:text-white">
          Included Tools for AI Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-black/40 border border-border space-y-1">
            <span className="text-amber-400 font-bold">
              adkit_google_get_campaigns
            </span>
            <p className="text-muted-foreground font-sans text-[11px]">
              Fetch Search & PMax campaign metrics, keywords, and search
              queries.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-border space-y-1">
            <span className="text-amber-400 font-bold">
              adkit_google_add_negative_keywords
            </span>
            <p className="text-muted-foreground font-sans text-[11px]">
              Automate search term waste reduction in real-time.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-foreground dark:text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all"
        >
          Connect Google Ads MCP Now →
        </Link>
      </div>
    </div>
  );
}
