/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CursorLogo,
  ClaudeLogo,
  ChatGPTLogo,
  GoogleLogo,
} from '@/components/marketing/icons';
import {
  type AgentCapabilities,
  getAgentCapabilities,
  resolveApiTransportUrl,
} from '@/lib/api';
import { cn } from '@/lib/utils';

interface AIAgentsSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAgentsSetupModal({
  isOpen,
  onClose,
}: AIAgentsSetupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([
    'codex',
    'claude',
  ]);
  const [accessMode, setAccessMode] = useState<
    'draft' | 'draft_publish' | 'admin'
  >('draft_publish');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [capabilities, setCapabilities] = useState<AgentCapabilities | null>(
    null,
  );
  const [verifyError, setVerifyError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const mcpEndpoint = resolveApiTransportUrl(
    capabilities?.transports.mcp.http_path ?? '/mcp',
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(mcpEndpoint);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const result = await getAgentCapabilities();
      setCapabilities(result);
      setVerified(true);
    } catch {
      setVerified(false);
      setVerifyError(
        'Handshake failed. Start the PerfOS API and verify this workspace credential.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/80 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/40 text-primary">
              <span className="font-mono text-base font-bold">⌘</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                AI Agents Setup
              </h2>
              <p className="text-xs text-muted-foreground">
                Connect MCP-compatible AI agents to automate ad discovery, creative tests &amp; ROAS optimization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            aria-label="Close dialog"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="my-5 flex items-center justify-between gap-2 border-b border-border pb-4">
          {[
            { num: 1, title: 'Select Clients' },
            { num: 2, title: 'Access & MCP' },
            { num: 3, title: 'Verify & Launch' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={cn(
                'flex cursor-pointer items-center gap-2 text-xs font-medium transition-colors',
                step === s.num
                  ? 'text-primary'
                  : step > s.num
                    ? 'text-emerald-400'
                    : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold font-mono',
                  step === s.num
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : step > s.num
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-card text-muted-foreground border border-border',
                )}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Agents */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Choose the AI interfaces that will orchestrate your connected ad channels:
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  id: 'codex',
                  name: 'Cursor IDE / Codex CLI',
                  desc: 'Terminal and IDE subagent orchestration with memory',
                  Logo: CursorLogo,
                },
                {
                  id: 'claude',
                  name: 'Claude Code / Desktop',
                  desc: 'Anthropic MCP client with full ad tool invocation',
                  Logo: ClaudeLogo,
                },
                {
                  id: 'chatgpt',
                  name: 'ChatGPT App (Custom GPT)',
                  desc: 'Conversational ad operations inside OpenAI interface',
                  Logo: ChatGPTLogo,
                },
                {
                  id: 'gemini',
                  name: 'Google Gemini Agent',
                  desc: 'Google AI studio campaign analysis workflow',
                  Logo: GoogleLogo,
                },
              ].map((agent) => {
                const isSelected = selectedAgents.includes(agent.id);
                return (
                  <div
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-150',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-zinc-700',
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border text-primary shrink-0 mt-0.5">
                      <agent.Logo className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-foreground">
                          {agent.name}
                        </h4>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 rounded border-border bg-card text-primary focus:ring-0"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                        {agent.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                className="btn-daisy-solid text-xs"
              >
                Continue to Access Policy &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Access & Key */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Select your agent authority policy and copy the local MCP endpoint:
            </p>
            <div className="space-y-2">
              {[
                {
                  id: 'draft',
                  title: 'Read + Draft (Maximum Safety)',
                  desc: 'Agents can inspect performance and prepare drafts; humans approve every external write.',
                },
                {
                  id: 'draft_publish',
                  title: 'Policy-gated Actions (Recommended)',
                  desc: 'Agents may formulate hooks and stage drafts; budget shifts remain safety-gated.',
                },
                {
                  id: 'admin',
                  title: 'Operator Mode',
                  desc: 'Broad tool access with strict budget caps, immutable audit logs, and approval gates.',
                },
              ].map((mode) => (
                <label
                  key={mode.id}
                  onClick={() => setAccessMode(mode.id as any)}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all',
                    accessMode === mode.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-zinc-700',
                  )}
                >
                  <input
                    type="radio"
                    name="accessMode"
                    checked={accessMode === mode.id}
                    onChange={() => {}}
                    className="mt-0.5 text-primary focus:ring-0"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {mode.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {mode.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground font-mono">
                  PerfOS MCP Endpoint
                </span>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-[10px] text-primary font-mono"
                >
                  Zero-leak Auth
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-surface-elevated px-3 py-1.5 font-mono text-[11px] text-primary border border-border">
                  {mcpEndpoint}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 shrink-0 text-xs"
                >
                  {copiedKey ? 'Copied! ✓' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs">
                &larr; Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="btn-daisy-solid text-xs"
              >
                Next: Verify Connection &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verify */}
        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 font-mono text-primary text-xl font-bold">
              {verified ? '✓' : '⌘'}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">
                {verified
                  ? 'AI Agents Successfully Linked'
                  : 'Test MCP Handshake'}
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                {verified
                  ? 'Your agents are authorized to query winning ads, generate new creative variations, and submit drafts.'
                  : 'Ping the local MCP server to confirm tool availability across Google, Meta, LinkedIn, X, TikTok, and Reddit.'}
              </p>
            </div>

            {verified && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-left">
                <p className="text-[11px] font-semibold text-emerald-400 font-mono">
                  ✓ Handshake Verified
                </p>
                <p className="text-[10px] text-zinc-300 mt-0.5 font-mono">
                  • {capabilities?.capabilities.length ?? 6} cross-surface capabilities discovered
                  <br />• Workspace: {capabilities?.workspace_id ?? 1} &middot; External writes: {capabilities?.safety.external_writes ?? 'policy-gated'}
                </p>
              </div>
            )}

            {verifyError && (
              <p role="alert" className="text-xs text-rose-400">
                {verifyError}
              </p>
            )}

            <div className="flex justify-center gap-3 pt-2">
              {!verified ? (
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="btn-daisy-solid text-xs"
                >
                  {isVerifying ? 'Verifying...' : 'Run Test Ping'}
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  className="btn-daisy-solid text-xs"
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
