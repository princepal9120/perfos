"use client";

import { FormEvent, Suspense, useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendChatMessage, type ChatMessage } from "@/lib/api";

const SUGGESTIONS = [
  "How much are my platforms over-claiming?",
  "Optimize my budget",
  "Which creative is fatigued?",
  "Run an incrementality test",
];

const inputCls =
  "w-full resize-none rounded-xl border border-border bg-zinc-900/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-white/20 focus:outline-none";

function ChatInner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      content:
        "I'm the PerfOS agent. Ask me to reconcile your platforms, optimize budget, or find fatigued creatives. Anything that changes spend needs your approval first.",
    },
  ]);
  const [input, setInput] = useState(initial);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setSending(true);
      scrollToBottom();
      try {
        const res = await sendChatMessage(trimmed, history);
        setMessages((prev) => [
          ...prev,
          { role: "agent", content: res.reply, actions: res.actions },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: "Could not reach the agent. Make sure the backend is running in mock mode.",
          },
        ]);
      } finally {
        setSending(false);
        scrollToBottom();
      }
    },
    [messages, sending, scrollToBottom],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void send(input);
    },
    [input, send],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Agent</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Talk to PerfOS in plain language. The agent plans actions and asks for
          approval before anything touches your accounts.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-4"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-xl bg-white px-4 py-3 text-xs leading-relaxed text-zinc-950 font-medium"
                  : "max-w-[85%] rounded-xl border border-border bg-zinc-900/90 px-4 py-3 text-xs leading-relaxed text-foreground"
              }
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.actions && m.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-2.5">
                  {m.actions.map((a, j) => (
                    <Link
                      key={j}
                      href={a.href ?? "#"}
                      className={
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors " +
                        (a.pending_approval
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                          : "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20")
                      }
                    >
                      {a.label}
                      {a.pending_approval && (
                        <span className="rounded bg-amber-400/20 px-1 text-[9px] uppercase tracking-wide">
                          approval
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-border bg-zinc-900/90 px-4 py-3 text-xs text-muted-foreground">
              <span className="animate-pulse">Agent is thinking…</span>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-md border border-border bg-zinc-900/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={2}
            placeholder="Ask the PerfOS agent…"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-md bg-white text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-30"
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
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading…</div>}>
      <ChatInner />
    </Suspense>
  );
}
