"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon } from "@/components/marketing/icons";

const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1, label: "$ USD" },
  { code: "INR", symbol: "₹", rate: 86.5, label: "₹ INR" },
  { code: "EUR", symbol: "€", rate: 0.92, label: "€ EUR" },
  { code: "GBP", symbol: "£", rate: 0.78, label: "£ GBP" },
  { code: "AUD", symbol: "A$", rate: 1.54, label: "A$ AUD" },
  { code: "CAD", symbol: "C$", rate: 1.38, label: "C$ CAD" },
  { code: "SGD", symbol: "S$", rate: 1.34, label: "S$ SGD" },
  { code: "JPY", symbol: "¥", rate: 152, label: "¥ JPY" },
];

const TOP_UP_PACKS = [
  { credits: "10,000 credits", priceUsd: 10, perCredit: "$0.001/credit", popular: false },
  { credits: "50,000 credits", priceUsd: 40, perCredit: "$0.0008/credit", popular: true },
  { credits: "200,000 credits", priceUsd: 120, perCredit: "$0.0006/credit", popular: false },
];

const PRICING_FAQS = [
  {
    q: "How does the 3-Month Promo offer work?",
    a: "Our launch promo gives you 3 full months of access with 5,000 AI generation credits monthly for just $5 total (regularly $20/mo). After 3 months, it renews at standard monthly pricing unless cancelled."
  },
  {
    q: "What is the Lifetime Deal?",
    a: "Pay $120 once, and you get lifetime access to PerfOS AdKit with 100,000 lifetime credits that never expire, plus all future core feature updates."
  },
  {
    q: "Do top-up credits expire?",
    a: "No! All credit pack top-ups are lifetime credits and will remain in your account until used."
  },
  {
    q: "Can I use the Ads MCP & CLI on the Free tier?",
    a: "Yes, the Free tier includes unlimited manual workspace access and full tool inspection. AI generation and autonomous execution require credits."
  },
  {
    q: "Can I cancel my monthly subscription anytime?",
    a: "Yes, you can cancel in one click from your billing dashboard with zero penalty or locked contracts."
  }
];

