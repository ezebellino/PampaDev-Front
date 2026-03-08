// components/ui/ScreenLoader.tsx
export default function ScreenLoader({ title = "Cargando…", subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="space-y-4">
      <div className="h-5 w-40 rounded bg-zinc-900/60 animate-pulse" />
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-900/70 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-52 rounded bg-zinc-900/60 animate-pulse" />
            <div className="h-3 w-72 rounded bg-zinc-900/40 animate-pulse" />
          </div>
        </div>
        <div className="mt-4 text-sm text-zinc-400">{title}</div>
        {subtitle ? <div className="text-xs text-zinc-500 mt-1">{subtitle}</div> : null}
      </div>
    </div>
  );
}