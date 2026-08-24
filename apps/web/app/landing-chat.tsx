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
    <div className="mx-auto mt-12 w-full max-w-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-[#8b8ba3]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Ask the PerfOS agent</span>
          <span className="ml-auto rounded bg-[#3b82f6]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#93c5fd]">
            AUTO
          </span>
        </div>
        <div className="relative mt-2">
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
            placeholder="Find where my platforms are over-claiming revenue"
            className="w-full resize-none rounded-xl border border-transparent bg-transparent px-3 py-3 pr-12 text-sm text-[#f0f0f5] placeholder:text-[#5b5b73] focus:border-[#3b82f6]/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => go(value || "What can you do?")}
            aria-label="Send"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#3b82f6] text-white transition-colors hover:bg-[#2563eb]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#8b8ba3] transition-colors hover:border-[#3b82f6]/40 hover:text-[#f0f0f5]"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-[#5b5b73]">
        Or{" "}
        <Link href="/overview" className="text-[#93c5fd] underline-offset-2 hover:underline">
          open the dashboard
        </Link>
      </p>
    </div>
  );
}
