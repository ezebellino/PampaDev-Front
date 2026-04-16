import StatCardSkeleton from "~/components/ui/StatCardSkeleton";

const STAT_CARDS = [
  {
    eyebrow: "Sucursales",
    helper: "Una red preparada para atender, organizar y escalar con orden.",
    badge: "En crecimiento",
    badgeClass: "border-sky-200 bg-[#eff4ff] text-sky-700",
    accent: "from-sky-100 via-sky-50 to-transparent",
  },
  {
    eyebrow: "Rubros",
    helper: "Una oferta flexible para adaptarse a distintos servicios y experiencias.",
    lockedHelper: "Contenido visible para perfiles con acceso a la plataforma.",
    badge: "Oferta activa",
    lockedBadge: "Acceso privado",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    accent: "from-amber-100 via-amber-50 to-transparent",
  },
] as const;

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
    <section className="mt-10 space-y-4 md:mt-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Panorama general</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Una visión rápida para entender la escala del producto.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-600">
          Una lectura breve de cobertura y oferta para comunicar valor de forma clara, sin ruido ni
          detalles internos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <article className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/94 p-5 shadow-[0_20px_50px_-40px_rgba(69,70,77,0.18)]">
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${STAT_CARDS[0].accent}`} />
              <div className="relative">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-stone-500">{STAT_CARDS[0].eyebrow}</div>
                  <div className="mt-3 text-4xl font-semibold text-slate-900">{branchesCount}</div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">{STAT_CARDS[0].helper}</span>
                  <span className={`rounded-full px-3 py-1 text-xs ${STAT_CARDS[0].badgeClass}`}>{STAT_CARDS[0].badge}</span>
                </div>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/94 p-5 shadow-[0_20px_50px_-40px_rgba(69,70,77,0.18)]">
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${STAT_CARDS[1].accent}`} />
              <div className="relative">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-stone-500">{STAT_CARDS[1].eyebrow}</div>
                  <div className="mt-3 text-4xl font-semibold text-slate-900">{disciplinesForbidden ? "Privado" : disciplinesCount}</div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">{disciplinesForbidden ? STAT_CARDS[1].lockedHelper : STAT_CARDS[1].helper}</span>
                  <span className={`rounded-full px-3 py-1 text-xs ${STAT_CARDS[1].badgeClass}`}>{disciplinesForbidden ? STAT_CARDS[1].lockedBadge : STAT_CARDS[1].badge}</span>
                </div>
              </div>
            </article>
          </>
        )}
      </div>
    </section>
  );
}
