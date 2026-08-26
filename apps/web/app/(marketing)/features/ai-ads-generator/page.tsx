"use client";

import Link from "next/link";
import { useState } from "react";

const PRESET_TEMPLATES = [
  { id: "saas", name: "B2B SaaS / DevTool", desc: "Speed, developer efficiency, and reliability angles" },
  { id: "mobile", name: "Mobile App / Consumer", desc: "Habit formation, simplicity, and visual delight" },
  { id: "ecom", name: "E-Commerce / DTC", desc: "Urgency, social proof, and unboxing appeal" },
  { id: "agency", name: "Agency / Services", desc: "ROI guarantees, client case studies, and saved hours" }
];

export default function AiAdsGeneratorPage() {
  const [productDesc, setProductDesc] = useState("AI code review bot that catches logic bugs before PR merge");
  const [brandColor, setBrandColor] = useState("#a855f7");
  const [template, setTemplate] = useState("saas");
  const [generating, setGenerating] = useState(false);
  const [selectedHook, setSelectedHook] = useState(0);

  const [hooks, setHooks] = useState([
    {
      title: "The Problem / Agitation Hook",
      headline: "Stop letting 3am outages pass through code review",
      body: "Manual PR reviews miss concurrency and logic edge-cases. Let autonomous AI review bots audit every commit before staging.",
      tag: "High Conversion · B2B Dev",
      predictedCtr: "5.4%",
      bgStyle: "from-purple-950/40 via-zinc-900 to-black"
    },
    {
      title: "The Direct Speed Hook",
      headline: "Cut PR review cycles from 4 days to 4 minutes",
      body: "Ship features 10x faster without breaking production. Instant inline suggestions with verified compiler output.",
      tag: "Founder / CTO Focus",
      predictedCtr: "4.8%",
      bgStyle: "from-indigo-950/40 via-zinc-900 to-black"
    },
    {
      title: "The Social Comparison Hook",
      headline: "Why top engineering teams stopped manual nitpick reviews",
      body: "Engineers should write code, not debate formatting or style in GitHub comments. Automate full-repo standards instantly.",
      tag: "Social Proof Angle",
      predictedCtr: "5.1%",
      bgStyle: "from-pink-950/40 via-zinc-900 to-black"
    }
  ]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setHooks([
        {
          title: "The ROI Guarantee Angle",
          headline: `Save 18 engineering hours weekly on ${productDesc.slice(0, 25)}...`,
          body: "Empower your team to ship confidently with automated verification and zero configuration.",
          tag: "Executive Decision Maker",
          predictedCtr: "5.9%",
          bgStyle: "from-purple-950/50 via-zinc-900 to-black"
        },
        {
          title: "The Anti-Legacy Comparison",
          headline: "Why modern growth teams left legacy tools behind in 2026",
          body: "Stop clicking 40 dropdowns. Manage your ad sets directly through typed MCP and CLI hooks.",
          tag: "Disruptor Angle",
          predictedCtr: "6.2%",
          bgStyle: "from-emerald-950/40 via-zinc-900 to-black"
        },
        {
          title: "The 1-Click Workflow Angle",
          headline: "Connect your ad accounts. Approve changes. Done.",
          body: "Autonomous campaign management with policy limits and transparent attribution.",
          tag: "High Velocity",
          predictedCtr: "5.3%",
          bgStyle: "from-indigo-950/40 via-zinc-900 to-black"
        }
      ]);
      setSelectedHook(0);
    }, 1000);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold">
          <span>✨</span> Multi-Format Static & Copy Synthesizer
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight leading-[1.08]">
          Generate On-Brand Ads from your <span className="bg-linear-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Brand Kit</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Stop staring at blank canvases. Turn your product value proposition, logo, and brand tokens into 30+ production-ready ad hooks and visuals in seconds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            Start Free AI Generation →
          </Link>
          <Link
            href="/features/ads-mcp"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/4 hover:bg-white/8 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            Generate via Claude MCP
          </Link>
        </div>
      </div>

      {/* Interactive Generator Workspace */}
      <div className="max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#111218] border border-white/10 space-y-8 shadow-2xl shadow-indigo-950/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono text-zinc-300 font-semibold block">
              1. Product Value Proposition or Website URL:
            </label>
            <input
              type="text"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. AI-driven email deliverability tool for B2B SaaS"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-300 font-semibold block">
              2. Brand Accent Color:
            </label>
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-zinc-300 uppercase font-semibold">
                {brandColor}
              </span>
            </div>
          </div>
        </div>

        {/* Template Archetype Selectors */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-zinc-300 font-semibold block">
            3. Select Niche & Angle Playbook:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setTemplate(tmpl.id)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  template === tmpl.id
                    ? "bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-950/30"
                    : "bg-black/30 border-white/6 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="font-bold text-xs block mb-0.5">{tmpl.name}</span>
                <span className="text-[10px] text-zinc-500 leading-tight block">{tmpl.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <span className="animate-spin">⚙</span> Synthesizing AI Creatives...
              </>
            ) : (
              <>
                <span>Generate High-ROAS Hooks</span> ✨
              </>
            )}
          </button>
        </div>

        {/* Results & Live Ad Preview Box */}
        <div className="pt-6 border-t border-white/6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-indigo-400 font-semibold">
              Synthesized Hook Angles (Ranked by Predicted ROAS)
            </span>
            <span className="text-xs text-zinc-500 font-mono">Live Simulation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hooks.map((hook, i) => (
              <div
                key={i}
                onClick={() => setSelectedHook(i)}
                className={`p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between space-y-4 ${
                  selectedHook === i
                    ? "bg-indigo-950/30 border-indigo-500/60 shadow-xl shadow-indigo-950/50 scale-[1.01]"
                    : "bg-black/40 border-white/6 hover:border-white/20"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{hook.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      CTR ~{hook.predictedCtr}
                    </span>
                  </div>

                  <div className={`p-4 rounded-xl bg-linear-to-br ${hook.bgStyle} border border-white/10 space-y-2`}>
                    <h4 className="font-display font-bold text-sm text-white leading-snug">
                      &quot;{hook.headline}&quot;
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {hook.body}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/4 text-[10px]">
                  <span className="text-indigo-300 font-mono">{hook.tag}</span>
                  <span className="text-zinc-500 font-mono">1080 × 1080 Static</span>
                </div>
              </div>
            ))}
          </div>

          {/* Staging Bar */}
          <div className="p-4 rounded-xl bg-black/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-300">
              Active Selection: <strong className="text-white">{hooks[selectedHook]?.title}</strong> staged with color <code className="text-purple-300">{brandColor}</code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert("Downloaded high-res ad asset")}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium"
              >
                Download PNG
              </button>
              <Link
                href="/command-center"
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
              >
                Deploy to Meta Ad Set →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
