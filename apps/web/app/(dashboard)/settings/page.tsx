/* Hallmark · macrostructure: Workbench · tone: modern-minimal · anchor hue: daisy-black
 * pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black
 */
"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MetaLogo,
  GoogleLogo,
  LinkedInLogo,
  XLogo,
  TikTokLogo,
  RedditLogo,
} from "@/components/marketing/icons";
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
    linkedin: true,
    x: true,
    tiktok: true,
    reddit: true,
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
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure agent safety policies, workspace keys, and platform synchronization.
          </p>
        </div>
        {saveToast && (
          <div className="rounded-lg border border-primary/40 bg-surface-elevated px-3 py-1.5 text-xs text-primary shadow-lg shadow-black/60 animate-in fade-in">
            {saveToast}
          </div>
        )}
      </div>

      {/* 2-Column Split Settings Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Subnavigation Column (Left) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Group: ACCOUNT */}
          <div>
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              ACCOUNT
            </p>
            <div className="space-y-0.5">
              {[
                { id: "profile", label: "Profile", icon: "👤" },
                { id: "billing", label: "Billing & Plans", icon: "💳" },
                { id: "devices_keys", label: "Devices & MCP Keys", icon: "💻" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SubTab)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
                    activeTab === item.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-transparent"
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
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              WORKSPACE
            </p>
            <div className="space-y-0.5">
              {[
                { id: "general", label: "General", icon: "🏢" },
                { id: "members", label: "Members & Access", icon: "👥" },
                { id: "ad_accounts", label: "Ad Accounts", icon: "📊" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SubTab)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
                    activeTab === item.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-transparent"
                  )}
                >
                  <span className="text-xs opacity-75">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Group: PROJECT POLICIES */}
          <div>
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              PROJECT POLICIES
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab("details")}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors",
                  activeTab === "details"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-transparent"
                )}
              >
                <span className="text-xs opacity-75">📋</span>
                <span>Project Details</span>
              </button>

              <button
                onClick={() => setActiveTab("agent_permissions")}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-left transition-colors",
                  activeTab === "agent_permissions"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-transparent"
                )}
              >
                <span className="text-primary text-xs">🛡️</span>
                <span className="text-primary">Agent Permissions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area (Right Column) */}
        <div className="lg:col-span-9 space-y-6">
          {/* 1. AGENT PERMISSIONS TAB */}
          {activeTab === "agent_permissions" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  Agent Permissions & Safety Gates
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Control what autonomous AI agents can execute, stage, or publish across your channels.
                </p>
              </div>

              {/* Section 1: Default Agent Access Card */}
              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xl shadow-black/40">
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Default Agent Authority
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Agents and MCP tool calls without custom scope inherit this policy setting.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="max-w-xl">
                    <h4 className="text-xs font-semibold text-foreground">Campaign Access Level</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      Can formulate hooks, synthesize scripts, and stage drafts. High-risk budget changes require human sign-off.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="inline-flex items-center rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary font-mono">
                      {campaignAccessLevel}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAccessModalOpen(true)}
                      className="h-8 text-xs font-medium"
                    >
                      Change Policy
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section 2: Platform Access Card with Real Brand Logos */}
              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xl shadow-black/40">
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Platform API Scopes
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Configure which connected marketing API capabilities agents can invoke.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="max-w-xl">
                    <h4 className="text-xs font-semibold text-foreground">Advanced MCP Tool Runner</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      Permit agents to invoke platform tool schemas directly across Meta, Google, LinkedIn, X, TikTok, and Reddit.
                    </p>
                  </div>

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
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary",
                      advancedPlatformAccess ? "bg-primary" : "bg-zinc-800"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out",
                        advancedPlatformAccess ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Granular Platform Capabilities Matrix with Official Vector Logos */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2 font-mono uppercase tracking-wider">
                    Connected Platforms (Google, Meta, LinkedIn, X, TikTok, Reddit)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: "google", name: "Google Ads", desc: "PMax Asset Groups, Search RSA, Video Ads", Logo: GoogleLogo, active: platformToggles.google },
                      { id: "meta", name: "Meta Ads", desc: "Dynamic Creatives, Placement Media, Ad Sets", Logo: MetaLogo, active: platformToggles.meta },
                      { id: "linkedin", name: "LinkedIn Ads", desc: "Sponsored Content, B2B Audience Split", Logo: LinkedInLogo, active: platformToggles.linkedin },
                      { id: "x", name: "X (Twitter) Ads", desc: "Timeline takeovers, Keyword campaigns", Logo: XLogo, active: platformToggles.x },
                      { id: "tiktok", name: "TikTok Ads", desc: "Spark Ads, Smart+, Video Hooks", Logo: TikTokLogo, active: platformToggles.tiktok },
                      { id: "reddit", name: "Reddit Ads", desc: "Subreddit targeting, Conversation ads", Logo: RedditLogo, active: platformToggles.reddit },
                    ].map((plat) => (
                      <div
                        key={plat.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                            <plat.Logo className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate block">{plat.name}</span>
                            <p className="text-[10px] text-muted-foreground truncate">{plat.desc}</p>
                          </div>
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
                            platformToggles[plat.id as keyof typeof platformToggles] ? "bg-primary" : "bg-zinc-800"
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
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Profile Settings</h2>
                <p className="mt-1 text-xs text-muted-foreground">Manage your personal operator account and security.</p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-primary text-lg font-bold font-mono">
                    P
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">prince</h3>
                    <p className="text-xs text-muted-foreground">pal265354@gmail.com</p>
                    <Badge variant="outline" className="mt-1 border-primary/30 bg-primary/10 text-[10px] text-primary">
                      Workspace Owner
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="prince"
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="pal265354@gmail.com"
                      disabled
                      className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-muted-foreground outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={() => showToast("Profile settings saved")} className="btn-daisy-solid text-xs">
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
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Billing & Plan</h2>
                <p className="mt-1 text-xs text-muted-foreground">Manage subscriptions, platform spend limits, and invoices.</p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-xs text-primary font-semibold font-mono">
                      PerfOS Pro Tier
                    </Badge>
                    <p className="mt-1 text-xs text-zinc-300">$299 / month · Unlimited connected channels</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => showToast("Redirecting to Stripe customer portal...")} className="text-xs">
                    Manage Subscription
                  </Button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="text-foreground font-mono">Visa ending in 4242</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Next Billing Date</span>
                    <span className="text-foreground">September 1, 2026</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Managed Ad Spend Cap</span>
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
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Devices & API Keys</h2>
                <p className="mt-1 text-xs text-muted-foreground">Manage programmatic API keys and MCP authentication tokens.</p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Active MCP Session Token</h4>
                    <p className="text-[11px] text-muted-foreground">30-day persistent session for Codex CLI & Claude Desktop</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400 font-mono">
                    Active (Expires in 28 days)
                  </Badge>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-card p-3 border border-border">
                  <code className="flex-1 font-mono text-[11px] text-primary truncate">
                    apk_live_99f0b12ad76a91bc74e2
                  </code>
                  <Button
                    variant="outline"
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

          {/* 5. GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">General Workspace</h2>
                <p className="mt-1 text-xs text-muted-foreground">Global workspace defaults and brand parameters.</p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xl">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Workspace Name</label>
                    <input
                      type="text"
                      defaultValue="Demo DTC Brand"
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Primary Currency</label>
                    <input
                      type="text"
                      defaultValue="USD ($)"
                      disabled
                      className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-muted-foreground outline-none"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button onClick={() => showToast("Workspace settings saved")} className="btn-daisy-solid text-xs">
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
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Members & Roles</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Control who can create, review drafts, and publish campaigns.</p>
                </div>
                <Button onClick={() => showToast("Invite link copied to clipboard")} size="sm" className="btn-daisy-solid text-xs">
                  + Invite Member
                </Button>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 space-y-3 shadow-xl">
                {[
                  { name: "prince", email: "pal265354@gmail.com", role: "Owner" },
                  { name: "PerfOS Autonomous Fleet", email: "agents@perfos.ai", role: "Draft + Publish" },
                  { name: "Creative Producer", email: "creative@dtcbrand.co", role: "Editor" },
                ].map((m) => (
                  <div key={m.email} className="flex items-center justify-between border-b border-border pb-3 last:border-none">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.email}</p>
                    </div>
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">
                      {m.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. AD ACCOUNTS TAB (Featuring the Exact 6 Platforms) */}
          {activeTab === "ad_accounts" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Connected Ad Accounts</h2>
                <p className="mt-1 text-xs text-muted-foreground">Manage ad networks and synchronization frequency across your 6 connected channels.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "Google Ads (PMax & Search)", id: "982-104-5829", status: "Connected", spend: "$8,940 / mo", Logo: GoogleLogo },
                  { name: "Meta Ads (Main DTC)", id: "act_109283471", status: "Connected", spend: "$14,230 / mo", Logo: MetaLogo },
                  { name: "LinkedIn Ads (B2B)", id: "li_502910394", status: "Connected", spend: "$1,820 / mo", Logo: LinkedInLogo },
                  { name: "X (Twitter) Ads", id: "x_884102913", status: "Connected", spend: "$1,250 / mo", Logo: XLogo },
                  { name: "TikTok Ads (Spark)", id: "tt_892019482", status: "Connected", spend: "$4,150 / mo", Logo: TikTokLogo },
                  { name: "Reddit Ads (Subreddit)", id: "rd_440192834", status: "Connected", spend: "$950 / mo", Logo: RedditLogo },
                ].map((acc) => (
                  <div key={acc.id} className="rounded-xl border border-border bg-surface p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-primary">
                          <acc.Logo className="w-3.5 h-3.5 text-primary" />
                        </span>
                        <h4 className="text-xs font-semibold text-foreground truncate">{acc.name}</h4>
                      </div>
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono uppercase">
                        {acc.status}
                      </Badge>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">{acc.id}</p>
                    <p className="text-[11px] text-zinc-300">Managed spend: <strong>{acc.spend}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. PROJECT DETAILS TAB */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Project Details</h2>
                <p className="mt-1 text-xs text-muted-foreground">Project metadata and daily safety limits.</p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xl text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Project Name</label>
                  <input
                    type="text"
                    defaultValue="Demo DTC Brand"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Daily Budget Floor / Ceiling</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      defaultValue="Min: $500 / day"
                      className="rounded-lg border border-border bg-card px-3 py-2 text-foreground outline-none"
                    />
                    <input
                      type="text"
                      defaultValue="Max: $5,000 / day"
                      className="rounded-lg border border-border bg-card px-3 py-2 text-foreground outline-none"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button onClick={() => showToast("Project details saved")} className="btn-daisy-solid text-xs">
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
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display text-base font-semibold text-foreground">Change Campaign Access Policy</h3>
            <p className="mt-1 text-xs text-muted-foreground">Select what level of authority AI agents hold when managing ad drafts.</p>

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
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-white/20"
                  )}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      checked={campaignAccessLevel === lvl.id}
                      onChange={() => {}}
                      className="text-primary focus:ring-0"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">{lvl.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{lvl.desc}</p>
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
