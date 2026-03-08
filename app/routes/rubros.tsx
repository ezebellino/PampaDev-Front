// app/routes/rubros.tsx
import { useMemo } from "react";
import { Link } from "react-router";
import Footer from "~/components/layout/Footer";
import { useDisciplinesPublic } from "~/lib/disciplines/useDisciplinesPublic";

type Discipline = { idDiscipline: number; name: string };

// ✅ Mapa simple: vos podés ir completando URLs reales
const DISCIPLINE_IMAGES: Record<string, string> = {
  "pilates": "https://images.unsplash.com/photo-1518611012118-f0c5e6f6a8d0?auto=format&fit=crop&w=1200&q=60",
  "taekwondo": "https://images.unsplash.com/photo-1520975958225-82f3b134d62f?auto=format&fit=crop&w=1200&q=60",
  "gym": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=60",
  "futbol": "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60",
  "padel": "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=60",
};

function pickImage(name: string) {
  const key = name.trim().toLowerCase();
  // match exacto por ahora (simple)
  return DISCIPLINE_IMAGES[key] ?? "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60";
}

export default function PublicRubros() {
  const { data, loading } = useDisciplinesPublic();

  const items = useMemo(() => {
    const arr = (data ?? []) as Discipline[];
    return arr
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [data]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Rubros</h1>
              <p className="text-sm text-zinc-400">
                Explorá disciplinas disponibles. Para reservar, necesitás iniciar sesión.
              </p>
            </div>

            <Link
              to="/"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm hover:bg-zinc-900"
            >
              ← Volver
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 text-sm text-zinc-400">Cargando rubros…</div>
          ) : items.length === 0 ? (
            <div className="mt-8 text-sm text-zinc-400">Todavía no hay rubros cargados.</div>
          ) : (
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((d) => (
                <article
                  key={d.idDiscipline}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden hover:bg-zinc-900/30 transition"
                >
                  <div className="relative h-36">
                    <img
                      src={pickImage(d.name)}
                      alt={d.name}
                      className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/10 to-transparent" />
                  </div>

                  <div className="p-4 space-y-2">
                    <h2 className="text-lg font-semibold">{d.name}</h2>
                    <p className="text-sm text-zinc-400">
                      Consultá disponibilidad y reservá turnos desde tu panel.
                    </p>

                    <div className="pt-2 flex gap-2">
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
                      >
                        Entrar
                      </Link>

                      <Link
                        to="/"
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900"
                      >
                        Ver cómo funciona
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}