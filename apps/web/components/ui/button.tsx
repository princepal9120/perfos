import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "success";
type Size = "default" | "sm" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default:
    "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:opacity-90 active:opacity-80",
  secondary: "bg-white/[0.04] text-[#f0f0f5] ring-1 ring-white/10 hover:bg-white/[0.08]",
  outline:
    "border border-white/[0.1] bg-transparent text-[#f0f0f5] hover:bg-white/[0.04] hover:border-white/20",
  ghost: "text-[#8b8ba3] hover:bg-white/[0.06] hover:text-[#f0f0f5]",
  destructive: "bg-red-500/20 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/30",
  success: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/25",
};

const sizes: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 px-6",
  icon: "h-9 w-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
