'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ChatGPTGoogleadsPage() {
  const [copied, setCopied] = useState(false);
  const prompt =
    'Analyze our active Google Ads campaigns. Find the 3 highest spending ad sets from the past 14 days, report their CTR and ROAS, and recommend creative variations from our top competitor swipe file.';

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4 text-center">
        <Link
          href="/integrations/chatgpt"
          className="text-xs text-primary hover:underline"
        >
          ← Back to ChatGPT Integration
        </Link>
        <h1 className="text-4xl font-display font-bold text-foreground dark:text-white tracking-tight">
          Manage Google Ads with ChatGPT
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          Equip ChatGPT with direct, typed tools to query metrics, spy on
          competitor Google Ads creatives, and push fresh variants on autopilot.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-mono text-primary font-bold">
            Example AI Prompt
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(prompt);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs font-mono px-2.5 py-1 rounded bg-white/8 text-foreground dark:text-white"
          >
            {copied ? '✓ Copied' : 'Copy Prompt'}
          </button>
        </div>
        <p className="p-4 rounded-xl bg-black/60 font-mono text-xs text-foreground">
          &quot;Analyze our active Google Ads campaigns. Find the 3 highest
          spending ad sets from the past 14 days, report their CTR and ROAS, and
          recommend creative variations from our top competitor swipe
          file.&quot;
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary text-white dark:text-white text-xs font-semibold shadow-lg shadow-primary/30 transition-all"
        >
          Connect ChatGPT to Google Ads →
        </Link>
      </div>
    </div>
  );
}
