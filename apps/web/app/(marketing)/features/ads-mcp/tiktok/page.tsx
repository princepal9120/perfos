/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: postproxy
 * Macrostructure mirrors adkit.so/features/ads-mcp/tiktok. Real PerfOS MCP tools. */
'use client';

import { AdsMcpPage } from '@/components/marketing/ads-mcp-page';
import { TikTokLogo } from '@/components/marketing/icons';

export default function TikTokAdsMcpPage() {
  return (
    <AdsMcpPage
      platform="TikTok"
      name="TikTok Ads"
      Logo={TikTokLogo}
      hero="The safe MCP server for TikTok Ads"
      sub="Manage Spark ads, short-form creative, and audience demographics from your agent. Every change is drafted first — nothing touches a live account until you approve."
      problem="Short-form creative that dies in the TikTok ads manager. Spark hooks that need constant refresh. No way to route creative or audience work through your agent without raw platform MCPs that write live."
      relief="Prompt in plain English, review the draft, approve when ready. Your agent pulls creative performance, stages Spark swaps, and generates short-form variants — always as drafts."
      features={[
        {
          cap: 'Manage',
          title: 'Manage TikTok campaigns in bulk',
          prompt: 'Swap out the fatigued Spark ad in my prospecting campaign',
          reply: 'Flagged the fatigued Spark ad and drafted the replacement variant from your top performer. Approve to stage.',
          chip: 'perfos_ads_loop_run',
        },
        {
          cap: 'Analyze',
          title: 'Analyze TikTok Ads in seconds',
          prompt: 'How are my Spark ads performing this week?',
          reply: 'Hook rate is strong but completion is down on two variants. Drafted a refresh swap for your review.',
          chip: 'perfos_measurement_summary',
        },
        {
          cap: 'Library',
          title: 'Spy on competitor short-form creative',
          prompt: 'What short-form ads are winning in my vertical?',
          reply: 'Pulled the active video ads pacing your vertical and saved the top hooks to your swipe file.',
          chip: 'perfos_adlib_search',
        },
        {
          cap: 'Create',
          title: 'Generate short-form variants',
          prompt: 'Turn my top video into 3 new variants',
          reply: '3 variants drafted — different hooks, same core footage. Staged for your review.',
          chip: 'perfos_ads_generate',
        },
        {
          cap: 'Clone',
          title: 'Clone winning creative',
          prompt: 'Clone the best-performing ad in my swipe file',
          reply: 'Cloned the winner and remixed the hook for your current offer. Staged as a draft.',
          chip: 'perfos_ads_clone',
        },
        {
          cap: 'Truth',
          title: 'Keep budget honest',
          prompt: 'Is the broad campaign overspending?',
          reply: 'Reconciled reported vs tracked spend — the broad campaign is flagged. Drafted a pause and reallocation for review.',
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
        { title: 'Short-form growth teams', desc: 'Spark ads and creative swaps managed from a chat.' },
        { title: 'Founders & solopreneurs', desc: 'Run TikTok ads without living in the ads manager.' },
        { title: 'Agencies', desc: 'Multiple accounts, one conversation, no tab-switching.' },
        { title: 'Creative marketers', desc: 'Iterate on hooks where the rest of your workflow runs.' },
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