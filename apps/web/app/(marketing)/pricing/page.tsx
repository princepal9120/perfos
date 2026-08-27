/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Stat-Led Pricing */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckIcon } from '@/components/marketing/icons';
import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingFooter } from '@/components/marketing/footer';

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, label: '$ USD' },
  { code: 'INR', symbol: '₹', rate: 86.5, label: '₹ INR' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: '€ EUR' },
  { code: 'GBP', symbol: '£', rate: 0.78, label: '£ GBP' },
  { code: 'AUD', symbol: 'A$', rate: 1.54, label: 'A$ AUD' },
  { code: 'CAD', symbol: 'C$', rate: 1.38, label: 'C$ CAD' },
  { code: 'SGD', symbol: 'S$', rate: 1.34, label: 'S$ SGD' },
  { code: 'JPY', symbol: '¥', rate: 152, label: '¥ JPY' },
];

const COMPARISON_ROWS = [
  {
    feature: 'Projects (Brands / Clients)',
    single: '1 Project Workspace',
    multi: 'Unlimited Project Workspaces',
    highlight: true,
  },
  {
    feature: 'Supported Ad Channels',
    single: 'Google, Meta, LinkedIn, X, TikTok, Reddit',
    multi: 'Google, Meta, LinkedIn, X, TikTok, Reddit',
    highlight: false,
  },
  {
    feature: 'Connected Ad Accounts',
    single: '1 per network',
    multi: 'Unlimited Accounts',
    highlight: true,
  },
  {
    feature: 'Ad Library & Spy Database',
    single: '500k+ Ads (Full Access)',
    multi: '500k+ Ads (Full Access)',
    highlight: false,
  },
  {
    feature: 'Longevity & Evergreen Detection',
    single: '✓ Included (30/60/90+ days)',
    multi: '✓ Included (30/60/90+ days)',
    highlight: false,
  },
  {
    feature: 'Shopify Revenue Reconciliation',
    single: '✓ Included',
    multi: '✓ Included',
    highlight: false,
  },
  {
    feature: 'AI Creative Studio & Hook Cloner',
    single: '✓ Included',
    multi: '✓ Included',
    highlight: false,
  },
  {
    feature: 'Model Context Protocol (MCP) & CLI',
    single: '✓ Included (Claude, Cursor, ChatGPT)',
    multi: '✓ Included (Claude, Cursor, ChatGPT)',
    highlight: false,
  },
  {
    feature: 'Draft Approval Safety Gate',
    single: '✓ 100% Draft-First Policy',
    multi: '✓ 100% Draft-First Policy',
    highlight: false,
  },
  {
    feature: 'Team Members & Seats',
    single: 'Unlimited Seats',
    multi: 'Unlimited Seats',
    highlight: true,
  },
  {
    feature: 'Customer Support',
    single: 'Standard Support',
    multi: 'Priority Dedicated Support',
    highlight: false,
  },
];

const PRICING_FAQS = [
  {
    q: "What counts as a 'project'?",
    a: 'A project is one brand or client workspace. It holds its own connected ad accounts, brand kit design tokens, competitor swipe files, and drafted campaigns.',
  },
  {
    q: 'Is the MCP server and CLI included on both plans?',
    a: 'Yes! Both plans include full access to the Ads MCP server and Terminal CLI for Claude Code, Cursor IDE, ChatGPT, and Codex.',
  },
  {
    q: 'What happens after the 7-day free trial?',
    a: 'You get full, unrestricted access to all features during your 7-day trial. If you do not cancel before the trial ends, your card will be charged for your chosen plan.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel in one click from your billing settings at any time. There are no contracts, commitments, or cancellation fees.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes, you can upgrade or downgrade between Single Workspace and Multiple Workspaces whenever you want. Upgrades take effect immediately.',
  },
  {
    q: 'How much do I save by paying yearly?',
    a: 'Paying yearly saves you 30% or more compared to month-to-month billing. The discounted annual rates are shown automatically when you toggle Yearly above.',
  },
];

