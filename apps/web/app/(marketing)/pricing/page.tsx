/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Stat-Led Pricing */
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

const COMPARISON_ROWS = [
  { feature: "Projects (Brands / Clients)", single: "1 Project", multi: "Unlimited Projects", highlight: true },
  { feature: "Connected Ad Accounts", single: "1 per network", multi: "Unlimited Accounts", highlight: true },
  { feature: "Ad Library & Spy Database", single: "500k+ Ads (Full Access)", multi: "500k+ Ads (Full Access)", highlight: false },
  { feature: "Longevity & Inactivity Detection", single: "✓ Included", multi: "✓ Included", highlight: false },
  { feature: "AI Ads Generator & Studio", single: "✓ Included", multi: "✓ Included", highlight: false },
  { feature: "AI Creative Cloner & Remix", single: "✓ Included", multi: "✓ Included", highlight: false },
  { feature: "1-Click Multi-Format Resizer", single: "✓ Included", multi: "✓ Included", highlight: false },
  { feature: "Model Context Protocol (MCP)", single: "✓ Included", multi: "✓ Included", highlight: false },
  { feature: "Ads Terminal CLI Tool", single: "✓ Included", multi: "✓ Included", highlight: false },
  { feature: "Supported Networks", single: "Meta, Google, TikTok, LinkedIn, Reddit, X, MS", multi: "Meta, Google, TikTok, LinkedIn, Reddit, X, MS", highlight: false },
  { feature: "Team Members & Seats", single: "Unlimited Seats", multi: "Unlimited Seats", highlight: true },
  { feature: "Draft Approval Safety Gate", single: "✓ 100% Draft by Default", multi: "✓ 100% Draft by Default", highlight: false },
  { feature: "Customer Support", single: "Standard Email Support", multi: "Priority Dedicated Support", highlight: false },
];

const PRICING_FAQS = [
  {
    q: "What counts as a 'project'?",
    a: "A project is one brand or client workspace. It holds its own connected ad accounts, brand kit design tokens, competitor swipe files, and drafted campaigns."
  },
  {
    q: "Is the MCP and CLI included on both plans?",
    a: "Yes! Both plans include full access to the Ads MCP server and Terminal CLI for Claude Code, Cursor IDE, ChatGPT, and Codex."
  },
  {
    q: "What happens after the 7-day free trial?",
    a: "You get full, unrestricted access to all features during your 7-day trial. If you do not cancel before the trial ends, your card will be charged for your chosen plan."
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel in one click from your billing settings at any time. There are no contracts, commitments, or cancellation fees."
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade between Single Project and Multiple Projects whenever you want. Upgrades take effect immediately and we adjust the price difference automatically."
  },
  {
    q: "How much do I save by paying yearly?",
    a: "Paying yearly saves you 30% or more compared to month-to-month billing. The discounted annual rates are shown automatically when you toggle Yearly above."
  },
  {
    q: "Do you charge per seat or per ad account?",
    a: "Neither. AdKit charges flat by project. Every plan includes unlimited team members with zero per-seat or per-account surcharges."
  },
  {
    q: "Does AdKit work for agencies managing multiple clients?",
    a: "Yes! The Multiple Projects plan is purpose-built for agencies: one workspace per client, unlimited accounts, and unlimited seats under one flat monthly price."
  }
];

