import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ads MCP Server — Model Context Protocol for AI Agents',
  description:
    'Connect Meta, Google, TikTok, LinkedIn, Reddit, X, and Microsoft Ads directly to Claude Code, Cursor, and ChatGPT via Model Context Protocol.',
  alternates: {
    canonical: 'https://perfos.adkit.so/features/ads-mcp',
  },
};

export default function AdsMcpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