export default function PricingPage() {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const formatPrice = (usd: number) => {
    if (usd === 0) return '0';
    const converted = Math.round(usd * selectedCurrency.rate);
    return selectedCurrency.symbol + converted.toLocaleString();
  };

  const singlePrice = annualBilling ? 29 : 49;
  const multiPrice = annualBilling ? 49 : 97;

  return (
    <div className="min-h-screen bg-canvas text-foreground selection:bg-primary/25 selection:text-foreground overflow-x-clip">
      <MarketingNavbar />

      <main className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header & Currency Switcher Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border">
          <div>
            <span className="px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
              100% Transparent Plans
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
              One plan, every ad tool, zero surprises
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Pick the plan that fits your brands. Both plans include the full PerfOS toolbox, unlimited team members, and native MCP access for your AI agent.
            </p>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-surface rounded-xl border border-border overflow-x-auto max-w-full">
            <span className="text-[11px] font-mono text-zinc-400 px-2 font-medium">
              Currency:
            </span>
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setSelectedCurrency(curr)}
                className={
                  'px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer ' +
                  (selectedCurrency.code === curr.code
                    ? 'bg-primary text-white border border-primary/40'
                    : 'text-zinc-400 hover:text-white')
                }
              >
                {curr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Single Workspace */}
          <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Single Workspace</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Full PerfOS toolbox (Ad Library, AI Studio, and MCP server) for one brand.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {formatPrice(singlePrice)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/ month</span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-300 border-t border-border pt-5">
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Google, Meta, LinkedIn, X, TikTok, Reddit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Multi-platform Ad Library (500k+ ads)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Competitor Longevity &amp; Activity Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>AI Hook Generator &amp; Creative Cloner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Ads MCP Server &amp; Terminal CLI</span>
                </li>
              </ul>
            </div>

            <Link
              href="/command-center"
              className="block w-full py-3 text-center text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl border border-border transition-colors"
            >
              Start 7-Day Free Trial
            </Link>
          </div>

          {/* Card 2: Multiple Workspaces */}
          <div className="p-8 rounded-2xl bg-surface border-2 border-primary relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary text-[10px] font-bold uppercase tracking-wider text-white font-mono">
              Scale
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Multiple Workspaces (Agency)</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  For agencies, media buyers, and operators with multiple client accounts.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {formatPrice(multiPrice)}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/ month</span>
              </div>

              <ul className="space-y-3 text-xs text-zinc-200 border-t border-border pt-5">
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span><strong>Unlimited</strong> Brand &amp; Client Workspaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Google, Meta, LinkedIn, X, TikTok, Reddit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>1,000 AI Creative Generations / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Multi-Seat Team Access &amp; Dedicated API Keys</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Priority Support &amp; Custom MCP Bridge</span>
                </li>
              </ul>
            </div>

            <Link
              href="/command-center"
              className="btn-daisy-solid block w-full py-3 text-center text-xs font-bold text-white rounded-xl transition-colors"
            >
              Start Agency Free Trial &rarr;
            </Link>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <section aria-label="Feature Comparison" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Full Plan Comparison</h2>
            <p className="text-xs text-zinc-400">Detailed breakdown of everything included in each tier.</p>
          </div>

          <div className="border border-border rounded-2xl bg-surface overflow-hidden shadow-xl">
            <div className="grid grid-cols-3 p-4 sm:p-5 bg-canvas border-b border-border text-xs font-mono font-bold text-zinc-400">
              <span>Feature</span>
              <span>Single Workspace</span>
              <span className="text-primary">Multiple Workspaces</span>
            </div>

            <div className="divide-y divide-white/5">
              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 p-4 sm:p-5 text-xs items-center hover:bg-white/2 transition-colors"
                >
                  <span className="font-semibold text-white">{row.feature}</span>
                  <span className="text-zinc-400">{row.single}</span>
                  <span className="text-primary font-semibold">{row.multi}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing FAQs */}
        <section aria-label="Pricing FAQs" className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-white text-center tracking-tight mb-8">
            Pricing FAQs
          </h2>
          <div className="space-y-3">
            {PRICING_FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-200 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-primary font-mono text-base font-bold">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
