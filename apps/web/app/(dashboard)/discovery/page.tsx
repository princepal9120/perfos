"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiPost } from "@/lib/api";

/** Loose winner shape so any backend response renders. */
interface Winner {
  id?: string | number;
  platform: string;
  advertiser?: string;
  body?: string | null;
  score?: number | null;
  tier?: string | null;
}

type DiscoveryResponse = Winner[] | { winners?: Winner[] };

/** Shown until /api/discovery responds, so the mock UI works standalone. */
const MOCK_WINNERS: Winner[] = [
  {
    platform: "tiktok",
    advertiser: "Gymshark",
    body: "POV: you finally found leggings that survive leg day.",
    score: 92,
    tier: "high_conf",
  },
  {
    platform: "meta",
    advertiser: "Athletic Greens",
    body: "75 ingredients. One scoop. Zero excuses.",
    score: 87,
    tier: "winner",
  },
];

function extractWinners(data: DiscoveryResponse): Winner[] {
  return Array.isArray(data) ? data : (data.winners ?? []);
}

export default function DiscoveryPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const runDiscovery = async () => {
    setLoading(true);
    try {
      const data = await apiPost<DiscoveryResponse>("/discovery", {});
      setWinners(extractWinners(data));
      setRan(true);
    } catch {
      // Mock-safe: backend not reachable yet, fall back to demo winners.
      setWinners(MOCK_WINNERS);
      setRan(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Discovery</h2>
          <p className="text-sm text-muted-foreground">
            Scan ad libraries and surface proven winners to clone.
          </p>
        </div>
        <Button onClick={runDiscovery} disabled={loading}>
          {loading ? "Running..." : "Run Discovery"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Winners</CardTitle>
          <CardDescription>
            Top-scoring ads from the last discovery run, ready for Studio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!ran ? (
            <p className="py-4 text-sm text-muted-foreground">
              Hit “Run Discovery” to scan public ad libraries.
            </p>
          ) : winners.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No winners returned.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {winners.map((w, i) => (
                <li key={w.id ?? `${w.platform}-${i}`} className="flex items-start gap-3 py-3">
                  <Badge variant="outline">{w.platform}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{w.advertiser ?? "Unknown advertiser"}</p>
                    <p className="mt-0.5 line-clamp-2 whitespace-normal text-sm text-muted-foreground">
                      {w.body ?? "(no copy)"}
                    </p>
                  </div>
                  {typeof w.score === "number" ? (
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {Math.round(w.score)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
