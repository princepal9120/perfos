import type * as React from 'react';
import { cn } from '@/lib/utils';

type Variant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'up'
  | 'down'
  | 'neutral';

type Shape = 'pill' | 'square';

const variants: Record<Variant, string> = {
  default: 'border-accent/20 bg-accent-muted text-accent',
  secondary: 'border-border-subtle bg-bg-elevated text-text-secondary',
  outline: 'border-border-subtle text-text-secondary',
  destructive: 'border-destructive/20 bg-destructive/10 text-red-400',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  // delta chips: green when the metric went up, red when down, neutral flat
  up: 'border-success/20 bg-success/10 text-success',
  down: 'border-red-500/20 bg-red-500/10 text-red-400',
  neutral: 'border-border-subtle bg-white/5 text-text-muted',
};

const shapes: Record<Shape, string> = {
  pill: 'rounded-full px-2.5',
  square: 'rounded-sm px-1.5',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  /** square = tight 4px corners for dense data rows; pill = default */
  shape?: Shape;
}

function Badge({
  className,
  variant = 'default',
  shape = 'pill',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap border py-0.5 text-[11px] font-medium leading-4 tracking-wide tabular-nums transition-colors duration-fast ease-out',
        shapes[shape],
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
