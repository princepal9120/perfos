"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AIAgentsSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAgentsSetupModal({ isOpen, onClose }: AIAgentsSetupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(["codex", "claude"]);
  const [accessMode, setAccessMode] = useState<"draft" | "draft_publish" | "admin">("draft_publish");
  const [copiedKey, setCopiedKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  if (!isOpen) return null;

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText("mcp:https://mcp.adkit.so/v1/sse?token=apk_live_99f0b12ad76a");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-purple-950/30 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-red-500 to-orange-500 text-foreground dark:text-white shadow-md shadow-orange-500/20">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground dark:text-white">
                AI Agents Setup
              </h2>
              <p className="text-xs text-muted-foreground">
                Connect MCP-compatible AI agents to automate ad discovery, creative tests & ROAS optimization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground dark:text-white"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="my-5 flex items-center justify-between gap-2 border-b border-border pb-4">
          {[
            { num: 1, title: "Select Clients" },
            { num: 2, title: "Access & MCP" },
            { num: 3, title: "Verify & Launch" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={cn(
                "flex cursor-pointer items-center gap-2 text-xs font-medium transition-colors",
                step === s.num
                  ? "text-primary"
                  : step > s.num
                  ? "text-emerald-400"
                  : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  step === s.num
                    ? "bg-purple-500/20 text-primary ring-1 ring-purple-500"
                    : step > s.num
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800 text-muted-foreground"
                )}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Agents */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Choose the AI interfaces that will interact with your ad accounts:
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { id: "codex", name: "Codex CLI / OMX", desc: "Terminal subagent orchestration with memory", icon: "⚡" },
                { id: "claude", name: "Claude Code / Desktop", desc: "Anthropic MCP client with full tool support", icon: "🟣" },
                { id: "chatgpt", name: "ChatGPT App (Official)", desc: "Conversational ad ops directly inside OpenAI", icon: "🟢" },
                { id: "gemini", name: "Gemini CLI Agent", desc: "Google AI studio ad analysis workflow", icon: "🔷" },
              ].map((agent) => {
                const isSelected = selectedAgents.includes(agent.id);
                return (
                  <div
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-150",
                      isSelected
                        ? "border-purple-500/50 bg-purple-950/20 shadow-sm shadow-purple-950/40"
                        : "border-border bg-muted hover:border-white/20 hover:bg-muted"
                    )}
                  >
                    <span className="text-xl">{agent.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-foreground dark:text-white">{agent.name}</h4>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-0"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{agent.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} className="bg-primary hover:bg-primary text-white dark:text-white text-xs">
                Continue to Access Policy →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Access & Key */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Select safety policy and copy your 30-day persistent MCP connection endpoint:
            </p>
            <div className="space-y-2">
              {[
                { id: "draft", title: "Drafts Only (Maximum Safety)", desc: "Agents can propose creatives and audience changes; humans must click Publish." },
                { id: "draft_publish", title: "Draft + Publish (Recommended)", desc: "Autonomous budget adjustments and minor bid tweaks; high-budget campaigns require approval." },
                { id: "admin", title: "Autonomous Admin", desc: "Full autonomous loop with automated daily spend reallocation based on iROAS." },
              ].map((mode) => (
                <label
                  key={mode.id}
                  onClick={() => setAccessMode(mode.id as any)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
                    accessMode === mode.id
                      ? "border-purple-500/50 bg-purple-950/20"
                      : "border-border bg-muted hover:border-white/20"
                  )}
                >
                  <input
                    type="radio"
                    name="accessMode"
                    checked={accessMode === mode.id}
                    onChange={() => {}}
                    className="mt-0.5 text-purple-600 focus:ring-0"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground dark:text-white">{mode.title}</h4>
                    <p className="text-[11px] text-muted-foreground">{mode.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">One-Click MCP Connection URL</span>
                <Badge variant="outline" className="border-primary/30 bg-purple-500/10 text-[10px] text-primary">
                  30-day Session Active
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-black/60 px-3 py-1.5 font-mono text-[11px] text-zinc-300 border border-white/5">
                  mcp.adkit.so/v1/sse?token=apk_live_99f0b12ad76a
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 shrink-0 text-xs"
                >
                  {copiedKey ? "Copied! ✓" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button onClick={() => setStep(3)} className="bg-primary hover:bg-primary text-white dark:text-white text-xs">
                Next: Verify Connection →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verify */}
        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-2xl">
              {verified ? "🚀" : "🛰️"}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground dark:text-white">
                {verified ? "AI Agents Successfully Linked!" : "Test MCP Handshake"}
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                {verified
                  ? "Your agents are authorized to query winning ads, generate new creative variations, and submit drafts."
                  : "Ping the local MCP server to confirm tool availability and token handshake."}
              </p>
            </div>

            {verified && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-left">
                <p className="text-[11px] font-semibold text-emerald-400">Handshake Verified</p>
                <p className="text-[10px] text-zinc-300 mt-0.5">
                  • 18 tools discovered (get_winners, create_draft, evaluate_iroas, launch_campaign)<br />
                  • Workspace: DTC Scaling Project #1 &middot; Access: Draft + Publish
                </p>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              {!verified ? (
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="bg-primary hover:bg-primary text-white dark:text-white text-xs"
                >
                  {isVerifying ? "Verifying..." : "Run Test Ping"}
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-foreground dark:text-white text-xs"
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
