import React from "react";
import { cn } from "./cn";

type Tone = "neutral" | "success" | "warning";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    neutral: "border-zinc-800 text-zinc-300",
    success: "border-emerald-900/60 text-emerald-300",
    warning: "border-amber-900/60 text-amber-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
