"use client";

import { useState } from "react";
import Link from "next/link";

const PRICING_FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes! There are no long-term contracts. You can cancel your subscription with 1 click directly inside your billing settings."
  },
  {
    q: "What counts as a Brand or Project?",
    a: "A project corresponds to 1 product or domain with its own brand kit (colors, fonts, logos, value propositions) and connected ad accounts."
  },
  {
    q: "Do I need to pay extra for the Ads MCP or CLI?",
    a: "No! Full access to the official Ads MCP server and Ads CLI is included in all plans (both Single Project and Multiple Projects)."
  },
  {
    q: "How does the 7-day trial work?",
    a: "You get full, unrestricted access to search ads, generate creative hooks, and test your MCP connections for 7 days. If you cancel within 7 days, you are never charged."
  }
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
          Simple, Transparent Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
          Pick the plan that fits your brands
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Save 30%+ with yearly billing. Every plan includes full Ad Library, AI Studio, and MCP access.
        </p>

        {/* Toggle */}
        <div className="pt-4 inline-flex items-center gap-3 p-1 rounded-xl bg-white/4 border border-white/8">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              !annual ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
              annual ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Yearly</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
              Save 30%+
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Single Project */}
        <div className="p-8 rounded-2xl bg-[#111218] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Single Project</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Every AdKit tool (ads library, AI studio, and MCP) for one brand.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-bold text-white">
                ${annual ? "29" : "49"}
              </span>
              <span className="text-xs text-zinc-400 font-mono">/ month</span>
            </div>

            <p className="text-xs text-zinc-400">
              {annual ? "Billed annually ($348/yr). Save $240." : "Billed monthly. Cancel anytime."}
            </p>

            <div className="pt-4 border-t border-white/6 space-y-3">
              <span className="text-xs font-mono uppercase text-zinc-400 font-semibold block">
                Everything you need:
              </span>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">✓ Multi-platform Ad Library (500k+ ads)</li>
                <li className="flex items-center gap-2">✓ Competitor Tracking & Longevity Filters</li>
                <li className="flex items-center gap-2">✓ AI Ads Generator & Creative Cloner</li>
                <li className="flex items-center gap-2">✓ Ads MCP Server for Claude, Cursor, ChatGPT</li>
                <li className="flex items-center gap-2">✓ Ads CLI for Terminal & CI/CD</li>
                <li className="flex items-center gap-2">✓ 1 Brand Kit & Connected Ad Accounts</li>
              </ul>
            </div>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3.5 text-center text-xs font-semibold text-white bg-white/6 hover:bg-white/12 rounded-xl border border-white/10 transition-colors"
          >
            Start 7-Day Trial
          </Link>
        </div>

        {/* Multiple Projects */}
        <div className="p-8 rounded-2xl bg-linear-to-b from-[#161426] to-[#101117] border-2 border-purple-500/40 relative shadow-2xl shadow-purple-950/30 flex flex-col justify-between space-y-6">
          <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-purple-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Multiple Projects</h2>
              <p className="text-xs text-zinc-400 mt-1">
                For agencies, media buyers, and operators running multiple client brands.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-bold text-white">
                ${annual ? "89" : "149"}
              </span>
              <span className="text-xs text-zinc-400 font-mono">/ month</span>
            </div>

            <p className="text-xs text-purple-300/80">
              {annual ? "Billed annually ($1,068/yr). Save $720." : "Billed monthly. Cancel anytime."}
            </p>

            <div className="pt-4 border-t border-white/6 space-y-3">
              <span className="text-xs font-mono uppercase text-purple-300 font-semibold block">
                Everything you need:
              </span>
              <ul className="space-y-2.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2">✓ <strong>Unlimited</strong> Brands & Client Workspaces</li>
                <li className="flex items-center gap-2">✓ Unlimited Competitor Ad Search & Downloads</li>
                <li className="flex items-center gap-2">✓ <strong>1,000 AI generation credits</strong> / mo</li>
                <li className="flex items-center gap-2">✓ Cloud Ads MCP server & multi-agent API keys</li>
                <li className="flex items-center gap-2">✓ Multi-Seat Team Access (5 seats included)</li>
                <li className="flex items-center gap-2">✓ Priority Support & Custom Platform Bridge</li>
              </ul>
            </div>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3.5 text-center text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-colors"
          >
            Start Agency Trial →
          </Link>
        </div>
      </div>

      {/* Pricing FAQs */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-display font-bold text-white">Pricing questions, answered</h3>
        </div>
        <div className="space-y-3">
          {PRICING_FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/8 bg-[#111218] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-100 hover:text-purple-300"
              >
                <span>{faq.q}</span>
                <span className="text-purple-400 font-mono">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/4 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
