import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "PerfOS",
  description: "AI Performance Marketing OS. Honest attribution console",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-background font-sans text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
