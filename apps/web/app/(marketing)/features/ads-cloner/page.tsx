"use client";

import Link from "next/link";
import { useState } from "react";

const SAMPLE_COMPETITOR_ADS = [
  {
    brand: "Linear",
    title: "Keyboard-First Speed Teaser",
    originalHeadline: "Built for speed. Never touch your mouse to assign an issue again.",
    angle: "Extreme responsiveness & developer ergonomics",
    network: "LinkedIn",
    daysLive: 142
  },
  {
    brand: "Notion",
    title: "Sticky Note Matrix",
    originalHeadline: "Why your team is drowning in 12 different tools when you only need one.",
    angle: "Tool consolidation & mental simplicity",
    network: "Meta",
    daysLive: 98
  },
  {
    brand: "Supabase",
    title: "Firebase Migration Warning",
    originalHeadline: "Tired of unpredictable cloud bills at the end of the month? Switch to Postgres.",
    angle: "Cost transparency & open source independence",
    network: "YouTube",
    daysLive: 180
  }
];

export default function AdsClonerPage() {
  const [targetUrl, setTargetUrl] = useState("https://facebook.com/ads/library/?id=883921092");
  const [yourProduct, setYourProduct] = useState("PerfOS - Autonomous Ad Intelligence & MCP Platform");
  const [cloning, setCloning] = useState(false);
  const [step, setStep] = useState(1);

  const [remixResult, setRemixResult] = useState({
    deconstructedHook: "Split screen comparing clunky legacy UI with 1-click modern workflow.",
    deconstructedTone: "Urgent, developer-centric, high contrast.",
    adaptedAngle: "Why growth engineers stopped configuring Meta Ads Manager manually in 2026.",
    headlineVariationA: "Manage Meta, Google, and TikTok Ads directly from Claude or Cursor.",
    headlineVariationB: "Clone winning competitor ads in 2 clicks without an agency.",
    headlineVariationC: "Say goodbye to 15 manual dropdowns inside Ads Manager."
  });

  const handleRunCloner = () => {
    setCloning(true);
    setTimeout(() => {
      setCloning(false);
      setStep(2);
      setRemixResult({
        deconstructedHook: "Pain agitation: Lost engineering hours vs automated agent velocity.",
        deconstructedTone: "Utilitarian, proof-first, technical confidence.",
        adaptedAngle: `Why modern teams are switching to ${yourProduct.slice(0, 30)}...`,
        headlineVariationA: "Eliminate manual ad configuration. Run everything via typed MCP tools.",
        headlineVariationB: "Deploy competitor-tested winning hooks in under 3 minutes.",
        headlineVariationC: "Automated ROAS optimization with zero manual spreadsheet exports."
      });
    }, 1200);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-mono font-semibold">
          <span>🧬</span> Visual & Structural Angle Decompiler
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-[1.08]">
          Clone & Remix <span className="bg-linear-to-r from-pink-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">Competitor Winning Ads</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Paste any competitor ad library link, video, or image. Our multimodal engine deconstructs the psychological hook, copy rhythm, and visual hierarchy — then generates on-brand adaptations for your product.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.02]"
          >
            Start Remixing Ads Free →
          </Link>
          <Link
            href="/features/ad-library"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/4 hover:bg-white/8 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            Find Competitor Links in Library
          </Link>
        </div>
      </div>

      {/* Interactive Cloner Sandbox */}
      <div className="max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#111218] border border-white/10 space-y-8 shadow-2xl shadow-pink-950/20">
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase text-pink-400 font-semibold">
            1. Configure Source & Target Product
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium">Competitor Ad Library Link or Image URL:</label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium">Your Product Name & Value Proposition:</label>
              <input
                type="text"
                value={yourProduct}
                onChange={(e) => setYourProduct(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Or pick a live sample winner:</span>
              {SAMPLE_COMPETITOR_ADS.map((ad, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTargetUrl(`https://meta.com/ads/${ad.brand.toLowerCase()}`);
                    handleRunCloner();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/4 hover:bg-white/8 text-zinc-300 border border-white/6 text-[11px]"
                >
                  {ad.brand} ({ad.daysLive}d)
                </button>
              ))}
            </div>

            <button
              onClick={handleRunCloner}
              disabled={cloning}
              className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2"
            >
              {cloning ? (
                <>
                  <span className="animate-spin">⚙</span> Decompiling Ad...
                </>
              ) : (
                <>
                  <span>Deconstruct & Remix</span> 🧬
                </>
              )}
            </button>
          </div>
        </div>

        {/* Decompiled Comparison Matrix */}
        <div className="pt-6 border-t border-white/6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-pink-400 font-semibold">
              2. Deconstructed Angle & Adapted Creative Set
            </span>
            <span className="text-xs text-emerald-400 font-mono">✓ 100% Brand Token Compliant</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Deconstructed Blueprint */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/8 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Extracted Competitor Blueprint
              </span>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white/2 border border-white/4">
                  <span className="text-zinc-500 block mb-1">Visual Hook Pattern:</span>
                  <p className="text-zinc-200 font-medium">{remixResult.deconstructedHook}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/2 border border-white/4">
                  <span className="text-zinc-500 block mb-1">Copy Psychology Tone:</span>
                  <p className="text-zinc-200 font-medium">{remixResult.deconstructedTone}</p>
                </div>
              </div>
            </div>

            {/* Right: Adapted Variations */}
            <div className="p-6 rounded-2xl bg-pink-950/20 border border-pink-500/30 space-y-4 shadow-lg shadow-pink-950/30">
              <span className="text-[10px] font-mono uppercase tracking-wider text-pink-300 font-bold block">
                Adapted On-Brand Variations (Your Brand)
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-pink-500/20 space-y-1">
                  <span className="text-[10px] text-pink-400 font-mono font-bold">Variant A · Direct Hook</span>
                  <p className="text-white font-semibold">{remixResult.headlineVariationA}</p>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-pink-500/20 space-y-1">
                  <span className="text-[10px] text-pink-400 font-mono font-bold">Variant B · Benefit Hook</span>
                  <p className="text-white font-semibold">{remixResult.headlineVariationB}</p>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-pink-500/20 space-y-1">
                  <span className="text-[10px] text-pink-400 font-mono font-bold">Variant C · Pain Reliever</span>
                  <p className="text-white font-semibold">{remixResult.headlineVariationC}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-300">
              Staged: <strong className="text-white">3 remixed creative sets</strong> ready for instant publishing.
            </div>
            <div className="flex gap-2">
              <Link
                href="/pricing"
                className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow"
              >
                Launch via Ads MCP →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
