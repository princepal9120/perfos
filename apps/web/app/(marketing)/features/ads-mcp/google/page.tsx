/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: postproxy
 * Macrostructure mirrors adkit.so/features/ads-mcp/google. Real PerfOS MCP tools. */
'use client';

import { AdsMcpPage } from '@/components/marketing/ads-mcp-page';
import { GoogleLogo } from '@/components/marketing/icons';

export default function GoogleAdsMcpPage() {
  return (
    <AdsMcpPage
      platform="Google"
      name="Google Ads"
      Logo={GoogleLogo}
      hero="The safe MCP server for Google Ads"
      sub="Manage Search, Performance Max, and YouTube campaigns straight from a chat. Every change is drafted in your workspace first — nothing touches a live account until you approve."
      problem="Wasted hours in Google Ads UI instead of shipping. Negative-keyword hygiene that goes stale. No way to route search-term waste or budget changes through your agent without raw Google-API MCPs that write live."
      relief="Ask in plain English, review the draft, approve when ready. Your agent scans campaigns, stages budget moves, and generates fresh RSA and creative builds — all as drafts."
      features={[
        {
          cap: 'Manage',
          title: 'Manage Google campaigns in bulk',
          prompt: 'Cut spend on campaigns spending over target without conversions',
          reply: 'Scanned your accounts and drafted a pause + budget reallocation across 3 Search campaigns. Approve the batch to submit.',
          chip: 'perfos_ads_loop_run',
        },
        {
          cap: 'Analyze',
          title: 'Analyze Google Ads in seconds',
          prompt: 'What is driving conversions this week?',
          reply: 'Search and PMax both up this week. I drafted an incremental-ROAS read to isolate the true driver. Want it staged?',
          chip: 'perfos_measurement_summary',
        },
        {
          cap: 'Library',
          title: 'Spy on competitor Search ads',
          prompt: 'What is the longest-running ad in my vertical?',
          reply: 'Pulled the evergreen ad in your vertical — 142 days live, pointing at a top landing page. Saved the copy reference to your swipe file.',
          chip: 'perfos_adlib_search',
        },
        {
          cap: 'Create',
          title: 'Generate RSA-ready creative',
          prompt: 'Draft 3 new headlines and descriptions for my PMax campaign',
          reply: '3 RSA variants drafted, each with hooks and CTAs matched to your brand kit. Review them before I stage.',
          chip: 'perfos_ads_generate',
        },
        {
          cap: 'Clone',
          title: 'Clone and remix winning Search ads',
          prompt: 'Clone my best search ad and make a variation',
          reply: 'Cloned the winner and remixed the primary headline for the new offer. Staged as a draft with your brand kit.',
          chip: 'perfos_ads_clone',
        },
        {
          cap: 'Truth',
          title: 'Keep search-term waste under control',
          prompt: 'Find search terms spending without conversions',
          reply: 'Flagged 14 wasted terms across the account and drafted negative-keyword adds. Approve the list once you review it.',
          chip: 'perfos_ads_search',
        },
      ]}
      tools={[
        { name: 'perfos_measurement_summary', desc: 'Cross-network performance snapshot with spend, ROAS, and anomaly flags.' },
        { name: 'perfos_measurement_iroas', desc: 'Incremental ROAS with a minimum sample filter for honest small-data reads.' },
        { name: 'perfos_measurement_reconcile', desc: 'Reported vs tracked spend reconciliation across networks.' },
        { name: 'perfos_ads_search', desc: 'Query ads by persona, channels, country, and search terms.' },
        { name: 'perfos_ads_winners', desc: 'Strongest ads per channel and persona from scored discovery runs.' },
        { name: 'perfos_ads_clone', desc: 'Clone any ad by ID and remix its creative into a draft.' },
        { name: 'perfos_ads_generate', desc: 'Generate a fresh creative brief and assets for a persona.' },
        { name: 'perfos_ads_loop_run', desc: 'Discovery-to-launch loop with a dry-run default.' },
        { name: 'perfos_ads_loop_status', desc: 'Check running loops and their latest output.' },
        { name: 'perfos_adlib_search', desc: 'Full-text ad library search across platforms and competitors.' },
      ]}
      personas={[
        { title: 'Founders & solopreneurs', desc: 'Run Google Ads without living inside the UI. Ask, review, approve.' },
        { title: 'Agencies & media buyers', desc: 'Multiple accounts, one conversation, no tab-switching.' },
        { title: 'Growth marketers', desc: 'Performance marketing already runs on agents — keep ad ops there too.' },
        { title: 'Search specialists', desc: 'Turn routine negative-keyword and budget work into drafted prompts.' },
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