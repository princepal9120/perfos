import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success';
type Size = 'default' | 'sm' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  default:
    'bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 font-medium shadow-sm active:scale-[0.98]',
  secondary:
    'bg-zinc-900 text-foreground border border-border hover:bg-zinc-800 hover:border-white/20 active:scale-[0.98]',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-white/4 hover:border-white/20 active:scale-[0.98]',
  ghost:
    'text-muted-foreground hover:bg-white/6 hover:text-foreground active:scale-[0.98]',
  destructive:
    'bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 active:scale-[0.98]',
  success:
    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 px-6 text-sm',
  icon: 'h-9 w-9',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { Button };
