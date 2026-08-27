import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function Narrative({ narrative }: { narrative: string | null }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>What happened</CardTitle>
        <CardDescription>
          Deterministic summary from reconciled data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {narrative ? (
          <p className="text-xs leading-relaxed text-zinc-300">{narrative}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Narrative will appear once today&apos;s data is reconciled.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
