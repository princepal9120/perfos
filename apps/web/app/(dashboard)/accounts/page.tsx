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
  type AdAccount,
  connectAccount,
  getAccounts,
  type Platform,
} from '@/lib/api';

type Connector = {
  id: Platform;
  name: string;
  monogram: string;
  description: string;
};

const CONNECTORS: Connector[] = [
  {
    id: 'meta',
    name: 'Meta ads',
    monogram: 'M',
    description:
      'Facebook and Instagram campaigns — spend and claimed conversions.',
  },
  {
    id: 'google',
    name: 'Google ads',
    monogram: 'G',
    description:
      'Search, Shopping and Performance Max, with claimed conversions.',
  },
  {
    id: 'tiktok',
    name: 'TikTok ads',
    monogram: 'T',
    description: 'Short-form video campaigns and claimed conversions.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn ads',
    monogram: 'in',
    description: 'B2B campaigns, lead gen forms and audience reach.',
  },
  {
    id: 'twitter',
    name: 'X ads',
    monogram: 'X',
    description: 'Timeline takeovers and engagement-driven campaigns.',
  },
];

function StatusBadge({ status }: { status: AdAccount['status'] }) {
  const active = status === 'active';
  return (
    <Badge variant={active ? 'success' : 'warning'} className="gap-1.5">
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-warning'}`}
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
    <div className="mx-auto w-full max-w-[1280px] px-6 py-8">
      {/* header */}
      <div className="mb-8">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Accounts
        </h1>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Connect an ad platform to pull campaign spend and claimed conversions.
          PerfOS reconciles those claims against actual revenue before any
          budget moves.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {/* connector grid */}
      <section aria-label="Available platforms">
        <h2 className="mb-3 text-sm font-medium tracking-tight text-muted-foreground">
          Platforms
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
                  className="flex flex-col transition-colors duration-fast ease-out hover:border-border-hover"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated font-display text-sm font-semibold text-foreground"
                        >
                          {c.monogram}
                        </span>
                        <CardTitle>{c.name}</CardTitle>
                      </div>
                      {connected && (
                        <Badge variant="success" shape="square">
                          connected
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      {c.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto">
                    {connected ? (
                      <p className="w-full text-xs text-muted-foreground">
                        <span className="font-medium tabular-nums text-muted-foreground">
                          {count}
                        </span>{' '}
                        {count === 1 ? 'account' : 'accounts'} syncing
                      </p>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(c.id, c.name)}
                        disabled={connecting !== null}
                        className="w-full"
                      >
                        {busy ? 'Connecting…' : 'Connect'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* connected accounts */}
      <section aria-label="Connected accounts" className="mt-10">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-medium tracking-tight text-foreground">
            Connected accounts
          </h2>
          {!loading && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {accounts.length}
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
          <div className="rounded-lg border border-dashed border-border-subtle bg-bg-surface/50 px-6 py-10 text-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto h-8 w-8 text-zinc-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008V17.25Z"
              />
            </svg>
            <p className="mt-3 text-sm text-muted-foreground">
              No accounts yet. Connect a platform above to pull its campaigns
              into PerfOS.
            </p>
            {firstOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect(firstOpen.id, firstOpen.name)}
                disabled={connecting !== null}
                className="mt-4"
              >
                {connecting === firstOpen.id
                  ? 'Connecting…'
                  : `Connect ${firstOpen.name}`}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const meta = CONNECTORS.find(
                    (c) => c.id === account.platform,
                  );
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-foreground">
                        {meta?.name ?? account.platform}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-foreground">
                        {account.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                        {account.platform_account_id ?? '—'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={account.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-muted-foreground">
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
