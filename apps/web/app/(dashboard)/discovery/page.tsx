"use client";

import * as React from "react";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PersonaPicker, type Persona } from "@/components/discovery/persona-picker";
import { AdPreview, type WinningAd } from "@/components/discovery/ad-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  useTableSort,
} from "@/components/ui/table";
import { apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types & Schemas                                                     */
/* ------------------------------------------------------------------ */

type Platform = "meta" | "tiktok" | "google" | "linkedin" | "x";
type Tier = "high_conf" | "winner" | "emerging" | "loser";

interface ScoreComponents {
  runtime: number; // 0..1
  reach: number; // 0..1
  concentration: number; // 0..1
  spend: number; // 0..1
}

interface WinnerAd extends Record<string, unknown> {
  id: string;
  persona: Persona;
  platform: Platform;
  advertiser: string;
  handle: string;
  headline: string;
  body: string;
  cta: string;
  format: string;
  score: number;
  tier: Tier;
  runtimeDays: number;
  spendEst: string;
  firstSeen: string;
  lastSeen: string;
  hookType: string;
  angleType: string;
  scores: ScoreComponents;
  deltaPercent: number;
}

/* ------------------------------------------------------------------ */
/* Mock Dataset per Persona (Real Draft Copy & Ad DNA)                */
/* ------------------------------------------------------------------ */

const DATASET: Record<Persona, WinnerAd[]> = {
  saas: [
    {
      id: "saas-01",
      persona: "saas",
      platform: "meta",
      advertiser: "Linear",
      handle: "linear.app",
      headline: "Stop managing Jira tickets. Switch to real issue tracking.",
      body: "Fast, sleek, keyboard-first software tracking. Built for engineering teams who ship daily without waiting on complex sprint rituals.",
      cta: "Start free trial",
      format: "1:1 Screen Flow",
      score: 95,
      tier: "high_conf",
      runtimeDays: 42,
      spendEst: "$18.5k – $45.0k",
      firstSeen: "42 days ago",
      lastSeen: "Today (active)",
      hookType: "Pain Agitation (0–3s)",
      angleType: "Speed & Engineering Craft",
      scores: { runtime: 0.96, reach: 0.92, concentration: 0.94, spend: 0.91 },
      deltaPercent: 14.8,
    },
    {
      id: "saas-02",
      persona: "saas",
      platform: "tiktok",
      advertiser: "Supabase",
      handle: "supabase.com",
      headline: "POV: You replaced 5 backend services with Postgres in 15 minutes.",
      body: "Build production apps with Auth, Database, Storage, and Realtime without configuring Kubernetes or managing connection pools.",
      cta: "Build in minutes",
      format: "9:16 Developer Vlog",
      score: 91,
      tier: "high_conf",
      runtimeDays: 28,
      spendEst: "$12.0k – $28.0k",
      firstSeen: "28 days ago",
      lastSeen: "Today (active)",
      hookType: "POV Storytelling",
      angleType: "Developer Simplicity",
      scores: { runtime: 0.89, reach: 0.94, concentration: 0.88, spend: 0.86 },
      deltaPercent: 11.2,
    },
    {
      id: "saas-03",
      persona: "saas",
      platform: "linkedin",
      advertiser: "Retool",
      handle: "retool.com",
      headline: "Your engineers shouldn't spend 3 weeks building an internal admin dashboard.",
      body: "Connect to your SQL database or REST API and assemble powerful internal tools with drag-and-drop React components.",
      cta: "Explore templates",
      format: "16:9 Interactive Demo",
      score: 87,
      tier: "winner",
      runtimeDays: 21,
      spendEst: "$9.5k – $22.0k",
      firstSeen: "21 days ago",
      lastSeen: "Yesterday",
      hookType: "Cost & Resource Waste",
      angleType: "Engineering Efficiency",
      scores: { runtime: 0.84, reach: 0.86, concentration: 0.90, spend: 0.82 },
      deltaPercent: 8.5,
    },
    {
      id: "saas-04",
      persona: "saas",
      platform: "google",
      advertiser: "Loom",
      handle: "loom.com",
      headline: "Say it with a 90-second video instead of a 30-minute meeting.",
      body: "Record your screen and camera with one click. Share instantly with your team. Zero calendar overhead and searchable transcripts.",
      cta: "Get Loom free",
      format: "Responsive Display",
      score: 82,
      tier: "winner",
      runtimeDays: 16,
      spendEst: "$6.2k – $15.0k",
      firstSeen: "16 days ago",
      lastSeen: "Today (active)",
      hookType: "Meeting Fatigue",
      angleType: "Time Savings & Async",
      scores: { runtime: 0.78, reach: 0.85, concentration: 0.80, spend: 0.79 },
      deltaPercent: 5.1,
    },
    {
      id: "saas-05",
      persona: "saas",
      platform: "x",
      advertiser: "Vercel",
      handle: "vercel.com",
      headline: "Zero-config edge rendering deployed in 4 seconds.",
      body: "Deploy Next.js applications directly from your git push with instant preview branches and global CDN caching.",
      cta: "Deploy now",
      format: "1:1 Terminal GIF",
      score: 76,
      tier: "emerging",
      runtimeDays: 9,
      spendEst: "$4.0k – $10.5k",
      firstSeen: "9 days ago",
      lastSeen: "Today (active)",
      hookType: "Instant Gratification",
      angleType: "Developer Experience",
      scores: { runtime: 0.65, reach: 0.79, concentration: 0.75, spend: 0.74 },
      deltaPercent: 2.4,
    },
  ],
  dropship: [
    {
      id: "drop-01",
      persona: "dropship",
      platform: "meta",
      advertiser: "Oura Ring",
      handle: "ouraring.com",
      headline: "I wore this titanium sleep ring for 30 days. My recovery score changed forever.",
      body: "Accurate sleep stages, HRV, and body temperature tracking packed into a sleek, lightweight ring that charges once a week.",
      cta: "Shop the collection",
      format: "9:16 UGC Unboxing",
      score: 94,
      tier: "high_conf",
      runtimeDays: 35,
      spendEst: "$32.0k – $85.0k",
      firstSeen: "35 days ago",
      lastSeen: "Today (active)",
      hookType: "Personal Transformation",
      angleType: "Health Proof & Design",
      scores: { runtime: 0.94, reach: 0.95, concentration: 0.92, spend: 0.93 },
      deltaPercent: 16.2,
    },
    {
      id: "drop-02",
      persona: "dropship",
      platform: "tiktok",
      advertiser: "Ridge Wallet",
      handle: "ridge.com",
      headline: "Throw away your bulky leather wallet. This holds 12 cards and blocks RFID skimmers.",
      body: "Aerospace-grade aluminum and carbon fiber wallet backed by a lifetime warranty. Over 4 million wallets shipped worldwide.",
      cta: "Claim 15% discount",
      format: "9:16 Durability Drop Test",
      score: 89,
      tier: "high_conf",
      runtimeDays: 24,
      spendEst: "$22.0k – $54.0k",
      firstSeen: "24 days ago",
      lastSeen: "Today (active)",
      hookType: "Extreme Durability Test",
      angleType: "Minimalist EDC Utility",
      scores: { runtime: 0.88, reach: 0.91, concentration: 0.86, spend: 0.87 },
      deltaPercent: 9.4,
    },
    {
      id: "drop-03",
      persona: "dropship",
      platform: "google",
      advertiser: "Theragun",
      handle: "therabody.com",
      headline: "Deep muscle relief in 2 minutes. The percussive massage gun physical therapists recommend.",
      body: "QuietForce technology delivers 16mm amplitude percussive therapy for accelerated workout recovery and tension relief.",
      cta: "Order now",
      format: "16:9 Clinical Review",
      score: 84,
      tier: "winner",
      runtimeDays: 18,
      spendEst: "$14.0k – $35.0k",
      firstSeen: "18 days ago",
      lastSeen: "Yesterday",
      hookType: "Doctor Endorsement",
      angleType: "Clinical Authority",
      scores: { runtime: 0.81, reach: 0.87, concentration: 0.82, spend: 0.83 },
      deltaPercent: 6.8,
    },
    {
      id: "drop-04",
      persona: "dropship",
      platform: "meta",
      advertiser: "Boll & Branch",
      handle: "bollandbranch.com",
      headline: "Why 3 US Presidents sleep on these organic cotton sheets.",
      body: "100% organic long-staple cotton sheets that get softer with every single wash. Free shipping and 100-night trial.",
      cta: "Try for 100 nights",
      format: "1:1 Macro Fabric Texture",
      score: 78,
      tier: "winner",
      runtimeDays: 12,
      spendEst: "$8.5k – $20.0k",
      firstSeen: "12 days ago",
      lastSeen: "Today (active)",
      hookType: "Celebrity & Elite Proof",
      angleType: "Unmatched Luxury Feel",
      scores: { runtime: 0.72, reach: 0.80, concentration: 0.77, spend: 0.76 },
      deltaPercent: 4.2,
    },
  ],
  beauty: [
    {
      id: "beauty-01",
      persona: "beauty",
      platform: "tiktok",
      advertiser: "Glossier",
      handle: "glossier.com",
      headline: "The 3-minute morning routine that gives you glass skin with zero foundation.",
      body: "Lightweight, sheer makeup and nourishing skincare designed to enhance your natural barrier without clogging pores.",
      cta: "Shop bestselling kit",
      format: "9:16 Bathroom Mirror GRWM",
      score: 93,
      tier: "high_conf",
      runtimeDays: 31,
      spendEst: "$26.0k – $60.0k",
      firstSeen: "31 days ago",
      lastSeen: "Today (active)",
      hookType: "Natural Aesthetic GRWM",
      angleType: "Effortless Glow",
      scores: { runtime: 0.92, reach: 0.96, concentration: 0.89, spend: 0.90 },
      deltaPercent: 13.6,
    },
    {
      id: "beauty-02",
      persona: "beauty",
      platform: "meta",
      advertiser: "The Ordinary",
      handle: "theordinary.com",
      headline: "Stop paying $90 for Niacinamide serum. Here is clinical science at $8.",
      body: "High-strength vitamin and mineral blemish formula with 10% pure Niacinamide and 1% Zinc PCA. Transparent pricing.",
      cta: "Discover formula",
      format: "1:1 Ingredient Breakdown",
      score: 88,
      tier: "winner",
      runtimeDays: 22,
      spendEst: "$15.0k – $38.0k",
      firstSeen: "22 days ago",
      lastSeen: "Today (active)",
      hookType: "Price Gouging Exposure",
      angleType: "Science & Transparency",
      scores: { runtime: 0.85, reach: 0.90, concentration: 0.88, spend: 0.84 },
      deltaPercent: 8.9,
    },
    {
      id: "beauty-03",
      persona: "beauty",
      platform: "meta",
      advertiser: "Krave Beauty",
      handle: "kravebeauty.com",
      headline: "Is your skincare routine actually destroying your skin barrier?",
      body: "Great Barrier Relief: a skin-soothing serum with Tamanu oil and ceramides to calm redness and irritated moisture barriers.",
      cta: "Reset your skin",
      format: "4:5 Dermatologist Reaction",
      score: 81,
      tier: "winner",
      runtimeDays: 15,
      spendEst: "$7.0k – $18.0k",
      firstSeen: "15 days ago",
      lastSeen: "Yesterday",
      hookType: "Skin Danger Warning",
      angleType: "Barrier Repair & Calm",
      scores: { runtime: 0.76, reach: 0.82, concentration: 0.84, spend: 0.78 },
      deltaPercent: 5.0,
    },
  ],
  b2b: [
    {
      id: "b2b-01",
      persona: "b2b",
      platform: "linkedin",
      advertiser: "Ramp",
      handle: "ramp.com",
      headline: "Companies that switch corporate cards save an average of 5% in the first 6 months.",
      body: "The only finance automation platform and corporate card that actively works to help you spend less with automatic receipt matching.",
      cta: "Get $500 bonus",
      format: "1:1 CFO Testimonial",
      score: 96,
      tier: "high_conf",
      runtimeDays: 48,
      spendEst: "$45.0k – $110.0k",
      firstSeen: "48 days ago",
      lastSeen: "Today (active)",
      hookType: "CFO Bottom-Line Metric",
      angleType: "Direct Cost Savings & ROI",
      scores: { runtime: 0.98, reach: 0.95, concentration: 0.96, spend: 0.94 },
      deltaPercent: 18.2,
    },
    {
      id: "b2b-02",
      persona: "b2b",
      platform: "linkedin",
      advertiser: "Deel",
      handle: "deel.com",
      headline: "Hire international contractors in 150+ countries with 100% compliance guarantee.",
      body: "Generate compliant contracts, run automated global payroll in 120 currencies, and manage equipment across borders.",
      cta: "Book a 15-min demo",
      format: "16:9 Product Walkthrough",
      score: 90,
      tier: "high_conf",
      runtimeDays: 27,
      spendEst: "$28.0k – $70.0k",
      firstSeen: "27 days ago",
      lastSeen: "Today (active)",
      hookType: "Compliance Fear Relief",
      angleType: "Global Scaling Speed",
      scores: { runtime: 0.88, reach: 0.92, concentration: 0.91, spend: 0.87 },
      deltaPercent: 10.5,
    },
    {
      id: "b2b-03",
      persona: "b2b",
      platform: "google",
      advertiser: "Gusto",
      handle: "gusto.com",
      headline: "Run payroll for your entire team in under 5 minutes without tax errors.",
      body: "All-in-one payroll, employee benefits, and HR software designed specifically for modern growing businesses with direct tax filing.",
      cta: "Get 3 months free",
      format: "Responsive Search & Banner",
      score: 83,
      tier: "winner",
      runtimeDays: 19,
      spendEst: "$11.0k – $29.0k",
      firstSeen: "19 days ago",
      lastSeen: "Today (active)",
      hookType: "Time Waste in Backoffice",
      angleType: "Automated Peace of Mind",
      scores: { runtime: 0.79, reach: 0.86, concentration: 0.81, spend: 0.80 },
      deltaPercent: 6.1,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Helper Icons & Badges                                              */
/* ------------------------------------------------------------------ */

function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  const c = cn("h-3.5 w-3.5 shrink-0", className);
  switch (platform) {
    case "meta":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={c} aria-hidden="true">
          <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={c} aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-6.33 6.34 6.33 6.33 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.85-4.48V8.77a8.2 8.2 0 0 0 4.92 1.63V6.95a4.8 4.8 0 0 1-2-.26Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={c} aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
        </svg>
      );
    case "google":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={c} aria-hidden="true">
          <path d="M21.35 11.1H12v3.8h5.35c-.55 2.45-2.6 3.8-5.35 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.45 0 2.8.55 3.8 1.5l2.7-2.7C16.85 3.75 14.55 3 12 3 7.05 3 3 7.05 3 12s4.05 9 9 9c5.2 0 8.65-3.65 8.65-8.8 0-.75-.05-1.45-.15-2.1Z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={c} aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
  }
}

function tierBadge(tier: Tier) {
  switch (tier) {
    case "high_conf":
      return <Badge variant="success">High confidence</Badge>;
    case "winner":
      return <Badge variant="default">Proven winner</Badge>;
    case "emerging":
      return <Badge variant="secondary">Emerging</Badge>;
    case "loser":
      return <Badge variant="destructive">Below bar</Badge>;
  }
}

/* ------------------------------------------------------------------ */
/* Subcomponent: Score Breakdown                                       */
/* ------------------------------------------------------------------ */

interface ScoreBreakdownProps {
  winner: WinnerAd;
}

function ScoreBreakdownCard({ winner }: ScoreBreakdownProps) {
  const bars = [
    {
      label: "Runtime longevity",
      val: winner.scores.runtime,
      desc: `${winner.runtimeDays}d continuous active run`,
    },
    {
      label: "Audience reach",
      val: winner.scores.reach,
      desc: "Broad multi-region library persistence",
    },
    {
      label: "Persuasion concentration",
      val: winner.scores.concentration,
      desc: `${winner.hookType} with direct angle`,
    },
    {
      label: "Spend velocity",
      val: winner.scores.spend,
      desc: `${winner.spendEst} estimated spend band`,
    },
  ];

  return (
    <Card className="border-white/8 bg-[#0c0c0f]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-zinc-100">
            Winner score breakdown
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white tabular-nums">
              {winner.score}
              <span className="text-xs font-normal text-zinc-500">/100</span>
            </span>
            {tierBadge(winner.tier)}
          </div>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Deterministic 0–100 score synthesized from ad longevity, hook retention, and library persistence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div className="space-y-3">
          {bars.map((b) => {
            const pct = Math.round(b.val * 100);
            return (
              <div key={b.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">{b.label}</span>
                  <span className="font-semibold text-zinc-200 tabular-nums">
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">{b.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-white/6 bg-white/2 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Ad DNA tags
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs">
              Hook: {winner.hookType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Angle: {winner.angleType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Format: {winner.format}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponent: Empty Discovery State                                */
/* ------------------------------------------------------------------ */

interface EmptyDiscoveryProps {
  onRun: () => void;
  loading: boolean;
}

function EmptyDiscoveryState({ onRun, loading }: EmptyDiscoveryProps) {
  return (
    <Card className="border-dashed border-white/12 bg-[#0c0c0f]/60 py-12 text-center">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-blue-400 shadow-inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-100">
          No competitor ads scanned yet
        </h3>
        <p className="mt-1 max-w-md text-sm text-zinc-400">
          Select your target business persona and scan public ad libraries to surface high-longevity winner creative and persuasion angles.
        </p>
        <div className="mt-6">
          <Button
            onClick={onRun}
            disabled={loading}
            className="bg-blue-600 px-5 text-white hover:bg-blue-500 active:scale-[0.98]"
          >
            {loading ? "Scanning public libraries..." : "Run discovery scan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page Component (C12)                                          */
/* ------------------------------------------------------------------ */

function DiscoveryContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") || "library";
  const [activeTab, setActiveTab] = useState<"library" | "competitors" | "saved">("library");

  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "competitors" || v === "library" || v === "saved") {
      setActiveTab(v);
    }
  }, [searchParams]);

  const [persona, setPersona] = useState<Persona>("saas");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("saas-01");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedAds, setSavedAds] = useState<string[]>(["saas-01", "saas-02"]);
  const [activeBoard, setActiveBoard] = useState<string>("Unsorted");
  const [boards, setBoards] = useState<string[]>(["Unsorted", "Q3 Scaling Hooks", "High-Converting UGC"]);

  // Active items based on persona
  const currentDataset = useMemo(() => {
    return DATASET[persona] || [];
  }, [persona]);

  // Handle persona change: auto-select top item
  const handlePersonaChange = (p: Persona) => {
    setPersona(p);
    const first = DATASET[p]?.[0];
    if (first) {
      setSelectedId(first.id);
    }
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!hasScanned) return [];
    return currentDataset.filter((item) => {
      if (platformFilter !== "all" && item.platform !== platformFilter) return false;
      if (tierFilter !== "all" && item.tier !== tierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAdv = item.advertiser.toLowerCase().includes(q);
        const matchHook = item.headline.toLowerCase().includes(q);
        const matchBody = item.body.toLowerCase().includes(q);
        if (!matchAdv && !matchHook && !matchBody) return false;
      }
      return true;
    });
  }, [currentDataset, platformFilter, tierFilter, searchQuery, hasScanned]);

  // Sort helper
  const { sorted: sortedRows, key: sortKey, dir: sortDir, toggle: toggleSort } =
    useTableSort<WinnerAd>(filteredRows, { key: "score", dir: "desc" });

  // Selected ad
  const selectedAd = useMemo(() => {
    const found = currentDataset.find((w) => w.id === selectedId);
    return found ?? sortedRows[0] ?? currentDataset[0];
  }, [currentDataset, selectedId, sortedRows]);

  // Convert selectedAd to WinningAd for the AdPreview component
  const winningAdForPreview: WinningAd | null = useMemo(() => {
    if (!selectedAd) return null;
    return {
      id: selectedAd.id,
      platform: selectedAd.platform,
      advertiser: selectedAd.advertiser,
      headline: selectedAd.headline,
      body: selectedAd.body,
      ctaText: selectedAd.cta,
      score: selectedAd.score,
      tier: selectedAd.tier,
      spendRange: selectedAd.spendEst,
      runtimeDays: selectedAd.runtimeDays,
      mediaType: selectedAd.format,
      hook: selectedAd.hookType,
      angle: selectedAd.angleType,
      firstSeen: selectedAd.firstSeen,
      lastSeen: selectedAd.lastSeen,
    };
  }, [selectedAd]);

  // KPI Calculations
  const kpis = useMemo(() => {
    if (!hasScanned || currentDataset.length === 0) {
      return { spend: "$0", winnersCount: 0, avgScore: 0, avgRuntime: "0d" };
    }
    const count = currentDataset.length;
    const avgS = (currentDataset.reduce((acc, c) => acc + c.score, 0) / count).toFixed(1);
    const avgR = (currentDataset.reduce((acc, c) => acc + c.runtimeDays, 0) / count).toFixed(1);
    return {
      spend: persona === "saas" ? "$87.2k" : persona === "dropship" ? "$124.5k" : persona === "beauty" ? "$68.0k" : "$142.0k",
      winnersCount: count,
      avgScore: Number(avgS),
      avgRuntime: `${avgR}d`,
    };
  }, [currentDataset, hasScanned, persona]);

  // Trigger discovery run (online apiPost with graceful mock fallback)
  const runDiscovery = async () => {
    setLoading(true);
    setToastMessage(null);
    try {
      await apiPost<{ winners?: unknown[] }>("/discovery", { persona });
      setHasScanned(true);
      setToastMessage(`Scan complete: surfaced ${currentDataset.length} winning ad concepts for ${persona.toUpperCase()}.`);
    } catch {
      // Offline fallback: load mock dataset
      setHasScanned(true);
      setToastMessage(`Offline scan complete: loaded ${currentDataset.length} proven ${persona.toUpperCase()} winner concepts.`);
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleClone = (ad: WinningAd | WinnerAd) => {
    setToastMessage(`Cloned “${ad.advertiser ?? "winner"}” brief DNA to Creative Studio drafts.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSaveSwipe = (ad: WinningAd | WinnerAd) => {
    setToastMessage(`Saved “${ad.advertiser ?? "winner"}” ad to Swipe File board.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleReset = () => {
    setHasScanned(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-950/40 px-4 py-2.5 text-xs text-blue-200 shadow-md">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-blue-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-white">
            {activeTab === "competitors"
              ? "Competitor Tracking"
              : activeTab === "saved"
              ? "Saved Ads & Boards"
              : "Ads Library & Swipe File"}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            {activeTab === "competitors"
              ? "Monitor rival brand spend, scan frequency, and winning ad rotations in real time."
              : activeTab === "saved"
              ? "Curated creative boards, swipe files, and one-click studio cloning pipelines."
              : "Scan public ad libraries, isolate long-running winner DNA, and clone proven hooks into launch briefs."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasScanned && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-white/8 text-xs text-zinc-400 hover:bg-white/4 hover:text-zinc-200"
            >
              Clear scan
            </Button>
          )}
          <Button
            onClick={runDiscovery}
            disabled={loading}
            className="bg-purple-600 text-white hover:bg-purple-500 text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Scanning libraries...
              </span>
            ) : (
              "Scan Ad Libraries"
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Subtabs (Matching Sidebar: Competitors / Ads Library / Saved Ads) */}
      <div className="flex items-center gap-1 border-b border-white/8 pb-1">
        {[
          { id: "library", label: "Ads Library (Swipe File)", icon: "🔍" },
          { id: "competitors", label: "Competitor Tracking", icon: "🏢" },
          { id: "saved", label: "Saved Ads (Boards)", icon: "📌" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
              activeTab === tab.id
                ? "border-b-2 border-purple-500 bg-purple-950/20 text-purple-300"
                : "text-zinc-400 hover:bg-white/4 hover:text-zinc-200"
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-white/8 bg-[#0c0c0f] p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-8 w-28" />
              <Skeleton className="mt-2 h-3 w-36" />
            </Card>
          ))
        ) : (
          <>
            <Stat
              label="Tracked competitor spend"
              value={kpis.spend}
              delta={14.8}
              sub="Est. 30-day market spend velocity"
              className="border-white/8 bg-[#0c0c0f]"
            />
            <Stat
              label="Surfaced winners"
              value={kpis.winnersCount}
              delta={8.2}
              sub="Scored ≥ 75 with ≥ 14d runtime"
              className="border-white/8 bg-[#0c0c0f]"
            />
            <Stat
              label="Average winner score"
              value={kpis.avgScore}
              delta={3.5}
              sub="Ad Oracle heuristic composite"
              className="border-white/8 bg-[#0c0c0f]"
            />
            <Stat
              label="Average ad runtime"
              value={kpis.avgRuntime}
              delta={12.0}
              sub="Observed active duration across platforms"
              className="border-white/8 bg-[#0c0c0f]"
            />
          </>
        )}
      </div>

      {/* Persona Picker Section */}
      <Card className="border-white/8 bg-[#0c0c0f]">
        <CardContent className="pt-5">
          <PersonaPicker
            value={persona}
            onChange={handlePersonaChange}
          />
        </CardContent>
      </Card>

      {/* Empty State or Main Discovery Workspace */}
      {activeTab === "competitors" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold text-white">Tracked Competitor Brands</h3>
              <p className="text-xs text-zinc-400">Continuous ad intelligence monitoring and creative velocity alerts.</p>
            </div>
            <Button
              onClick={() => setToastMessage("Added new competitor tracker")}
              size="sm"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
            >
              + Track New Brand
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Linear", handle: "linear.app", status: "Active (Synced 2h ago)", ads: 24, spend: "$45k/mo", topHook: "Pain Agitation (0-3s)", category: "Dev Tools / SaaS" },
              { name: "Supabase", handle: "supabase.com", status: "Active (Synced 4h ago)", ads: 18, spend: "$32k/mo", topHook: "POV Storytelling", category: "Database / Infra" },
              { name: "Retool", handle: "retool.com", status: "Active (Synced 1h ago)", ads: 31, spend: "$65k/mo", topHook: "Cost & Waste Proof", category: "Internal Tools" },
              { name: "Loom", handle: "loom.com", status: "Active (Synced 3h ago)", ads: 15, spend: "$28k/mo", topHook: "Screen Recording Hook", category: "Async Video" },
              { name: "Notion", handle: "notion.so", status: "Active (Synced 1h ago)", ads: 42, spend: "$90k/mo", topHook: "Workspace Template Demo", category: "Productivity" },
              { name: "Figma", handle: "figma.com", status: "Active (Synced 5h ago)", ads: 29, spend: "$75k/mo", topHook: "Realtime Collaboration", category: "Design" },
            ].map((comp) => (
              <div key={comp.name} className="rounded-2xl border border-white/8 bg-[#121319] p-5 space-y-3 shadow-lg hover:border-purple-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs font-bold text-purple-300">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{comp.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">{comp.handle}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[9px] text-emerald-400">
                    {comp.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/4">
                  <div>
                    <span className="text-zinc-500 text-[10px]">Active Ads:</span>
                    <p className="text-white font-semibold">{comp.ads} variations</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px]">Est. Monthly Spend:</span>
                    <p className="text-purple-300 font-semibold">{comp.spend}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-[#181924] p-2 text-[11px] text-zinc-300 border border-white/5">
                  <span className="text-zinc-500 text-[10px] block">Top Winning Hook Type:</span>
                  <span className="text-zinc-200 font-medium">{comp.topHook}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-400">{comp.category}</span>
                  <button
                    onClick={() => {
                      setActiveTab("library");
                      setSearchQuery(comp.name);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                  >
                    View All Ads →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "saved" ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              {boards.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBoard(b)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                    activeBoard === b
                      ? "bg-purple-600 text-white"
                      : "bg-[#161722] text-zinc-400 hover:text-white border border-white/8"
                  )}
                >
                  {b}
                </button>
              ))}
              <button
                onClick={() => {
                  const name = prompt("Enter board name:");
                  if (name) {
                    setBoards([...boards, name]);
                    setActiveBoard(name);
                    setToastMessage(`Created board "${name}"`);
                  }
                }}
                className="rounded-xl border border-dashed border-white/20 bg-transparent px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                + New Board
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText("https://perfos.app/board/share_99a82b");
                setToastMessage("Shareable board link copied to clipboard! 📋");
              }}
              className="text-xs border-white/10"
            >
              Share Board Link ↗
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDataset.slice(0, 4).map((ad) => (
              <div key={ad.id} className="rounded-2xl border border-white/8 bg-[#121319] p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px]">
                    {ad.platform.toUpperCase()} &middot; {ad.format}
                  </Badge>
                  <span className="text-[10px] text-zinc-400 font-mono">Score: {ad.score}/100</span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-white line-clamp-1">{ad.headline}</h4>
                  <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">{ad.body}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/6 pt-3">
                  <span className="text-[10px] text-emerald-400 font-medium">Est. Spend: {ad.spendEst}</span>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleClone(ad)}
                      className="h-7 px-2.5 text-[11px] bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      Clone to Studio
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !hasScanned ? (
        <EmptyDiscoveryState onRun={runDiscovery} loading={loading} />
      ) : (
        <div className="space-y-6">
          {/* Top Winner Spotlight & Ad Preview (C09 + C10) */}
          {selectedAd && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <AdPreview
                  ad={winningAdForPreview}
                  onClone={handleClone}
                  onSaveToBoard={handleSaveSwipe}
                />
              </div>
              <div className="lg:col-span-5">
                <ScoreBreakdownCard winner={selectedAd} />
              </div>
            </div>
          )}

          {/* Winners Table (C08) */}
          <Card className="border-white/8 bg-[#0c0c0f]">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-100">
                    Scored competitor winners
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Ranked by longevity, hook retention, and estimated spend. Select a row to preview ad DNA.
                  </CardDescription>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search advertiser or hook..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-44 rounded-md border border-white/8 bg-white/4 px-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-56"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-2 text-[10px] text-zinc-500 hover:text-zinc-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="h-8 rounded-md border border-white/8 bg-white/4 px-2 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all" className="bg-[#111114]">All platforms</option>
                    <option value="meta" className="bg-[#111114]">Meta</option>
                    <option value="tiktok" className="bg-[#111114]">TikTok</option>
                    <option value="google" className="bg-[#111114]">Google</option>
                    <option value="linkedin" className="bg-[#111114]">LinkedIn</option>
                    <option value="x" className="bg-[#111114]">X</option>
                  </select>

                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="h-8 rounded-md border border-white/8 bg-white/4 px-2 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all" className="bg-[#111114]">All tiers</option>
                    <option value="high_conf" className="bg-[#111114]">High confidence</option>
                    <option value="winner" className="bg-[#111114]">Proven winner</option>
                    <option value="emerging" className="bg-[#111114]">Emerging</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/8 hover:bg-transparent">
                    <TableHead
                      sortable
                      active={sortKey === "platform"}
                      dir={sortDir}
                      onSort={() => toggleSort("platform")}
                    >
                      Platform
                    </TableHead>
                    <TableHead
                      sortable
                      active={sortKey === "advertiser"}
                      dir={sortDir}
                      onSort={() => toggleSort("advertiser")}
                    >
                      Advertiser
                    </TableHead>
                    <TableHead className="w-2/5">Winning hook / Headline</TableHead>
                    <TableHead
                      sortable
                      active={sortKey === "score"}
                      dir={sortDir}
                      onSort={() => toggleSort("score")}
                    >
                      Score
                    </TableHead>
                    <TableHead
                      sortable
                      active={sortKey === "runtimeDays"}
                      dir={sortDir}
                      onSort={() => toggleSort("runtimeDays")}
                    >
                      Runtime
                    </TableHead>
                    <TableHead>Est. spend</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-7 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : sortedRows.length === 0 ? (
                    <TableEmpty colSpan={7}>
                      <p className="text-sm font-medium text-zinc-300">No matching winner ads found</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Try adjusting your search query or relaxing the platform/tier filters.
                      </p>
                    </TableEmpty>
                  ) : (
                    sortedRows.map((row) => {
                      const isSelected = selectedAd?.id === row.id;
                      return (
                        <TableRow
                          key={row.id}
                          onClick={() => setSelectedId(row.id)}
                          className={cn(
                            "cursor-pointer transition-colors duration-150 ease-out",
                            isSelected
                              ? "bg-blue-500/8 hover:bg-blue-500/12"
                              : "hover:bg-white/3"
                          )}
                        >
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-xs text-zinc-300">
                              <PlatformIcon platform={row.platform} />
                              <span className="capitalize">{row.platform}</span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-xs font-semibold text-zinc-100">{row.advertiser}</p>
                              <p className="text-[11px] text-zinc-500">{row.handle}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="truncate text-xs font-medium text-zinc-200" title={row.headline}>
                                {row.headline}
                              </p>
                              <p className="line-clamp-1 text-[11px] text-zinc-500" title={row.body}>
                                {row.body}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white tabular-nums">
                                {row.score}
                              </span>
                              {tierBadge(row.tier)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-zinc-300 tabular-nums">
                              {row.runtimeDays} days
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-zinc-400 tabular-nums">
                              {row.spendEst}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(row.id);
                              }}
                              className={cn(
                                "h-7 text-xs",
                                isSelected
                                  ? "bg-blue-600 text-white hover:bg-blue-500"
                                  : "border-white/8 text-zinc-300 hover:bg-white/4"
                              )}
                            >
                              {isSelected ? "Inspecting" : "Inspect"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-zinc-400">Loading Discovery...</div>}>
      <DiscoveryContent />
    </Suspense>
  );
}
