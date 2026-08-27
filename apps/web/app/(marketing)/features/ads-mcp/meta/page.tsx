/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: postproxy
 * Macrostructure mirrors adkit.so/features/ads-mcp/meta. Real PerfOS MCP tools. */
'use client';

import { AdsMcpPage } from '@/components/marketing/ads-mcp-page';
import { MetaLogo } from '@/components/marketing/icons';

export default function MetaAdsMcpPage() {
  return (
    <AdsMcpPage
      platform="Meta"
      name="Meta Ads"
      Logo={MetaLogo}
      hero="The safe MCP server for Meta Ads"
      sub="Manage Facebook and Instagram campaigns, review creatives, and pull results from your agent. Every change lands as a draft in your workspace — nothing touches a live account until you approve."
      problem="Hours in Ads Manager instead of building. Manual duplication that breaks on a misclick. No way to pull account performance into a chat. Raw platform MCPs with no guardrails that write straight to the account."
      relief="Plain English prompts, draft-first replies, and publish-only-with-approval. Your agent scans campaigns, stages budget moves, and drafts creative changes. You review the diff in PerfOS before anything goes live."
      features={[
        {
          cap: 'Manage',
          title: 'Manage Meta campaigns in bulk',
          prompt: 'Pause all ads with frequency above 4 in my prospecting campaigns',
          reply: 'On it. I scanned your campaigns and drafted 8 pauses across 3 prospecting ad sets. Approve the batch and I will submit it.',
          chip: 'perfos_ads_loop_run',
        },
        {
          cap: 'Analyze',
          title: 'Analyze Meta Ads in seconds',
          prompt: 'How are my Facebook and Instagram campaigns doing this month?',
          reply: 'Spend is on track, ROAS is up, but frequency on two retargeting sets is climbing. Want a fatigue sweep drafted?',
          chip: 'perfos_measurement_summary',
        },
        {
          cap: 'Library',
          title: 'Spy on competitors in the Ad Library',
          prompt: 'Show me Notion\'s Meta ads and their best creatives',
          reply: 'Found 84 active ads across Facebook and Instagram. Marking the evergreen creative and its landing page as your top copy reference.',
          chip: 'perfos_adlib_search',
        },
        {
          cap: 'Create',
          title: 'Generate fresh creative from a winner',
          prompt: 'Turn my top-performing creative into new variants',
          reply: 'Generated 3 variants from your winner: Square, Story, Banner. Staged as drafts with hooks and copy — review when ready.',
          chip: 'perfos_ads_generate',
        },
        {
          cap: 'Clone',
          title: 'Clone and remix competitor ads',
          prompt: 'Clone the best creative from my swipe file',
          reply: 'Pulled the saved creative and remixed the headline for your current offer. Drafted with your brand kit — approve to stage.',
          chip: 'perfos_ads_clone',
        },
        {
          cap: 'Budget',
          title: 'Keep ad spend under control',
          prompt: 'Pause any ad set over $50 CPL, and relaunch Retargeting Q3 — it stopped delivering yesterday',
          reply: 'Two moves drafted for approval: pause Prospecting: Broad (CPL $64) and reset the Retargeting Q3 daily budget.',
          chip: 'perfos_measurement_reconcile',
        },
      ]}
      tools={[
        { name: 'perfos_measurement_summary', desc: 'Cross-network performance snapshot: spend, ROAS, anomalies, and fatigue flags in one call.' },
        { name: 'perfos_measurement_reconcile', desc: 'Compare reported vs tracked spend and surface discrepancies between the network and your books.' },
        { name: 'perfos_measurement_iroas', desc: 'Incremental ROAS read with a minimum sample filter, so small datasets do not overstate lift.' },
        { name: 'perfos_ads_search', desc: 'Search for ads by query, persona, channels, and country across the ad library.' },
        { name: 'perfos_ads_winners', desc: 'Pull the strongest ads per channel and persona from scored discovery runs.' },
        { name: 'perfos_ads_clone', desc: 'Clone any ad by ID and remix its creative into a new draft.' },
        { name: 'perfos_ads_generate', desc: 'Generate a fresh creative brief and assets for a given persona.' },
        { name: 'perfos_ads_loop_run', desc: 'Run the discovery-to-launch loop with a dry-run default; safe by construction.' },
        { name: 'perfos_ads_loop_status', desc: 'Check the state of running discovery loops and their latest output.' },
        { name: 'perfos_adlib_search', desc: 'Full-text ad library search across platforms, competitors, tiers, and minimum runtime.' },
      ]}
      personas={[
        { title: 'Founders & solopreneurs', desc: 'Run ads without living inside Ads Manager. Ask, review, approve.' },
        { title: 'Agencies & media buyers', desc: 'Manage multiple accounts from one conversation instead of ten dashboards.' },
        { title: 'Growth marketers', desc: 'Your work already happens with AI agents — ads should not be the exception.' },
        { title: 'Brand managers', desc: 'Track competitor creative and swipe the winners into your own pipeline.' },
      ]}
      faqs={[
        { q: 'Do changes go live immediately?', a: 'No. Every mutation is a draft in your workspace. Nothing reaches an ad account until you approve it.' },
        { q: 'Which agents can connect?', a: 'Any MCP-compatible client: Claude, ChatGPT, Cursor, Perplexity, GitHub Copilot, and the PerfOS Command Center itself.' },
        { q: 'Do I need API keys?', a: 'No. Add the server JSON block to your MCP client, point it at your workspace, and start prompting.' },
        { q: 'Can it read performance data?', a: 'Yes — spend, ROAS, anomalies, attribution, and incrementality all route through real perfos_measurement_* tools.' },
      ]}
    />
  );
}