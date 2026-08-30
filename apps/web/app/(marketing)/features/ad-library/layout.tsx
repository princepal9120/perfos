import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ad Library & Competitor Ad Spy Tool — 500k+ Searchable Ads',
  description:
    'Search 500,000+ active SaaS and mobile app ads across Meta, Google, TikTok, LinkedIn, and X. Filter by 90+ day active longevity to spot evergreen winners.',
  alternates: {
    canonical: 'https://perfos.adkit.so/features/ad-library',
  },
};

export default function AdLibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
