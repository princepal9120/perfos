import { Stat } from "@/components/ui/stat";
import {
  formatMoney,
  formatPct,
  formatRoas,
  type KpiValues,
} from "@/components/overview/briefing";

export function KpiCards({ kpis }: { kpis: KpiValues | null }) {
  const overCount = kpis?.overCountPct ?? null;
  const flagged = kpis?.integrityFlag === true || (overCount !== null && overCount > 15);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Spend" value={formatMoney(kpis?.spend ?? null)} sub="Google + Meta, trailing period" />
      <Stat
        label="Revenue"
        value={formatMoney(kpis?.revenue ?? null)}
        sub="Shopify — source of truth"
      />
      <Stat
        label="Blended ROAS"
        value={formatRoas(kpis?.roas ?? null)}
        sub="Revenue ÷ total spend (MER)"
      />
      <Stat
        label="Over-count"
        value={formatPct(overCount)}
        sub={
          flagged
            ? "Platform claims exceed Shopify revenue — flagged"
            : "Platform claims vs Shopify revenue"
        }
        className={flagged ? "border-destructive/40 bg-destructive/5" : undefined}
      />
    </div>
  );
}
