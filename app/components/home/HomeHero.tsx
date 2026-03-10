import { Link } from "react-router";
import type { User } from "~/lib/auth/AuthContext";

type HomeHeroProps = {
  isAuthed: boolean;
  user: User | null;
};

export default function HomeHero({ isAuthed, user }: HomeHeroProps) {
  const ctaHref = isAuthed ? "/app" : "/login";
  const ctaLabel = isAuthed ? "Ir a mi panel" : "Entrar / Login";

  return (
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
  );
}
