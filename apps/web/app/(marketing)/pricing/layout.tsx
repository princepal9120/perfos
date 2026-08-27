import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simple, Transparent Pricing — Single & Multiple Projects',
  description:
    'Start your 7-day free trial. Plans start at $29/mo with full access to the Ad Library, AI Ads Generator, and multi-network Ads MCP Server.',
  alternates: {
    canonical: 'https://perfos.adkit.so/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
