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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur",
            "shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
            <div className="font-semibold tracking-tight">{title}</div>
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-800 px-2 py-1 hover:bg-zinc-900"
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
