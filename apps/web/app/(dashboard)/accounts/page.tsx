"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { connectAccount, getAccounts, type AdAccount } from "@/lib/api";

type PlatformMeta = {
  id:
    | "google"
    | "meta"
    | "shopify"
    | "tiktok"
    | "linkedin"
    | "pinterest"
    | "snapchat"
    | "amazon"
    | "reddit"
    | "twitter"
    | "youtube"
    | "amazon_ads"
    | "x_ads";
  name: string;
  description: string;
  dotClass: string;
};

const PLATFORMS: PlatformMeta[] = [
  {
    id: "google",
    name: "Google Ads",
    description: "Campaigns, spend and claimed conversions.",
    dotClass: "bg-blue-500",
  },
  {
    id: "meta",
    name: "Meta Ads",
    description: "Facebook & Instagram performance claims.",
    dotClass: "bg-sky-500",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Actual revenue. The source of truth.",
    dotClass: "bg-emerald-600",
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    description: "Short-form video performance claims.",
    dotClass: "bg-[#ff2d55]",
  },
  {
    id: "linkedin",
    name: "LinkedIn Ads",
    description: "B2B campaigns and lead gen claims.",
    dotClass: "bg-[#0a66c2]",
  },
  {
    id: "pinterest",
    name: "Pinterest Ads",
    description: "Visual discovery campaign claims.",
    dotClass: "bg-[#e60023]",
  },
  {
    id: "snapchat",
    name: "Snapchat Ads",
    description: "Vertical video reach and swipes.",
    dotClass: "bg-[#f7b500]",
  },
  {
    id: "amazon",
    name: "Amazon Ads",
    description: "Retail media spend and claimed sales.",
    dotClass: "bg-[#ff9900]",
  },
  {
    id: "reddit",
    name: "Reddit Ads",
    description: "Community placements and clicks.",
    dotClass: "bg-[#ff4500]",
  },
  {
    id: "twitter",
    name: "Twitter Ads",
    description: "Timeline campaigns and engagement.",
    dotClass: "bg-[#1d9bf0]",
  },
  {
    id: "youtube",
    name: "YouTube Ads",
    description: "Video views and claimed conversions.",
    dotClass: "bg-[#ff0000]",
  },
  {
    id: "amazon_ads",
    name: "Amazon DSP",
    description: "Programmatic retail media buys.",
    dotClass: "bg-[#ff9900]",
  },
  {
    id: "x_ads",
    name: "X Ads",
    description: "Real-time campaigns on X.",
    dotClass: "bg-[#1d9bf0]",
  },
];

function StatusBadge({ status }: { status: AdAccount["status"] }) {
  return (
    <Badge variant={status === "active" ? "success" : "warning"} className="gap-1.5">
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-success" : "bg-warning"}`}
        aria-hidden="true"
      />
      {status}
    </Badge>
  );
}

function PlatformChip({ platform }: { platform: PlatformMeta["id"] }) {
  const meta = PLATFORMS.find((p) => p.id === platform);
  return (
    <span className="inline-flex items-center gap-2 font-medium text-foreground">
      <span className={`h-2 w-2 shrink-0 rounded-full ${meta?.dotClass ?? "bg-muted-foreground"}`} aria-hidden="true" />
      {meta?.name ?? platform}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<PlatformMeta["id"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAccounts()
      .then((rows) => {
        if (!cancelled) setAccounts(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load accounts. Is the API running in mock mode?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = useCallback(async (platform: PlatformMeta["id"]) => {
    setConnecting(platform);
    setError(null);
    try {
      const created = await connectAccount({ platform });
      setAccounts((prev) => [...prev, created]);
    } catch {
      setError(`Failed to connect ${platform}. Check that the backend is up.`);
    } finally {
      setConnecting(null);
    }
  }, []);

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Connected accounts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Google and Meta report claimed conversions. Shopify holds actual revenue. Mock
          connectors seed demo data instantly.
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

      <section aria-label="Available platforms" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const connected = connectedPlatforms.has(platform.id);
          const isConnecting = connecting === platform.id;
          return (
            <Card key={platform.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${platform.dotClass}`} aria-hidden="true" />
                  <CardTitle className="text-sm">{platform.name}</CardTitle>
                </div>
                <CardDescription className="text-xs leading-relaxed">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                {connected ? (
                  <Button variant="outline" disabled className="w-full">
                    Connected
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => handleConnect(platform.id)}
                    disabled={connecting !== null || loading}
                    className="w-full"
                  >
                    {isConnecting ? "Connecting…" : "Connect"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </section>

      <section aria-label="Connected accounts list" className="mt-8">
        <h3 className="text-sm font-semibold">Accounts</h3>
        {loading ? (
          <div className="mt-3 space-y-2" aria-busy="true" aria-label="Loading accounts">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No accounts connected yet. Connect a platform above to pull mock data.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="whitespace-nowrap px-4 py-3">
                      <PlatformChip platform={account.platform} />
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">{account.name}</TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {account.platform_account_id}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge status={account.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(account.connected_at)}
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
