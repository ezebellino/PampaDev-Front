import { cn } from "./cn";
import React from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-lg rounded-3xl border border-stone-200 bg-white/98 backdrop-blur",
            "shadow-[0_32px_80px_-45px_rgba(69,70,77,0.32)]"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
            <div className="font-semibold tracking-tight text-slate-900">{title}</div>
            <button
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-2.5 py-1.5 text-slate-600 transition hover:border-sky-200 hover:bg-[#eff4ff] hover:text-slate-900"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
