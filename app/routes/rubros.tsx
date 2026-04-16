import { useMemo } from "react";
import { Link } from "react-router";
import DisciplinePublicCard from "~/components/rubros/DisciplinePublicCard";
import DisciplinePublicCardSkeleton from "~/components/rubros/DisciplinePublicCardSkeleton";
import Footer from "~/components/layout/Footer";
import { useDisciplinesPublic } from "~/lib/disciplines/useDisciplinesPublic";

type Discipline = { idDiscipline: number; name: string };

const DISCIPLINE_IMAGES: Record<string, string> = {
  pilates:
    "https://images.unsplash.com/photo-1518611012118-f0c5e6f6a8d0?auto=format&fit=crop&w=1200&q=60",
  taekwondo:
    "https://images.unsplash.com/photo-1520975958225-82f3b134d62f?auto=format&fit=crop&w=1200&q=60",
  gym:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=60",
  futbol:
    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60",
  padel:
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=60",
};

function normalizeDisciplineKey(name: string) {
  return name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function pickImage(name: string) {
  const key = normalizeDisciplineKey(name);
  return DISCIPLINE_IMAGES[key] ?? "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60";
}

export default function PublicRubros() {
  const { data, loading } = useDisciplinesPublic();

  const items = useMemo(() => {
    const arr = (data ?? []) as Discipline[];
    return arr.slice().sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [data]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f8f9ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(163,230,53,0.10),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,236,0.92)_55%,rgba(239,246,245,0.96))]" />
      <div className="relative flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/92 px-6 py-7 shadow-[0_30px_80px_-48px_rgba(69,70,77,0.22)] backdrop-blur md:px-10 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(163,230,53,0.10),transparent_24%),linear-gradient(135deg,rgba(239,244,255,0.85),transparent_55%)]" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="inline-flex rounded-full border border-sky-200 bg-[#eff4ff] px-3 py-1 text-xs font-medium text-sky-700">Actividades disponibles</p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl md:leading-tight">
                  Explorá actividades para después elegir la oferta real de tu sucursal.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-lg md:leading-8">
                  Acá ves las disciplinas disponibles. Después, según la sucursal activa, vas a poder consultar horarios, planes y reservas.
                </p>
              </div>
              <Link to="/" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#eff4ff]">
                Volver al inicio
              </Link>
            </div>
          </section>

          {loading ? (
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <DisciplinePublicCardSkeleton key={index} />
              ))}
            </section>
          ) : items.length === 0 ? (
            <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white/92 px-5 py-6 text-sm text-slate-600">
              Todavía no hay disciplinas publicadas.
            </div>
          ) : (
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((discipline) => (
                <DisciplinePublicCard key={discipline.idDiscipline} discipline={discipline} imageUrl={pickImage(discipline.name)} />
              ))}
            </section>
          )}
        </div>
      </div>
      <div className="relative">
        <Footer />
      </div>
    </main>
  );
}
