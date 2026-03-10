import { useMemo } from "react";
import { Link } from "react-router";
import Footer from "~/components/layout/Footer";
import { useDisciplinesPublic } from "~/lib/disciplines/useDisciplinesPublic";
import DisciplinePublicCard from "~/components/rubros/DisciplinePublicCard";
import DisciplinePublicCardSkeleton from "~/components/rubros/DisciplinePublicCardSkeleton";

type Discipline = { idDiscipline: number; name: string };

const DISCIPLINE_IMAGES: Record<string, string> = {
  pilates: "https://images.unsplash.com/photo-1518611012118-f0c5e6f6a8d0?auto=format&fit=crop&w=1200&q=60",
  taekwondo: "https://images.unsplash.com/photo-1520975958225-82f3b134d62f?auto=format&fit=crop&w=1200&q=60",
  gym: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=60",
  futbol: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60",
  padel: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=60",
};

function normalizeDisciplineKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pickImage(name: string) {
  const key = normalizeDisciplineKey(name);
  return (
    DISCIPLINE_IMAGES[key] ??
    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60"
  );
}

export default function PublicRubros() {
  const { data, loading } = useDisciplinesPublic();

  const items = useMemo(() => {
    const arr = (data ?? []) as Discipline[];
    return arr.slice().sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [data]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <DisciplinePublicCardSkeleton key={i} />
              ))}
            </section>
          ) : items.length === 0 ? (
            <div className="mt-8 text-sm text-zinc-400">Todavía no hay rubros cargados.</div>
          ) : (
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((d) => (
                <DisciplinePublicCard
                  key={d.idDiscipline}
                  discipline={d}
                  imageUrl={pickImage(d.name)}
                />
              ))}
            </section>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}