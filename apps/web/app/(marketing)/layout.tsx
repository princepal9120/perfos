import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-zinc-100 selection:bg-purple-500/20 selection:text-purple-200">
      <MarketingNavbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
