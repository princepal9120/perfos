"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FloatingAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "👋 Hi Prince! I'm your PerfOS Ad Copilot. I can analyze iROAS, find winning competitor angles, propose creative variations, or check agent permissions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = (userText?: string) => {
    const q = userText ?? input;
    if (!q.trim()) return;

    const next = [...messages, { role: "user" as const, text: q }];
    setMessages(next);
    if (!userText) setInput("");
    setLoading(true);

    setTimeout(() => {
      let reply = "I've analyzed your connected channels. Meta Ads has 3 winning hooks ready for creative scaling with positive incremental ROAS (1.82x).";
      if (q.toLowerCase().includes("permission") || q.toLowerCase().includes("access")) {
        reply = "Agent Permissions are currently configured to 'Draft + Publish' with Advanced Platform Access enabled. Agents can call platform APIs and propose drafts.";
      } else if (q.toLowerCase().includes("competitor") || q.toLowerCase().includes("discovery")) {
        reply = "I discovered 14 new high-engagement competitor ads in the DTC Beauty niche. 4 are using the 'problem-first comparison' storyboard.";
      } else if (q.toLowerCase().includes("budget") || q.toLowerCase().includes("scale")) {
        reply = "Recommended budget reallocation: Shift $450/day from Google Search Broad to Meta Dynamic Creative Winner #104.";
      }

      setMessages([...next, { role: "assistant" as const, text: reply }]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button (matching Image #1 purple circular spark button) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Copilot"
          className={cn(
            "group relative flex h-12 w-12 items-center justify-center rounded-full shadow-xl shadow-purple-500/20 transition-all duration-200 ease-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400/80",
            isOpen
              ? "bg-purple-700 text-foreground dark:text-white rotate-90"
              : "bg-linear-to-tr from-purple-600 to-indigo-500 text-foreground dark:text-white hover:from-purple-500 hover:to-indigo-400 hover:scale-105"
          )}
        >
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
              <path d="M18 16L19.2 18.8L22 20L19.2 21.2L18 24L16.8 21.2L14 20L16.8 18.8L18 16Z" opacity="0.8" />
            </svg>
          )}
          <span className="sr-only">Toggle AI Assistant</span>
        </button>
      </div>

      {/* Flyout Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 flex h-[480px] w-88 max-w-[calc(100vw-2rem)] sm:w-96 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-purple-500/20 animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 text-primary text-xs">
                ✦
              </div>
              <span className="font-display text-xs font-semibold text-foreground dark:text-white">PerfOS Ad Copilot</span>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[9px] text-emerald-400">
                Live
              </Badge>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground dark:text-white"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-white dark:text-white"
                      : "border border-border bg-muted text-foreground"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-border bg-muted px-3 py-2 text-muted-foreground">
                  <span className="inline-flex animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-border bg-card p-2">
            {[
              "What's my top winning ad?",
              "Agent Permissions status",
              "Rebalance daily budget",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-border bg-card p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot anything about your ads…"
              className="flex-1 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground dark:text-white placeholder-zinc-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="h-7 px-3 bg-primary hover:bg-primary text-white dark:text-white text-xs"
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
