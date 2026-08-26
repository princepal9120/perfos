"use client";
import Link from "next/link";

export default function MicrosoftAdsMcpPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <Link href="/features/ads-mcp" className="text-xs text-purple-400 hover:underline">
          ← Back to All Ads MCPs
        </Link>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
          Microsoft Advertising MCP Connector
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
          Bing Search and Copilot ad inventory management via MCP agent tools.
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
        >
          Connect Microsoft Ads MCP Now →
        </Link>
      </div>
    </div>
  );
}
