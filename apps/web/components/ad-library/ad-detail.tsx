'use client';

import * as React from 'react';
import { formatAdDate, TierBadge } from '@/components/ad-library/ad-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AdLibraryItem } from '@/lib/api';

export interface AdDetailProps {
  ad: AdLibraryItem | null;
  onClose: () => void;
  onToggleSave: (ad: AdLibraryItem) => void;
  onClone?: (ad: AdLibraryItem) => void;
}

const VIDEO_PATTERN = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function DetailMedia({
  url,
  advertiser,
}: {
  url: string | null;
  advertiser: string;
}) {
  const [failed, setFailed] = React.useState(false);

  if (!url || failed) {
    return (
      <div className="flex h-56 w-full items-center justify-center rounded-lg border border-border bg-white/2">
        <span className="text-3xl font-semibold uppercase text-muted-foreground">
          {advertiser.charAt(0) || '?'}
        </span>
      </div>
    );
  }

  if (VIDEO_PATTERN.test(url)) {
    return (
      <video
        src={url}
        controls
        muted
        playsInline
        preload="metadata"
        aria-label={`Video creative from ${advertiser}`}
        onError={() => setFailed(true)}
        className="max-h-72 w-full rounded-lg border border-border bg-black object-contain"
      />
    );
  }

  return (
    // Remote creative URLs come from ad libraries on unknown hosts, so next/image is not usable.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`Creative from ${advertiser}`}
      onError={() => setFailed(true)}
      className="max-h-72 w-full rounded-lg border border-border bg-white/2 object-contain"
    />
  );
}

/** Meta serves the advertiser's raw ad setup, so landing_url is usually a tracking
 *  redirector and may be unparseable (no scheme, protocol-relative, macro in the host).
 *  The href always stays the untouched URL — only this display label is derived. */
function destinationLabel(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname ? hostname.replace(/^www\./, '') : url;
  } catch {
    return url;
  }
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-xs font-medium tabular-nums text-foreground dark:text-white">
        {value}
      </span>
    </div>
  );
}

export function AdDetail({
  ad,
  onClose,
  onToggleSave,
  onClone,
}: AdDetailProps) {
  const [copied, setCopied] = React.useState(false);

  // Reset the copy confirmation when a different ad is opened in the same panel.
  React.useEffect(() => {
    setCopied(false);
  }, [ad?.ad_id]);

  if (!ad) return null;

  const body = ad.body ?? '';

  async function copyBody() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground dark:text-white">
              {ad.advertiser || 'Unknown advertiser'}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" shape="square">
                {ad.platform || 'meta'}
              </Badge>
              <TierBadge tier={typeof ad.tier === 'string' ? ad.tier : null} />
              {ad.score !== null && (
                <span className="text-[11px] font-semibold tabular-nums text-foreground dark:text-white">
                  {Math.round(ad.score)}
                  <span className="font-normal text-muted-foreground">
                    /100
                  </span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ad detail"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <DetailMedia url={ad.creative_url} advertiser={ad.advertiser} />

        {ad.title && (
          <p className="text-sm font-medium leading-snug text-foreground dark:text-white">
            {ad.title}
          </p>
        )}

        {body && (
          <div className="rounded-lg border border-border bg-white/2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Body copy
              </span>
              <button
                type="button"
                onClick={copyBody}
                className="text-[10px] font-medium text-blue-400 transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
              {body}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetaRow
            label="Runtime"
            value={`${Math.max(0, Math.round(ad.runtime_days))}d`}
          />
          <MetaRow label="Variants" value={ad.variant_count ?? 0} />
          <MetaRow label="First seen" value={formatAdDate(ad.first_seen_at)} />
          <MetaRow label="Last seen" value={formatAdDate(ad.last_seen_at)} />
        </div>

        {(ad.cta || ad.landing_url) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {ad.cta && (
              <Badge variant="secondary" shape="square">
                {ad.cta}
              </Badge>
            )}
            {ad.landing_url && (
              <a
                href={ad.landing_url}
                target="_blank"
                rel="noopener noreferrer"
                title={ad.landing_url}
                className="max-w-full truncate text-[11px] text-blue-400 underline-offset-2 hover:underline"
              >
                {destinationLabel(ad.landing_url)}
              </a>
            )}
          </div>
        )}

        {ad.boards.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Boards
            </span>
            {ad.boards.map((board) => (
              <Badge key={board} variant="outline" shape="pill">
                {board}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Button
            variant={ad.saved ? 'secondary' : 'default'}
            size="sm"
            onClick={() => onToggleSave(ad)}
            aria-pressed={ad.saved}
          >
            {ad.saved ? 'Saved' : 'Save'}
          </Button>
          {onClone && (
            <Button variant="outline" size="sm" onClick={() => onClone(ad)}>
              Clone
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AdDetail;
