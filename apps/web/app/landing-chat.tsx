/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SUGGESTIONS = [
  'How much are my platforms over-claiming?',
  'Optimize my budget across Meta & Google',
  'Which creative is fatigued?',
  'Discover top competitor evergreen ads',
];

export default function LandingChat() {
  const router = useRouter();
  const [value, setValue] = useState('');

  const go = (text: string) => {
    const q = encodeURIComponent(text);
    router.push(`/command-center?q=${q}`);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-xl border border-border bg-card p-3 text-left shadow-xl shadow-black/60">
        <div className="flex items-center gap-2 border-b border-border pb-2 text-xs text-muted-foreground">
          <span className="font-mono text-xs font-bold text-primary">⌘</span>
          <span className="font-medium text-foreground">
            PerfOS Autonomous Agent
          </span>
          <span className="ml-auto rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-primary">
            LIVE OPERATOR
          </span>
        </div>
        <div className="relative mt-2.5">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                go(value || 'What can you do?');
              }
            }}
            rows={2}
            placeholder="Reconcile platform spend vs Shopify, or find competitor ads…"
            className="w-full resize-none rounded-lg border border-transparent bg-transparent px-2.5 py-2 pr-10 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => go(value || 'What can you do?')}
            aria-label="Send"
            className="btn-daisy-solid absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-md"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Or{' '}
        <Link
          href="/command-center"
          className="text-primary underline underline-offset-4 hover:text-foreground"
        >
          open the full operator console
        </Link>
      </p>
    </div>
  );
}
