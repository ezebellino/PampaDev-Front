import StatCardSkeleton from "~/components/ui/StatCardSkeleton";

type HomeStatsProps = {
  branchesCount: number;
  disciplinesCount: number;
  branchesLoading: boolean;
  disciplinesLoading: boolean;
  disciplinesForbidden: boolean;
};

export default function HomeStats({
  branchesCount,
  disciplinesCount,
  branchesLoading,
  disciplinesLoading,
  disciplinesForbidden,
}: HomeStatsProps) {
  const isLoading = branchesLoading || disciplinesLoading;

  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-2">
      {isLoading ? (
        <>
          <StatCardSkeleton />
          <StatCardSkeleton />
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-xs text-zinc-400">Sucursales</div>
            <div className="mt-2 text-2xl font-semibold">{branchesCount}</div>
            <div className="mt-2 text-sm text-zinc-500">
              Datos reales desde /api/Branches
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-xs text-zinc-400">Rubros</div>
            <div className="mt-2 text-2xl font-semibold">
              {disciplinesForbidden ? "🔒" : disciplinesCount}
            </div>
            <div className="mt-2 text-sm text-zinc-500">
              {disciplinesForbidden
                ? "Disponible al iniciar sesión"
                : "Datos reales desde /api/Disciplines"}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
