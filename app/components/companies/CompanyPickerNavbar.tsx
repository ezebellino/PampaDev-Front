import { useEffect } from "react";
import { useCompanies } from "../../lib/api/hooks/useCompanies";
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

  if (loading) return null;
  if (options.length <= 1) return null;

  const value = companyId ?? options[0]?.idCompany ?? "";

  return (
    <select
      value={value}
      onChange={(e) => {
        const id = Number(e.target.value);

        if (!Number.isFinite(id)) {
          logWarn("Company: invalid select value", { raw: e.target.value }, { feature: "companies", layer: "ui" });
          return;
        }
        if (companyId === id) return;

        setCompanyId(id);
      }}
      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600"
      aria-label="Empresa activa"
    >
      {options.map((c) => (
        <option key={c.idCompany} value={c.idCompany}>
          {c.fantasyName} (#{c.idCompany})
        </option>
      ))}
    </select>
  );
}