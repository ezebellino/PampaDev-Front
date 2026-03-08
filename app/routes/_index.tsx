import { Link } from "react-router";
import Footer from "~/components/layout/Footer";
import { useAuth } from "../lib/auth/AuthContext";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useEffect, useState } from "react";
import { apiGetPublic } from "../lib/api/api"; // ajustá el path si tu api.ts está en otro lado
import type { ApiError } from "../lib/api/api";


type Discipline = { idDiscipline: number; name: string };

function useDisciplinesPublic() {
  const [data, setData] = useState<Discipline[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();

    setLoading(true);
    setForbidden(false);

    apiGetPublic<Discipline[]>("/api/Disciplines", ctrl.signal)
      .then((res) => setData(res))
      .catch((e: ApiError) => {
        if (e?.status === 401 || e?.status === 403) setForbidden(true);
        setData(null);
      })
      .finally(() => setLoading(false));

    return () => {
      ctrl.abort();
    };
  }, []);

  return { data, loading, forbidden };
}

export default function Home() {
  const { isAuthed, user } = useAuth();
  const { data: branches, loading: branchesLoading } = useBranches();
  const { data: disciplines, loading: disciplinesLoading, forbidden: disciplinesForbidden } = useDisciplinesPublic();

  const branchesCount = branches?.length ?? 0;
  const disciplinesCount = disciplines?.length ?? 0;

  const ctaHref = isAuthed ? "/app" : "/login";
  const ctaLabel = isAuthed ? "Ir a mi panel" : "Entrar / Login";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
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
              Gestión por roles (Devs/Admin/Instructor/Usuario), horarios disponibles,
              cobros por turno o mensualidad y futura moneda virtual.
            </p>

            {/* mini status */}
            {isAuthed && (
              <div className="text-sm text-zinc-400">
                Sesión activa: <span className="text-zinc-200">{user?.name}</span> ·{" "}
                <span className="text-zinc-500">{user?.role}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={ctaHref}
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-white"
              >
                {ctaLabel}
              </Link>

              <Link
                to="/rubros"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-medium text-zinc-100 hover:bg-zinc-900"
              >
                Ver rubros
              </Link>
            </div>
          </header>

          {/* Stats reales (suaves) */}
          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="text-xs text-zinc-400">Sucursales</div>
              <div className="mt-2 text-2xl font-semibold">
                {branchesLoading ? "…" : branchesCount}
              </div>
              <div className="mt-2 text-sm text-zinc-500">
                Datos reales desde /api/Branches
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="text-xs text-zinc-400">Rubros</div>
              <div className="mt-2 text-2xl font-semibold">
                {disciplinesLoading ? "…" : disciplinesForbidden ? "🔒" : disciplinesCount}
              </div>
              <div className="mt-2 text-sm text-zinc-500">
                {disciplinesForbidden ? "Disponible al iniciar sesión" : "Datos reales desde /api/Disciplines"}
              </div>
            </div>
          </section>

          {/* Feature cards */}
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
