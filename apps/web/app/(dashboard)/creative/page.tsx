'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type GeneratedAsset, generateCreative, getAssets } from '@/lib/api';
import { cn } from '@/lib/utils';

/* ---------------------------------- types --------------------------------- */

type Format = 'ugc' | 'static' | 'carousel' | 'demo';
type Platform = 'meta' | 'tiktok' | 'youtube';

interface Brief {
  hook: string;
  body: string;
  cta: string;
  format: Format;
  platform: Platform;
}

type AssetRow = GeneratedAsset;

interface AdVariant {
  id: string;
  label: string;
  hook: string;
  body: string;
  cta: string;
  /** predicted 3s hold rate, 0-1 */
  holdRate: number;
  /** predicted click-through, 0-1 */
  ctr: number;
  /** composite studio score, 0-100 */
  score: number;
}

/* ------------------------------ draft defaults ----------------------------- */

const DEFAULT_BRIEF: Brief = {
  hook: 'Your ad account is spending while you sleep. Most of it on ads nobody finishes watching.',
  body: "PerfOS reads every creative's hold rate, flags fatigue before spend climbs, and drafts the next variant from what already worked.",
  cta: 'See what your ads are doing',
  format: 'ugc',
  platform: 'meta',
};

const FORMATS: { value: Format; label: string }[] = [
  { value: 'ugc', label: 'UGC talking head' },
  { value: 'static', label: 'Static image' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'demo', label: 'Product demo' },
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'meta', label: 'Meta' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
];

/** deterministic draft variants — stand-in for the generation API */
function buildVariants(brief: Brief): AdVariant[] {
  const h = brief.hook.trim() || DEFAULT_BRIEF.hook;
  const b = brief.body.trim() || DEFAULT_BRIEF.body;
  const c = brief.cta.trim() || DEFAULT_BRIEF.cta;
  const shortHook = h.split(/[.!?]/)[0]?.trim() || h;

  const angles: {
    label: string;
    hook: string;
    body: string;
    hold: number;
    ctr: number;
    score: number;
  }[] = [
    {
      label: `v1 · ${brief.format}`,
      hook: shortHook,
      body: `${b} No new dashboard to learn — it runs alongside your existing accounts.`,
      hold: 0.342,
      ctr: 0.019,
      score: 87,
    },
    {
      label: `v2 · problem-first`,
      hook: `Most teams find out about creative fatigue two weeks too late.`,
      body: `${b} Fatigue alerts land before the spend curve bends the wrong way.`,
      hold: 0.298,
      ctr: 0.016,
      score: 81,
    },
    {
      label: `v3 · proof-first`,
      hook: `Hold rate up 11 points across the last 40 creatives we shipped.`,
      body: `${b} Every draft cites the winning pattern it was built from, so review takes minutes, not days.`,
      hold: 0.311,
      ctr: 0.021,
      score: 84,
    },
    {
      label: `v4 · short cut-down`,
      hook:
        shortHook.length > 42 ? shortHook.slice(0, 42).trimEnd() : shortHook,
      body: b,
      hold: 0.276,
      ctr: 0.014,
      score: 76,
    },
  ];

  return angles.map((a, i) => ({
    id: `variant-${i + 1}`,
    label: a.label,
    hook: a.hook,
    body: a.body,
    cta: c,
    holdRate: a.hold,
    ctr: a.ctr,
    score: a.score,
  }));
}

/* ---------------------------------- icons --------------------------------- */

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5" />
    </svg>
  );
}

/* --------------------------------- pieces ---------------------------------- */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground">
      {children}
    </label>
  );
}

const inputClasses =
  'w-full resize-none rounded-lg border border-border bg-white/3 px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 transition-colors duration-150 ease-out hover:border-white/16 focus:border-blue-500/40 focus:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30';

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md border px-2.5 py-1 text-xs font-medium transition-[background-color,border-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
            value === o.value
              ? 'border-blue-500/30 bg-blue-500/12 text-blue-300'
              : 'border-border bg-transparent text-muted-foreground hover:border-white/16 hover:bg-white/4 hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ScoreChip({ score }: { score: number }) {
  return (
    <Badge shape="square" variant={score >= 85 ? 'default' : 'neutral'}>
      score {score}
    </Badge>
  );
}

