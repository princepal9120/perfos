"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SubTab =
  | "profile"
  | "billing"
  | "devices_keys"
  | "general"
  | "members"
  | "integrations"
  | "ad_accounts"
  | "details"
  | "agent_permissions";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SubTab>("agent_permissions");
  const [campaignAccessLevel, setCampaignAccessLevel] = useState<string>("Draft + Publish");
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [advancedPlatformAccess, setAdvancedPlatformAccess] = useState<boolean>(false);
  const [platformToggles, setPlatformToggles] = useState({
    meta: true,
    google: true,
    tiktok: true,
    linkedin: true,
    reddit: false,
    x: false,
  });
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  return (
    <div className="min-h-full pb-16">
      {/* Top Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-white">
            Settings
          </h1>
        </div>
        {saveToast && (
          <div className="rounded-lg border border-purple-500/30 bg-purple-950/80 px-3 py-1.5 text-xs text-purple-300 shadow-lg shadow-purple-950/50 animate-in fade-in">
            {saveToast}
          </div>
        )}
      </div>

      {/* 2-Column Split Settings Layout (Exact Match to Image #1) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Subnavigation Column (Left) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Group: ACCOUNT */}
          <div>
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              ACCOUNT
            </p>
            <div className="space-y-0.5">
              {[
                { id: "profile", label: "Profile", icon: "👤" },
                { id: "billing", label: "Billing", icon: "💳" },
                { id: "devices_keys", label: "Devices & Keys", icon: "💻" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SubTab)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
                    activeTab === item.id
                      ? "bg-purple-950/40 text-purple-300"
                      : "text-zinc-400 hover:bg-white/4 hover:text-zinc-200"
                  )}
                >
                  <span className="text-xs opacity-75">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Group: WORKSPACE */}
          <div>
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              WORKSPACE
            </p>
            <div className="space-y-0.5">
              {[
                { id: "general", label: "General", icon: "🏢" },
                { id: "members", label: "Members", icon: "👥" },
                { id: "integrations", label: "Integrations", icon: "⚡" },
                { id: "ad_accounts", label: "Ad accounts", icon: "📊" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SubTab)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
                    activeTab === item.id
                      ? "bg-purple-950/40 text-purple-300"
                      : "text-zinc-400 hover:bg-white/4 hover:text-zinc-200"
                  )}
                >
                  <span className="text-xs opacity-75">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Group: PROJECT • NEW PROJECT */}
          <div>
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              PROJECT &middot; NEW PROJECT
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab("details")}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
                  activeTab === "details"
                    ? "bg-purple-950/40 text-purple-300"
                    : "text-zinc-400 hover:bg-white/4 hover:text-zinc-200"
                )}
              >
                <span className="text-xs opacity-75">📋</span>
                <span>Details</span>
              </button>

              {/* Agent Permissions (Active purple highlighted state matching Image #1) */}
              <button
                onClick={() => setActiveTab("agent_permissions")}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-left transition-colors",
                  activeTab === "agent_permissions"
                    ? "bg-purple-950/40 text-purple-400"
                    : "text-zinc-400 hover:bg-white/4 hover:text-zinc-200"
                )}
              >
                <span className="text-purple-400 text-xs">🛡️</span>
                <span className="text-purple-400">Agent Permissions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area (Right Column) */}
        <div className="lg:col-span-9 space-y-6">
          {/* 1. AGENT PERMISSIONS TAB (Exact reproduction of Image #1) */}
          {activeTab === "agent_permissions" && (
            <div className="space-y-6">
              {/* Top Title & Subtitle */}
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                  Agent Permissions
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Control what AI agents can do in this project.
                </p>
              </div>

              {/* Section 1: Default Agent Access Card */}
              <div className="rounded-2xl border border-white/8 bg-[#121319] p-6 space-y-4 shadow-xl shadow-black/40">
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">
                    Default Agent Access
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Agents and API keys without their own access level inherit this setting.
                  </p>
                </div>

                {/* Campaign Access Item Box */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/6 bg-[#171822] p-4">
                  <div className="max-w-xl">
                    <h4 className="text-xs font-semibold text-white">Campaign access</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                      Can create and edit campaigns as drafts. Drafts can be published by the agent or from the dashboard.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Purple Badge: Draft + Publish */}
                    <span className="inline-flex items-center rounded-lg border border-purple-500/20 bg-[#25143e] px-2.5 py-1 text-[11px] font-semibold text-purple-300">
                      {campaignAccessLevel}
                    </span>
                    {/* Button: Change access */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAccessModalOpen(true)}
                      className="h-8 rounded-lg border border-white/10 bg-[#1f202b] hover:bg-[#282a38] text-xs font-medium text-zinc-200"
                    >
                      Change access
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section 2: Platform Access Card */}
              <div className="rounded-2xl border border-white/8 bg-[#121319] p-6 space-y-4 shadow-xl shadow-black/40">
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">
                    Platform Access
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Configure which ad platform capabilities agents can use.
                  </p>
                </div>

                {/* Advanced Platform Access Item Box with Toggle Switch */}
                <div className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-[#171822] p-4">
                  <div className="max-w-xl">
                    <h4 className="text-xs font-semibold text-white">Advanced Platform Access</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                      Let agents call ad platform APIs directly for features AdKit doesn&apos;t support yet. Changes still go through the draft system, but AdKit won&apos;t validate the request content.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={advancedPlatformAccess}
                    onClick={() => {
                      setAdvancedPlatformAccess(!advancedPlatformAccess);
                      showToast(
                        !advancedPlatformAccess
                          ? "Advanced Platform Access enabled"
                          : "Advanced Platform Access disabled"
                      );
                    }}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                      advancedPlatformAccess ? "bg-purple-600" : "bg-zinc-800"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                        advancedPlatformAccess ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Granular Platform Capabilities Matrix */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-zinc-400 mb-2">Connected Platform Scopes</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: "meta", name: "Meta Ads", desc: "Carousels, Instagram Identities, Placement media", active: platformToggles.meta },
                      { id: "google", name: "Google Ads", desc: "PMax Asset Groups, Search RSA, Video Ads", active: platformToggles.google },
                      { id: "tiktok", name: "TikTok Ads", desc: "Spark Ads, Smart+, Dayparting", active: platformToggles.tiktok },
                      { id: "linkedin", name: "LinkedIn Ads", desc: "Sponsored Content, Bidding, Lead Gen", active: platformToggles.linkedin },
                    ].map((plat) => (
                      <div
                        key={plat.id}
                        className="flex items-center justify-between rounded-xl border border-white/4 bg-[#151620] p-3"
                      >
                        <div>
                          <span className="text-xs font-semibold text-white">{plat.name}</span>
                          <p className="text-[10px] text-zinc-400">{plat.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPlatformToggles((prev) => ({
                              ...prev,
                              [plat.id]: !prev[plat.id as keyof typeof platformToggles],
                            }));
                            showToast(`Updated ${plat.name} agent permission`);
                          }}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                            platformToggles[plat.id as keyof typeof platformToggles] ? "bg-purple-600" : "bg-zinc-800"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition duration-200",
                              platformToggles[plat.id as keyof typeof platformToggles] ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">Profile Settings</h2>
                <p className="mt-1 text-xs text-zinc-400">Manage your personal operator account and security.</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#121319] p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-4 border-b border-white/6 pb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xl font-bold">
                    P
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">prince</h3>
                    <p className="text-xs text-zinc-400">pal265354@gmail.com</p>
                    <Badge variant="outline" className="mt-1 border-purple-500/30 bg-purple-500/10 text-[10px] text-purple-300">
                      Workspace Owner
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="prince"
                      className="w-full rounded-lg border border-white/10 bg-[#171822] px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="pal265354@gmail.com"
                      disabled
                      className="w-full rounded-lg border border-white/5 bg-[#14151e] px-3 py-2 text-zinc-400 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={() => showToast("Profile settings saved")} className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 3. BILLING TAB */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">Billing & Plan</h2>
                <p className="mt-1 text-xs text-zinc-400">Manage subscriptions, platform spend limits, and invoices.</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#121319] p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/6 pb-4">
                  <div>
                    <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-xs text-purple-300 font-semibold">
                      PerfOS Pro Tier
                    </Badge>
                    <p className="mt-1 text-xs text-zinc-300">$299 / month &middot; Unlimited connected channels</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => showToast("Redirecting to Stripe customer portal...")} className="text-xs">
                    Manage Subscription
                  </Button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/4">
                    <span className="text-zinc-400">Payment Method</span>
                    <span className="text-white font-mono">Visa ending in 4242</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/4">
                    <span className="text-zinc-400">Next Billing Date</span>
                    <span className="text-white">September 1, 2026</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Managed Ad Spend Cap</span>
                    <span className="text-emerald-400 font-semibold">$50,000 / mo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. DEVICES & KEYS TAB */}
          {activeTab === "devices_keys" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">Devices & API Keys</h2>
                <p className="mt-1 text-xs text-zinc-400">Manage programmatic API keys and MCP authentication tokens.</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#121319] p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/6 pb-3">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Active MCP Session Token</h4>
                    <p className="text-[11px] text-zinc-400">30-day persistent session for Codex CLI & Claude Desktop</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400">
                    Active (Expires in 28 days)
                  </Badge>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-[#171822] p-3 border border-white/5">
                  <code className="flex-1 font-mono text-[11px] text-purple-300 truncate">
                    apk_live_99f0b12ad76a91bc74e2
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText("apk_live_99f0b12ad76a91bc74e2");
                      showToast("API Key copied to clipboard");
                    }}
                    className="text-xs h-7"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 5. GENERAL & WORKSPACE TABS */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">General Workspace</h2>
                <p className="mt-1 text-xs text-zinc-400">Global workspace defaults and brand parameters.</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#121319] p-6 space-y-4 shadow-xl">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Workspace Name</label>
                    <input
                      type="text"
                      defaultValue="Demo DTC Brand"
                      className="w-full rounded-lg border border-white/10 bg-[#171822] px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Primary Currency</label>
                    <input
                      type="text"
                      defaultValue="USD ($)"
                      disabled
                      className="w-full rounded-lg border border-white/5 bg-[#14151e] px-3 py-2 text-zinc-400 outline-none"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button onClick={() => showToast("Workspace settings saved")} className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 6. MEMBERS TAB */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-white">Members & Roles</h2>
                  <p className="mt-1 text-xs text-zinc-400">Control who can create, review drafts, and publish campaigns.</p>
                </div>
                <Button onClick={() => showToast("Invite link copied to clipboard")} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
                  + Invite Member
                </Button>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#121319] p-6 space-y-3 shadow-xl">
                {[
                  { name: "prince", email: "pal265354@gmail.com", role: "Owner" },
                  { name: "AdKit MCP Agent", email: "agent@mcp.adkit.so", role: "Draft + Publish" },
                  { name: "Creative Producer", email: "creative@dtcbrand.co", role: "Editor" },
                ].map((m) => (
                  <div key={m.email} className="flex items-center justify-between border-b border-white/4 pb-3 last:border-none">
                    <div>
                      <p className="text-xs font-semibold text-white">{m.name}</p>
                      <p className="text-[11px] text-zinc-400">{m.email}</p>
                    </div>
                    <Badge variant="outline" className="border-purple-500/20 bg-purple-950/40 text-purple-300 text-[10px]">
                      {m.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. AD ACCOUNTS TAB */}
          {activeTab === "ad_accounts" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">Connected Ad Accounts</h2>
                <p className="mt-1 text-xs text-zinc-400">Manage ad networks and synchronization frequency.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "Meta Ads (Main DTC)", id: "act_109283471", status: "Connected", spend: "$14,230 / mo" },
                  { name: "Google Ads (PMax)", id: "982-104-5829", status: "Connected", spend: "$8,940 / mo" },
                  { name: "TikTok Ads (Spark)", id: "tt_892019482", status: "Connected", spend: "$4,150 / mo" },
                  { name: "LinkedIn Ads", id: "li_502910394", status: "Connected", spend: "$1,820 / mo" },
                ].map((acc) => (
                  <div key={acc.id} className="rounded-xl border border-white/8 bg-[#121319] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-white">{acc.name}</h4>
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                        {acc.status}
                      </Badge>
                    </div>
                    <p className="font-mono text-[10px] text-zinc-400">{acc.id}</p>
                    <p className="text-[11px] text-zinc-300">Managed spend: {acc.spend}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. PROJECT DETAILS TAB */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">Project Details</h2>
                <p className="mt-1 text-xs text-zinc-400">Project metadata and daily safety limits.</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#121319] p-6 space-y-4 shadow-xl text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    defaultValue="New project"
                    className="w-full rounded-lg border border-white/10 bg-[#171822] px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Daily Budget Floor / Ceiling</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      defaultValue="Min: $500 / day"
                      className="rounded-lg border border-white/10 bg-[#171822] px-3 py-2 text-white outline-none"
                    />
                    <input
                      type="text"
                      defaultValue="Max: $5,000 / day"
                      className="rounded-lg border border-white/10 bg-[#171822] px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button onClick={() => showToast("Project details saved")} className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
                    Save Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Change Campaign Access Level */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAccessModalOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#14151f] p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display text-base font-semibold text-white">Change Campaign Access Policy</h3>
            <p className="mt-1 text-xs text-zinc-400">Select what level of authority AI agents hold when managing ad drafts.</p>

            <div className="my-4 space-y-2.5">
              {[
                { id: "Read-Only", title: "Read-Only", desc: "Agents can only inspect metrics and winning creatives. No drafts or publishing." },
                { id: "Drafts Only", title: "Drafts Only", desc: "Agents can stage campaign variations as drafts. Every change requires human sign-off." },
                { id: "Draft + Publish", title: "Draft + Publish (Recommended)", desc: "Can create drafts and automatically publish verified optimizations & budget shifts." },
                { id: "Full Autonomous", title: "Full Autonomous", desc: "Autonomous budget scaling, daily asset swapping, and creative kill-switch rules." },
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => {
                    setCampaignAccessLevel(lvl.id);
                    setIsAccessModalOpen(false);
                    showToast(`Campaign access level updated to ${lvl.id}`);
                  }}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
                    campaignAccessLevel === lvl.id
                      ? "border-purple-500/60 bg-purple-950/30"
                      : "border-white/6 bg-[#181924] hover:border-white/20"
                  )}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      checked={campaignAccessLevel === lvl.id}
                      onChange={() => {}}
                      className="text-purple-600 focus:ring-0"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{lvl.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{lvl.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAccessModalOpen(false)} className="text-xs">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
