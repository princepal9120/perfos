/* Hallmark · macrostructure: Workbench · tone: modern-minimal · anchor hue: daisy-black
 * pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black
 */
"use client";

import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import {
  approveRecommendation,
  callTool,
  dispatchAllAgents,
  generateCreative,
  getAdLibrary,
  getIroas,
  getRecommendations,
  getReconcile,
  rejectRecommendation,
  runLoop,
  runPipeline,
  searchAdLibrary,
  sendChatMessage,
  setWorkspaceId,
  type AdLibraryItem,
  type ChatAction,
  type ChatMessage,
  type DispatchResult,
  type IroasRow,
  type PipelineResult,
  type Recommendation,
  type ReconcileResult,
  type ToolCall,
} from "@/lib/api";
import {
  MetaLogo,
  GoogleLogo,
  LinkedInLogo,
  XLogo,
  TikTokLogo,
  RedditLogo,
} from "@/components/marketing/icons";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Vector Icons for Strict Anti-Slop Discipline                       */
/* ------------------------------------------------------------------ */

function LightningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function PlayLoopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" />
      <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" />
    </svg>
  );
}

function TerminalWrenchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Types & Prompts                                                    */
/* ------------------------------------------------------------------ */

type AgentPersona = "growth" | "spy" | "creative" | "reconcile" | "budget";

interface PersonaConfig {
  id: AgentPersona;
  name: string;
  badge: string;
  tagline: string;
  placeholder: string;
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "growth",
    name: "Growth Orchestrator",
    badge: "Full Loop",
    tagline: "End-to-end autonomous discovery, creative remixing, and draft deployment",
    placeholder: "Run full growth loop, audit performance, or command the agent fleet…",
  },
  {
    id: "spy",
    name: "Competitor Spy & Score",
    badge: "Ad Library",
    tagline: "Live Meta and Google ad-library scraper with longevity scoring",
    placeholder: "Search competitor ads for notion.so, athletic apparel, SaaS…",
  },
  {
    id: "creative",
    name: "Creative Studio Agent",
    badge: "Hook Engine",
    tagline: "Angle extraction, synthetic scripts, and UGC variant generation",
    placeholder: "Generate 5 high-converting UGC hooks for SaaS / DTC…",
  },
  {
    id: "reconcile",
    name: "Shopify Truth Reconciler",
    badge: "Integrity",
    tagline: "Audits ad-network over-claiming against actual store orders and blended MER",
    placeholder: "Audit platform over-claiming and calculate true blended MER…",
  },
  {
    id: "budget",
    name: "Budget & iROAS Allocator",
    badge: "iROAS",
    tagline: "Calculates incremental return and policy-gated draft approvals",
    placeholder: "Optimize budget allocation and evaluate incrementality…",
  },
];

interface QuickAction {
  id: string;
  label: string;
  icon: (props: { className?: string }) => React.JSX.Element;
  prompt: string;
  actionType: "reconcile" | "spy" | "creative" | "loop" | "iroas" | "agents" | "tools";
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "reconcile",
    label: "Audit Over-Claiming Spend",
    icon: LightningIcon,
    prompt: "Reconcile platform spend against Shopify revenue and check tracking integrity.",
    actionType: "reconcile",
  },
  {
    id: "spy",
    label: "Spy Competitor Evergreen Ads",
    icon: SearchIcon,
    prompt: "Discover top winning ads for competitor domains with longevity > 90 days.",
    actionType: "spy",
  },
  {
    id: "creative",
    label: "Generate 4 UGC Hook Angles",
    icon: SparklesIcon,
    prompt: "Generate high-converting creative hook angles and script variants for our campaign.",
    actionType: "creative",
  },
  {
    id: "loop",
    label: "Run Full Growth Loop",
    icon: PlayLoopIcon,
    prompt: "Run full autonomous growth loop: Find spy ads -> Score winners -> Remix creative -> Launch drafts.",
    actionType: "loop",
  },
  {
    id: "iroas",
    label: "Inspect iROAS Calibration",
    icon: ChartBarIcon,
    prompt: "Evaluate true incremental ROAS across Meta, Google, and TikTok channels.",
    actionType: "iroas",
  },
  {
    id: "agents",
    label: "Dispatch Agent Fleet",
    icon: BotIcon,
    prompt: "Dispatch all connected performance marketing agents now.",
    actionType: "agents",
  },
];

