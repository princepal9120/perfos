/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: postproxy
 * Macrostructure mirrors adkit.so/features/ads-mcp/reddit. Real PerfOS MCP tools. */
'use client';

import { AdsMcpPage } from '@/components/marketing/ads-mcp-page';
import { RedditLogo } from '@/components/marketing/icons';

export default function RedditAdsMcpPage() {
  return (
    <AdsMcpPage
      platform="Reddit"
      name="Reddit Ads"
      Logo={RedditLogo}
      hero="The safe MCP server for Reddit Ads"
      sub="Manage subreddit targeting and post creative from your agent. Every change is drafted in your workspace first — nothing touches a live account until you approve."
      problem="Subreddit targeting that needs rebuilding every launch. Post placements that fail to land in the communities that matter. No way to route community intelligence or placement work through your agent without raw platform MCPs that write live."
      relief="Prompt in plain English, review the draft, approve when ready. Your agent pulls placement performance, stages subreddit changes, and generates native post creative — always as drafts."
      features={[
        {
          cap: 'Manage',
          title: 'Manage Reddit campaigns in bulk',
          prompt: 'Shift budget to the subreddits actually converting',
          reply: 'Compared your placement performance, drafted a budget move to the converting subreddits, and staged it. Approve when ready.',
          chip: 'perfos_ads_loop_run',
        },
        {
          cap: 'Analyze',
          title: 'Analyze Reddit Ads in seconds',
          prompt: 'How are my placements pacing this week?',
          reply: 'CPC is healthy but two subreddits are fatigued. Drafted a placement pause and refresh for review.',
          chip: 'perfos_measurement_summary',
        },
        {
          cap: 'Library',
          title: 'Spy on competitor placements',
          prompt: 'What are the best-performing subreddit placements in my vertical?',
          reply: 'Pulled the active ads pacing your space and saved the winning hooks to your swipe file.',
          chip: 'perfos_adlib_search',
        },
        {
          cap: 'Create',
          title: 'Generate native post creative',
          prompt: 'Draft 3 native post variants for r/SaaS',
          reply: '3 variants drafted — different hooks, same honest tone. Staged for your review.',
          chip: 'perfos_ads_generate',
        },
        {
          cap: 'Clone',
          title: 'Clone winning post creative',
          prompt: 'Clone my best placement and remix the hook',
          reply: 'Cloned the winner and remixed the hook for your current offer. Staged as a draft.',
          chip: 'perfos_ads_clone',
        },
        {
          cap: 'Truth',
          title: 'Keep budget honest',
          prompt: 'Is the branded-placement campaign overspending?',
          reply: 'Reconciled reported vs tracked spend — the branded campaign is flagged. Drafted a pause and reallocation for review.',
          chip: 'perfos_measurement_reconcile',
        },
      ]}
      tools={[
        { name: 'perfos_measurement_summary', desc: 'Cross-network performance snapshot with spend and anomaly flags.' },
        { name: 'perfos_measurement_iroas', desc: 'Incremental ROAS read for honest small-data attribution.' },
        { name: 'perfos_measurement_reconcile', desc: 'Reported vs tracked spend for tight control across networks.' },
        { name: 'perfos_ads_search', desc: 'Query ads by persona and vertical across the ad library.' },
        { name: 'perfos_ads_winners', desc: 'Strongest ads per channel and persona from scored runs.' },
        { name: 'perfos_ads_clone', desc: 'Clone any ad by ID and remix its creative into a draft.' },
        { name: 'perfos_ads_generate', desc: 'Generate a fresh creative brief for a persona.' },
        { name: 'perfos_ads_loop_run', desc: 'Discovery-to-launch loop with a dry-run default.' },
        { name: 'perfos_ads_loop_status', desc: 'Check running loops and latest output.' },
        { name: 'perfos_adlib_search', desc: 'Full-text ad library search across platforms.' },
      ]}
      personas={[
        { title: 'Community-led marketers', desc: 'Placements that land where your audience actually contributes.' },
        { title: 'Founders & solopreneurs', desc: 'Run Reddit ads without living in the ads manager.' },
        { title: 'Agencies', desc: 'Multiple accounts, one conversation, no tab-switching.' },
        { title: 'Growth marketers', desc: 'Native-post iteration that lives where the rest of your workflow does.' },
      ]}
      faqs={[
        { q: 'Do changes go live immediately?', a: 'No. Every mutation is a draft until you approve it in the workspace.' },
        { q: 'Which agents can connect?', a: 'Any MCP-compatible client — Claude, ChatGPT, Cursor, Perplexity, GitHub Copilot, and the PerfOS Command Center.' },
        { q: 'Do I need API keys?', a: 'No. Add the server JSON block, point it at a workspace, and start prompting.' },
        { q: 'Can it read performance data?', a: 'Yes — spend, ROAS, anomalies, and incrementality route through real perfos_measurement_* tools.' },
      ]}
    />
  );
}