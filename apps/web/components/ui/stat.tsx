import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';

export interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
  delta?: number | null;
  className?: string;
}

function formatDelta(delta: number) {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}%`;
}

function Stat({ label, value, sub, delta, className }: StatProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground dark:text-white">
            {value}
          </span>
          {typeof delta === 'number' && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums',
                delta >= 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400',
              )}
            >
              {formatDelta(delta)}
            </span>
          )}
        </div>
        {sub && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export { Stat };
