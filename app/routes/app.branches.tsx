import { Badge } from "../components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useBranch } from "../lib/branches/BranchContext";

export default function BranchesPage() {
  const { data, loading, error } = useBranches();
  const { branchId, setBranchId } = useBranch();

  if (loading) {
    return <ScreenLoader title="Cargando sucursales…" subtitle="Estamos preparando tu red de operación." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sucursales"
          subtitle="Elegí desde qué sede querés trabajar y mantené el contexto de operación siempre visible."
        />
        <Card>
          <CardContent className="space-y-3 py-6">
            <div className="text-sm font-medium text-red-300">No pudimos cargar las sucursales.</div>
            <div className="text-sm text-zinc-400">{error.message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if ((data?.length ?? 0) === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sucursales"
          subtitle="Todavía no hay sedes configuradas para operar desde este entorno."
        />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">
            Cuando exista al menos una sucursal, vas a poder seleccionarla desde acá.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sucursales"
        subtitle="Elegí la sede activa para filtrar la operación, los rubros y la configuración disponible."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data!.map((branch) => {
          const active = branchId === branch.idBranch;

          return (
            <article
              key={branch.idBranch}
              className={`relative overflow-hidden rounded-[1.75rem] border bg-zinc-950/70 transition duration-200 ${
                active
                  ? "border-cyan-400/40 shadow-[0_20px_50px_rgba(34,211,238,0.10)]"
                  : "border-zinc-800 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,rgba(56,189,248,0.14),transparent_55%)]" />
              <div className="relative p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-zinc-100">{branch.companyName}</div>
                    <div className="text-sm text-zinc-400">{branch.cityName}</div>
                  </div>
                  <Badge className="shrink-0 border-zinc-700 bg-zinc-900/80 text-zinc-300">
                    #{branch.idBranch}
                  </Badge>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300">
                    {branch.address}
                  </div>

                  <p className="text-sm leading-6 text-zinc-400">
                    {branch.description || "Esta sucursal ya está lista para usarse dentro del flujo operativo."}
                  </p>

                  <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
                    <span>Creada {new Date(branch.createdAt).toLocaleDateString("es-AR")}</span>
                    <span
                      className={`rounded-full px-3 py-1 ${
                        active
                          ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                          : "border border-zinc-800 bg-zinc-900/70 text-zinc-400"
                      }`}
                    >
                      {active ? "Sucursal activa" : "Disponible"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant={active ? "primary" : "secondary"}
                    size="sm"
                    className="w-full"
                    onClick={() => setBranchId(branch.idBranch)}
                  >
                    {active ? "Trabajando en esta sucursal" : "Usar esta sucursal"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
