/* Hallmark · macrostructure: Workbench · tone: modern-minimal · anchor hue: daisy-black
 * pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black
 */
'use client';

import Link from 'next/link';
import * as React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FloatingAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string }>
  >([
    {
      role: 'assistant',
      text: "👋 Hi Prince! I'm your PerfOS Ad Copilot. I can analyze iROAS, find winning competitor angles, propose creative variations, or check agent permissions.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = (userText?: string) => {
    const q = userText ?? input;
    if (!q.trim()) return;

    const next = [...messages, { role: 'user' as const, text: q }];
    setMessages(next);
    if (!userText) setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply =
        "I've analyzed your connected channels. Meta Ads has 3 winning hooks ready for creative scaling with positive incremental ROAS (1.82x).";
      if (
        q.toLowerCase().includes('permission') ||
        q.toLowerCase().includes('access')
      ) {
        reply =
          "Agent Permissions are currently configured to 'Draft + Publish' with Advanced Platform Access enabled. Agents can call platform APIs and propose drafts.";
      } else if (
        q.toLowerCase().includes('competitor') ||
        q.toLowerCase().includes('discovery') ||
        q.toLowerCase().includes('ad')
      ) {
        reply =
          "I discovered 14 new high-engagement competitor ads in the library. 4 are using the 'problem-first comparison' storyboard with >60 days runtime.";
      } else if (
        q.toLowerCase().includes('budget') ||
        q.toLowerCase().includes('scale')
      ) {
        reply =
          'Recommended budget reallocation: Shift $450/day from Google Search Broad to Meta Dynamic Creative Winner #104.';
      }

      setMessages([...next, { role: 'assistant' as const, text: reply }]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Copilot"
          className={cn(
            'group relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-surface-elevated text-primary shadow-xl shadow-black/80 transition-all duration-150 ease-out active:scale-95 focus:outline-none focus:ring-1 focus:ring-primary',
            isOpen
              ? 'bg-primary text-primary-foreground rotate-90'
              : 'hover:border-primary hover:bg-primary/10',
          )}
        >
          {isOpen ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <span className="font-mono text-sm font-bold">⌘</span>
          )}
          <span className="sr-only">Toggle AI Assistant</span>
        </button>
      </div>

      {/* Flyout Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 flex h-[480px] w-88 max-w-[calc(100vw-2rem)] sm:w-96 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/90 animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-primary text-xs font-bold">
                ⌘
              </div>
              <span className="font-display text-xs font-semibold text-foreground">
                PerfOS Copilot
              </span>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-[9px] text-emerald-400"
              >
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/command-center"
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-primary hover:underline"
              >
                Open Full Console ↗
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-3 py-2 leading-relaxed text-xs',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'border border-border bg-card text-foreground',
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-border bg-card px-3 py-2 text-muted-foreground">
                  <span className="inline-flex animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-border bg-surface-elevated p-2">
            {[
              "What's my top winning ad?",
              'Check platform overcount',
              'Rebalance daily budget',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
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
            className="flex items-center gap-2 border-t border-border bg-surface p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot anything…"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="btn-daisy-solid h-7 px-3 text-xs"
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
