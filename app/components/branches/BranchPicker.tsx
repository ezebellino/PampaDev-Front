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

  const options: Branch[] = useMemo(() => {
    if (companyId == null) return [];
    return all.filter((branch) => branch.idCompany === companyId);
  }, [all, companyId]);

  const labelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const branch of options) {
      map.set(branch.idBranch, `${branch.companyName} · ${branch.cityName} (#${branch.idBranch})`);
    }
    return map;
  }, [options]);

  useEffect(() => {
    if (loading) return;
    if (companyId == null) return;

    const validIds = options.map((branch) => branch.idBranch);
    const before = branchId ?? null;

    setBranchIfValid(validIds);

    const afterExpected = before != null && validIds.includes(before) ? before : (validIds[0] ?? null);

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
  }, [loading, companyId, options, branchId, setBranchIfValid, labelById]);

  const value = useMemo(() => {
    return branchId ?? options[0]?.idBranch ?? "";
  }, [branchId, options]);

  if (loading) return <div className="text-xs text-zinc-500">Cargando sucursales…</div>;

  if (companyId == null) {
    return <div className="text-xs text-zinc-500">Elegí una empresa para ver sus sucursales.</div>;
  }

  if (options.length === 0) {
    return <div className="text-xs text-zinc-500">No hay sucursales disponibles para esta empresa.</div>;
  }

  return (
    <select
      value={value}
      onChange={(event) => {
        const id = Number(event.target.value);

        if (!Number.isFinite(id)) {
          logWarn(
            "Branch: invalid select value",
            { raw: event.target.value, companyId },
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
        "w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-cyan-500/40",
        className ?? "",
      ].join(" ")}
      aria-label="Sucursal activa"
    >
      {options.map((branch) => (
        <option key={branch.idBranch} value={branch.idBranch}>
          {branch.companyName} · {branch.cityName} (#{branch.idBranch})
        </option>
      ))}
    </select>
  );
}
