import { Link } from "react-router";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";

import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import ScreenLoader from "../components/ui/ScreenLoader";

import { useDisciplines } from "../lib/disciplines/useDisciplines";
import { useBranchDisciplineConfig } from "../lib/disciplines/useBranchDisciplineConfig";
import { useBranch } from "../lib/branches/BranchContext";

function formatARS(n: number) {
  return `$ ${n.toLocaleString("es-AR")}`;
}

export default function RubrosPage() {
  const { user } = useAuth();
  const isDevs = user?.role === ROLES.DEVS;

  const { branchId } = useBranch();
  const { disciplines, loading, error, refresh } = useDisciplines();

  // ✅ Sentinel estable para no romper types ni Rules of Hooks
  const NO_BRANCH = "__none__" as const;

  const hasBranch = branchId !== null;
  const safeBranchId: number | string = branchId ?? NO_BRANCH;

  // ✅ Hook SIEMPRE se ejecuta (nunca condicional)
  const { hydrated, byId, toggleEnabled, updateField } =
    useBranchDisciplineConfig(safeBranchId, disciplines);

  // ✅ Cuando no hay branch real, tratamos como no hidratado
  const hydratedSafe = hasBranch ? hydrated : false;

  /* ---------------------------
     LOADERS / ERRORES
  --------------------------- */

  // 1) Loader API
  if (loading) {
    return <ScreenLoader label="Cargando rubros (Disciplines) desde la API…" />;
  }

  // 2) Error API
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rubros" subtitle="Error cargando disciplines" />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-300">
            <div className="text-red-300">{error}</div>
            <div className="mt-3">
              <Button variant="secondary" onClick={refresh}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3) No branch seleccionado (necesario para configurar/habilitar por sucursal)
  if (!hasBranch) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rubros" subtitle="Elegí una sucursal para ver y configurar rubros." />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">
            No hay sucursal seleccionada.
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/app/branches">
                <Button variant="secondary">Ver sucursales</Button>
              </Link>
              <Button variant="ghost" onClick={refresh}>↻ Refrescar Disciplines</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4) Loader hidratación local (config por sucursal)
  if (!hydratedSafe) {
    return <ScreenLoader label="Cargando configuración por sucursal (localStorage)…" />;
  }

  /* ---------------------------
     LISTA VISIBLE
  --------------------------- */

  // Visible list: solo enabled (para no-dev)
  const visible = isDevs
    ? disciplines
    : disciplines.filter((d) => byId.get(d.idDiscipline)?.enabled);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rubros"
        subtitle={`Catálogo real desde backend (Disciplines) · Branch ${branchId}`}
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={refresh}>↻ Refrescar API</Button>
          </div>
        }
      />

      {isDevs && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración por sucursal (mock)</CardTitle>
            <CardDescription>
              Esto simula la entidad futura BranchDiscipline: habilitado, duración y precio por sucursal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-zinc-400">
              Tip: si el backend cambia, seguís mostrando Disciplines, y solo migrás esta config al endpoint real.
            </div>
          </CardContent>
        </Card>
      )}

      {visible.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay rubros habilitados</CardTitle>
            <CardDescription>
              {isDevs ? "Habilitá al menos uno desde el panel por sucursal." : "Contactá al administrador."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((d) => {
            const cfg = byId.get(d.idDiscipline);

            // ✅ defaults razonables para cuando falta config
            const enabled = cfg?.enabled ?? (isDevs ? true : false);
            const durationMin = cfg?.durationMin ?? 60;
            const basePrice = cfg?.basePrice ?? 0;

            return (
              <Card key={d.idDiscipline} className="hover:bg-zinc-900/35 transition">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{d.name}</CardTitle>
                      <CardDescription>Discipline #{d.idDiscipline}</CardDescription>
                    </div>
                    <Badge className="shrink-0">{enabled ? "✅ Habilitado" : "🚫 Oculto"}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-zinc-400">Duración</div>
                    <div className="text-sm font-medium">{durationMin} min</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-zinc-400">Precio base</div>
                    <div className="text-base font-semibold">{formatARS(basePrice)}</div>
                  </div>

                  {isDevs && !cfg && (
                    <div className="text-xs text-amber-300">Config missing: usando defaults</div>
                  )}

                  {isDevs && (
                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleEnabled(d.idDiscipline)}
                          className="accent-zinc-200"
                        />
                        Habilitado en esta sucursal
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={durationMin}
                          onChange={(e) =>
                            updateField(d.idDiscipline, { durationMin: Number(e.target.value) })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                          placeholder="Duración"
                        />
                        <input
                          type="number"
                          value={basePrice}
                          onChange={(e) =>
                            updateField(d.idDiscipline, { basePrice: Number(e.target.value) })
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                          placeholder="Precio"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-3">
                  <Link to={`/app/rubros/${d.idDiscipline}`} className="w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full"
                      disabled={!enabled && !isDevs}
                    >
                      Ver horarios
                    </Button>
                  </Link>

                  {!isDevs && (
                    <Button size="sm" variant="secondary">Reservar</Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}