export default function ScreenLoader({ title = "Cargando...", subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="space-y-4">
      <div className="h-5 w-40 animate-pulse rounded bg-zinc-900/60" />
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-900/70" />
          <div className="space-y-2">
            <div className="h-4 w-52 animate-pulse rounded bg-zinc-900/60" />
            <div className="h-3 w-72 animate-pulse rounded bg-zinc-900/40" />
          </div>
        </div>
        <div className="mt-4 text-sm text-zinc-400">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-zinc-500">{subtitle}</div> : null}
      </div>
    </div>
  );
}