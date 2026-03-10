import { Link } from "react-router";
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
  return (
    <Card className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70">
      <div className="relative h-48 overflow-hidden sm:h-52">
        <img
          src={imageUrl}
          alt={discipline.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-zinc-200 backdrop-blur">
          Rubro #{discipline.idDiscipline}
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
            {discipline.name}
          </h3>

          <p className="text-sm leading-relaxed text-zinc-400">
            Explorá este rubro y descubrí cómo podría integrarse a una experiencia moderna
            de reservas, clases y gestión.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white"
          >
            Ingresar para reservar
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </Card>
  );
}