import React from "react";
import { cn } from "./cn";

export function PageHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)}>
      <div className="max-w-3xl">
        <div className="inline-flex rounded-full border border-slate-200/45 bg-[#eff4ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
          PampaDev
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.4rem]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
