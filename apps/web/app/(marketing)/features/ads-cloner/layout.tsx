import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Ad Cloner & Remix Engine — Deconstruct Competitor Winning Ads',
  description:
    'Decompile any competitor ad link or image into its visual hook pattern and psychological angle, then generate adapted on-brand variations.',
  alternates: {
    canonical: 'https://perfos.adkit.so/features/ads-cloner',
  },
};

export default function AdsClonerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
