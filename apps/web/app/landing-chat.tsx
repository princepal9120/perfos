"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const SUGGESTIONS = [
  "How much are my platforms over-claiming?",
  "Optimize my budget",
  "Which creative is fatigued?",
];

export default function LandingChat() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const go = (text: string) => {
    const q = encodeURIComponent(text);
    router.push(`/chat?q=${q}`);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-xl border border-white/10 bg-[#111114] p-3 text-left shadow-xl shadow-black/60">
        <div className="flex items-center gap-2 border-b border-white/6 pb-2 text-xs text-zinc-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-medium text-zinc-300">Ask the PerfOS Agent</span>
          <span className="ml-auto rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-400">
            AUTO
          </span>
        </div>
        <div className="relative mt-2.5">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                go(value || "What can you do?");
              }
            }}
            rows={2}
            placeholder="Find where my platforms are over-claiming revenue…"
            className="w-full resize-none rounded-lg border border-transparent bg-transparent px-2.5 py-2 pr-10 text-xs leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:border-white/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => go(value || "What can you do?")}
            aria-label="Send"
            className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-md bg-white text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="currentColor"
                strokeWidth="2"
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
            className="rounded-md border border-white/8 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500">
        Or{" "}
        <Link href="/overview" className="text-zinc-300 underline underline-offset-4 hover:text-white">
          open the operator console
        </Link>
      </p>
    </div>
  );
}
