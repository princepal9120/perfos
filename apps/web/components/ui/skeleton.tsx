import { cn } from '@/lib/utils';

/**
 * Keyframes live here (not tailwind.config/globals.css) so this component is
 * self-contained; those files are owned by other agents.
 */
const SHIMMER_CSS = `
@keyframes ui-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-shimmer-band { animation: none !important; }
}`;

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-muted', className)}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: SHIMMER_CSS }} />
      <div
        aria-hidden="true"
        className="ui-shimmer-band pointer-events-none absolute inset-0 animate-[ui-shimmer_1.8s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/[0.07] to-transparent"
      />
    </div>
  );
}

/** Stack of text-shaped bars; last line shortened like a real paragraph. */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3 w-full', i === lines - 1 && 'w-2/3')}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
