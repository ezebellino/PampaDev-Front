import { useState } from "react";
import CompanyForm, { type CompanyFormData } from "../components/companies/CompanyForm";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useCompanies } from "../lib/api/hooks/useCompanies";
import { useCompany } from "../lib/companies/CompanyContext";
import { logInfo } from "../lib/utils/logger";

export default function CompaniesRoute() {
  return (
    <Protected allowRoles={[ROLES.DEVS]}>
      <CompaniesPage />
    </Protected>
  );
}

function CompaniesPage() {
  const { data, loading, error, refresh, create } = useCompanies();
  const { companyId, setCompanyId } = useCompany();
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  async function handleCreate(data: CompanyFormData) {
    setCreateBusy(true);
    try {
      const company = await create(data);
      setCompanyId(company.idCompany);
      setCreateOpen(false);
      logInfo(
        "Company created via API",
        { idCompany: company.idCompany, fantasyName: company.fantasyName },
        { feature: "companies", layer: "ui" }
      );
    } catch (error: any) {
      alert(error?.message || "No se pudo crear la empresa.");
    } finally {
      setCreateBusy(false);
    }
  }

  if (loading) {
    return <ScreenLoader title="Cargando empresas�" subtitle="Estamos preparando la estructura empresarial activa." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Empresas"
          subtitle="No pudimos cargar el cat�logo de empresas en este momento."
          right={
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              + Nueva empresa
            </Button>
          }
        />
        <Card>
          <CardContent className="space-y-3 py-6 text-sm">
            <div className="font-medium text-red-300">Ocurri� un problema al cargar las empresas.</div>
            <div className="text-zinc-400">{error.message}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => void refresh()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Modal
          open={createOpen}
          title="Nueva empresa"
          onClose={() => {
            if (!createBusy) setCreateOpen(false);
          }}
        >
          <CompanyForm
            loading={createBusy}
            submitLabel="Crear empresa"
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
        title="Empresas"
        subtitle="Base empresarial de la plataforma."
        right={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => void refresh()}>
              Actualizar
            </Button>
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              + Nueva empresa
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {(data ?? []).map((company) => {
          const active = companyId === company.idCompany;
          const location = [company.cityName, company.provinceName, company.countryName].filter(Boolean).join(", ");

          return (
            <article
              key={company.idCompany}
              className={`relative overflow-hidden rounded-[1.75rem] border bg-zinc-950/75 transition duration-200 ${
                active
                  ? "border-cyan-400/40 shadow-[0_20px_50px_rgba(34,211,238,0.10)]"
                  : "border-zinc-800 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/75"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,rgba(34,197,94,0.12),transparent_55%)]" />
              <div className="relative p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-zinc-100">{company.fantasyName}</div>
                    <div className="text-sm text-zinc-400">{company.tradeName}</div>
                  </div>
                  <Badge className="shrink-0 border-zinc-700 bg-zinc-900/80 text-zinc-300">
                    #{company.idCompany}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm text-zinc-400">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-zinc-500">Documento</div>
                    <div className="mt-1 text-zinc-200">{company.cuitCuilDNI}</div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-zinc-500">Ubicaci�n</div>
                    <div className="mt-1 text-zinc-200">{location || "Sin ubicaci�n detallada"}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Creada {new Date(company.createdAt).toLocaleDateString("es-AR")}</span>
                    <span
                      className={`rounded-full px-3 py-1 ${
                        active
                          ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                          : "border border-zinc-800 bg-zinc-900/70 text-zinc-400"
                      }`}
                    >
                      {active ? "Empresa activa" : "Disponible"}
                    </span>
                  </div>
                </div>

                <Button
                  variant={active ? "primary" : "secondary"}
                  size="sm"
                  className="w-full"
                  onClick={() => setCompanyId(company.idCompany)}
                >
                  {active ? "Empresa activa" : "Usar empresa"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <Modal
        open={createOpen}
        title="Nueva empresa"
        onClose={() => {
          if (!createBusy) setCreateOpen(false);
        }}
      >
        <CompanyForm
          loading={createBusy}
          submitLabel="Crear empresa"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}

