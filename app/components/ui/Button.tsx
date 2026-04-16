import React from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[1.15rem] font-semibold tracking-tight transition-all duration-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f9ff] " +
    "disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<Variant, string> = {
    primary:
      "bg-[linear-gradient(135deg,#0f172a,#1e293b)] text-white shadow-[0_18px_40px_-22px_rgba(15,23,42,0.55)] hover:bg-[linear-gradient(135deg,#131b2e,#0f172a)]",
    secondary:
      "border border-slate-200/60 bg-[#eff4ff] text-slate-800 shadow-sm hover:border-sky-200 hover:bg-white hover:text-slate-900",
    ghost: "text-slate-600 hover:bg-[#eff4ff] hover:text-slate-900",
  };

  const sizes: Record<Size, string> = {
    sm: "px-3.5 py-2.5 text-sm",
    md: "px-4.5 py-3 text-sm",
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
