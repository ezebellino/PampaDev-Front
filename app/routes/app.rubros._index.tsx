
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
        title="Cargando catálogo..."
        subtitle="Estamos preparando la oferta disponible para esta sucursal."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rubros" subtitle="No pudimos cargar el catálogo en este momento." />
        <Card>
          <CardContent className="space-y-3 py-6 text-sm">
            <div className="font-medium text-red-300">Ocurrió un problema al cargar los rubros.</div>
            <div className="text-stone-500">{error}</div>
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
          subtitle="Elige una sucursal para ver su catálogo operativo, precios base y visibilidad."
        />
        <Card>
          <CardContent className="space-y-4 py-6 text-sm text-stone-500">
            <p>No hay una sucursal activa seleccionada.</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/app/branches">
                <Button variant="secondary">Ver sucursales</Button>
              </Link>
              <Button variant="ghost" onClick={() => void refresh()}>
                Actualizar catálogo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hydratedSafe) {
    return (
      <ScreenLoader title="Cargando configuración..." subtitle="Estamos preparando la vista operativa de esta sucursal." />
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
        subtitle={`Catálogo operativo de la sucursal ${branchId}. Aquí administrás qué disciplinas base se muestran como oferta real en esta sede.`}
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => void refresh()}>
              Actualizar
            </Button>
          </div>
        }
      />

      <Card className="border-slate-200/70 bg-[linear-gradient(135deg,rgba(239,244,255,0.94),rgba(255,255,255,0.98)_44%,rgba(236,253,245,0.9)_100%)] shadow-[0_28px_80px_-48px_rgba(69,70,77,0.2)]">
        <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-700/75">Catálogo por sucursal</div>
            <div className="max-w-3xl text-2xl font-semibold leading-tight text-slate-900">
              Una disciplina base se convierte en rubro operativo cuando la sede define visibilidad, duración y precio.
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Esto ayuda a separar el catálogo general de disciplinas del comportamiento real de cada sucursal. La misma disciplina puede mostrarse distinta según la sede, sin duplicar el modelo base.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{enabledCount} visibles</Badge>
              <Badge tone="neutral">{customConfiguredCount} configuradas</Badge>
              <Badge tone="neutral">Promedio {averageDuration} min</Badge>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-slate-200 bg-white/88 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Sucursal activa</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">#{branchId}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/88 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Modo</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{isDevs ? "Configuración completa" : "Vista publicada"}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/88 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Enfoque</div>
              <div className="mt-2 text-sm font-medium text-slate-900">Oferta real por sede</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDevs ? (
        <Card className="overflow-hidden border-slate-200 bg-white/96">
          <div className="h-20 bg-[linear-gradient(135deg,rgba(34,197,94,0.12),transparent_55%)]" />
          <CardHeader className="relative -mt-6">
            <CardTitle>Cómo leer este módulo</CardTitle>
            <CardDescription>
              Aquí no creás disciplinas nuevas: ajustás cómo se publica cada disciplina dentro de la sucursal activa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-6 text-stone-500">
              Si necesitas ampliar el catálogo base, primero trabajas en Disciplinas o en Requests. Desde este panel defines la capa operativa: visibilidad, duración y precio base para esta sede.
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
                : "Todavía no hay servicios habilitados para esta sede."}
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
                className={`relative overflow-hidden rounded-[1.75rem] border bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)] transition duration-200 ${
                  enabled
                    ? "border-slate-200 hover:-translate-y-1 hover:border-sky-200 hover:bg-white"
                    : "border-slate-200 opacity-95"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-24 ${
                    enabled
                      ? "bg-[linear-gradient(135deg,rgba(224,242,254,0.9),transparent_55%)]"
                      : "bg-[linear-gradient(135deg,rgba(254,243,199,0.9),transparent_55%)]"
                  }`}
                />

                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-slate-900">{discipline.name}</div>
                      <div className="text-sm text-stone-500">Disciplina base #{discipline.idDiscipline}</div>
                    </div>
                    <Badge className="shrink-0 border-zinc-700 bg-zinc-900/80 text-slate-600">
                      {enabled ? "Visible" : "Oculto"}
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-stone-500">Duracion</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">{durationMin} min</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-stone-500">Precio base</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">{formatARS(basePrice)}</div>
                    </div>
                  </div>

                  {isDevs && !config ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                      Esta sucursal todavía usa valores iniciales para este rubro.
                    </div>
                  ) : null}

                  {isDevs ? (
                    <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleEnabled(discipline.idDiscipline)}
                          className="accent-sky-600"
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
                          className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                          placeholder="Duración"
                        />
                        <input
                          type="number"
                          value={basePrice}
                          onChange={(event) =>
                            updateField(discipline.idDiscipline, {
                              basePrice: Number(event.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                          placeholder="Precio"
                        />
                      </div>
                    </div>
                  ) : null}

                  <CardFooter className="mt-5 border-t border-slate-200 px-0 pb-0 pt-4">
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