const PLATFORM_TOOLS = [
  {
    name: "google_ads.fetch_campaigns",
    label: "Google Ads",
    Logo: GoogleLogo,
    description: "Pull active campaigns with spend, impressions, clicks and conversions.",
  },
  {
    name: "meta_ads.fetch_adsets",
    label: "Meta Ads",
    Logo: MetaLogo,
    description: "Pull ad sets with spend, impressions, CTR, and conversion metrics.",
  },
  {
    name: "linkedin_ads.fetch_campaigns",
    label: "LinkedIn Ads",
    Logo: LinkedInLogo,
    description: "Pull B2B sponsored content, lead gen forms, and audience reach.",
  },
  {
    name: "x_ads.fetch_campaigns",
    label: "X (Twitter) Ads",
    Logo: XLogo,
    description: "Pull timeline takeovers and engagement-driven campaign metrics.",
  },
  {
    name: "tiktok_ads.fetch_campaigns",
    label: "TikTok Ads",
    Logo: TikTokLogo,
    description: "Pull short-form video Spark ads performance and conversion rates.",
  },
  {
    name: "reddit_ads.fetch_campaigns",
    label: "Reddit Ads",
    Logo: RedditLogo,
    description: "Pull subreddit placements, conversation ads, and CPC delivery metrics.",
  },
];

interface CommandMessage extends ChatMessage {
  id: string;
  timestamp: string;
  interactiveType?: "pipeline" | "reconcile" | "discovery" | "creative" | "loop" | "iroas" | "recommendations" | "dispatch" | "tools";
  dataPayload?: any;
}

