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
  getMcpServers,
  type MCPServer,
  type MCPServerCreate,
  registerMcpServer,
  setWorkspaceId,
  toggleMcpServer,
} from '@/lib/api';

const TRANSPORTS: { id: MCPServerCreate['transport']; label: string }[] = [
  { id: 'http', label: 'HTTP' },
  { id: 'sse', label: 'SSE' },
  { id: 'stdio', label: 'Stdio' },
];

const PRESET_MCP_SERVERS = [
  { name: 'google-ads-mcp', label: 'Google Ads MCP', transport: 'stdio' as const, endpoint: 'npx -y @perfos/google-ads-mcp', Logo: GoogleLogo },
  { name: 'meta-ads-mcp', label: 'Meta Ads MCP', transport: 'stdio' as const, endpoint: 'npx -y @perfos/meta-ads-mcp', Logo: MetaLogo },
  { name: 'linkedin-ads-mcp', label: 'LinkedIn Ads MCP', transport: 'stdio' as const, endpoint: 'npx -y @perfos/linkedin-ads-mcp', Logo: LinkedInLogo },
  { name: 'x-ads-mcp', label: 'X (Twitter) Ads MCP', transport: 'stdio' as const, endpoint: 'npx -y @perfos/x-ads-mcp', Logo: XLogo },
  { name: 'tiktok-ads-mcp', label: 'TikTok Ads MCP', transport: 'stdio' as const, endpoint: 'npx -y @perfos/tiktok-ads-mcp', Logo: TikTokLogo },
  { name: 'reddit-ads-mcp', label: 'Reddit Ads MCP', transport: 'stdio' as const, endpoint: 'npx -y @perfos/reddit-ads-mcp', Logo: RedditLogo },
];

const inputCls =
  'flex h-9 w-full rounded-md border border-border bg-card px-3 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground';

function TransportChip({ transport }: { transport: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-medium text-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      {transport.toUpperCase()}
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

export default function McpPage() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [transport, setTransport] = useState<MCPServerCreate['transport']>('http');
  const [endpoint, setEndpoint] = useState('');
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
      const data = await getMcpServers();
      setServers(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError('Could not load MCP servers. Check that the API is running.');
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
      setError('Server name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await registerMcpServer({
        name: trimmed,
        transport,
        endpoint: endpoint.trim() || null,
      });
      setName('');
      setEndpoint('');
      await load();
    } catch {
      setError('Failed to register MCP server. Check that the backend is up.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(s: MCPServer) {
    setBusyId(s.id);
    setError(null);
    try {
      await toggleMcpServer(s.id);
      await load();
    } catch {
      setError(`Toggle failed for ${s.name}.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Model Context Protocol (MCP) Servers
        </h1>
        <p className="mt-1 text-xs text-muted-foreground max-w-prose">
          Connect Model Context Protocol servers so Claude Code, Cursor, and ChatGPT agents can call official ad tools (Google, Meta, LinkedIn, X, TikTok, Reddit) directly from your coding IDE or terminal.
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

      {/* Preset Platform MCP Connectors */}
      <section aria-label="Preset MCP Connectors">
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Native Ad Platform MCP Servers (Google, Meta, LinkedIn, X, TikTok, Reddit)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_MCP_SERVERS.map((preset) => (
            <Card key={preset.name} className="bg-surface border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <preset.Logo className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">{preset.label}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{preset.transport} transport</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono uppercase">
                  READY
                </Badge>
              </div>
              <div className="p-2 rounded bg-card border border-border">
                <code className="text-[10px] font-mono text-primary break-all block">
                  {preset.endpoint}
                </code>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Custom Server Registration */}
      <div className="grid gap-8 lg:grid-cols-12 pt-4">
        <section aria-label="Register an MCP server" className="lg:col-span-4">
          <Card className="bg-surface border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Register Custom MCP Server</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Connect HTTP, SSE, or Stdio endpoints for custom internal marketing tools.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label
                    htmlFor="mcp-name"
                    className="text-[11px] font-medium text-muted-foreground"
                  >
                    Server Name
                  </label>
                  <input
                    id="mcp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. custom-ads-mcp"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="mcp-transport"
                    className="text-[11px] font-medium text-muted-foreground"
                  >
                    Transport
                  </label>
                  <select
                    id="mcp-transport"
                    value={transport}
                    onChange={(e) =>
                      setTransport(e.target.value as MCPServerCreate['transport'])
                    }
                    className={inputCls}
                  >
                    {TRANSPORTS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="mcp-endpoint"
                    className="text-[11px] font-medium text-muted-foreground"
                  >
                    Endpoint (URL or Stdio command)
                  </label>
                  <input
                    id="mcp-endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://mcp.example.com/sse"
                    className={inputCls}
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border">
                <Button type="submit" disabled={saving} className="btn-daisy-solid w-full text-xs">
                  {saving ? 'Connecting…' : 'Register MCP Server'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </section>

        {/* Registered Servers Table */}
        <section aria-label="Registered MCP servers" className="lg:col-span-8 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Active MCP Server Instances
          </h2>
          {loading ? (
            <div
              className="space-y-2"
              aria-busy="true"
              aria-label="Loading MCP servers"
            >
              {[0, 1].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-surface border border-border" />
              ))}
            </div>
          ) : servers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-xs text-muted-foreground">
              No custom MCP servers registered yet. Connect your first custom endpoint on the left.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="px-4 py-3 font-medium text-foreground text-xs">
                        {s.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3">
                        <TransportChip transport={s.transport} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate px-4 py-3 text-muted-foreground font-mono text-xs">
                        {s.endpoint ?? 'n/a'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-3 text-right">
                        <Button
                          variant={s.enabled ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleToggle(s)}
                          disabled={busyId === s.id}
                          className="text-xs h-7"
                        >
                          {busyId === s.id
                            ? '…'
                            : s.enabled
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