function VariantCard({
  variant,
  onCopy,
  copied,
}: {
  variant: AdVariant;
  onCopy: (v: AdVariant) => void;
  copied: boolean;
}) {
  const script = `${variant.hook}\n\n${variant.body}\n\nCTA: ${variant.cta}`;
  return (
    <Card className="group flex flex-col transition-colors duration-200 ease-out hover:border-white/16">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {variant.label}
        </span>
        <ScoreChip score={variant.score} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="font-display text-[15px] font-medium leading-snug tracking-tight text-foreground">
          {variant.hook}
        </p>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {variant.body}
        </p>
        <p className="mt-auto border-l-2 border-blue-500/30 pl-2.5 text-xs text-zinc-300">
          {variant.cta}
        </p>
        <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">
              hold 3s
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground">
              {(variant.holdRate * 100).toFixed(1)}%
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">
              est. ctr
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground">
              {(variant.ctr * 100).toFixed(2)}%
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">
              fatigue risk
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground">
              {scoreToRisk(variant.score)}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button size="sm" variant="ghost" onClick={() => onCopy(variant)}>
          {copied ? 'Copied' : 'Copy script'}
        </Button>
        <Button size="sm" variant="outline">
          Send to review
        </Button>
      </CardFooter>
    </Card>
  );
}

function scoreToRisk(score: number) {
  if (score >= 85) return 'low';
  if (score >= 80) return 'moderate';
  return 'watch';
}

/** skeleton matching the real variant-card layout shape */
function VariantGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-14 rounded-sm" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-8 w-full border-l-2 border-transparent" />
            <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="space-y-1.5">
                  <Skeleton className="h-2 w-10" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

/* ---------------------------------- page ----------------------------------- */

