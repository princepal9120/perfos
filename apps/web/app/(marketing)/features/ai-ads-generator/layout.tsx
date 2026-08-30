import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Ads Generator — Generate On-Brand Ad Creatives in Seconds',
  description:
    'Transform your brand kit, value proposition, and competitor hooks into 30+ production-ready static and video ad variations with 1-click resizing.',
  alternates: {
    canonical: 'https://perfos.adkit.so/features/ai-ads-generator',
  },
};

export default function AiAdsGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
