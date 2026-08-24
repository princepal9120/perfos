import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning";

const variants: Record<Variant, string> = {
  default: "border-[#3b82f6]/20 bg-[#3b82f6]/10 text-[#3b82f6]",
  secondary: "border-transparent bg-white/[0.04] text-[#8b8ba3]",
  outline: "border-white/[0.1] text-[#8b8ba3]",
  destructive: "border-red-500/20 bg-red-500/10 text-red-400",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-4 tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
