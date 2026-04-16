const FEATURE_CARDS = [
  {
    title: "Multi-rubros",
    desc: "Desde bienestar hasta deportes, una misma plataforma acompaña distintos modelos de servicio.",
    accent: "from-sky-100 via-sky-50 to-transparent",
  },
  {
    title: "Roles",
    desc: "Cada perfil encuentra su propio flujo, con menos fricción y más claridad en cada tarea.",
    accent: "from-emerald-100 via-emerald-50 to-transparent",
  },
  {
    title: "Mobile-first",
    desc: "Una experiencia ágil y legible para gestionar, reservar y responder desde cualquier lugar.",
    accent: "from-amber-100 via-amber-50 to-transparent",
  },
] as const;

export default function HomeFeatures() {
  return (
    <section className="mt-12 space-y-5 md:mt-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Capacidades</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Una plataforma diseñada para acompañar la operación real.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-600">
          Más que una agenda de turnos: una base para ordenar servicios, equipos y experiencia del
          cliente en un mismo lugar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <article
            key={card.title}
            className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/94 p-5 transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:bg-white"
          >
            <div className={`absolute inset-x-0 top-0 h-24 bg-linear-to-br ${card.accent}`} />
            <div className="relative">
              <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
