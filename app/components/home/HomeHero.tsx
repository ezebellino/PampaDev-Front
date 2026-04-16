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
  const ctaLabel = isAuthed ? "Ir a mi panel" : "Entrar";

  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/92 px-6 py-7 shadow-[0_30px_80px_-48px_rgba(69,70,77,0.22)] backdrop-blur md:px-10 md:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(163,230,53,0.10),transparent_24%),linear-gradient(135deg,rgba(239,244,255,0.85),transparent_55%)]" />
      <div className="absolute -right-24 top-10 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-lime-100/40 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-[#eff4ff] px-3 py-1 text-xs font-medium text-sky-700">
            <span className="text-base leading-none">?</span>
            MultiRubro · Reservas · Membresías · Turnos
          </p>

          <div className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-xs text-lime-800">
            Una plataforma para ordenar la operación y simplificar el día a día
          </div>
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl md:leading-[1.02]">
            Organizá turnos, espacios y membresías con una experiencia simple y profesional.
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-lg md:leading-8">
            Centralizá la gestión de sedes, disciplinas y usuarios en una sola plataforma, con una
            experiencia clara para administrar, vender y crecer sin sumar complejidad.
          </p>
        </div>

        <div className="grid gap-2 text-sm text-slate-700 md:max-w-2xl md:grid-cols-3">
          {HERO_POINTS.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-slate-200 bg-stone-50/90 px-4 py-3 text-balance shadow-sm"
            >
              {point}
            </div>
          ))}
        </div>

        {isAuthed ? (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
            Sesión activa:
            <span className="font-medium text-slate-900">{user?.name}</span>
            <span className="rounded-full border border-slate-200 px-2 py-1 text-xs uppercase tracking-[0.2em] text-stone-500">
              {user?.role}
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            {ctaLabel}
          </Link>

          <Link
            to="/rubros"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-[#eff4ff] hover:text-slate-900"
          >
            Explorar rubros
          </Link>
        </div>
      </div>
    </header>
  );
}
