import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-muted [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
      ) : null}

      <h3 className="text-sm font-semibold tracking-tight text-text-primary">
        {title}
      </h3>

      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
export default EmptyState;
