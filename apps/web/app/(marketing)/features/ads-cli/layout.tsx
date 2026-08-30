import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ads CLI — Terminal Ad Management for Developers & CI/CD',
  description:
    'Deploy, pause, and inspect campaigns across Meta, Google, and TikTok directly from your command line or automated deployment pipelines.',
  alternates: {
    canonical: 'https://perfos.adkit.so/features/ads-cli',
  },
};

export default function AdsCliLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