export default function PricingPage() {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const formatPrice = (usd: number) => {
    if (usd === 0) return "0";
    const converted = Math.round(usd * selectedCurrency.rate);
    return selectedCurrency.symbol + converted.toLocaleString();
  };

  const singlePrice = annualBilling ? 29 : 49;
  const multiPrice = annualBilling ? 49 : 97;

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f4f4f6] py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      {/* Header & Currency Switcher Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-[#d86f82] bg-[#d86f82]/10 border border-[#d86f82]/20 rounded-full">
            100% Transparent Plans
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
            One plan, every ad tool, no surprise bills
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Pick the plan that fits your brands. Both plans include the full AdKit toolbox, unlimited team members, and MCP access for your AI agent.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#121318] rounded-xl border border-white/10 overflow-x-auto max-w-full">
          <span className="text-[11px] font-mono text-zinc-400 px-2 font-medium">Currency:</span>
          {CURRENCIES.map((curr) => (
            <button
              key={curr.code}
              onClick={() => setSelectedCurrency(curr)}
              className={"px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer " + (selectedCurrency.code === curr.code ? "bg-[#d86f82] text-white border border-[#d86f82]/40" : "text-zinc-400 hover:text-white")}
            >
              {curr.code}
            </button>
          ))}
        </div>
      </div>

      {/* Billing Interval Toggle (Monthly vs Yearly) */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-[#121318] border border-white/10">
          <button
            onClick={() => setAnnualBilling(false)}
            className={"px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer " + (!annualBilling ? "bg-[#d86f82] text-white shadow-sm" : "text-zinc-400 hover:text-white")}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setAnnualBilling(true)}
            className={"px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer " + (annualBilling ? "bg-[#d86f82] text-white shadow-sm" : "text-zinc-400 hover:text-white")}
          >
            <span>Yearly Billing</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white font-mono font-bold">
              Save 30%+
            </span>
          </button>
        </div>
        <p className="text-xs text-zinc-400">
          {annualBilling ? "Billed annually. Cancel anytime with 1 click." : "Billed monthly. Cancel anytime with 1 click."}
        </p>
      </div>

      {/* 2-Column Core Plans (1:1 with adkit.so) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Tier 1: Single Project */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#121318] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">Single Brand</span>
              <h3 className="text-2xl font-bold text-white mt-1">Single Project</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                For running ads on one brand. All tools, one ad account per platform, unlimited team members.
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 border-t border-white/10 pt-6">
              <span className="text-5xl font-extrabold text-white">{formatPrice(singlePrice)}</span>
              <span className="text-xs text-zinc-400 font-mono">/ month</span>
            </div>
            {annualBilling && (
              <p className="text-[11px] text-[#d86f82] font-mono">
                Billed annually at {formatPrice(singlePrice * 12)} / year
              </p>
            )}

            <div className="space-y-3">
              <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">Everything you need:</p>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span><strong>1 Project</strong> (1 brand / client workspace)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>Connect 1 ad account per platform (Meta, Google, TikTok, LinkedIn, X, Reddit)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>Full Ad Library (500k+ competitor ads &amp; swipe files)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>AI Ads Generator &amp; Creative Cloner</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>Ads MCP Server &amp; Terminal CLI</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span><strong>Unlimited</strong> team members &amp; seats</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>7-day free trial · 1-click cancel</span>
                </li>
              </ul>
            </div>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3.5 text-center text-xs font-semibold text-zinc-200 bg-[#181920] hover:bg-[#22232c] hover:text-white rounded-xl border border-white/10 transition-colors"
          >
            Start 7-Day Free Trial
          </Link>
        </div>

        {/* Tier 2: Multiple Projects (Most Popular) */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#121318] border-2 border-[#d86f82] relative flex flex-col justify-between space-y-8 shadow-2xl">
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-[#d86f82] text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Most Popular · Agency Tier
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-[#d86f82] font-bold tracking-wider">Agencies &amp; Operators</span>
              <h3 className="text-2xl font-bold text-white mt-1">Multiple Projects</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                For agencies, media buyers, and operators running multiple brands. Unlimited projects, unlimited ad accounts, one flat price.
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 border-t border-white/10 pt-6">
              <span className="text-5xl font-extrabold text-white">{formatPrice(multiPrice)}</span>
              <span className="text-xs text-zinc-400 font-mono">/ month</span>
            </div>
            {annualBilling && (
              <p className="text-[11px] text-[#d86f82] font-mono">
                Billed annually at {formatPrice(multiPrice * 12)} / year
              </p>
            )}

            <div className="space-y-3">
              <p className="text-xs font-mono font-bold text-[#d86f82] uppercase tracking-wider">Everything in Single Project, plus:</p>
              <ul className="space-y-3 text-xs text-zinc-200">
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span><strong>Unlimited Projects</strong> (separate client workspaces)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span><strong>Unlimited Ad Accounts</strong> across all supported platforms</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>Unlimited competitor ad search &amp; HD creative downloads</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>Full AI Ads Generator, Cloner &amp; Batch Resizer</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>Dedicated Ads MCP Server bridge &amp; API keys</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span><strong>Unlimited</strong> team seats with role-based access</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-[#d86f82]" />
                  <span>Priority engineering support</span>
                </li>
              </ul>
            </div>
          </div>

          <Link
            href="/command-center"
            className="w-full py-3.5 text-center text-xs font-bold text-white bg-[#d86f82] hover:bg-[#c85c6f] rounded-xl transition-colors active:scale-98"
          >
            Start Agency Trial →
          </Link>
        </div>
      </div>

      {/* Feature Comparison Matrix Table (1:1 with adkit.so) */}
      <div className="p-8 sm:p-10 rounded-2xl bg-[#121318] border border-white/10 space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            What you get on each plan
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Both plans include the full AdKit toolbox and MCP access for your AI agent. The difference is how many brands you can run.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase tracking-wider">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">Single Project ({formatPrice(singlePrice)}/mo)</th>
                <th className="py-3 px-4 text-[#d86f82]">Multiple Projects ({formatPrice(multiPrice)}/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{row.feature}</td>
                  <td className="py-3 px-4">{row.single}</td>
                  <td className={"py-3 px-4 " + (row.highlight ? "font-bold text-[#d86f82]" : "")}>{row.multi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing FAQs (1:1 with adkit.so) */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-extrabold text-white">Pricing questions, answered</h3>
          <p className="text-xs text-zinc-400">Everything you need to know about our plans, projects, and billing.</p>
        </div>
        <div className="space-y-3">
          {PRICING_FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-[#121318] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-200 hover:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-[#d86f82] font-mono text-base font-bold">{openFaq === i ? "−" : "+"}</span>
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
