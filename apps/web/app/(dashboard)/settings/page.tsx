"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAccounts, type AdAccount } from "@/lib/api";

const PLATFORM_LABELS: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  shopify: "Shopify",
  tiktok: "TikTok Ads",
  linkedin: "LinkedIn Ads",
  pinterest: "Pinterest Ads",
  snapchat: "Snapchat Ads",
  amazon: "Amazon Ads",
  reddit: "Reddit Ads",
  twitter: "X Ads",
  youtube: "YouTube Ads",
  amazon_ads: "Amazon Ads",
  x_ads: "X Ads",
};

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = await getAccounts();
      setAccounts(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch {
      setError("Could not load workspace accounts. Check that the backend is up.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const connected = accounts.filter((a) => a.status === "connected");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace configuration for this PerfOS demo.
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

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-sm">Workspace</CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            Demo DTC Brand &middot; USD &middot; Mock mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-muted-foreground">Mode</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Mock data
            </span>
          </div>
          <div className="flex items-start justify-between border-b border-border/60 pb-3">
            <span className="text-muted-foreground">Connected channels</span>
            <span className="flex max-w-[60%] flex-wrap justify-end gap-1.5">
              {loading ? (
                <span className="text-muted-foreground">Loading…</span>
              ) : connected.length === 0 ? (
                <span className="font-medium">None</span>
              ) : (
                connected.map((a) => (
                  <Badge key={a.id} variant="outline" className="text-[11px]">
                    {PLATFORM_LABELS[a.platform] ?? a.platform}
                  </Badge>
                ))
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API access</span>
            <span className="font-medium">Workspace token</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
