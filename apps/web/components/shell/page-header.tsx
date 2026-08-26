import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-6 border-b border-white/8 pb-6">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export default PageHeader;
