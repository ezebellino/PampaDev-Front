import { useMemo, useState } from "react";
import BranchForm, { type BranchFormData } from "../components/branches/BranchForm";
import { Badge } from "../components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { logInfo } from "../lib/utils/logger";

export default function BranchesPage() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { data, loading, error, refresh, create } = useBranches();
  const { branchId, setBranchId } = useBranch();
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  const isDev = user?.role === ROLES.DEVS;
  const initialFormData = useMemo<Partial<BranchFormData>>(
    () => ({
      companyName: companyId ? `Empresa ${companyId}` : "",
    }),
    [companyId]
  );

  async function handleCreate(data: BranchFormData) {
    if (!companyId) {
      alert("Elegí primero una empresa activa para crear la sucursal.");
      return;
    }

    setCreateBusy(true);
    try {
      const branch = await create({
        ...data,
        idCompany: companyId,
      });

      setBranchId(branch.idBranch);
      setCreateOpen(false);
      logInfo(
        "Branch created locally",
        { idBranch: branch.idBranch, cityName: branch.cityName },
        { feature: "branches", layer: "ui" }
      );
    } catch (error: any) {
      alert(error?.message || "No se pudo crear la sucursal.");
    } finally {
      setCreateBusy(false);
    }
  }

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
          right={
            isDev ? (
              <Button variant="secondary" onClick={() => setCreateOpen(true)} disabled={!companyId}>
                + Nueva sucursal
              </Button>
            ) : undefined
          }
        />
        <Card>
          <CardContent className="space-y-4 py-6 text-sm text-zinc-400">
            <div>Cuando exista al menos una sucursal, vas a poder seleccionarla desde acá.</div>
            {isDev ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                {companyId
                  ? "Podés crear la primera sucursal desde este mismo panel."
                  : "Elegí una empresa activa para habilitar el alta de sucursales."}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Modal
          open={createOpen}
          title="Nueva sucursal"
          onClose={() => {
            if (!createBusy) setCreateOpen(false);
          }}
        >
          <BranchForm
            initialData={initialFormData}
            loading={createBusy}
            submitLabel="Crear sucursal"
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sucursales"
        subtitle="Elegí la sede activa para filtrar la operación, los rubros y la configuración disponible."
        right={
          isDev ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={() => void refresh()}>
                Actualizar
              </Button>
              <Button variant="secondary" onClick={() => setCreateOpen(true)} disabled={!companyId}>
                + Nueva sucursal
              </Button>
            </div>
          ) : undefined
        }
      />

      {isDev && !companyId ? (
        <Card>
          <CardContent className="py-4 text-sm text-zinc-400">
            Elegí primero una empresa activa para habilitar el alta de nuevas sucursales.
          </CardContent>
        </Card>
      ) : null}

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

      <Modal
        open={createOpen}
        title="Nueva sucursal"
        onClose={() => {
          if (!createBusy) setCreateOpen(false);
        }}
      >
        <BranchForm
          initialData={initialFormData}
          loading={createBusy}
          submitLabel="Crear sucursal"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
