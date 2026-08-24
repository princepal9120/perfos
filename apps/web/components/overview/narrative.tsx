import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Narrative({ narrative }: { narrative: string | null }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>What happened</CardTitle>
        <CardDescription>Deterministic summary from reconciled data</CardDescription>
      </CardHeader>
      <CardContent>
        {narrative ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{narrative}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Narrative will appear once today&apos;s data is reconciled.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
