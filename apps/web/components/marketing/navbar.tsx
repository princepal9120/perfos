/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  MetaLogo,
  GoogleLogo,
  LinkedInLogo,
  XLogo,
  TikTokLogo,
  RedditLogo,
} from '@/components/marketing/icons';
import { cn } from '@/lib/utils';

function LightningIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-3.5 w-3.5 shrink-0', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-3.5 w-3.5 shrink-0', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-3.5 w-3.5 shrink-0', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-3.5 w-3.5 shrink-0', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-150 ' +
        (scrolled
          ? 'bg-canvas/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent border-b border-transparent')
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
            <span className="font-mono text-sm font-bold">⌘</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-lg tracking-tight text-white">
              PerfOS
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
              AUTONOMOUS ADS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Features Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('features')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-md transition-colors hover:bg-white/5 cursor-pointer">
              <span>Features</span>
              <svg
                className={
                  'w-3.5 h-3.5 transition-transform duration-150 ' +
                  (activeDropdown === 'features'
                    ? 'rotate-180 text-primary'
                    : 'text-zinc-500')
                }
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {activeDropdown === 'features' && (
              <div className="absolute top-full left-0 w-[460px] p-3 mt-1 bg-surface border border-border rounded-xl shadow-2xl grid grid-cols-2 gap-2">
                <Link
                  href="/features/ad-library"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <LightningIcon className="text-primary" />
                    <span className="text-sm font-semibold text-white group-hover:text-primary">
                      Ad Library &amp; Spy
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Track &amp; spy on 500k+ competitor ads across major networks.
                  </p>
                </Link>

                <Link
                  href="/features/ai-ads-generator"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <SparklesIcon className="text-primary" />
                    <span className="text-sm font-semibold text-white group-hover:text-primary">
                      Creative Studio
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Instantly craft on-brand hooks, UGC scripts, and static variants.
                  </p>
                </Link>

                <Link
                  href="/features/ads-cloner"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <LayersIcon className="text-primary" />
                    <span className="text-sm font-semibold text-white group-hover:text-primary">
                      AI Ad Cloner
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Deconstruct winning competitor angles and remix for your brand.
                  </p>
                </Link>

                <Link
                  href="/features/ads-mcp"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-border group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TerminalIcon className="text-primary" />
                    <span className="text-sm font-semibold text-white group-hover:text-primary">
                      Ads MCP &amp; CLI
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Terminal-native ad management and Claude/Cursor bridge.
                  </p>
                </Link>
              </div>
            )}
          </div>

          {/* Ads MCP Dropdown — Real Company Logos for Meta, Google, LinkedIn, X, TikTok, Reddit */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('mcp')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-md transition-colors hover:bg-white/5 cursor-pointer">
              <span>Ads MCP</span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-primary/15 text-primary border border-primary/30">
                PROTOCOLS
              </span>
            </button>

            {activeDropdown === 'mcp' && (
              <div className="absolute top-full left-0 w-[440px] p-3 mt-1 bg-surface border border-border rounded-xl shadow-2xl">
                <div className="mb-2.5 pb-2 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-medium">
                    Native MCP Connectors
                  </span>
                  <Link
                    href="/features/ads-mcp"
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    All MCPs &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/features/ads-mcp/meta"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <MetaLogo className="w-4 h-4 text-primary shrink-0" />
                    <span>Meta Ads MCP</span>
                  </Link>
                  <Link
                    href="/features/ads-mcp/google"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <GoogleLogo className="w-4 h-4 text-primary shrink-0" />
                    <span>Google Ads MCP</span>
                  </Link>
                  <Link
                    href="/features/ads-mcp/linkedin"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <LinkedInLogo className="w-4 h-4 text-primary shrink-0" />
                    <span>LinkedIn Ads MCP</span>
                  </Link>
                  <Link
                    href="/features/ads-mcp/x"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <XLogo className="w-4 h-4 text-primary shrink-0" />
                    <span>X (Twitter) Ads MCP</span>
                  </Link>
                  <Link
                    href="/features/ads-mcp/tiktok"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <TikTokLogo className="w-4 h-4 text-primary shrink-0" />
                    <span>TikTok Ads MCP</span>
                  </Link>
                  <Link
                    href="/features/ads-mcp/reddit"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <RedditLogo className="w-4 h-4 text-primary shrink-0" />
                    <span>Reddit Ads MCP</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/pricing"
            className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-md transition-colors hover:bg-white/5"
          >
            Pricing
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/command-center"
            className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-2 transition-colors"
          >
            Console
          </Link>
          <Link
            href="/command-center"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors border border-primary/30 active:scale-[0.98]"
          >
            Open Command Center &rarr;
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
          aria-label="Toggle Navigation"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
