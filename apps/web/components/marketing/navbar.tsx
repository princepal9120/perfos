"use client";

import Link from "next/link";
import { PerfOSLogo } from "@/components/marketing/icons";
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
      className={"fixed top-0 left-0 right-0 z-50 transition-colors duration-150 " + (scrolled ? "bg-[#08080a]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent border-b border-transparent")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#d86f82] flex items-center justify-center text-white shadow-sm group-hover:bg-[#c85c6f] transition-colors">
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
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#d86f82]/10 text-[#d86f82] border border-[#d86f82]/20 font-semibold">
              BY ADKIT
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Features Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("features")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-md transition-colors hover:bg-white/5 cursor-pointer">
              <span>Features</span>
              <svg
                className={"w-3.5 h-3.5 transition-transform duration-150 " + (activeDropdown === "features" ? "rotate-180 text-[#d86f82]" : "text-zinc-500")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeDropdown === "features" && (
              <div className="absolute top-full left-0 w-[460px] p-3 mt-1 bg-[#121318] border border-white/10 rounded-xl shadow-2xl grid grid-cols-2 gap-2">
                <Link
                  href="/features/ad-library"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#d86f82]">⚡</span>
                    <span className="text-sm font-semibold text-white group-hover:text-[#d86f82]">
                      Ad Library
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Track &amp; spy on 500k+ competitor ads across 7 major networks.
                  </p>
                </Link>

                <Link
                  href="/features/ai-ads-generator"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#d86f82]">✨</span>
                    <span className="text-sm font-semibold text-white group-hover:text-[#d86f82]">
                      AI Ads Generator
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Instantly craft on-brand copy, hooks, and static assets.
                  </p>
                </Link>

                <Link
                  href="/features/ads-cloner"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#d86f82]">🧬</span>
                    <span className="text-sm font-semibold text-white group-hover:text-[#d86f82]">
                      AI Ad Cloner
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Clone top-performing competitor creatives and remix for your brand.
                  </p>
                </Link>

                <Link
                  href="/features/ads-cli"
                  className="p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#d86f82]">💻</span>
                    <span className="text-sm font-semibold text-white group-hover:text-[#d86f82]">
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
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-md transition-colors hover:bg-white/5 cursor-pointer">
              <span>Ads MCP</span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-[#d86f82]/15 text-[#d86f82] border border-[#d86f82]/30">
                PROTOCOLS
              </span>
            </button>

            {activeDropdown === "mcp" && (
              <div className="absolute top-full left-0 w-[420px] p-3 mt-1 bg-[#121318] border border-white/10 rounded-xl shadow-2xl">
                <div className="mb-2 pb-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-500 font-medium">
                    Native MCP Connectors
                  </span>
                  <Link
                    href="/features/ads-mcp"
                    className="text-xs text-[#d86f82] hover:underline font-semibold"
                  >
                    All MCPs →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/features/ads-mcp/meta"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d86f82]"></span>
                    Meta Ads MCP
                  </Link>
                  <Link
                    href="/features/ads-mcp/google"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d86f82]"></span>
                    Google Ads MCP
                  </Link>
                  <Link
                    href="/features/ads-mcp/tiktok"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d86f82]"></span>
                    TikTok Ads MCP
                  </Link>
                  <Link
                    href="/features/ads-mcp/linkedin"
                    className="px-2.5 py-2 rounded-lg hover:bg-white/5 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d86f82]"></span>
                    LinkedIn Ads MCP
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
            Sign In
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#d86f82] hover:bg-[#c85c6f] rounded-lg transition-colors border border-[#d86f82]/30 active:scale-[0.98]"
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
    </header>
  );
}
