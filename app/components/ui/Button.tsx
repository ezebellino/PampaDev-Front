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
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<Variant, string> = {
    primary: "bg-zinc-100 text-zinc-950 hover:bg-white",
    secondary: "border border-zinc-800 bg-zinc-950 hover:bg-zinc-900",
    ghost: "hover:bg-zinc-900",
  };

  const sizes: Record<Size, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
