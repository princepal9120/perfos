/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MetaLogo,
  GoogleLogo,
  LinkedInLogo,
  XLogo,
  TikTokLogo,
  RedditLogo,
} from '@/components/marketing/icons';
import {
  type AdAccount,
  connectAccount,
  getAccounts,
  type Platform,
} from '@/lib/api';

type Connector = {
  id: Platform;
  name: string;
  Logo: (props: { className?: string }) => React.JSX.Element;
  description: string;
};

const CONNECTORS: Connector[] = [
  {
    id: 'meta',
    name: 'Meta Ads',
    Logo: MetaLogo,
    description:
      'Facebook & Instagram campaigns — spend, CTR, and claimed conversions.',
  },
  {
    id: 'google',
    name: 'Google Ads',
    Logo: GoogleLogo,
    description:
      'Search, Shopping, YouTube and Performance Max conversions.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    Logo: LinkedInLogo,
    description: 'B2B sponsored content, lead gen forms, and audience reach.',
  },
  {
    id: 'twitter',
    name: 'X (Twitter) Ads',
    Logo: XLogo,
    description: 'Timeline takeovers, keyword targeting, and engagement campaigns.',
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    Logo: TikTokLogo,
    description: 'Short-form video Spark ads and conversion tracking.',
  },
  {
    id: 'reddit',
    name: 'Reddit Ads',
    Logo: RedditLogo,
    description: 'Subreddit placement targeting, conversation ads, and CPC reach.',
  },
];

function StatusBadge({ status }: { status: AdAccount['status'] }) {
  const active = status === 'active' || status === 'connected';
  return (
    <Badge variant={active ? 'success' : 'warning'} className="gap-1.5 font-mono text-[10px]">
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-amber-400'}`}
        aria-hidden="true"
      />
      {status}
    </Badge>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<Platform | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAccounts()
      .then((rows) => {
        if (!cancelled) setAccounts(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled)
          setError('Could not load accounts. Check that the API is running.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = useCallback(
    async (platform: Platform, label: string) => {
      setConnecting(platform);
      setError(null);
      try {
        const created = await connectAccount({ platform });
        setAccounts((prev) => [...prev, created]);
      } catch {
        setError(
          `Could not connect ${label}. Make sure the API is up and try again.`,
        );
      } finally {
        setConnecting(null);
      }
    },
    [],
  );

  const countByPlatform = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.platform] = (acc[a.platform] ?? 0) + 1;
    return acc;
  }, {});

  const firstOpen = CONNECTORS.find((c) => !countByPlatform[c.id]);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-8">
      {/* header */}
      <div className="mb-8">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Connected Ad Accounts
        </h1>
        <p className="mt-1 max-w-prose text-xs text-muted-foreground">
          Connect your official ad network accounts to synchronize spend, CTR, and claimed conversions. PerfOS reconciles these claims against actual Shopify store orders before any budget shift.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300"
        >
          {error}
        </div>
      )}

      {/* connector grid */}
      <section aria-label="Available platforms">
        <h2 className="mb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Supported Platforms (6)
        </h2>
        {loading ? (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Loading platforms"
          >
            {CONNECTORS.map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="mt-4 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
                <Skeleton className="mt-5 h-9 w-full rounded-lg" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONNECTORS.map((c) => {
              const count = countByPlatform[c.id] ?? 0;
              const connected = count > 0;
              const busy = connecting === c.id;
              return (
                <Card
                  key={c.id}
                  className="flex flex-col bg-surface border-border transition-colors hover:border-primary/40"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary"
                        >
                          <c.Logo className="w-4 h-4 text-primary" />
                        </span>
                        <CardTitle className="text-sm font-semibold">{c.name}</CardTitle>
                      </div>
                      {connected && (
                        <Badge variant="success" shape="square" className="text-[9px] font-mono uppercase">
                          connected
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs leading-relaxed mt-2">
                      {c.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-2 border-t border-border">
                    {connected ? (
                      <p className="w-full text-xs text-muted-foreground font-mono">
                        <span className="font-medium text-foreground">
                          {count}
                        </span>{' '}
                        {count === 1 ? 'account' : 'accounts'} syncing
                      </p>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(c.id, c.name)}
                        disabled={connecting !== null}
                        className="btn-daisy-solid w-full text-xs"
                      >
                        {busy ? 'Connecting…' : `Connect ${c.name}`}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* connected accounts table */}
      <section aria-label="Connected accounts" className="mt-10">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Active Connected Accounts
          </h2>
          {!loading && (
            <span className="text-xs font-mono text-primary">
              ({accounts.length})
            </span>
          )}
        </div>

        {loading ? (
          <div
            className="space-y-2"
            aria-busy="true"
            aria-label="Loading accounts"
          >
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center">
            <span className="font-mono text-sm text-muted-foreground block mb-2">⌘</span>
            <p className="text-xs text-muted-foreground">
              No accounts connected yet. Connect Google, Meta, LinkedIn, X, TikTok, or Reddit above.
            </p>
            {firstOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect(firstOpen.id, firstOpen.name)}
                disabled={connecting !== null}
                className="mt-4 text-xs"
              >
                {connecting === firstOpen.id
                  ? 'Connecting…'
                  : `Connect ${firstOpen.name}`}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connected Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const meta = CONNECTORS.find(
                    (c) => c.id === account.platform,
                  );
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-foreground font-medium flex items-center gap-2">
                        {meta ? <meta.Logo className="w-3.5 h-3.5 text-primary" /> : null}
                        <span>{meta?.name ?? account.platform}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-foreground text-xs">
                        {account.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                        {account.platform_account_id ?? '—'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={account.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-xs font-mono text-muted-foreground">
                        {formatDate(account.connected_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
