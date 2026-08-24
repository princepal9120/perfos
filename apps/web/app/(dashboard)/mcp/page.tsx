"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getMcpServers,
  registerMcpServer,
  setWorkspaceId,
  toggleMcpServer,
  type MCPServer,
  type MCPServerCreate,
} from "@/lib/api";

const TRANSPORTS: { id: MCPServerCreate["transport"]; label: string }[] = [
  { id: "http", label: "HTTP" },
  { id: "sse", label: "SSE" },
  { id: "stdio", label: "Stdio" },
];

const inputCls =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function TransportChip({ transport }: { transport: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-medium">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          transport === "http"
            ? "bg-primary"
            : transport === "sse"
              ? "bg-amber-500"
              : "bg-violet-500"
        }`}
        aria-hidden="true"
      />
      {transport.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "connected"
      ? "success"
      : status === "disabled"
        ? "secondary"
        : status === "error"
          ? "destructive"
          : "warning";
  return <Badge variant={variant}>{status}</Badge>;
}

export default function McpPage() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [transport, setTransport] = useState<MCPServerCreate["transport"]>("http");
  const [endpoint, setEndpoint] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("perfos_workspace_id");
      setWorkspaceId(stored ? Number(stored) || 1 : 1);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await getMcpServers();
      setServers(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError("Could not load MCP servers. Is the API running in mock mode?");
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
      setError("Server name is required.");
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
      setName("");
      setEndpoint("");
      await load();
    } catch {
      setError("Failed to register MCP server. Check that the backend is up.");
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
    <div>
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">MCP servers</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect Model Context Protocol servers so your agents can call external
          tools (analytics, ad platforms, databases) during performance work.
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

      <section aria-label="Register an MCP server" className="max-w-md">
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-sm">Connect an MCP server</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              HTTP / SSE / Stdio transports. Status is mocked in demo mode.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="mcp-name"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Name
                </label>
                <input
                  id="mcp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ads-analytics-mcp"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="mcp-transport"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Transport
                </label>
                <select
                  id="mcp-transport"
                  value={transport}
                  onChange={(e) =>
                    setTransport(e.target.value as MCPServerCreate["transport"])
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
              <div className="space-y-1.5">
                <label
                  htmlFor="mcp-endpoint"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Endpoint (URL or command)
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
            <CardFooter>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Connecting…" : "Connect server"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>

      <section aria-label="Registered MCP servers" className="mt-8">
        <h3 className="text-sm font-semibold">Registered servers</h3>
        {loading ? (
          <div
            className="mt-3 space-y-2"
            aria-busy="true"
            aria-label="Loading MCP servers"
          >
            {[0, 1].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : servers.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No MCP servers connected yet. Register your first server above.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
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
                    <TableCell className="px-4 py-3 font-medium">{s.name}</TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3">
                      <TransportChip transport={s.transport} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                      {s.endpoint ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-right">
                      <Button
                        variant={s.enabled ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggle(s)}
                        disabled={busyId === s.id}
                      >
                        {busyId === s.id
                          ? "…"
                          : s.enabled
                            ? "Disable"
                            : "Enable"}
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
