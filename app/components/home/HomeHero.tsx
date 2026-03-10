import { Link } from "react-router";
import type { User } from "~/lib/auth/authTypes";

const HERO_POINTS = [
  "Reservas ágiles por horario y espacio",
  "Membresías y seguimiento por sucursal",
  "Experiencias claras para cada tipo de usuario",
];

type HomeHeroProps = {
  isAuthed: boolean;
  user: User | null;
};

export default function HomeHero({ isAuthed, user }: HomeHeroProps) {
  const ctaHref = isAuthed ? "/app" : "/login";
  const ctaLabel = isAuthed ? "Ir a mi panel" : "Entrar / Login";

  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-zinc-950/70 px-6 py-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur md:px-10 md:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_55%)]" />
      <div className="absolute -right-24 top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-200">
            <span className="text-base leading-none">⚡</span>
            MultiRubro · Reservas · Membresías · Turnos
          </p>

          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            Una plataforma para ordenar la operación y simplificar el día a día
          </div>
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.02]">
            Organizá turnos, espacios y membresías con una experiencia simple y profesional.
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-lg md:leading-8">
            Centralizá la gestión de sedes, disciplinas y usuarios en una sola plataforma, con una
            experiencia clara para administrar, vender y crecer sin sumar complejidad.
          </p>
        </div>

        <div className="grid gap-2 text-sm text-zinc-300 md:max-w-2xl md:grid-cols-3">
          {HERO_POINTS.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 px-4 py-3 text-balance"
            >
              {point}
            </div>
          ))}
        </div>

        {isAuthed ? (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-300">
            Sesión activa:
            <span className="font-medium text-zinc-100">{user?.name}</span>
            <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
              {user?.role}
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5 hover:bg-white"
          >
            {ctaLabel}
          </Link>

          <Link
            to="/rubros"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900/80 px-5 py-3 text-sm font-medium text-zinc-100 transition hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-900"
          >
            Explorar rubros
          </Link>
        </div>
      </div>
    </header>
  );
}
