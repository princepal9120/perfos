/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · theme: daisy-black · macrostructure: Workbench */
'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  GoogleLogo,
  MetaLogo,
  LinkedInLogo,
  XLogo,
  TikTokLogo,
  RedditLogo,
} from '@/components/marketing/icons';
import {
  getIntegrations,
  type Integration,
  type IntegrationCategory,
  type IntegrationCreate,
  type IntegrationProvider,
  registerIntegration,
  setWorkspaceId,
  toggleIntegration,
} from '@/lib/api';

const PROVIDERS: {
  id: string;
  label: string;
  Logo: (props: { className?: string }) => React.JSX.Element;
}[] = [
  { id: 'google_ads', label: 'Google Ads', Logo: GoogleLogo },
  { id: 'meta_ads', label: 'Meta Ads', Logo: MetaLogo },
  { id: 'linkedin', label: 'LinkedIn Ads', Logo: LinkedInLogo },
  { id: 'twitter', label: 'X (Twitter) Ads', Logo: XLogo },
  { id: 'tiktok', label: 'TikTok Ads', Logo: TikTokLogo },
  { id: 'reddit', label: 'Reddit Ads', Logo: RedditLogo },
];

const CATEGORIES: { id: IntegrationCategory; label: string }[] = [
  { id: 'ads', label: 'Ads' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'crm', label: 'CRM' },
  { id: 'creative', label: 'Creative' },
];

const inputCls =
  'flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground';

function ProviderChip({ provider }: { provider: string }) {
  const p = PROVIDERS.find((item) => item.id === provider || item.label.toLowerCase().includes(provider.toLowerCase()));
  return (
    <span className="inline-flex items-center gap-2 font-medium text-xs text-foreground">
      {p ? <p.Logo className="w-3.5 h-3.5 text-primary" /> : null}
      <span>{p?.label ?? provider.replace(/_/g, ' ').toUpperCase()}</span>
    </span>
  );
}

function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-mono capitalize text-muted-foreground">
      {category}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'connected' || status === 'active';
  return (
    <Badge variant={active ? 'success' : 'secondary'} className="font-mono text-[9px] uppercase">
      {status}
    </Badge>
  );
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<string>('google_ads');
  const [category, setCategory] = useState<IntegrationCategory>('ads');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('perfos_workspace_id');
      setWorkspaceId(stored ? Number(stored) || 1 : 1);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await getIntegrations();
      setIntegrations(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError('Could not load integrations. Check that the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Integration name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await registerIntegration({
        name: trimmed,
        provider: provider as IntegrationProvider,
        category,
        endpoint: endpoint.trim() || null,
        api_key: apiKey.trim() || null,
      });
      setName('');
      setEndpoint('');
      setApiKey('');
      await load();
    } catch {
      setError('Failed to register integration. Check that the backend is up.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(i: Integration) {
    setBusyId(i.id);
    setError(null);
    try {
      await toggleIntegration(i.id);
      await load();
    } catch {
      setError(`Toggle failed for ${i.name}.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Platform Integrations
        </h1>
        <p className="mt-1 text-xs text-muted-foreground max-w-prose">
          Connect your 6 primary performance ad channels (Google, Meta, LinkedIn, X, TikTok, Reddit) so PerfOS can orchestrate campaigns and reconcile revenue deterministically.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300"
        >
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Registration Form */}
        <section aria-label="Register an integration" className="lg:col-span-4">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Connect an Ad Channel</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Add API credentials for Google, Meta, LinkedIn, X, TikTok, or Reddit.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label
                    htmlFor="integration-name"
                    className="text-[11px] font-medium text-muted-foreground"
                  >
                    Account / Channel Name
                  </label>
                  <input
                    id="integration-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Google Ads Primary Account"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="integration-provider"
                    className="text-[11px] font-medium text-muted-foreground"
                  >
                    Ad Platform
                  </label>
                  <select
                    id="integration-provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className={inputCls}
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="integration-category"
                    className="text-[11px] font-medium text-muted-foreground"
                  >
                    Category
                  </label>
                  <select
                    id="integration-category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as IntegrationCategory)
                    }
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="integration-endpoint"
                    className="text-[11px] font-medium text-muted-foreground"
                  >
                    API Endpoint / Account ID
                  </label>
                  <input
                    id="integration-endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="act_102938471"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="integration-api-key"
                    className="text-[11px] font-medium text-muted-foreground"
                  >
                    Access Token / API Key
                  </label>
                  <input
                    id="integration-api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="EAAK…"
                    autoComplete="off"
                    className={inputCls}
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border">
                <Button type="submit" disabled={saving} className="btn-daisy-solid w-full text-xs">
                  {saving ? 'Connecting…' : 'Save Connection'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </section>

        {/* Registered Integrations List */}
        <section aria-label="Registered integrations" className="lg:col-span-8 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Connected Platform Status
          </h2>
          {loading ? (
            <div
              className="space-y-2"
              aria-busy="true"
              aria-label="Loading integrations"
            >
              {[0, 1].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-surface border border-border" />
              ))}
            </div>
          ) : integrations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-xs text-muted-foreground">
              No integrations configured yet. Use the form on the left to connect Google, Meta, LinkedIn, X, TikTok, or Reddit.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Account ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="px-4 py-3 font-medium text-foreground text-xs">
                        {i.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        <ProviderChip provider={i.provider} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        <CategoryChip category={i.category} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={i.status} />
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate px-4 py-3 text-muted-foreground font-mono text-xs">
                        {i.endpoint ?? '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-right">
                        <Button
                          variant={i.enabled ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleToggle(i)}
                          disabled={busyId === i.id}
                          className="text-xs h-7"
                        >
                          {busyId === i.id
                            ? '…'
                            : i.enabled
                              ? 'Disable'
                              : 'Enable'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
