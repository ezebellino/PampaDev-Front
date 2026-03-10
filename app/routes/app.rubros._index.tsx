import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useAuth } from "../lib/auth/AuthContext";
import { useBranch } from "../lib/branches/BranchContext";
import { useBranchDisciplineConfig } from "../lib/disciplines/useBranchDisciplineConfig";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import { ROLES } from "../lib/auth/roles";

function formatARS(amount: number) {
  return `$ ${amount.toLocaleString("es-AR")}`;
}

export default function RubrosPage() {
  const { user } = useAuth();
  const isDevs = user?.role === ROLES.DEVS;

  const { branchId } = useBranch();
  const { disciplines, loading, error, refresh } = useDisciplines();

  const noBranch = "__none__" as const;
  const hasBranch = branchId !== null;
  const safeBranchId: number | string = branchId ?? noBranch;

  const { hydrated, byId, toggleEnabled, updateField } =
    useBranchDisciplineConfig(safeBranchId, disciplines);

  const hydratedSafe = hasBranch ? hydrated : false;

  if (loading) {
    return (
      <ScreenLoader
        title="Cargando rubros…"
        subtitle="Estamos preparando el catálogo disponible para esta operación."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Rubros"
          subtitle="No pudimos cargar el catálogo en este momento."
        />
        <Card>
          <CardContent className="space-y-3 py-6 text-sm">
            <div className="font-medium text-red-300">Ocurrió un problema al cargar los rubros.</div>
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
          subtitle="Elegí una sucursal para ver su catálogo, precios y configuración disponible."
        />
        <Card>
          <CardContent className="space-y-4 py-6 text-sm text-zinc-400">
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
      <ScreenLoader
        title="Cargando configuración…"
        subtitle="Estamos preparando la vista de esta sucursal."
      />
    );
  }

  const visible = isDevs
    ? disciplines
    : disciplines.filter((discipline) => byId.get(discipline.idDiscipline)?.enabled);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rubros"
        subtitle={`Catálogo disponible para la sucursal ${branchId}. Desde acá podés revisar visibilidad, duración y precio base.`}
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => void refresh()}>
              Actualizar
            </Button>
          </div>
        }
      />

      {isDevs ? (
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
          <div className="h-20 bg-[linear-gradient(135deg,rgba(34,197,94,0.12),transparent_55%)]" />
          <CardHeader className="-mt-6 relative">
            <CardTitle>Configuración por sucursal</CardTitle>
            <CardDescription>
              Controlá qué rubros están visibles y ajustá parámetros clave para esta sede.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-6 text-zinc-400">
              Cada rubro puede cambiar según la sucursal activa. Esto permite adaptar precios,
              duración y disponibilidad sin perder consistencia en el catálogo general.
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
                ? "Activá al menos un rubro para que quede disponible en esta sucursal."
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

            return (
              <article
                key={discipline.idDiscipline}
                className={`relative overflow-hidden rounded-[1.75rem] border bg-zinc-950/75 transition duration-200 ${
                  enabled
                    ? "border-zinc-800 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/75"
                    : "border-zinc-850 opacity-95"
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
                      <div className="text-sm text-zinc-500">Servicio #{discipline.idDiscipline}</div>
                    </div>
                    <Badge className="shrink-0 border-zinc-700 bg-zinc-900/80 text-zinc-300">
                      {enabled ? "✅ Visible" : "🚫 Oculto"}
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Duración</div>
                      <div className="mt-2 text-lg font-semibold text-zinc-100">{durationMin} min</div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/55 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Precio base</div>
                      <div className="mt-2 text-lg font-semibold text-zinc-100">{formatARS(basePrice)}</div>
                    </div>
                  </div>

                  {isDevs && !config ? (
                    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                      Esta sucursal todavía usa valores iniciales para este rubro.
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
                        Mostrar este rubro en la sucursal activa
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
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                          placeholder="Precio"
                        />
                      </div>
                    </div>
                  ) : null}

                  <CardFooter className="mt-5 flex flex-col gap-2 border-t border-zinc-800 px-0 pb-0 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link to={`/app/rubros/${discipline.idDiscipline}`} className="w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full"
                        disabled={!enabled && !isDevs}
                      >
                        Ver horarios
                      </Button>
                    </Link>

                    {!isDevs ? (
                      <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                        Reservar
                      </Button>
                    ) : null}
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
