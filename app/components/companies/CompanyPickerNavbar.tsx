import { useEffect } from "react";
import { useCompanies } from "../../lib/api/hooks/useCompanies";
import BranchPicker from "../branches/BranchPicker";
import { useCompany } from "../../lib/companies/CompanyContext";
import { logWarn } from "../../lib/utils/logger";

export default function CompanyPickerNavbar() {
  const { data, loading } = useCompanies();
  const { companyId, setCompanyId } = useCompany();

  const options = data ?? [];

  useEffect(() => {
    if (loading) return;
    if (companyId != null) return;

    const first = options[0]?.idCompany;
    if (first != null) setCompanyId(first);
  }, [loading, companyId, options, setCompanyId]);

  if (loading) {
    return <div className="text-sm text-zinc-500">Cargando contexto…</div>;
  }

  if (options.length === 0) {
    return <div className="text-sm text-zinc-500">No hay empresas disponibles.</div>;
  }

  const value = companyId ?? options[0]?.idCompany ?? "";

  return (
    <div className="grid w-full gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      {options.length > 1 ? (
        <label className="block min-w-0">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-zinc-500">Empresa</span>
          <select
            value={value}
            onChange={(event) => {
              const id = Number(event.target.value);

              if (!Number.isFinite(id)) {
                logWarn(
                  "Company: invalid select value",
                  { raw: event.target.value },
                  { feature: "companies", layer: "ui" }
                );
                return;
              }

              if (companyId === id) return;
              setCompanyId(id);
            }}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-cyan-500/40"
            aria-label="Empresa activa"
          >
            {options.map((company) => (
              <option key={company.idCompany} value={company.idCompany}>
                {company.fantasyName} (#{company.idCompany})
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">Empresa</div>
          <div className="mt-1 truncate text-sm text-zinc-200">{options[0]?.fantasyName}</div>
        </div>
      )}

      <label className="block min-w-0">
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-zinc-500">Sucursal</span>
        <BranchPicker className="w-full" />
      </label>
    </div>
  );
}
