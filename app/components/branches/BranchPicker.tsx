import { useEffect, useMemo } from "react";
import { useBranches } from "../../lib/api/hooks/useBranches";
import type { Branch } from "../../lib/api/models/branch";
import { useBranch } from "../../lib/branches/BranchContext";
import { useCompany } from "../../lib/companies/CompanyContext";
import { logInfo, logWarn } from "../../lib/utils/logger";

type Props = {
  onPick?: () => void;
  className?: string;
};

export default function BranchPicker({ onPick, className }: Props) {
  const { data: branches, loading } = useBranches();
  const { branchId, setBranchId, setBranchIfValid } = useBranch();
  const { companyId } = useCompany();

  const all: Branch[] = branches ?? [];

  // 👇 Filtramos por companyId; si no hay company aún, no mostramos nada
  const options: Branch[] = useMemo(() => {
    if (companyId == null) return [];
    return all.filter((b) => b.idCompany === companyId);
  }, [all, companyId]);

  const labelById = useMemo(() => {
    const m = new Map<number, string>();
    for (const b of options) {
      m.set(b.idBranch, `${b.companyName} · ${b.cityName} (#${b.idBranch})`);
    }
    return m;
  }, [options]);

  // ✅ Auto-fix: cuando cambia company o cargan branches, validamos branchId
  useEffect(() => {
    if (loading) return;
    if (companyId == null) return;

    const validIds = options.map((b) => b.idBranch);
    const before = branchId ?? null;

    // ajusta el branchId si no está dentro de los válidos
    setBranchIfValid(validIds);

    // si antes era inválida, el "after esperado" es el primer válido o null
    const afterExpected =
      before != null && validIds.includes(before) ? before : (validIds[0] ?? null);

    if (before !== afterExpected) {
      logInfo(
        "Branch: auto-fixed for company",
        {
          companyId,
          from: before,
          to: afterExpected,
          toLabel: afterExpected != null ? labelById.get(afterExpected) : null,
          reason: "branchId not valid for selected company",
        },
        { feature: "branches", layer: "ui" }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, companyId, options]);

  const value = useMemo(() => {
    return branchId ?? options[0]?.idBranch ?? "";
  }, [branchId, options]);

  if (loading) return <div className="text-xs text-zinc-500">Cargando sucursales…</div>;

  if (companyId == null) {
    return <div className="text-xs text-zinc-500">Seleccioná una company…</div>;
  }

  if (options.length === 0) {
    return <div className="text-xs text-zinc-500">Sin sucursales para esta company</div>;
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        const id = Number(e.target.value);

        if (!Number.isFinite(id)) {
          logWarn(
            "Branch: invalid select value",
            { raw: e.target.value, companyId },
            { feature: "branches", layer: "ui" }
          );
          return;
        }
        if (branchId === id) return;

        const from = branchId ?? null;
        setBranchId(id);

        logInfo(
          "Branch: changed by user",
          {
            companyId,
            from,
            fromLabel: from != null ? labelById.get(from) : null,
            to: id,
            toLabel: labelById.get(id),
          },
          { feature: "branches", layer: "ui" }
        );

        onPick?.();
      }}
      className={[
        "rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600",
        className ?? "",
      ].join(" ")}
      aria-label="Sucursal activa"
    >
      {options.map((b) => (
        <option key={b.idBranch} value={b.idBranch}>
          {b.companyName} · {b.cityName} (#{b.idBranch})
        </option>
      ))}
    </select>
  );
}