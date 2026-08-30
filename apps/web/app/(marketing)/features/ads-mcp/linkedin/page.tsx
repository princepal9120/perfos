/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: postproxy
 * Macrostructure mirrors adkit.so/features/ads-mcp/linkedin. Real PerfOS MCP tools. */
'use client';

import { AdsMcpPage } from '@/components/marketing/ads-mcp-page';
import { LinkedInLogo } from '@/components/marketing/icons';

export default function LinkedInAdsMcpPage() {
  return (
    <AdsMcpPage
      platform="LinkedIn"
      name="LinkedIn Ads"
      Logo={LinkedInLogo}
      hero="The safe MCP server for LinkedIn Ads"
      sub="Manage B2B campaigns, title and company targeting, and lead-gen forms from your agent. Every change is drafted first — nothing touches a live account until you approve."
      problem="B2B campaigns buried in the LinkedIn campaign manager. Audience targeting that needs to be rebuilt every launch. No way to route account checks or audience work through your agent without raw platform MCPs that write live."
      relief="Prompt in plain English, review the draft, approve when ready. Your agent pulls account performance, stages audience changes, and generates lead-gen creative — always as drafts."
      features={[
        {
          cap: 'Manage',
          title: 'Manage LinkedIn campaigns in bulk',
          prompt: 'Shift budget to the audience actually converting',
          reply: 'Compared your two top audiences, drafted a 30% budget move to the converting segment, and staged it. Approve when ready.',
          chip: 'perfos_ads_loop_run',
        },
        {
          cap: 'Analyze',
          title: 'Analyze LinkedIn Ads in seconds',
          prompt: 'How did last month\'s ABM campaign do?',
          reply: 'Pipeline-attributed conversions are up, CPL is flat. Drafted an iROAS read to confirm incrementality before scaling.',
          chip: 'perfos_measurement_summary',
        },
        {
          cap: 'Library',
          title: 'Spy on competitor B2B creative',
          prompt: 'What are competitors in my vertical running on LinkedIn?',
          reply: 'Pulled the active B2B ads pacing your vertical. Saved the strongest hook and its landing page to your swipe file.',
          chip: 'perfos_adlib_search',
        },
        {
          cap: 'Create',
          title: 'Generate lead-gen creative',
          prompt: 'Draft 3 new headline variants for my lead-gen campaign',
          reply: '3 headline + description variants drafted, matched to your brand kit. Review them before I stage.',
          chip: 'perfos_ads_generate',
        },
        {
          cap: 'Clone',
          title: 'Clone winning account-based ads',
          prompt: 'Clone my best ABM ad for a new segment',
          reply: 'Cloned the winner and remixed targeting + headline for the new segment. Staged as a draft.',
          chip: 'perfos_ads_clone',
        },
        {
          cap: 'Truth',
          title: 'Keep budget honest',
          prompt: 'Are we overspending on the logo-heavy campaign?',
          reply: 'Reconciled reported vs tracked spend — the ABM campaign is flagged. Drafted a pause and reallocation for review.',
          chip: 'perfos_measurement_reconcile',
        },
      ]}
      tools={[
        { name: 'perfos_measurement_summary', desc: 'Cross-network performance snapshot with spend and anomaly flags.' },
        { name: 'perfos_measurement_iroas', desc: 'Incremental ROAS read for honest B2B small-data attribution.' },
        { name: 'perfos_measurement_reconcile', desc: 'Reported vs tracked spend for tight control across networks.' },
        { name: 'perfos_ads_search', desc: 'Query ads by persona and vertical across the ad library.' },
        { name: 'perfos_ads_winners', desc: 'Strongest B2B ads per channel and persona from scored runs.' },
        { name: 'perfos_ads_clone', desc: 'Clone any ad by ID and remix its creative into a draft.' },
        { name: 'perfos_ads_generate', desc: 'Generate a fresh creative brief for a B2B persona.' },
        { name: 'perfos_ads_loop_run', desc: 'Discovery-to-launch loop with a dry-run default.' },
        { name: 'perfos_ads_loop_status', desc: 'Check running loops and latest output.' },
        { name: 'perfos_adlib_search', desc: 'Full-text ad library search across platforms.' },
      ]}
      personas={[
        { title: 'B2B marketers', desc: 'Title and company targeting built from a chat, not the campaign manager.' },
        { title: 'Agencies', desc: 'Run multiple B2B accounts from one conversation.' },
        { title: 'Founders & solopreneurs', desc: 'Run LinkedIn ads without living inside the UI.' },
        { title: 'Growth marketers', desc: 'ABM iteration that lives where the rest of your workflow does.' },
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