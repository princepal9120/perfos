
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Caveat } from "next/font/google";
import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-face",
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
});

const caveatFont = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://perfos.adkit.so"),
  title: {
    default: "PerfOS by AdKit — The Agentic AI Ads Platform & Toolbox",
    template: "%s — PerfOS by AdKit",
  },
  description:
    "The agentic ads toolbox for you & your AI agents. Research 500k+ competitor ads, generate on-brand static and video variations, and launch high-ROAS campaigns directly from Claude, Cursor, and ChatGPT.",
  keywords: [
    "ad library",
    "competitor ad spy",
    "ads mcp",
    "model context protocol ads",
    "ai ads generator",
    "ad cloner",
    "meta ads mcp",
    "google ads mcp",
    "claude code ads",
    "cursor ads mcp",
    "tiktok ads cli",
    "performance marketing ai"
  ],
  authors: [{ name: "AdKit Inc." }],
  creator: "PerfOS by AdKit",
  publisher: "AdKit Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://perfos.adkit.so",
    siteName: "PerfOS by AdKit",
    title: "PerfOS by AdKit — The Agentic AI Ads Platform & Toolbox",
    description:
      "Research 500k+ competitor ads, generate high-ROAS hooks, and deploy campaigns autonomously via Claude, Cursor, and ChatGPT.",
    images: [
      {
        url: "https://adkit.so/cdn-cgi/image/w=1200,h=630,f=webp,q=90/images/landings/landing-hero.png",
        width: 1200,
        height: 630,
        alt: "PerfOS by AdKit - AI Ads Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PerfOS by AdKit — The Agentic AI Ads Platform & Toolbox",
    description:
      "Research competitors, launch campaigns, and track performance in minutes from your favorite AI agent.",
    creator: "@adkit_so",
    images: ["https://adkit.so/cdn-cgi/image/w=1200,h=630,f=webp,q=90/images/landings/landing-hero.png"],
  },
  alternates: {
    canonical: "https://perfos.adkit.so",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0d",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "PerfOS by AdKit",
        "operatingSystem": "All (Web, MCP, CLI)",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "29.00",
          "priceCurrency": "USD",
          "priceValidUntil": "2027-12-31"
        },
        "description": "The ads toolbox for marketers & AI agents. Research competitor ads, create on-brand variants, and deploy campaigns via Model Context Protocol.",
        "url": "https://perfos.adkit.so"
      },
      {
        "@type": "Organization",
        "name": "AdKit Inc.",
        "url": "https://perfos.adkit.so",
        "logo": "https://perfos.adkit.so/icon.png",
        "sameAs": [
          "https://twitter.com/adkit_so",
          "https://github.com/adkit"
        ]
      }
    ]
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${caveatFont.variable} min-h-screen scroll-smooth bg-[#0e0e0d] font-sans text-zinc-100 antialiased selection:bg-purple-500/25 selection:text-purple-200`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-black"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
