import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import BranchForm, { type BranchFormData } from "../components/branches/BranchForm";
import { Badge } from "../components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useCompanies } from "../lib/api/hooks/useCompanies";
import { getCities, type City } from "../lib/api/services/locations";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { logInfo } from "../lib/utils/logger";

export default function BranchesPage() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { data, loading, error, refresh, create, mode } = useBranches();
  const { data: companies } = useCompanies();
  const { branchId, setBranchId } = useBranch();
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const isDev = user?.role === ROLES.DEVS;
  const activeCompany = useMemo(
    () => (companies ?? []).find((company) => company.idCompany === companyId) ?? null,
    [companies, companyId]
  );
  const visibleBranches = useMemo(() => {
    const all = data ?? [];
    if (companyId == null) return all;
    return all.filter((branch) => branch.idCompany === companyId);
  }, [data, companyId]);

  useEffect(() => {
    let alive = true;

    setCitiesLoading(true);
    getCities()
      .then((items) => {
        if (!alive) return;
        setCities(items);
      })
      .catch(() => {
        if (!alive) return;
        setCities([]);
      })
      .finally(() => {
        if (!alive) return;
        setCitiesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function handleCreate(data: BranchFormData) {
    if (!companyId || !activeCompany) {
      alert("Elegí primero una empresa activa para crear la sucursal.");
      return;
    }

    setCreateBusy(true);
    try {
      const city = cities.find((item) => item.idCity === data.idCity);
      const branch = await create({
        address: data.address,
        description: data.description,
        idCity: data.idCity,
        cityName: city?.name ?? `Ciudad ${data.idCity}`,
        companyName: activeCompany.fantasyName,
        idCompany: companyId,
      });

      setBranchId(branch.idBranch);
      setCreateOpen(false);
      logInfo(
        mode === "api" ? "Branch created via API" : "Branch created in local fallback",
        { idBranch: branch.idBranch, cityName: branch.cityName, idCompany: branch.idCompany },
        { feature: "branches", layer: "ui" }
      );
    } catch (createError: any) {
      alert(createError?.message || "No se pudo crear la sucursal.");
    } finally {
      setCreateBusy(false);
    }
  }

  if (loading) {
    return <ScreenLoader title="Cargando sucursales..." subtitle="Estamos preparando tu red de operación." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Sucursales"
          subtitle="No pudimos cargar las sucursales."
          right={
            isDev ? (
              <Button variant="secondary" onClick={() => setCreateOpen(true)} disabled={!activeCompany || citiesLoading || cities.length === 0}>
                + Nueva sucursal
              </Button>
            ) : undefined
          }
        />
        <Card>
          <CardContent className="space-y-3 py-6">
            <div className="text-sm font-medium text-rose-700">No pudimos cargar las sucursales.</div>
            <div className="text-sm text-slate-600">{error.message}</div>
            {!activeCompany ? (
              <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-600">
                Elegí una empresa activa para habilitar el alta de sucursales.
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
            companyName={activeCompany?.fantasyName}
            cities={cities}
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
        subtitle={
          activeCompany
            ? `Estás viendo las sucursales vinculadas a ${activeCompany.fantasyName}.`
            : "Elegí una empresa activa para filtrar la operación y crear nuevas sucursales."
        }
        right={
          isDev ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={() => void refresh()}>
                Actualizar
              </Button>
              <Button variant="secondary" onClick={() => setCreateOpen(true)} disabled={!activeCompany || citiesLoading || cities.length === 0}>
                + Nueva sucursal
              </Button>
            </div>
          ) : undefined
        }
      />

      {mode === "local-fallback" ? (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardContent className="py-4 text-sm text-amber-100">
            La API de sucursales no está disponible ahora mismo. Seguimos operando con el catálogo local para no bloquear la gestión.
          </CardContent>
        </Card>
      ) : null}

      {!activeCompany ? (
        <Card>
          <CardContent className="space-y-3 py-5 text-sm text-slate-600">
            <div>Seleccion? una empresa activa para ver sus sucursales.</div>
            <div className="flex flex-wrap gap-2">
              <Link to="/app/companies" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-[#eff4ff]">
                Ir a empresas
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeCompany && visibleBranches.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 py-6 text-sm text-slate-600">
            <div>No hay sucursales cargadas para esta empresa todavía.</div>
            {isDev ? (
              <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                Podés crear la primera sucursal para {activeCompany.fantasyName} desde este mismo panel.
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {visibleBranches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleBranches.map((branch) => {
            const active = branchId === branch.idBranch;

            return (
              <article
                key={branch.idBranch}
                className={`relative overflow-hidden rounded-[1.75rem] border bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)] transition duration-200 ${
                  active
                    ? "border-sky-200 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]"
                    : "border-slate-200 hover:-translate-y-1 hover:border-sky-200 hover:bg-white"
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,rgba(224,242,254,0.9),transparent_55%)]" />
                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-slate-900">{branch.companyName}</div>
                      <div className="text-sm text-slate-600">{branch.cityName}</div>
                    </div>
                    <Badge className="shrink-0 border-slate-200 bg-stone-50 text-slate-700">
                      #{branch.idBranch}
                    </Badge>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-700">
                      {branch.address}
                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {branch.description || "Esta sucursal ya está lista para usarse dentro del flujo operativo."}
                    </p>

                    <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
                      <span>Creada {new Date(branch.createdAt).toLocaleDateString("es-AR")}</span>
                      <span
                        className={`rounded-full px-3 py-1 ${
                          active
                            ? "border border-sky-200 bg-[#eff4ff] text-sky-700"
                            : "border border-slate-200 bg-stone-50 text-slate-700"
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
      ) : null}

      <Modal
        open={createOpen}
        title="Nueva sucursal"
        onClose={() => {
          if (!createBusy) setCreateOpen(false);
        }}
      >
        <BranchForm
          companyName={activeCompany?.fantasyName}
          cities={cities}
          loading={createBusy}
          submitLabel="Crear sucursal"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
