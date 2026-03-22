
import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useBranchDisciplineConfig } from "../lib/disciplines/useBranchDisciplineConfig";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import { mockRubros } from "../lib/rubros/mockRubros";
import { matchesRubroCandidate } from "../lib/rubros/rubroMatching";

function formatARS(amount: number) {
  return `$ ${amount.toLocaleString("es-AR")}`;
}

function resolveRubroPathId(name: string) {
  return mockRubros.find((rubro) => matchesRubroCandidate(rubro.id, rubro.name, name))?.id ?? null;
}

export default function RubrosPage() {
  const { user } = useAuth();
  const isDevs = user?.role === ROLES.DEVS;

  const { branchId } = useBranch();
  const { disciplines, loading, error, refresh } = useDisciplines();

  const noBranch = "__none__" as const;
  const hasBranch = branchId !== null;
  const safeBranchId: number | string = branchId ?? noBranch;

  const { hydrated, byId, toggleEnabled, updateField } = useBranchDisciplineConfig(safeBranchId, disciplines);

  const hydratedSafe = hasBranch ? hydrated : false;

  if (loading) {
    return (
      <ScreenLoader
        title="Cargando catalogo..."
        subtitle="Estamos preparando la oferta disponible para esta sucursal."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rubros" subtitle="No pudimos cargar el catalogo en este momento." />
        <Card>
          <CardContent className="space-y-3 py-6 text-sm">
            <div className="font-medium text-red-300">Ocurrio un problema al cargar los rubros.</div>
            <div className="text-zinc-400">{error}</div>
            <div>
              <Button variant="secondary" onClick={() => void refresh()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasBranch) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rubros"
          subtitle="Elige una sucursal para ver su catalogo operativo, precios base y visibilidad."
        />
        <Card>
          <CardContent className="space-y-4 py-6 text-sm text-zinc-400">
            <p>No hay una sucursal activa seleccionada.</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/app/branches">
                <Button variant="secondary">Ver sucursales</Button>
              </Link>
              <Button variant="ghost" onClick={() => void refresh()}>
                Actualizar catalogo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hydratedSafe) {
    return (
      <ScreenLoader title="Cargando configuracion..." subtitle="Estamos preparando la vista operativa de esta sucursal." />
    );
  }

  const visible = isDevs ? disciplines : disciplines.filter((discipline) => byId.get(discipline.idDiscipline)?.enabled);
  const enabledCount = disciplines.filter((discipline) => byId.get(discipline.idDiscipline)?.enabled).length;
  const customConfiguredCount = disciplines.filter((discipline) => byId.has(discipline.idDiscipline)).length;
  const averageDuration = disciplines.length
    ? Math.round(
        disciplines.reduce((total, discipline) => total + (byId.get(discipline.idDiscipline)?.durationMin ?? 60), 0) / disciplines.length
      )
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rubros"
        subtitle={`Catalogo operativo de la sucursal ${branchId}. Aqui administras que disciplinas base se muestran como oferta real en esta sede.`}
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => void refresh()}>
              Actualizar
            </Button>
          </div>
        }
      />

      <Card className="border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_36%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))]">
        <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Catalogo por sucursal</div>
            <div className="max-w-3xl text-2xl font-semibold leading-tight text-white">
              Una disciplina base se convierte en rubro operativo cuando la sede define visibilidad, duracion y precio.
            </div>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300">
              Esto ayuda a separar el catalogo general de disciplinas del comportamiento real de cada sucursal. La misma disciplina puede mostrarse distinta segun la sede, sin duplicar el modelo base.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{enabledCount} visibles</Badge>
              <Badge tone="neutral">{customConfiguredCount} configuradas</Badge>
              <Badge tone="neutral">Promedio {averageDuration} min</Badge>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Sucursal activa</div>
              <div className="mt-2 text-lg font-semibold text-white">#{branchId}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Modo</div>
              <div className="mt-2 text-sm font-medium text-white">{isDevs ? "Configuracion completa" : "Vista publicada"}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Enfoque</div>
              <div className="mt-2 text-sm font-medium text-white">Oferta real por sede</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDevs ? (
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
          <div className="h-20 bg-[linear-gradient(135deg,rgba(34,197,94,0.12),transparent_55%)]" />
          <CardHeader className="relative -mt-6">
            <CardTitle>Como leer este modulo</CardTitle>
            <CardDescription>
              Aqui no creas disciplinas nuevas: ajustas como se publica cada disciplina dentro de la sucursal activa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-6 text-zinc-400">
              Si necesitas ampliar el catalogo base, primero trabajas en Disciplinas o en Requests. Desde este panel defines la capa operativa: visibilidad, duracion y precio base para esta sede.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {visible.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay rubros disponibles</CardTitle>
            <CardDescription>
              {isDevs
                ? "Activa al menos una disciplina para que quede publicada como rubro en esta sucursal."
                : "Todavia no hay servicios habilitados para esta sede."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((discipline) => {
            const config = byId.get(discipline.idDiscipline);
            const enabled = config?.enabled ?? isDevs;
            const durationMin = config?.durationMin ?? 60;
            const basePrice = config?.basePrice ?? 0;
            const rubroPathId = resolveRubroPathId(discipline.name);
            const canOpenAgenda = Boolean(rubroPathId) && (enabled || isDevs);

            return (
              <article
                key={discipline.idDiscipline}
                className={`relative overflow-hidden rounded-[1.75rem] border bg-zinc-950/75 transition duration-200 ${
                  enabled
                    ? "border-zinc-800 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/75"
                    : "border-zinc-800/70 opacity-95"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-24 ${
                    enabled
                      ? "bg-[linear-gradient(135deg,rgba(56,189,248,0.14),transparent_55%)]"
                      : "bg-[linear-gradient(135deg,rgba(245,158,11,0.12),transparent_55%)]"
                  }`}
                />

                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-zinc-100">{discipline.name}</div>
                      <div className="text-sm text-zinc-500">Disciplina base #{discipline.idDiscipline}</div>
                    </div>
                    <Badge className="shrink-0 border-zinc-700 bg-zinc-900/80 text-zinc-300">
                      {enabled ? "Visible" : "Oculto"}
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Duracion</div>
                      <div className="mt-2 text-lg font-semibold text-zinc-100">{durationMin} min</div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Precio base</div>
                      <div className="mt-2 text-lg font-semibold text-zinc-100">{formatARS(basePrice)}</div>
                    </div>
                  </div>

                  {isDevs && !config ? (
                    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                      Esta sucursal todavia usa valores iniciales para esta disciplina dentro del catalogo operativo.
                    </div>
                  ) : null}

                  {isDevs ? (
                    <div className="mt-5 space-y-3 border-t border-zinc-800 pt-4">
                      <label className="flex items-center gap-2 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleEnabled(discipline.idDiscipline)}
                          className="accent-zinc-200"
                        />
                        Mostrar esta oferta en la sucursal activa
                      </label>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="number"
                          value={durationMin}
                          onChange={(event) =>
                            updateField(discipline.idDiscipline, {
                              durationMin: Number(event.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                          placeholder="Duracion"
                        />
                        <input
                          type="number"
                          value={basePrice}
                          onChange={(event) =>
                            updateField(discipline.idDiscipline, {
                              basePrice: Number(event.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                          placeholder="Precio"
                        />
                      </div>
                    </div>
                  ) : null}

                  <CardFooter className="mt-5 border-t border-zinc-800 px-0 pb-0 pt-4">
                    {rubroPathId ? (
                      <Link to={`/app/rubros/${rubroPathId}`} className="block w-full">
                        <Button size="sm" variant="primary" className="w-full" disabled={!canOpenAgenda}>
                          {isDevs ? "Ver agenda" : "Reservar"}
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="secondary" className="w-full" disabled>
                        Agenda no disponible
                      </Button>
                    )}
                  </CardFooter>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
