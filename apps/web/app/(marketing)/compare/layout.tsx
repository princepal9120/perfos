import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'AdKit vs Native Ads Manager vs Legacy Spy Tools — Detailed Comparison',
  description:
    'Compare AdKit with native ad managers and legacy spy tools. See why autonomous AI agents and modern growth teams choose AdKit.',
  alternates: {
    canonical: 'https://perfos.adkit.so/compare',
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
