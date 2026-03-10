const FEATURE_CARDS = [
  {
    title: "Multi-rubros",
    desc: "Desde bienestar hasta deportes, una misma plataforma acompaña distintos modelos de servicio.",
    icon: "🏟️",
    accent: "from-cyan-400/20 via-cyan-400/8 to-transparent",
  },
  {
    title: "Roles",
    desc: "Cada perfil encuentra su propio flujo, con menos fricción y más claridad en cada tarea.",
    icon: "🧩",
    accent: "from-emerald-400/20 via-emerald-400/8 to-transparent",
  },
  {
    title: "Mobile-first",
    desc: "Una experiencia ágil y legible para gestionar, reservar y responder desde cualquier lugar.",
    icon: "📱",
    accent: "from-amber-300/20 via-amber-300/8 to-transparent",
  },
] as const;

export default function HomeFeatures() {
  return (
    <section className="mt-12 space-y-5 md:mt-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Capacidades</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Una plataforma diseñada para acompañar la operación real.
          </h2>
        </div>
        <p className="max-w-xl text-sm text-zinc-400">
          Más que una agenda de turnos: una base para ordenar servicios, equipos y experiencia del
          cliente en un mismo lugar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <article
            key={card.title}
            className="group relative overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/80"
          >
            <div className={`absolute inset-x-0 top-0 h-24 bg-linear-to-br ${card.accent}`} />
            <div className="relative">
              <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-2xl shadow-sm transition group-hover:scale-105">
                {card.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{card.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
