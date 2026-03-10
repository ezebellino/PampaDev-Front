import { Card } from "../ui/Card";

export default function DisciplinePublicCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Imagen fake */}
      <div className="h-48 animate-pulse bg-zinc-800/70 sm:h-52" />

      <div className="p-5">
        <div className="space-y-3">
          {/* Título */}
          <div className="h-5 w-2/3 animate-pulse rounded-md bg-zinc-800/70" />

          {/* Texto */}
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-zinc-800/60" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-zinc-800/60" />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-800/70 sm:w-40" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-800/50 sm:w-36" />
        </div>
      </div>
    </Card>
  );
}