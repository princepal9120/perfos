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
  "w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#3b82f6]/60 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]/40";

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
        <h2 className="text-lg font-semibold tracking-tight">Agent</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Talk to PerfOS in plain language. The agent plans actions and asks for
          approval before anything touches your accounts.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-[#3b82f6] px-4 py-3 text-sm text-white"
                  : "max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground"
              }
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              {m.actions && m.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.actions.map((a, j) => (
                    <Link
                      key={j}
                      href={a.href ?? "#"}
                      className={
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                        (a.pending_approval
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                          : "border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#93c5fd] hover:bg-[#3b82f6]/20")
                      }
                    >
                      {a.label}
                      {a.pending_approval && (
                        <span className="rounded bg-amber-400/20 px-1.5 text-[10px] uppercase tracking-wide">
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
            <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
              <span className="animate-pulse">Agent is thinking…</span>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[#3b82f6]/40 hover:text-foreground"
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
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#3b82f6] text-white transition-opacity hover:bg-[#2563eb] disabled:opacity-40"
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
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
      <ChatInner />
    </Suspense>
  );
}