export default function CreativePage() {
  const [brief, setBrief] = useState<Brief>(DEFAULT_BRIEF);
  const [phase, setPhase] = useState<'empty' | 'generating' | 'done'>('empty');
  const [variants, setVariants] = useState<AdVariant[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const hookRef = useRef<HTMLTextAreaElement>(null);
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => setAssetsError('Could not load generated assets.'));
  }, []);

  // The create stage can emit the same clip for several winners; show it once.
  const uniqueAssets = [...new Map(assets.map((a) => [a.asset_url, a])).values()];

  /** Render clips from the winners discovery has already scored. */
  async function renderFromWinners() {
    setRendering(true);
    setAssetsError(null);
    try {
      await generateCreative('saas');
      setAssets(await getAssets());
    } catch {
      setAssetsError('Generation failed — run a discovery scan first.');
    } finally {
      setRendering(false);
    }
  }

  function generate() {
    setPhase('generating');
    // ponytail: mock latency instead of wiring the generation API; swap when /api/create exists
    window.setTimeout(() => {
      setVariants(buildVariants(brief));
      setPhase('done');
    }, 1100);
  }

  async function handleCopy(v: AdVariant) {
    try {
      await navigator.clipboard.writeText(
        `${v.hook}\n\n${v.body}\n\nCTA: ${v.cta}`,
      );
      setCopiedId(v.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-50">
            Creative studio
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Draft a brief, generate variants against it, then push the strongest
            scripts into review before any budget moves.
          </p>
        </div>
        <dl className="flex items-center gap-6 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
              in review
            </dt>
            <dd className="font-semibold tabular-nums text-foreground">
              6 scripts
            </dd>
          </div>
          <div className="h-8 w-px bg-white/8" aria-hidden="true" />
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
              avg hold 3s
            </dt>
            <dd className="flex items-baseline gap-1.5 font-semibold tabular-nums text-foreground">
              31.4%
              <Badge variant="up" shape="square">
                +2.1
              </Badge>
            </dd>
          </div>
          <div
            className="hidden h-8 w-px bg-white/8 sm:block"
            aria-hidden="true"
          />
          <div className="hidden sm:block">
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
              launched this week
            </dt>
            <dd className="font-semibold tabular-nums text-foreground">
              12 creatives
            </dd>
          </div>
        </dl>
      </header>

      {/* main split */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* brief column */}
        <Card>
          <CardHeader>
            <CardTitle>Script brief</CardTitle>
            <CardDescription>
              What the generator works from. Everything here stays editable
              until launch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FieldLabel>Hook</FieldLabel>
              <textarea
                ref={hookRef}
                rows={3}
                className={inputClasses}
                placeholder="One sharp opening line. Name the pain or the proof."
                value={brief.hook}
                onChange={(e) =>
                  setBrief((b) => ({ ...b, hook: e.target.value }))
                }
              />
            </div>
            <div>
              <FieldLabel>Body</FieldLabel>
              <textarea
                rows={4}
                className={inputClasses}
                placeholder="What the product does, in plain words."
                value={brief.body}
                onChange={(e) =>
                  setBrief((b) => ({ ...b, body: e.target.value }))
                }
              />
            </div>
            <div>
              <FieldLabel>Call to action</FieldLabel>
              <input
                type="text"
                className={cn(inputClasses, 'resize-none')}
                placeholder="e.g. Start free, no card needed"
                value={brief.cta}
                onChange={(e) =>
                  setBrief((b) => ({ ...b, cta: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3 pt-1">
              <FieldLabel>Format</FieldLabel>
              <SegmentedControl
                ariaLabel="Ad format"
                options={FORMATS}
                value={brief.format}
                onChange={(format) => setBrief((b) => ({ ...b, format }))}
              />
              <FieldLabel>Platform</FieldLabel>
              <SegmentedControl
                ariaLabel="Platform"
                options={PLATFORMS}
                value={brief.platform}
                onChange={(platform) => setBrief((b) => ({ ...b, platform }))}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="ghost" onClick={() => setBrief(DEFAULT_BRIEF)}>
              Reset
            </Button>
            <Button onClick={generate} disabled={phase === 'generating'}>
              <SparkIcon className="h-4 w-4" />
              {phase === 'generating' ? 'Generating…' : 'Generate variants'}
            </Button>
          </CardFooter>
        </Card>

        {/* variants column */}
        <section aria-label="Generated variants" className="min-w-0">
          {phase === 'empty' ? (
            <Card className="flex min-h-[420px] flex-col items-center justify-center px-8 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white/3 text-muted-foreground">
                <LayersIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
                No variants yet
              </h3>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Write or keep the starter brief on the left, then generate four
                scored drafts to compare side by side.
              </p>
              <Button
                className="mt-6"
                onClick={() => {
                  generate();
                  hookRef.current?.focus();
                }}
              >
                <SparkIcon className="h-4 w-4" />
                Generate from brief
              </Button>
            </Card>
          ) : phase === 'generating' ? (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <SparkIcon className="h-4 w-4 animate-pulse text-blue-400" />
                Drafting four variants from the brief…
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <VariantGridSkeleton />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Four drafts ready to review, ranked by predicted hold rate.
                </p>
                <Badge variant="up" shape="square">
                  best score {Math.max(...variants.map((v) => v.score))}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {variants.map((v) => (
                  <VariantCard
                    key={v.id}
                    variant={v}
                    onCopy={handleCopy}
                    copied={copiedId === v.id}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Clips rendered by the CREATE stage from scored competitor winners. */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Generated assets
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Clips the create stage rendered from your top discovered winners.
            </p>
          </div>
          <Button size="sm" onClick={renderFromWinners} disabled={rendering}>
            {rendering ? 'Generating…' : 'Generate from top winners'}
          </Button>
        </div>
        <div className="px-5 py-4">
          {assetsError ? (
            <p className="text-xs text-red-400">{assetsError}</p>
          ) : uniqueAssets.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No assets yet — scan the ad library, then generate from the
              winners.
            </p>
          ) : (
            <ul className="space-y-2">
              {uniqueAssets.slice(0, 20).map((a) => (
                <li
                  key={a.asset_url}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-white/3 px-3 py-2 text-xs"
                >
                  <span className="truncate font-mono text-zinc-300">
                    {a.asset_url}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {a.provider ?? '—'}
                    {a.duration_s ? ` · ${a.duration_s}s` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
