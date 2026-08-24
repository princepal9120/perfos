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
  apiPost,
  getAgents,
  registerAgent,
  setWorkspaceId,
  type AgentProvider,
  type ConnectedAgent,
} from "@/lib/api";

const PROVIDERS: { id: AgentProvider; label: string; dotClass: string }[] = [
  { id: "chatgpt", label: "ChatGPT", dotClass: "bg-emerald-500" },
  { id: "claude", label: "Claude", dotClass: "bg-orange-500" },
  { id: "opencode", label: "opencode", dotClass: "bg-violet-500" },
  { id: "openai", label: "OpenAI API", dotClass: "bg-sky-400" },
  { id: "anthropic", label: "Anthropic API", dotClass: "bg-rose-400" },
];

const inputCls =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function ProviderChip({ provider }: { provider: string }) {
  const meta = PROVIDERS.find((p) => p.id === provider);
  return (
    <span className="inline-flex items-center gap-2 font-medium">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${meta?.dotClass ?? "bg-muted-foreground"}`}
        aria-hidden="true"
      />
      {meta?.label ?? provider}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "connected" || status === "active"
      ? "success"
      : status === "paused"
        ? "warning"
        : status === "error"
          ? "destructive"
          : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

function fmtLastRun(value: string | null) {
  if (!value) return "never";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<ConnectedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AgentProvider>("chatgpt");
  const [name, setName] = useState("");
  const [config, setConfig] = useState("{}");
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
      const data = await getAgents();
      setAgents(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError("Could not load agents. Is the API running in mock mode?");
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
      setError("Agent name is required.");
      return;
    }
    let configJson: Record<string, unknown>;
    try {
      configJson = config.trim() ? JSON.parse(config) : {};
    } catch {
      setError("Config must be valid JSON.");
      return;
    }
    if (typeof configJson !== "object" || Array.isArray(configJson)) {
      setError("Config must be a JSON object.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await registerAgent({ provider, name: trimmed, config_json: configJson });
      setName("");
      setConfig("{}");
      await load();
    } catch {
      setError("Failed to register agent. Check that the backend is up.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDispatch(agent: ConnectedAgent) {
    setBusyId(agent.id);
    setError(null);
    try {
      await apiPost<ConnectedAgent>(`/api/agents/${agent.id}/dispatch`, {
        payload: {},
      });
      await load();
    } catch {
      setError(`Dispatch failed for ${agent.name}.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">AI agents</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage ChatGPT, Claude and opencode workers that execute performance
          marketing tasks on your behalf.
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

      <section aria-label="Register an agent" className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Connect an agent</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Register a worker by provider. Config JSON is optional.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="agent-provider" className="text-xs font-medium text-muted-foreground">
                  Provider
                </label>
                <select
                  id="agent-provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as AgentProvider)}
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
                <label htmlFor="agent-name" className="text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  id="agent-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="budget-watchdog"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="agent-config" className="text-xs font-medium text-muted-foreground">
                  Config (JSON)
                </label>
                <textarea
                  id="agent-config"
                  rows={4}
                  value={config}
                  onChange={(e) => setConfig(e.target.value)}
                  spellCheck={false}
                  className={`${inputCls} h-auto font-mono`}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Connecting…" : "Connect agent"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>

      <section aria-label="Connected agents" className="mt-8">
        <h3 className="text-sm font-semibold">Connected agents</h3>
        {loading ? (
          <div className="mt-3 space-y-2" aria-busy="true" aria-label="Loading agents">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No agents connected yet. Register your first ChatGPT / Claude /
            opencode worker above.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="px-4 py-3 font-medium">{a.name}</TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3">
                      <ProviderChip provider={a.provider} />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {fmtLastRun(a.last_run_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDispatch(a)}
                        disabled={busyId === a.id}
                      >
                        {busyId === a.id ? "Dispatching…" : "Dispatch"}
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