export default function PricingPage() {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const formatPrice = (usd: number) => {
    if (usd === 0) return "0";
    const converted = Math.round(usd * selectedCurrency.rate);
    return `${selectedCurrency.symbol}${converted.toLocaleString()}`;
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 min-h-screen bg-[#08080a] text-[#f4f4f6]">
      {/* Header & Currency Switcher Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <span className="px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-[#a8455a] bg-[#d86f82]/10 border border-[#d86f82]/20 rounded-full">
            Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2 tracking-tight">
            Plans &amp; Lifetime Offers
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Billed in USD. Prices shown in {selectedCurrency.label} for reference.
          </p>
        </div>

        {/* Currency Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#181920] rounded-xl border border-white/10 overflow-x-auto max-w-full">
          <span className="text-[11px] font-mono text-zinc-400 px-2 font-medium">Currency:</span>
          {CURRENCIES.map((curr) => (
            <button
              key={curr.code}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-all ${
                selectedCurrency.code === curr.code
                  ? "bg-[#121318] text-white shadow-sm border border-white/10"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {curr.code}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {/* Tier 1: Free ($0) */}
        <div className="p-7 rounded-2xl bg-[#121318] border border-white/10 hover:border-black/[0.15] hover:shadow-md transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">Starter</span>
              <h3 className="text-xl font-display font-bold text-white mt-1">Free</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-bold text-white">{selectedCurrency.symbol}0</span>
              <span className="text-xs text-zinc-400 font-mono">/ forever</span>
            </div>

            <p className="text-xs text-zinc-400">
              Full workspace access for solo evaluation. No credit card required.
            </p>

            <ul className="space-y-2.5 text-xs text-zinc-300 border-t border-white/10 pt-5">
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Full ad library search</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> 500k+ competitor ads</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Local Ads MCP & CLI inspect</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Own your creative data</li>
              <li className="text-zinc-400">✕ No AI generation credits</li>
            </ul>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3 text-center text-xs font-semibold text-zinc-200 bg-[#181920] hover:bg-zinc-200 rounded-xl border border-white/10 transition-colors"
          >
            Start Editing Free
          </Link>
        </div>

        {/* Tier 2: 3-Month Promo ($5 Total) */}
        <div className="p-7 rounded-2xl bg-[#121318] border-2 border-[#d86f82] relative shadow-lg shadow-[#d86f82]/10 flex flex-col justify-between space-y-6">
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-[#d86f82] text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            Launch Offer
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase text-[#a8455a] font-bold tracking-wider">Promo Deal</span>
              <h3 className="text-xl font-display font-bold text-white mt-1">3-Month Promo</h3>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-white">{formatPrice(5)}</span>
                <span className="text-xs text-zinc-400 line-through font-mono">{formatPrice(20)}/mo</span>
              </div>
              <span className="text-[11px] text-[#a8455a] font-medium block mt-0.5">for entire 3 months</span>
            </div>

            <p className="text-xs font-semibold text-[#a8455a]">
              5,000 AI credits monthly (15k total)
            </p>

            <ul className="space-y-2.5 text-xs text-zinc-200 border-t border-white/10 pt-5">
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> 3 months full platform access</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> AI Ads Generator & Cloner</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Claude, Cursor, ChatGPT MCP</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Meta, Google & TikTok publishing</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> 1 Brand Kit integration</li>
            </ul>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3 text-center text-xs font-semibold text-white bg-[#d86f82] hover:bg-[#c85c6f] rounded-xl transition-colors w-full py-3 text-center text-xs font-semibold rounded-xl"
          >
            Claim $5 Promo Deal →
          </Link>
        </div>

        {/* Tier 3: Monthly ($20/mo) */}
        <div className="p-7 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#d86f82]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">Most Flexible</span>
              <h3 className="text-xl font-display font-bold text-white mt-1">Monthly</h3>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-display font-bold text-white">{formatPrice(20)}</span>
              <span className="text-xs text-zinc-400 font-mono">/ month</span>
            </div>

            <p className="text-xs font-semibold text-emerald-700">
              20,000 credits monthly
            </p>

            <ul className="space-y-2.5 text-xs text-zinc-300 border-t border-white/10 pt-5">
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Cancel anytime, no lock-in</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Full AI generator & cloner</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Full Ads MCP & Terminal CLI</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Up to 5 connected brands</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-[#d86f82]" /> Team collaboration tools</li>
            </ul>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3 text-center text-xs font-semibold text-zinc-200 bg-[#181920] hover:bg-zinc-200 rounded-xl border border-white/10 transition-colors"
          >
            Start Monthly Plan
          </Link>
        </div>

        {/* Tier 4: Lifetime Deal ($120 One-Time) */}
        <div className="p-7 rounded-2xl bg-[#121318] border-2 border-zinc-900 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-white font-bold tracking-wider">Best Value</span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-mono font-semibold">One-Time</span>
            </div>
            <h3 className="text-xl font-display font-bold text-white mt-1">Lifetime</h3>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-white">{formatPrice(120)}</span>
                <span className="text-xs text-zinc-400 font-mono">one-time</span>
              </div>
              <span className="text-[11px] text-zinc-400 block mt-0.5">~6 months of monthly, then free forever</span>
            </div>

            <p className="text-xs font-semibold text-purple-700">
              100,000 lifetime credits (Never expire)
            </p>

            <ul className="space-y-2.5 text-xs text-zinc-200 border-t border-white/10 pt-5">
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-white" /> Pay once, own forever</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-white" /> All future updates included</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-white" /> Full Ads MCP & CLI ecosystem</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-white" /> Unlimited brands & workspaces</li>
              <li className="flex items-center gap-2"><CheckIcon className="w-3.5 h-3.5 text-white" /> Dedicated priority support</li>
            </ul>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3 text-center text-xs font-semibold text-white bg-[#181920] hover:bg-zinc-800 rounded-xl shadow transition-colors"
          >
            Get Lifetime Access ($120) →
          </Link>
        </div>
      </div>

      {/* Credit Top-Ups Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#121318] border border-white/10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase text-[#a8455a] font-semibold tracking-wider">Lifetime Add-ons</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Need more credits?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Top up with lifetime credits that never expire. Add them to any plan at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-4">
          {TOP_UP_PACKS.map((pack, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl bg-[#121318] border transition-all space-y-4 flex flex-col justify-between ${
                pack.popular
                  ? "border-[#d86f82] shadow-md relative"
                  : "border-white/10 hover:border-black/[0.15]"
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3.5 right-4 px-3 py-1 rounded-full bg-[#d86f82] text-[10px] font-bold text-white uppercase font-mono shadow-md">
                  Best Value
                </div>
              )}
              <div className="space-y-2">
                <span className="text-sm font-bold text-white block">{pack.credits}</span>
                <span className="text-3xl font-display font-bold text-white block">{formatPrice(pack.priceUsd)}</span>
                <span className="text-[11px] text-zinc-400 font-mono block">{pack.perCredit}</span>
              </div>

              <Link
                href="/command-center"
                className={`w-full py-2.5 text-center text-xs font-semibold rounded-xl transition-all ${
                  pack.popular
                    ? "w-full py-3 text-center text-xs font-semibold text-white bg-[#d86f82] hover:bg-[#c85c6f] rounded-xl transition-colors"
                    : "bg-[#181920] hover:bg-zinc-200 text-zinc-200"
                }`}
              >
                Top Up Now
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing FAQs */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-display font-bold text-white">Pricing questions, answered</h3>
          <p className="text-xs text-zinc-400">Everything you need to know about our plans, credits, and billing.</p>
        </div>
        <div className="space-y-3">
          {PRICING_FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-[#121318] overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-white hover:text-[#a8455a]"
              >
                <span>{faq.q}</span>
                <span className="text-[#d86f82] font-mono">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
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
