"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#0b0c10]/85 backdrop-blur-md border-b border-white/8 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-purple-600 via-violet-500 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-lg tracking-tight text-white">
              PerfOS
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
              by AdKit
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Features Mega Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("features")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-md transition-colors hover:bg-white/4">
              <span>Features</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "features" ? "rotate-180 text-purple-400" : "text-zinc-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "features" && (
              <div className="absolute top-full left-0 w-[460px] p-3 mt-1 bg-[#111218] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/features/ad-library"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/6 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded bg-purple-500/10 text-purple-400">⚡</span>
                    <span className="text-sm font-semibold text-zinc-100 group-hover:text-purple-300">
                      Ad Library
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Track & spy on 500k+ competitor ads across 7 major networks.
                  </p>
                </Link>

                <Link
                  href="/features/ai-ads-generator"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/6 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">✨</span>
                    <span className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300">
                      AI Ads Generator
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Instantly craft on-brand copy, hooks, and static assets.
                  </p>
                </Link>

                <Link
                  href="/features/ads-cloner"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/6 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded bg-pink-500/10 text-pink-400">🧬</span>
                    <span className="text-sm font-semibold text-zinc-100 group-hover:text-pink-300">
                      AI Ad Cloner
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Clone top-performing competitor creatives and remix for your brand.
                  </p>
                </Link>

                <Link
                  href="/features/ads-cli"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/6 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">💻</span>
                    <span className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300">
                      Ads CLI
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Terminal-native ad management and deployment pipelines.
                  </p>
                </Link>
              </div>
            )}
          </div>

          {/* Ads MCP Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("mcp")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-md transition-colors hover:bg-white/4">
              <span>Ads MCP</span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Protocols
              </span>
            </button>

            {activeDropdown === "mcp" && (
              <div className="absolute top-full left-0 w-[420px] p-3 mt-1 bg-[#111218] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="mb-2 pb-2 border-b border-white/6 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-medium">
                    Native MCP Connectors
                  </span>
                  <Link
                    href="/features/ads-mcp"
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    All MCPs →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/features/ads-mcp/meta"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Meta Ads MCP
                  </Link>
                  <Link
                    href="/features/ads-mcp/google"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Google Ads MCP
                  </Link>
                  <Link
                    href="/features/ads-mcp/tiktok"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    TikTok Ads MCP
                  </Link>
                  <Link
                    href="/features/ads-mcp/linkedin"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    LinkedIn Ads MCP
                  </Link>
                  <Link
                    href="/features/ads-mcp/reddit"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Reddit Ads MCP
                  </Link>
                  <Link
                    href="/features/ads-mcp/x"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-zinc-200"></span>
                    X Ads MCP
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Integrations Mega Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("integrations")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-md transition-colors hover:bg-white/4">
              <span>Integrations</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "integrations" ? "rotate-180 text-purple-400" : "text-zinc-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "integrations" && (
              <div className="absolute top-full left-0 w-[420px] p-3 mt-1 bg-[#111218] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="mb-2 pb-2 border-b border-white/6 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-medium">
                    AI Agent Ecosystem
                  </span>
                  <Link
                    href="/integrations"
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    All Integrations →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/integrations/claude"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="text-amber-400">🤖</span> Claude Code / Desktop
                  </Link>
                  <Link
                    href="/integrations/cursor"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="text-indigo-400">⚡</span> Cursor IDE
                  </Link>
                  <Link
                    href="/integrations/chatgpt"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="text-emerald-400">🧠</span> ChatGPT & GPT-4o
                  </Link>
                  <Link
                    href="/integrations/grok"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="text-pink-400">🚀</span> Grok (xAI)
                  </Link>
                  <Link
                    href="/integrations/codex"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="text-cyan-400">⚙️</span> Codex & OpenCode
                  </Link>
                  <Link
                    href="/integrations/perplexity"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="text-teal-400">🔍</span> Perplexity AI
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/pricing"
            className="px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-md transition-colors hover:bg-white/4"
          >
            Pricing
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/command-center"
            className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/pricing"
            className="relative inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-linear-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/25 border border-purple-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Free Trial →
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
          aria-label="Toggle Navigation"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0e0f14] px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              href="/features/ad-library"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/4 rounded-md"
            >
              Ad Library
            </Link>
            <Link
              href="/features/ai-ads-generator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/4 rounded-md"
            >
              AI Ads Generator
            </Link>
            <Link
              href="/features/ads-cloner"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/4 rounded-md"
            >
              AI Ad Cloner
            </Link>
            <Link
              href="/features/ads-mcp"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/4 rounded-md"
            >
              Ads MCP Server
            </Link>
            <Link
              href="/features/ads-cli"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/4 rounded-md"
            >
              Ads CLI
            </Link>
            <Link
              href="/integrations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/4 rounded-md"
            >
              AI Integrations
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/4 rounded-md"
            >
              Pricing
            </Link>
          </div>
          <div className="pt-3 border-t border-white/6 flex flex-col gap-2">
            <Link
              href="/command-center"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-zinc-300 bg-white/4 rounded-lg border border-white/8"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg shadow"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
