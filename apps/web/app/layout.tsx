import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PerfOS",
  description: "AI Performance Marketing OS — honest attribution console",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
