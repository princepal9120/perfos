"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon } from "@/components/marketing/icons";

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
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 bg-white text-zinc-900">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-[#a8455a] bg-[#d86f82]/10 border border-[#d86f82]/20 rounded-full">
          Simple, Transparent Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-zinc-950 tracking-tight">
          Pick the plan that fits your brands
        </h1>
        <p className="text-zinc-600 text-sm sm:text-base">
          Save 30%+ with yearly billing. Every plan includes full Ad Library, AI Studio, and MCP access.
        </p>

        {/* Toggle */}
        <div className="pt-4 inline-flex items-center gap-3 p-1 rounded-xl bg-zinc-100 border border-black/[0.06]">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              !annual ? "btn-daisy text-foreground dark:text-white shadow-sm" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
              annual ? "btn-daisy text-foreground dark:text-white shadow-sm" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <span>Yearly</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-mono font-semibold">
              Save 30%+
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-6">
        {/* Single Project */}
        <div className="p-8 rounded-2xl bg-white border border-black/[0.08] hover:border-[#d86f82]/40 hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-zinc-900">Single Project</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Every AdKit tool (ads library, AI studio, and MCP) for one brand.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-bold text-zinc-950">
                ${annual ? "29" : "49"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">/ month</span>
            </div>

            <p className="text-xs text-muted-foreground">
              {annual ? "Billed annually ($348/yr). Save $240." : "Billed monthly. Cancel anytime."}
            </p>

            <div className="pt-4 border-t border-black/[0.06] space-y-3">
              <span className="text-xs font-mono uppercase text-muted-foreground font-semibold block">
                Everything you need:
              </span>
              <ul className="space-y-2.5 text-xs text-zinc-700">
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Multi-platform Ad Library (500k+ ads)</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Competitor Tracking & Longevity Filters</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> AI Ads Generator & Creative Cloner</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Ads MCP Server for Claude, Cursor, ChatGPT</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Ads CLI for Terminal & CI/CD</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> 1 Brand Kit & Connected Ad Accounts</li>
              </ul>
            </div>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3.5 text-center text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl border border-black/[0.06] transition-colors"
          >
            Start 7-Day Trial
          </Link>
        </div>

        {/* Multiple Projects */}
        <div className="p-8 rounded-2xl bg-gradient-to-b from-[#fff6f8] to-white border-2 border-[#d86f82] relative shadow-xl shadow-[#d86f82]/10 flex flex-col justify-between space-y-6">
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-[#d86f82] text-[10px] font-bold uppercase tracking-wider text-foreground dark:text-white shadow-md">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-zinc-900">Multiple Projects</h2>
              <p className="text-xs text-muted-foreground mt-1">
                For agencies, media buyers, and operators running multiple client brands.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-bold text-zinc-950">
                ${annual ? "89" : "149"}
              </span>
              <span className="text-xs text-muted-foreground font-mono">/ month</span>
            </div>

            <p className="text-xs text-[#a8455a]">
              {annual ? "Billed annually ($1,068/yr). Save $720." : "Billed monthly. Cancel anytime."}
            </p>

            <div className="pt-4 border-t border-black/[0.06] space-y-3">
              <span className="text-xs font-mono uppercase text-[#a8455a] font-semibold block">
                Everything you need:
              </span>
              <ul className="space-y-2.5 text-xs text-zinc-800">
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> <strong>Unlimited</strong> Brands & Client Workspaces</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Unlimited Competitor Ad Search & Downloads</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> <strong>1,000 AI Creative Generations</strong> / mo</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Cloud Ads MCP server & multi-agent API keys</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Multi-Seat Team Access (5 seats included)</li>
                <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Priority Support & Custom Platform Bridge</li>
              </ul>
            </div>
          </div>

          <Link
            href="/command-center"
            className="btn-daisy w-full py-3.5 text-center text-xs font-semibold rounded-xl"
          >
            Start Agency Trial →
          </Link>
        </div>
      </div>

      {/* Pricing FAQs */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-display font-bold text-zinc-900">Pricing questions, answered</h3>
        </div>
        <div className="space-y-3">
          {PRICING_FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-900 hover:text-[#a8455a]"
              >
                <span>{faq.q}</span>
                <span className="text-[#d86f82] font-mono">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-zinc-600 leading-relaxed border-t border-black/[0.04] pt-3">
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
