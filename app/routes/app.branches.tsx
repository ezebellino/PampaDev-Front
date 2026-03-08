import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useBranch } from "../lib/branches/BranchContext";
import { Button } from "~/components/ui/Button";
import ScreenLoader from "../components/ui/ScreenLoader";

export default function BranchesPage() {
  const { data, loading, error } = useBranches();
  const { branchId, setBranchId } = useBranch();

  // ✅ Loader pantalla completa
  if (loading) {
    return <ScreenLoader label="Cargando sucursales desde la API…" />;
  }

  // ✅ Error consistente
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sucursales" subtitle="Datos reales desde la API (GET /api/Branches)." />
        <Card>
          <CardHeader>
            <CardTitle>Error al cargar</CardTitle>
            <CardDescription className="text-zinc-400">
              Status: {error.status} — {error.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-400">
            Tip: si querés botón “Reintentar”, hacemos que useBranches exponga refresh().
          </CardContent>
        </Card>
      </div>
    );
  }

  if ((data?.length ?? 0) === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sucursales" subtitle="Datos reales desde la API (GET /api/Branches)." />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">
            No hay sucursales todavía.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sucursales"
        subtitle="Datos reales desde la API (GET /api/Branches)."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data!.map((b) => {
          const active = branchId === b.idBranch;
          return (
            <Card
              key={b.idBranch}
              className={`hover:bg-zinc-900/35 transition ${active ? "ring-2 ring-zinc-500" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{b.companyName}</CardTitle>
                    <CardDescription>{b.cityName}</CardDescription>
                  </div>
                  <Badge className="shrink-0">#{b.idBranch}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="text-sm text-zinc-300">{b.address}</div>
                <div className="text-sm text-zinc-400">{b.description}</div>
                <div className="text-xs text-zinc-500">
                  Creado: {new Date(b.createdAt).toLocaleString("es-AR")}
                </div>

                <Button
                  variant={active ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setBranchId(b.idBranch)}
                >
                  {active ? "✅ Sucursal activa" : "Usar esta sucursal"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}