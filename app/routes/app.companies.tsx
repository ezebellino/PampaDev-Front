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
    return <ScreenLoader title="Cargando empresas..." subtitle="Estamos preparando la estructura empresarial activa." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Empresas"
          subtitle="No pudimos cargar el catálogo de empresas en este momento."
          right={
            <Button variant="secondary" onClick={() => setCreateOpen(true)}>
              + Nueva empresa
            </Button>
          }
        />
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="space-y-3 py-6 text-sm text-rose-700">
            <div className="font-medium">Ocurrió un problema al cargar las empresas.</div>
            <div>{error.message}</div>
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
        subtitle="Gestioná la estructura empresarial activa de forma clara y simple."
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
              className={`relative overflow-hidden rounded-[1.75rem] border bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)] transition duration-200 ${
                active
                  ? "border-sky-300/70 shadow-[0_20px_50px_-38px_rgba(14,116,144,0.24)]"
                  : "border-stone-200 hover:-translate-y-1 hover:border-sky-200 hover:bg-[#f8fbff]"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.24),transparent_48%),linear-gradient(135deg,rgba(254,249,195,0.22),transparent_62%)]" />
              <div className="relative p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-slate-900">{company.fantasyName}</div>
                    <div className="text-sm text-slate-600">{company.tradeName}</div>
                  </div>
                  <Badge className="shrink-0 border-stone-200 bg-stone-100 text-slate-700">
                    #{company.idCompany}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-stone-500">Documento</div>
                    <div className="mt-1 text-slate-800">{company.cuitCuilDNI}</div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-stone-500">Ubicación</div>
                    <div className="mt-1 text-slate-800">{location || "Sin ubicación detallada"}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Creada {new Date(company.createdAt).toLocaleDateString("es-AR")}</span>
                    <span
                      className={`rounded-full px-3 py-1 ${
                        active
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border border-stone-200 bg-stone-100 text-stone-600"
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

