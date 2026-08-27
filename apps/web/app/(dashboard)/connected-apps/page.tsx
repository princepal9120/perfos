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
  getIntegrations,
  type Integration,
  type IntegrationCategory,
  type IntegrationCreate,
  type IntegrationProvider,
  registerIntegration,
  setWorkspaceId,
  toggleIntegration,
} from '@/lib/api';

const PROVIDERS: { id: IntegrationProvider; label: string }[] = [
  { id: 'google_ads', label: 'Google Ads' },
  { id: 'meta_ads', label: 'Meta Ads' },
  { id: 'shopify', label: 'Shopify' },
  { id: 'stripe', label: 'Stripe' },
  { id: 'slack', label: 'Slack' },
  { id: 'linear', label: 'Linear' },
];

const CATEGORIES: { id: IntegrationCategory; label: string }[] = [
  { id: 'ads', label: 'Ads' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'crm', label: 'CRM' },
  { id: 'creative', label: 'Creative' },
];

const inputCls =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

const PROVIDER_DOT: Record<string, string> = {
  google_ads: 'bg-blue-500',
  meta_ads: 'bg-indigo-500',
  shopify: 'bg-green-500',
  stripe: 'bg-purple-500',
  slack: 'bg-amber-500',
  linear: 'bg-pink-500',
};

function ProviderChip({ provider }: { provider: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-medium">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${PROVIDER_DOT[provider] ?? 'bg-muted-foreground'}`}
        aria-hidden="true"
      />
      {provider.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}

function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs capitalize text-muted-foreground">
      {category}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'connected'
      ? 'success'
      : status === 'disabled'
        ? 'secondary'
        : status === 'error'
          ? 'destructive'
          : 'warning';
  return <Badge variant={variant}>{status}</Badge>;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<IntegrationProvider>('google_ads');
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
      setError('Could not load integrations. Is the API running in mock mode?');
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
        provider,
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
    <div>
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Integrations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect external tools (ad platforms, analytics, CRM) so PerfOS can
          pull spend and revenue data and act on it.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-destructive/40 bg-destructive/20 px-4 py-3 text-sm text-destructive-foreground"
        >
          {error}
        </div>
      )}

      <section aria-label="Register an integration" className="max-w-md">
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-sm">Connect an integration</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              API keys are stored per workspace. Status is mocked in demo mode.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="integration-name"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Name
                </label>
                <input
                  id="integration-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Google Ads main account"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="integration-provider"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Provider
                </label>
                <select
                  id="integration-provider"
                  value={provider}
                  onChange={(e) =>
                    setProvider(e.target.value as IntegrationProvider)
                  }
                  className={inputCls}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="integration-category"
                  className="text-xs font-medium text-muted-foreground"
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
              <div className="space-y-1.5">
                <label
                  htmlFor="integration-endpoint"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Endpoint
                </label>
                <input
                  id="integration-endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="integration-api-key"
                  className="text-xs font-medium text-muted-foreground"
                >
                  API key
                </label>
                <input
                  id="integration-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-live-…"
                  autoComplete="off"
                  className={inputCls}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Connecting…' : 'Connect integration'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>

      <section aria-label="Registered integrations" className="mt-8">
        <h3 className="text-sm font-semibold">Connected integrations</h3>
        {loading ? (
          <div
            className="mt-3 space-y-2"
            aria-busy="true"
            aria-label="Loading integrations"
          >
            {[0, 1].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : integrations.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No integrations connected yet. Register your first integration
            above.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Integration</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="px-4 py-3 font-medium">
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
                    <TableCell className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                      {i.endpoint ?? '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-right">
                      <Button
                        variant={i.enabled ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggle(i)}
                        disabled={busyId === i.id}
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
  );
}
