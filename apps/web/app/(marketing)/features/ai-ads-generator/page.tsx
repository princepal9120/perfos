/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckIcon, SparklesIcon, ZapIcon } from '@/components/marketing/icons';

const PRESET_TEMPLATES = [
  {
    id: 'saas',
    name: 'B2B SaaS / DevTool',
    desc: 'Speed, developer efficiency, and reliability angles',
  },
  {
    id: 'mobile',
    name: 'Mobile App / Consumer',
    desc: 'Habit formation, simplicity, and visual delight',
  },
  {
    id: 'ecom',
    name: 'E-Commerce / DTC',
    desc: 'Urgency, social proof, and unboxing appeal',
  },
  {
    id: 'agency',
    name: 'Agency / Services',
    desc: 'ROI guarantees, client case studies, and saved hours',
  },
];

export default function AiAdsGeneratorPage() {
  const [productDesc, setProductDesc] = useState(
    'Autonomous ad intelligence and Shopify reconciliation platform',
  );
  const [brandColor, setBrandColor] = useState('#d76d77');
  const [template, setTemplate] = useState('saas');
  const [generating, setGenerating] = useState(false);
  const [selectedHook, setSelectedHook] = useState(0);

  const [hooks, setHooks] = useState([
    {
      title: 'The Problem / Agitation Hook',
      headline: 'Stop letting 30% of your ad spend bleed into fake platform claims',
      body: 'Ad networks self-attribute conversions through wide view-through windows. Reconcile your actual Shopify transactions with 1 click.',
      tag: 'High Conversion · DTC Growth',
      predictedCtr: '5.4%',
    },
    {
      title: 'The Direct Speed Hook',
      headline: 'Cut creative testing cycles from 2 weeks to 2 minutes',
      body: 'Uncover competitor evergreen winners, spin up 20 hook variations with your brand tokens, and stage drafts directly from your AI agent.',
      tag: 'Founder & Operator Focus',
      predictedCtr: '4.8%',
    },
    {
      title: 'The Social Proof Hook',
      headline: 'Why modern performance teams stopped manual ad setup in 2026',
      body: 'Growth marketers should focus on strategy and angle discovery, not clicking 20 dropdowns in Meta Ads Manager.',
      tag: 'Social Proof Angle',
      predictedCtr: '5.1%',
    },
  ]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setHooks([
        {
          title: 'The ROI Guarantee Angle',
          headline: `Save 18 marketing hours weekly with ${productDesc.slice(0, 25)}...`,
          body: 'Empower your team to scale ad testing velocity with automated competitor intelligence and zero manual grunt work.',
          tag: 'Executive Decision Maker',
          predictedCtr: '5.9%',
        },
        {
          title: 'The Anti-Legacy Comparison',
          headline: 'Why modern growth teams left manual ad managers behind in 2026',
          body: 'Stop clicking 40 dropdowns. Manage your ad sets directly through typed MCP and CLI hooks.',
          tag: 'Disruptor Angle',
          predictedCtr: '6.2%',
        },
        {
          title: 'The 1-Click Workflow Angle',
          headline: 'Connect your ad accounts. Approve changes. Done.',
          body: 'Autonomous campaign management with policy limits and transparent attribution.',
          tag: 'High Velocity',
          predictedCtr: '5.3%',
        },
      ]);
      setSelectedHook(0);
    }, 1000);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 text-foreground">
      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold">
          <SparklesIcon className="w-3.5 h-3.5 text-primary" /> Multi-Format Creative Synthesizer
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
          Generate On-Brand Ads from your{' '}
          <span className="text-primary">
            Brand Tokens
          </span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Stop staring at blank canvases. Turn your product value proposition and brand tokens into 30+ production-ready ad hooks and visuals in seconds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <Link
            href="/command-center"
            className="btn-daisy-solid w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-semibold"
          >
            Start Free AI Generation &rarr;
          </Link>
          <Link
            href="/mcp"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-elevated text-zinc-300 text-xs font-semibold border border-border transition-colors"
          >
            Generate via Claude MCP
          </Link>
        </div>
      </div>

      {/* Interactive Generator Workspace */}
      <div className="max-w-5xl mx-auto p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono text-zinc-400 font-semibold block">
              1. Product Value Proposition or Website URL:
            </label>
            <input
              type="text"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
              placeholder="e.g. Autonomous ad intelligence and Shopify reconciliation platform"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 font-semibold block">
              2. Brand Accent Color:
            </label>
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="font-mono text-xs text-foreground uppercase font-semibold">
                {brandColor}
              </span>
            </div>
          </div>
        </div>

        {/* Template Archetype Selectors */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-zinc-400 font-semibold block">
            3. Select Niche &amp; Angle Playbook:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setTemplate(tmpl.id)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                  template === tmpl.id
                    ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="font-bold text-xs block mb-0.5 text-foreground">
                  {tmpl.name}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight block">
                  {tmpl.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-daisy-solid w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            {generating ? (
              <>
                <span className="animate-spin">⚙</span> Synthesizing AI Creatives...
              </>
            ) : (
              <>
                <span>Generate High-ROAS Hooks</span>
                <SparklesIcon className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Results & Live Ad Preview Box */}
        <div className="pt-6 border-t border-border space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-primary font-semibold tracking-wider">
              Synthesized Hook Angles (Ranked by Predicted ROAS)
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Live Simulation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hooks.map((hook, i) => (
              <div
                key={i}
                onClick={() => setSelectedHook(i)}
                className={`p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between space-y-4 ${
                  selectedHook === i
                    ? 'bg-card border-primary shadow-lg shadow-black/60 scale-[1.01]'
                    : 'bg-card border-border hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {hook.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      CTR ~{hook.predictedCtr}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                    <h4 className="font-display font-bold text-sm text-foreground leading-snug">
                      &quot;{hook.headline}&quot;
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {hook.body}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-[10px]">
                  <span className="text-primary font-mono font-medium">
                    {hook.tag}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    1080 × 1080 Static
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Staging Bar */}
          <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400">
              Active Selection:{' '}
              <strong className="text-foreground">
                {hooks[selectedHook]?.title}
              </strong>{' '}
              staged with color{' '}
              <code className="text-primary font-mono font-bold">{brandColor}</code>
            </div>
            <div className="flex gap-2">
              <Link
                href="/command-center"
                className="btn-daisy-solid px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Deploy to Command Center &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
