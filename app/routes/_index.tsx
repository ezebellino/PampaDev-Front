import { Link } from "react-router";
import Footer from "~/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* flex-1 empuja el footer abajo si no hay contenido */}
      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
          <header className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-xs text-zinc-300">
              ⚡ MultiRubro · Reservas · Membresías · Turnos
            </p>

            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Organizá turnos y espacios en un solo lugar.
            </h1>

            <p className="max-w-2xl text-zinc-400 md:text-lg">
              Gestión por roles (Dev/Admin/Instructor/Usuario), horarios disponibles,
              cobros por turno o mensualidad y futura moneda virtual.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-white"
              >
                Entrar / Login
              </Link>

              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-medium text-zinc-100 hover:bg-zinc-900"
              >
                Ver Dashboard (mock)
              </Link>
            </div>
          </header>

          <section className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
            {[
              { title: "Multi-rubros", desc: "Pilates, taekwondo, gym, fútbol, pádel y más.", icon: "🏟️" },
              { title: "Roles", desc: "Vistas según permisos: admin, instructor/canchero, usuario.", icon: "🧩" },
              { title: "Mobile-first", desc: "Diseño responsive real: usable desde el teléfono.", icon: "📱" },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:bg-zinc-900/40 transition"
              >
                <div className="text-2xl">{card.icon}</div>
                <h3 className="mt-3 font-semibold">{card.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{card.desc}</p>
              </div>
            ))}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
