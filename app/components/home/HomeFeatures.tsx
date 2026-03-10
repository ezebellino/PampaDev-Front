const FEATURE_CARDS = [
  {
    title: "Multi-rubros",
    desc: "Pilates, taekwondo, gym, fútbol, pádel y más.",
    icon: "🏟️",
  },
  {
    title: "Roles",
    desc: "Vistas según permisos: admin, instructor/canchero, usuario.",
    icon: "🧩",
  },
  {
    title: "Mobile-first",
    desc: "Diseño responsive real: usable desde el teléfono.",
    icon: "📱",
  },
];

export default function HomeFeatures() {
  return (
    <section className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
      {FEATURE_CARDS.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:bg-zinc-900/40"
        >
          <div className="text-2xl">{card.icon}</div>
          <h3 className="mt-3 font-semibold">{card.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{card.desc}</p>
        </div>
      ))}
    </section>
  );
}
