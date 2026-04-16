import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/Card";
import type { Discipline } from "~/lib/api/services/disciplines";

type DisciplineListProps = {
  disciplines: Discipline[];
  onEdit: (discipline: Discipline) => void;
  onDelete: (discipline: Discipline) => void;
  onRefresh: () => void | Promise<void>;
};

export default function DisciplineList({
  disciplines,
  onEdit,
  onDelete,
  onRefresh,
}: DisciplineListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return disciplines;
    return disciplines.filter((discipline) => discipline.name.toLowerCase().includes(normalized));
  }, [disciplines, query]);

  return (
    <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
      <CardHeader>
        <CardTitle>Catálogo disponible</CardTitle>
        <CardDescription>Buscá, editá o eliminá disciplinas del catálogo base.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 sm:w-80"
          />
          <div className="flex items-center gap-2">
            <Badge tone="neutral" className="text-slate-700 border-stone-200 bg-stone-100">
              {filtered.length} / {disciplines.length}
            </Badge>
            <Button variant="ghost" onClick={() => void onRefresh()}>
              Actualizar
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-slate-500">
            No encontramos disciplinas con ese criterio.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((discipline) => (
              <article
                key={discipline.idDiscipline}
                className="relative overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50/20"
              >
                <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(135deg,rgba(125,211,252,0.22),transparent_60%)]" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="text-base font-semibold text-slate-900">{discipline.name}</div>
                    <div className="text-xs text-slate-500">Disciplina #{discipline.idDiscipline}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(discipline)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => onDelete(discipline)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-slate-500">
        El precio y la duración final se ajustan después dentro de la configuración de cada sucursal.
      </CardFooter>
    </Card>
  );
}
