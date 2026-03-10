import { useEffect, useMemo } from "react";
import { useCompanies } from "../api/hooks/useCompanies";
import { useCompany } from "./CompanyContext";
import { logWarn } from "../utils/logger";

type Props = {
  onPick?: () => void;
  className?: string;
  hideIfSingle?: boolean;
};

export default function CompanyPicker({ onPick, className, hideIfSingle = false }: Props) {
  const { data: companies, loading } = useCompanies();
  const { companyId, setCompanyId } = useCompany();

  const options = companies ?? [];

  const labelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const company of options) {
      map.set(company.idCompany, `${company.fantasyName} (#${company.idCompany})`);
    }
    return map;
  }, [options]);

  useEffect(() => {
    if (loading) return;
    if (companyId != null) return;

    const first = options[0]?.idCompany;
    if (first == null) return;

    setCompanyId(first);
  }, [loading, companyId, options, setCompanyId]);

  const value = useMemo(() => {
    return companyId ?? options[0]?.idCompany ?? "";
  }, [companyId, options]);

  if (loading) return <div className="text-xs text-zinc-500">Cargando empresas…</div>;
  if (options.length === 0) return <div className="text-xs text-zinc-500">No hay empresas disponibles.</div>;

  if (hideIfSingle && options.length === 1) {
    const company = options[0];
    return (
      <div className={["text-sm text-zinc-200", className ?? ""].join(" ")}>
        {company.fantasyName} <span className="text-zinc-500">#{company.idCompany}</span>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(event) => {
        const id = Number(event.target.value);

        if (!Number.isFinite(id)) {
          logWarn("Company: invalid select value", { raw: event.target.value }, { layer: "ui", feature: "companies" });
          return;
        }

        if (companyId === id) return;

        setCompanyId(id);
        onPick?.();
      }}
      className={[
        "w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-cyan-500/40",
        className ?? "",
      ].join(" ")}
      aria-label="Empresa activa"
    >
      {options.map((company) => (
        <option key={company.idCompany} value={company.idCompany}>
          {labelById.get(company.idCompany)}
        </option>
      ))}
    </select>
  );
}
