'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type BriefingPayload,
  normalizeRecommendations,
  parseBriefing,
} from '@/components/overview/briefing';
import { ChangeList } from '@/components/overview/change-list';
import { KpiCards } from '@/components/overview/kpi-cards';
import { Narrative } from '@/components/overview/narrative';
import { RecommendationPreview } from '@/components/overview/recommendation-preview';
import { Button } from '@/components/ui/button';
import {
  generateRecommendations,
  getBriefing,
  getRecommendations,
} from '@/lib/api';

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function OverviewPage() {
  const [data, setData] = useState<BriefingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const briefing = parseBriefing(await getBriefing());
      setData(briefing);
      setError(null);
      let recs = await getRecommendations().catch(() => []);
      if (recs.length === 0) {
        recs = await generateRecommendations().catch(() => []);
      }
      const preview =
        normalizeRecommendations(recs).length > 0
          ? normalizeRecommendations(recs)
          : briefing.recommendations;
      setData({ ...briefing, recommendations: preview });
    } catch {
      setError('Could not load the briefing. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 60_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Daily briefing
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {today}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo DTC Brand &middot; reconciled against Shopify
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading briefing…</p>
      ) : (
        <>
          <KpiCards kpis={data?.kpis ?? null} />

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Narrative narrative={data?.narrative ?? null} />
            </div>
            <div className="lg:col-span-3">
              <ChangeList changes={data?.changes ?? []} />
            </div>
          </div>

          <RecommendationPreview
            recommendations={data?.recommendations ?? []}
          />
        </>
      )}
    </div>
  );
}
