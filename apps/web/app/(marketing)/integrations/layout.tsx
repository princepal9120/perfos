import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agent Integrations — Claude, Cursor, ChatGPT, Grok, Codex',
  description:
    'Equip your favorite AI agent with typed tools to research ads, generate creative hooks, and manage campaigns autonomously.',
  alternates: {
    canonical: 'https://perfos.adkit.so/integrations',
  },
};

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
