'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, createBrowserSession, setWorkspaceId } from '@/lib/api';

/** Browser auth boundary: API keys are entered once and exchanged for a cookie. */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState<boolean | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceIdState] = useState('1');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('perfos_workspace_id') || '1';
    setWorkspaceIdState(stored);
    setWorkspaceId(stored);
    void api.get('/auth/session').then(() => setReady(true)).catch(() => setReady(false));
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const session = await createBrowserSession({
        api_key: apiKey,
        workspace_id: Number(workspaceId),
      });
      window.localStorage.setItem('perfos_workspace_id', String(session.workspace_id));
      setApiKey('');
      setReady(true);
    } catch {
      setError('Authentication failed. Check the workspace and API key.');
    }
  }

  if (ready === null) return <main className="min-h-dvh bg-background" aria-busy="true" />;
  if (ready) return <>{children}</>;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to PerfOS</CardTitle>
          <CardDescription>Your key is exchanged for an HttpOnly session and is not stored in the browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={signIn} className="space-y-4">
            <input aria-label="Workspace ID" value={workspaceId} onChange={(e) => setWorkspaceIdState(e.target.value)} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm" inputMode="numeric" />
            <input aria-label="API key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm" autoComplete="off" required />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
