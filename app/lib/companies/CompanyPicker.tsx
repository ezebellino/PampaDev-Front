import { useEffect, useMemo } from "react";
import { useCompany } from "../../lib/companies/CompanyContext";
import { apiGet } from "../../lib/api/api";
import { useState } from "react";
import { logWarn } from "../../lib/utils/logger";

type Company = {
  idCompany: number;
  fantasyName: string;
  tradeName: string;
  cuitCuilDNI: string;
  createdAt: string;
};

type Props = {
  onPick?: () => void;     // opcional: cerrar drawer
  className?: string;
  hideIfSingle?: boolean; // opcional: si solo hay 1 company, ocultar select
};

function useCompanies() {
  const [data, setData] = useState<Company[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);

    apiGet<Company[]>("/api/Companies", ctrl.signal)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, []);

  return { data, loading };
}

export default function CompanyPicker({ onPick, className, hideIfSingle = false }: Props) {
  const { data: companies, loading } = useCompanies();
  const { companyId, setCompanyId } = useCompany();

  const options = companies ?? [];

  const labelById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of options) {
      m.set(c.idCompany, `${c.fantasyName} (#${c.idCompany})`);
    }
    return m;
  }, [options]);

  // Auto-select inicial si no hay companyId
  useEffect(() => {
    if (loading) return;
    if (companyId != null) return;

    const first = options[0]?.idCompany;
    if (first == null) return;

    setCompanyId(first);
    // Nota: logInfo no persiste (decisión A). Si querés persistir, usá warning.
    // Por ahora, no spam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, companyId, options, setCompanyId]);

  const value = useMemo(() => {
    return companyId ?? options[0]?.idCompany ?? "";
  }, [companyId, options]);

  if (loading) return <div className="text-xs text-zinc-500">Cargando empresas…</div>;
  if (options.length === 0) return <div className="text-xs text-zinc-500">Sin empresas</div>;

  if (hideIfSingle && options.length === 1) {
    const c = options[0];
    return (
      <div className={["text-sm text-zinc-200", className ?? ""].join(" ")}>
        {c.fantasyName} <span className="text-zinc-500">#{c.idCompany}</span>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        const id = Number(e.target.value);

        if (!Number.isFinite(id)) {
          logWarn("Company: invalid select value", { raw: e.target.value }, { layer: "ui", feature: "companies" });
          return;
        }
        if (companyId === id) return;

        setCompanyId(id);
        onPick?.();
      }}
      className={[
        "rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600",
        className ?? "",
      ].join(" ")}
      aria-label="Empresa activa"
    >
      {options.map((c) => (
        <option key={c.idCompany} value={c.idCompany}>
          {labelById.get(c.idCompany)}
        </option>
      ))}
    </select>
  );
}