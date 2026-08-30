export interface KpiValues {
  spend: number | null;
  revenue: number | null;
  roas: number | null;
  overCountPct: number | null;
  integrityFlag: boolean;
}

export interface ChangeItem {
  index: number;
  title: string;
  detail: string;
  platform: string | null;
}

export interface RecommendationItem {
  id: string;
  type: string;
  reason: string;
  impact: string | null;
  confidence: number | null;
  risk: string;
  status: string;
}

export interface BriefingPayload {
  kpis: KpiValues | null;
  changes: ChangeItem[];
  recommendations: RecommendationItem[];
  narrative: string | null;
}

type Raw = Record<string, unknown>;

function asRaw(value: unknown): Raw {
  return value && typeof value === 'object' ? (value as Raw) : {};
}

function pick(obj: Raw, keys: string[]): unknown {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function num(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const match = value.replace(/[$,\s]/g, '').match(/-?\d+(\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return null;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function titleCase(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Backend may send kpis as a record or as [{label, value}] — accept both. */
function kpiListToRecord(rawKpis: unknown[]): Raw {
  const out: Raw = {};
  for (const entry of rawKpis) {
    const item = asRaw(entry);
    const label = str(item.label).toLowerCase();
    const value = item.value;
    if (!label || value === undefined || value === null) continue;
    if (/spend/.test(label)) out.total_spend = value;
    else if (/revenue|sales/.test(label)) out.actual_revenue = value;
    else if (/roas|mer|blended/.test(label)) out.blended_mer = value;
    else if (/over|count|integrity|discrepanc/.test(label))
      out.over_count_pct = value;
  }
  return out;
}

export function normalizeKpis(rawKpis: unknown): KpiValues | null {
  const source = Array.isArray(rawKpis) ? kpiListToRecord(rawKpis) : rawKpis;
  const k = asRaw(source);
  const spend = num(pick(k, ['total_spend', 'spend', 'totalSpend']));
  const revenue = num(pick(k, ['actual_revenue', 'revenue', 'actualRevenue']));
  const roas = num(
    pick(k, ['blended_mer', 'blended_roas', 'blendedMer', 'roas', 'mer']),
  );
  const overCountPct = num(
    pick(k, ['over_count_pct', 'overCountPct', 'over_count_percent']),
  );
  if (
    spend === null &&
    revenue === null &&
    roas === null &&
    overCountPct === null
  )
    return null;
  const flag = pick(k, ['tracking_integrity_flag', 'trackingIntegrityFlag']);
  return {
    spend,
    revenue,
    roas,
    overCountPct,
    integrityFlag:
      flag === true || (typeof overCountPct === 'number' && overCountPct > 15),
  };
}

export function normalizeChanges(rawChanges: unknown[]): ChangeItem[] {
  return rawChanges.slice(0, 3).map((entry, i) => {
    const c = asRaw(entry);
    const platform = pick(c, ['platform', 'channel']);
    return {
      index: i,
      title:
        str(pick(c, ['title', 'summary', 'label', 'name', 'action'])) ||
        str(pick(c, ['description', 'reason', 'detail'])).slice(0, 80) ||
        titleCase(str(pick(c, ['type', 'change']))) ||
        `Change ${i + 1}`,
      detail: str(pick(c, ['detail', 'description', 'reason', 'note', 'body'])),
      platform: typeof platform === 'string' && platform ? platform : null,
    };
  });
}

export function normalizeRecommendations(
  rawRecs: unknown[],
): RecommendationItem[] {
  return rawRecs.slice(0, 3).map((entry, i) => {
    const r = asRaw(entry);
    const confidence = num(r.confidence);
    return {
      id: str(pick(r, ['id', 'recommendation_id'])) || String(i),
      type: titleCase(str(pick(r, ['type'])) || 'Recommendation'),
      reason:
        str(pick(r, ['reason', 'description', 'summary'])) ||
        'No reason provided.',
      impact:
        str(
          pick(r, ['expected_impact', 'impact', 'expected_value', 'delta']),
        ) || null,
      confidence:
        confidence === null
          ? null
          : confidence <= 1
            ? confidence * 100
            : confidence,
      risk: str(r.risk) || 'medium',
      status: str(r.status) || 'pending',
    };
  });
}

export function parseBriefing(json: unknown): BriefingPayload {
  const data = asRaw(json);
  return {
    kpis: normalizeKpis(data.kpis),
    changes: normalizeChanges(Array.isArray(data.changes) ? data.changes : []),
    recommendations: normalizeRecommendations(
      Array.isArray(data.recommendations) ? data.recommendations : [],
    ),
    narrative: str(data.narrative) || null,
  };
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatMoney(value: number | null): string {
  return value === null ? '—' : usd.format(value);
}

export function formatRoas(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(1)}x`;
}

export function formatPct(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)}%`;
}
