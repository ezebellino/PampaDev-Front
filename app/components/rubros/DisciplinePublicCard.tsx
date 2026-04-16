import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "~/lib/auth/AuthContext";
import { Card } from "../ui/Card";

type Discipline = {
  idDiscipline: number;
  name: string;
};

type Props = {
  discipline: Discipline;
  imageUrl: string;
};

export default function DisciplinePublicCard({ discipline, imageUrl }: Props) {
  const { isAuthed } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  const primaryAction = isAuthed
    ? {
        to: "/app/rubros",
        label: "Ver oferta disponible",
      }
    : {
        to: "/login",
        label: "Ingresar para empezar",
      };

  return (
    <Card className="group overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:bg-white">
      <div className="relative h-48 overflow-hidden sm:h-52">
        {imageFailed ? (
          <div className="flex h-full w-full items-end bg-[linear-gradient(135deg,rgba(224,242,254,0.95),rgba(255,255,255,1)_58%,rgba(236,253,245,0.8))] p-5">
            <div className="rounded-full border border-white/90 bg-white/92 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {discipline.name}
            </div>
          </div>
        ) : (
          <>
            <img
              src={imageUrl}
              alt={discipline.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
            <div className="absolute inset-0 bg-linear-to-t from-white/12 via-transparent to-transparent" />
          </>
        )}
      </div>

      <div className="p-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{discipline.name}</h3>

          <p className="text-sm leading-relaxed text-slate-600">
            Conocé esta actividad y descubrí si es la indicada para tu próxima reserva.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to={primaryAction.to}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {primaryAction.label}
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-[#eff4ff]"
          >
            Inicio
          </Link>
        </div>
      </div>
    </Card>
  );
}
