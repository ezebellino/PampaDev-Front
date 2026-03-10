export default function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-800/70" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded-md bg-zinc-800/70" />
      <div className="mt-3 h-4 w-40 animate-pulse rounded-md bg-zinc-800/60" />
    </div>
  );
}