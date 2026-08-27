/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: postproxy
 * Macrostructure mirrors adkit.so/features/ads-mcp/x. Real PerfOS MCP tools. */
'use client';

import { AdsMcpPage } from '@/components/marketing/ads-mcp-page';
import { XLogo } from '@/components/marketing/icons';

export default function XAdsMcpPage() {
  return (
    <AdsMcpPage
      platform="X"
      name="X Ads"
      Logo={XLogo}
      hero="The safe MCP server for X Ads"
      sub="Manage promoted posts and conversation targeting from your agent. Every change is drafted in your workspace first — nothing touches a live account until you approve."
      problem="Promoted posts lost in the X ads console. Conversation and follower targeting rebuilt by hand every launch. No way to route account checks or audience work through your agent without raw platform MCPs that write live."
      relief="Prompt in plain English, review the draft, approve when ready. Your agent pulls post performance, stages targeting changes, and generates new creative — always as drafts."
      features={[
        {
          cap: 'Manage',
          title: 'Manage X campaigns in bulk',
          prompt: 'Shift budget to the conversations actually converting',
          reply: 'Compared your two top conversation targets, drafted a budget move to the converting segment, and staged it. Approve when ready.',
          chip: 'perfos_ads_loop_run',
        },
        {
          cap: 'Analyze',
          title: 'Analyze X Ads in seconds',
          prompt: 'How are my promoted posts pacing this week?',
          reply: 'Engagement is up week-over-week but frequency is climbing on the top post. Drafted a fatigue check and creative refresh.',
          chip: 'perfos_measurement_summary',
        },
        {
          cap: 'Library',
          title: 'Spy on competitor Promoted posts',
          prompt: 'What are competitors in my vertical running on X?',
          reply: 'Pulled the active promoted posts pacing your vertical. Saved the strongest hook and thread to your swipe file.',
          chip: 'perfos_adlib_search',
        },
        {
          cap: 'Create',
          title: 'Generate promoted-post creative',
          prompt: 'Draft 3 new post variants for my tech audience',
          reply: '3 hook + thread variants drafted, matched to your brand kit. Review them before I stage.',
          chip: 'perfos_ads_generate',
        },
        {
          cap: 'Clone',
          title: 'Clone winning Promoted posts',
          prompt: 'Clone my best-performing post for a new launch',
          reply: 'Cloned the winner and remixed the hook for the new offer. Staged as a draft.',
          chip: 'perfos_ads_clone',
        },
        {
          cap: 'Truth',
          title: 'Keep budget honest',
          prompt: 'Is the retargeting post overspending?',
          reply: 'Reconciled reported vs tracked spend — the retargeting post is flagged. Drafted a pause and reallocation for review.',
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
        { title: 'Tech & developer marketers', desc: 'Conversation targeting on the exact conversations your audience lives in.' },
        { title: 'Founders & solopreneurs', desc: 'Run promoted posts without living in the ads console.' },
        { title: 'Agencies', desc: 'Multiple accounts, one conversation, no tab-switching.' },
        { title: 'Growth marketers', desc: 'Promoted-post iteration that lives where the rest of your workflow does.' },
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