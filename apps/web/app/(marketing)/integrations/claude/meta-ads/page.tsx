"use client";

import Link from "next/link";
import { useState } from "react";

export default function ClaudeMetaadsPage() {
  const [copied, setCopied] = useState(false);
  const prompt = "Analyze our active Meta (Facebook & Instagram) campaigns. Find the 3 highest spending ad sets from the past 14 days, report their CTR and ROAS, and recommend creative variations from our top competitor swipe file.";

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4 text-center">
        <Link href="/integrations/claude" className="text-xs text-purple-400 hover:underline">
          ← Back to Claude Integration
        </Link>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">
          Manage Meta (Facebook & Instagram) with Claude
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
          Equip Claude with direct, typed tools to query metrics, spy on competitor Meta (Facebook & Instagram) creatives, and push fresh variants on autopilot.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#111218] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/6 pb-3">
          <span className="text-xs font-mono text-purple-400 font-bold">Example AI Prompt</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(prompt);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs font-mono px-2.5 py-1 rounded bg-white/8 text-white"
          >
            {copied ? "✓ Copied" : "Copy Prompt"}
          </button>
        </div>
        <p className="p-4 rounded-xl bg-black/60 font-mono text-xs text-zinc-200">
          &quot;Analyze our active Meta (Facebook & Instagram) campaigns. Find the 3 highest spending ad sets from the past 14 days, report their CTR and ROAS, and recommend creative variations from our top competitor swipe file.&quot;
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
        >
          Connect Claude to Meta (Facebook & Instagram) →
        </Link>
      </div>
    </div>
  );
}
