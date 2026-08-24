"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace configuration for this PerfOS demo.
        </p>
      </div>

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
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-muted-foreground">Connected channels</span>
            <span className="font-medium">Google &middot; Meta &middot; Shopify</span>
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
