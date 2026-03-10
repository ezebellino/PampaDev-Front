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
    <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
      <CardHeader>
        <CardTitle>Catálogo disponible</CardTitle>
        <CardDescription>Buscá, editá o eliminá disciplinas del catálogo base.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full sm:w-80 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <div className="flex items-center gap-2">
            <Badge tone="neutral" className="text-zinc-300">
              {filtered.length} / {disciplines.length}
            </Badge>
            <Button variant="ghost" onClick={() => void onRefresh()}>
              Actualizar
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-5 text-sm text-zinc-400">
            No encontramos disciplinas con ese criterio.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((discipline) => (
              <article
                key={discipline.idDiscipline}
                className="relative overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950/85 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/75"
              >
                <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),transparent_60%)]" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="text-base font-semibold text-zinc-100">{discipline.name}</div>
                    <div className="text-xs text-zinc-500">Disciplina #{discipline.idDiscipline}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(discipline)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-300 hover:text-red-200"
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

      <CardFooter className="text-xs text-zinc-500">
        El precio y la duración final se ajustan después dentro de la configuración de cada sucursal.
      </CardFooter>
    </Card>
  );
}