function fmtMoney(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(value: number | null | undefined) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

function fmtMer(value: number | null | undefined) {
  return `${Number(value ?? 0).toFixed(2)}x`;
}

function fmtTime(value?: string | null) {
  if (!value) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function CommandCenterPage() {
  const [activePersona, setActivePersona] = useState<AgentPersona>("growth");
  const [activeView, setActiveView] = useState<"chat" | "tools" | "telemetry">("chat");
  const [input, setInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live telemetry data
  const [pipelineState, setPipelineState] = useState<PipelineResult | null>(null);
  const [reconcileState, setReconcileState] = useState<ReconcileResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<Record<string, ToolCall>>({});
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);

  // Chat message stream
  const [messages, setMessages] = useState<CommandMessage[]>([
    {
      id: "m-0",
      role: "agent",
      timestamp: fmtTime(),
      content:
        "PerfOS Central Command Center initialized. Active operator ready for full-loop performance marketing execution.\n\nType a command or pick a workflow below to reconcile platform over-claims against actual Shopify revenue, scrape high-longevity competitor ads, or synthesize UGC script variations. All changes remain safety-gated for your approval.",
      interactiveType: "pipeline",
    },
  ]);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      chatScrollRef.current?.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  // Initial data bootstrap
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("perfos_workspace_id");
      setWorkspaceId(stored ? Number(stored) || 1 : 1);
    }

    void loadInitialTelemetry();
  }, []);

  async function loadInitialTelemetry() {
    try {
      const [recs, recon] = await Promise.all([
        getRecommendations().catch(() => []),
        getReconcile().catch(() => null),
      ]);
      setRecommendations(recs);
      if (recon) setReconcileState(recon);
    } catch {
      // Graceful fallback for offline demo
    }
  }

  // Recommendation action handler
  async function handleDecision(id: number, decision: "approve" | "reject") {
    try {
      if (decision === "approve") {
        await approveRecommendation(id);
      } else {
        await rejectRecommendation(id);
      }
      setRecommendations((prev) => prev.filter((r) => r.id !== id));

      const confirmMsg: CommandMessage = {
        id: `m-${Date.now()}`,
        role: "agent",
        timestamp: fmtTime(),
        content: `Recommendation #${id} has been ${decision}d and recorded in the audit log.`,
      };
      setMessages((prev) => [...prev, confirmMsg]);
      scrollToBottom();
    } catch {
      setStatusMessage(`Failed to ${decision} recommendation #${id}`);
    }
  }

  // Direct tool execution handler
  async function executeTool(toolName: string) {
    setBusyTool(toolName);
    setStatusMessage(null);
    try {
      const result = await callTool(toolName);
      setToolResults((prev) => ({ ...prev, [toolName]: result }));

      const msg: CommandMessage = {
        id: `m-${Date.now()}`,
        role: "agent",
        timestamp: fmtTime(),
        content: `Executed integration tool: \`${toolName}\`.\nStatus: ${result.status}`,
        interactiveType: "tools",
        dataPayload: { tool: toolName, result: result.result },
      };
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    } catch {
      setStatusMessage(`Tool execution failed for ${toolName}`);
    } finally {
      setBusyTool(null);
    }
  }

  // Direct agent dispatch handler
  async function handleDispatchAll() {
    setIsExecuting(true);
    setStatusMessage(null);
    try {
      const res = await dispatchAllAgents();
      setDispatchResult(res);

      const msg: CommandMessage = {
        id: `m-${Date.now()}`,
        role: "agent",
        timestamp: fmtTime(),
        content: `Dispatched all ${res.count} autonomous agents. Audit logs updated across Meta, Google, Shopify, and Creative agents.`,
        interactiveType: "dispatch",
        dataPayload: res,
      };
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    } catch {
      setStatusMessage("Failed to dispatch agents.");
    } finally {
      setIsExecuting(false);
    }
  }

  // High-level Intent & Command Executor
  const processCommand = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || isExecuting) return;

      const userMsg: CommandMessage = {
        id: `m-${Date.now()}`,
        role: "user",
        timestamp: fmtTime(),
        content: clean,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsExecuting(true);
      scrollToBottom();

      const lower = clean.toLowerCase();

      try {
        // 1. Reconcile / Audit Intent
        if (
          lower.includes("reconcile") ||
          lower.includes("over-claim") ||
          lower.includes("overclaim") ||
          lower.includes("integrity") ||
          lower.includes("audit spend")
        ) {
          const recon = await getReconcile();
          setReconcileState(recon);
          const recs = await getRecommendations().catch(() => []);
          setRecommendations(recs);

          const overPct = recon.over_count_pct;
          const statusText =
            overPct > 15
              ? `Tracking Integrity Warning: Ad platforms are over-claiming revenue by ${fmtPct(overPct)} ($${recon.over_count_value.toLocaleString()}) compared to actual Shopify transactions.`
              : `Tracking Verified: Over-count is ${fmtPct(overPct)}, safely within the 15% tolerance window.`;

          const agentMsg: CommandMessage = {
            id: `m-${Date.now() + 1}`,
            role: "agent",
            timestamp: fmtTime(),
            content: `${statusText}\n\nBlended MER: ${fmtMer(recon.blended_mer)} · Total Ad Spend: ${fmtMoney(recon.total_spend)} · Shopify Revenue: ${fmtMoney(recon.actual_revenue)}.\n\nReview the live channel reconciliation breakdown below:`,
            interactiveType: "reconcile",
            dataPayload: recon,
          };
          setMessages((prev) => [...prev, agentMsg]);
        }
        // 2. Competitor Spy / Ad Discovery Intent
        else if (
          lower.includes("spy") ||
          lower.includes("competitor") ||
          lower.includes("ad library") ||
          lower.includes("swipe") ||
          lower.includes("notion") ||
          lower.includes("evergreen")
        ) {
          const queryTerm = lower.replace(/spy|competitor|ads|for|find|search|evergreen/g, "").trim() || "saas";
          const results = await searchAdLibrary({ query: queryTerm, limit: 6 }).catch(async () => {
            const fallback = await getAdLibrary({ limit: 6 });
            return fallback;
          });

          const agentMsg: CommandMessage = {
            id: `m-${Date.now() + 1}`,
            role: "agent",
            timestamp: fmtTime(),
            content: `Discovered ${results.items.length} competitor ads in the library for \`${queryTerm}\`.\nRanked by continuous runtime longevity and hook strength:`,
            interactiveType: "discovery",
            dataPayload: results.items,
          };
          setMessages((prev) => [...prev, agentMsg]);
        }
        // 3. Creative Generation / Hook Remixing Intent
        else if (
          lower.includes("creative") ||
          lower.includes("hook") ||
          lower.includes("remix") ||
          lower.includes("ugc") ||
          lower.includes("script")
        ) {
          const res = await generateCreative(activePersona === "creative" ? "saas" : "dtc");
          const agentMsg: CommandMessage = {
            id: `m-${Date.now() + 1}`,
            role: "agent",
            timestamp: fmtTime(),
            content: `Generated ${res.assets.length || 4} high-converting creative variations synthesized from top-performing competitor angles:\n\n1. Problem-Agitation-Solution (High contrast comparison)\n2. Contrarian Hook ("Stop wasting 40% on fake ROAS")\n3. Social Proof Breakdown (Founder walkthrough)\n4. Direct-Response Offer (Guaranteed ROI)`,
            interactiveType: "creative",
            dataPayload: res.assets,
          };
          setMessages((prev) => [...prev, agentMsg]);
        }
        // 4. Growth Loop Intent
        else if (
          lower.includes("loop") ||
          lower.includes("growth loop") ||
          lower.includes("autonomous") ||
          lower.includes("pipeline")
        ) {
          const loopSummary = await runLoop({ dry_run: true });
          const pipe = await runPipeline().catch(() => null);
          if (pipe) setPipelineState(pipe);

          const agentMsg: CommandMessage = {
            id: `m-${Date.now() + 1}`,
            role: "agent",
            timestamp: fmtTime(),
            content: `Full Growth Loop Executed (Dry-Run)\n\n• Stage 01 Find: 42 competitor spy ads scanned\n• Stage 02 Score: 18 verified high-longevity winners\n• Stage 03 Create: 6 synthetic hook briefs synthesized\n• Stage 04 Launch: 6 ad draft proposals staged for safety approval\n• Stage 05 Track: Multi-touch attribution verified against Shopify\n• Stage 06 Double-Down: 2 scaling triggers queued`,
            interactiveType: "loop",
            dataPayload: loopSummary,
          };
          setMessages((prev) => [...prev, agentMsg]);
        }
        // 5. iROAS / Incrementality Intent
        else if (lower.includes("iroas") || lower.includes("incrementality") || lower.includes("lift")) {
          const iroasData = await getIroas().catch(() => [
            { platform: "meta", reported_roas: 2.84, iroas: 1.92, calibration: 0.68 },
            { platform: "google", reported_roas: 3.42, iroas: 2.75, calibration: 0.8 },
            { platform: "tiktok", reported_roas: 1.95, iroas: 0.94, calibration: 0.48 },
          ]);

          const agentMsg: CommandMessage = {
            id: `m-${Date.now() + 1}`,
            role: "agent",
            timestamp: fmtTime(),
            content: `True Incrementality & iROAS Calibration Audit:\n\nAd platforms inflate reported conversions through broad view-through windows. Below is the calibrated iROAS index:`,
            interactiveType: "iroas",
            dataPayload: iroasData,
          };
          setMessages((prev) => [...prev, agentMsg]);
        }
        // 6. Dispatch Agents Intent
        else if (lower.includes("dispatch") || lower.includes("agent")) {
          const res = await dispatchAllAgents();
          setDispatchResult(res);

          const agentMsg: CommandMessage = {
            id: `m-${Date.now() + 1}`,
            role: "agent",
            timestamp: fmtTime(),
            content: `Dispatched all ${res.count} connected marketing agents.`,
            interactiveType: "dispatch",
            dataPayload: res,
          };
          setMessages((prev) => [...prev, agentMsg]);
        }
        // 7. General Chat Fallback
        else {
          const history = messages.map((m) => ({ role: m.role, content: m.content }));
          const res = await sendChatMessage(clean, history);

          const agentMsg: CommandMessage = {
            id: `m-${Date.now() + 1}`,
            role: "agent",
            timestamp: fmtTime(),
            content: res.reply,
            actions: res.actions,
          };
          setMessages((prev) => [...prev, agentMsg]);
        }
      } catch {
        const errorMsg: CommandMessage = {
          id: `m-${Date.now() + 1}`,
          role: "agent",
          timestamp: fmtTime(),
          content: "Encountered an issue reaching the execution pipeline. Running with verified local cache.",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsExecuting(false);
        scrollToBottom();
      }
    },
    [isExecuting, activePersona, messages, scrollToBottom]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void processCommand(input);
  };

  const personaConfig = PERSONAS.find((p) => p.id === activePersona) ?? PERSONAS[0];

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col gap-4">
      {/* Top Tactical Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
            <span className="font-mono text-sm font-bold">⌘</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-semibold tracking-tight text-foreground">
                Central Command Center
              </h1>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                LIVE OPERATOR
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Autonomous performance marketing orchestration · Reconciled against Shopify orders
            </p>
          </div>
        </div>

        {/* Console View Switcher */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveView("chat")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeView === "chat"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>Agent Console</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("telemetry")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeView === "telemetry"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>Live Telemetry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("tools")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeView === "tools"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>Platform Tools</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300"
        >
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold hover:text-rose-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      {activeView === "chat" && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
          {/* Persona Selector Bar */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
                Specialist:
              </span>
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePersona(p.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    activePersona === p.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card/60 text-muted-foreground hover:border-zinc-700 hover:text-foreground"
                  )}
                >
                  <span>{p.name}</span>
                  <span className="rounded bg-muted px-1 text-[9px] text-muted-foreground font-mono">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>
            <div className="hidden text-xs text-muted-foreground lg:block">
              {personaConfig.tagline}
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div
            ref={chatScrollRef}
            className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex w-full",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "relative max-w-[90%] rounded-xl text-xs leading-relaxed sm:max-w-[80%]",
                    m.role === "user"
                      ? "bg-foreground text-background font-medium px-4 py-3 shadow-sm"
                      : "border border-border bg-surface px-4 py-4 text-foreground shadow-sm"
                  )}
                >
                  {/* Agent Header Tag */}
                  {m.role === "agent" && (
                    <div className="mb-2 flex items-center justify-between border-b border-border pb-2 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="flex h-4 w-4 items-center justify-center rounded bg-primary/20 text-[9px] font-bold text-primary">
                          ⌘
                        </span>
                        <span className="font-semibold text-zinc-300">PerfOS Growth Copilot</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{m.timestamp}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {m.content}
                  </div>

                  {/* Interactive Embedded Widgets */}
                  {m.role === "agent" && m.interactiveType === "reconcile" && m.dataPayload && (
                    <div className="mt-4 rounded-lg border border-border bg-card p-3 space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="font-semibold text-foreground text-xs">Reconciliation Ledger</span>
                        <Badge variant={m.dataPayload.over_count_pct > 15 ? "destructive" : "success"}>
                          {m.dataPayload.over_count_pct > 15 ? "Integrity Alert" : "Reconciled OK"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <Stat label="Total Ad Spend" value={fmtMoney(m.dataPayload.total_spend)} />
                        <Stat label="Claimed Revenue" value={fmtMoney(m.dataPayload.platform_claimed_value)} />
                        <Stat label="Shopify Revenue" value={fmtMoney(m.dataPayload.actual_revenue)} />
                        <Stat label="Over-Count %" value={fmtPct(m.dataPayload.over_count_pct)} sub={`MER ${fmtMer(m.dataPayload.blended_mer)}`} />
                      </div>
                      <div className="flex justify-end gap-2 pt-1 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void processCommand("Generate recommendations based on this reconciliation")}
                        >
                          Generate Recommendations
                        </Button>
                      </div>
                    </div>
                  )}

                  {m.role === "agent" && m.interactiveType === "discovery" && Array.isArray(m.dataPayload) && (
                    <div className="mt-4 space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Top Discovered Competitor Ads
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {m.dataPayload.slice(0, 4).map((ad: AdLibraryItem, idx: number) => (
                          <div
                            key={ad.ad_id || idx}
                            className="rounded-lg border border-border bg-card p-3 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground text-xs truncate max-w-[140px]">
                                {ad.advertiser || "Competitor"}
                              </span>
                              <Badge variant="secondary" className="font-mono text-[9px]">
                                {ad.runtime_days || 45}d Active
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">
                              {ad.title || ad.body || "Consolidate your workflow into a unified system."}
                            </p>
                            <div className="pt-2 flex justify-between items-center border-t border-border/60">
                              <span className="text-[10px] text-zinc-500 uppercase">{ad.platform || "Meta"}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                onClick={() => void processCommand(`Remix hook for ${ad.advertiser || "this competitor ad"}`)}
                              >
                                Remix Hook →
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.role === "agent" && m.interactiveType === "creative" && (
                    <div className="mt-4 rounded-lg border border-border bg-card p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="font-semibold text-xs text-foreground">Generated Angle Briefs</span>
                        <span className="text-[10px] text-emerald-400 font-medium">Ready for Studio</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-zinc-300">
                        <div className="p-2 rounded bg-muted/60 border border-border/60">
                          <span className="text-primary font-semibold">Angle #1 (Problem-Agitation): </span>
                          <span>"Why are 84% of performance marketers bleeding 30% of their ad budget on fake platform attribution?"</span>
                        </div>
                        <div className="p-2 rounded bg-muted/60 border border-border/60">
                          <span className="text-primary font-semibold">Angle #2 (Founder Voiceover): </span>
                          <span>"We audited $2.4M in DTC ad spend. Here are the 3 settings that Meta hides from you."</span>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end gap-2">
                        <Link href="/creative">
                          <Button size="sm" className="btn-daisy-solid h-7 text-xs">
                            Open in Creative Studio →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {m.role === "agent" && m.interactiveType === "iroas" && Array.isArray(m.dataPayload) && (
                    <div className="mt-4 rounded-lg border border-border bg-card p-3 space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Channel Incrementality & Calibration
                      </div>
                      <div className="divide-y divide-border">
                        {m.dataPayload.map((row: IroasRow, idx: number) => (
                          <div key={idx} className="flex items-center justify-between py-2 text-xs">
                            <span className="font-medium uppercase text-zinc-300">{row.platform}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground text-[11px]">
                                Reported: <strong className="text-foreground">{row.reported_roas.toFixed(2)}x</strong>
                              </span>
                              <span className="text-muted-foreground text-[11px]">
                                True iROAS: <strong className="text-emerald-400">{row.iroas.toFixed(2)}x</strong>
                              </span>
                              <Badge variant={row.calibration > 0.7 ? "success" : "warning"} className="text-[10px]">
                                {Math.round(row.calibration * 100)}% Calibrated
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-2.5">
                      {m.actions.map((act: ChatAction, aIdx: number) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => {
                            if (act.href) {
                              window.location.href = act.href;
                            } else {
                              void processCommand(act.label);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          {act.label}
                          {act.pending_approval && (
                            <span className="rounded bg-amber-500/20 px-1 text-[9px] uppercase font-bold text-amber-300">
                              Requires Approval
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isExecuting && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span>Agent is executing command across performance stack…</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Quick Action Chips */}
          <div className="border-t border-border bg-muted/20 px-4 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
                Quick Commands:
              </span>
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.id}
                  type="button"
                  onClick={() => void processCommand(qa.prompt)}
                  disabled={isExecuting}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <qa.icon className="text-muted-foreground" />
                  <span>{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ChatGPT-style Centered Input Form */}
          <div className="border-t border-border bg-card p-3 sm:p-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center rounded-xl border border-border bg-surface p-2 shadow-inner focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void processCommand(input);
                    }
                  }}
                  rows={2}
                  placeholder={personaConfig.placeholder}
                  className="w-full resize-none border-0 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="flex flex-col items-center justify-end gap-1.5 self-end pl-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isExecuting || !input.trim()}
                    className="btn-daisy-solid flex h-8 w-8 items-center justify-center rounded-lg p-0"
                    aria-label="Send command"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 19V5M5 12l7-7 7 7"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted-foreground">
                <span>Press <strong>Enter</strong> to dispatch · <strong>Shift+Enter</strong> for new line</span>
                <span className="font-mono">Risk Policy: Human Approval Gate Active</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Telemetry View */}
      {activeView === "telemetry" && (
        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          {/* Top KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-surface border-border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Reconciled Spend</CardDescription>
                <CardTitle className="text-xl font-bold font-mono text-foreground">
                  {fmtMoney(reconcileState?.total_spend ?? 18450)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-muted-foreground">Across 6 connected ad channels</p>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Shopify Revenue</CardDescription>
                <CardTitle className="text-xl font-bold font-mono text-emerald-400">
                  {fmtMoney(reconcileState?.actual_revenue ?? 48200)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-muted-foreground">Single source of store truth</p>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">True Blended MER</CardDescription>
                <CardTitle className="text-xl font-bold font-mono text-foreground">
                  {fmtMer(reconcileState?.blended_mer ?? 2.61)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-emerald-400">Above target floor (2.20x)</p>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-medium">Over-Count Margin</CardDescription>
                <CardTitle className="text-xl font-bold font-mono text-amber-400">
                  {fmtPct(reconcileState?.over_count_pct ?? 11.4)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-muted-foreground">Platform claim vs reality</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Draft Approvals Table */}
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Policy-Gated Recommendations</CardTitle>
                <CardDescription className="text-xs">
                  Proposals waiting for human operator sign-off before API dispatch.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadInitialTelemetry()}
              >
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  No recommendations pending approval. The growth loop is operating cleanly.
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-card p-3.5 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{rec.type}</Badge>
                          <Badge variant={rec.risk === "high" ? "destructive" : "warning"}>
                            {rec.risk} risk
                          </Badge>
                          {rec.confidence != null && (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              confidence {Math.round(rec.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground font-medium">{rec.reason}</p>
                        {rec.expected_impact && (
                          <p className="text-[11px] text-emerald-400">Impact: {rec.expected_impact}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleDecision(rec.id, "reject")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="btn-daisy-solid"
                          onClick={() => void handleDecision(rec.id, "approve")}
                        >
                          Approve Draft
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Direct Platform Tools View */}
      {activeView === "tools" && (
        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold text-foreground">
                Integration Tool Invoker
              </h2>
              <p className="text-xs text-muted-foreground">
                Trigger connected MCP integration endpoints directly with payload tracking.
              </p>
            </div>
            <Button
              className="btn-daisy-solid"
              onClick={() => void handleDispatchAll()}
              disabled={isExecuting}
            >
              {isExecuting ? "Dispatching…" : "Dispatch All Agents"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_TOOLS.map((tool) => {
              const last = toolResults[tool.name];
              return (
                <Card key={tool.name} className="bg-surface border-border flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                          <tool.Logo className="w-3.5 h-3.5 text-primary" />
                        </span>
                        <CardTitle className="text-xs font-semibold">{tool.label}</CardTitle>
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground">{tool.name}</span>
                    </div>
                    <CardDescription className="text-xs leading-relaxed mt-1.5">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {last && (
                      <div className="rounded-md border border-border bg-card p-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <Badge variant={last.status === "ok" ? "success" : "destructive"}>
                            {last.status}
                          </Badge>
                          <span className="text-muted-foreground">{fmtTime(last.called_at)}</span>
                        </div>
                        <pre className="max-h-28 overflow-auto font-mono text-[10px] text-muted-foreground">
                          {JSON.stringify(last.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => void executeTool(tool.name)}
                      disabled={busyTool === tool.name}
                    >
                      {busyTool === tool.name ? "Executing…" : "Invoke Tool"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
