import { useEffect, useMemo, useState } from "react";
import type { Discipline, DisciplineConfig } from "./types";
import { loadBranchDisciplineConfig, saveBranchDisciplineConfig } from "./branchDisciplineStorage";

const NO_BRANCH = "__none__";

export function useBranchDisciplineConfig(branchId: number | string, disciplines: Discipline[]) {
  const safeBranchId = branchId ?? NO_BRANCH;

  const [hydrated, setHydrated] = useState(false);
  const [config, setConfig] = useState<DisciplineConfig[]>([]);

  // Hidrata cuando llegan disciplinas o cambia la sucursal activa.
  useEffect(() => {
    if (safeBranchId === NO_BRANCH || disciplines.length === 0) {
      setConfig([]);
      setHydrated(false);
      return;
    }

    const initial = loadBranchDisciplineConfig(safeBranchId, disciplines);
    setConfig(initial);
    setHydrated(true);
  }, [safeBranchId, disciplines]);

  // Persiste solo cuando ya hay una sucursal real hidratada.
  useEffect(() => {
    if (!hydrated) return;
    if (safeBranchId === NO_BRANCH) return;
    saveBranchDisciplineConfig(safeBranchId, config);
  }, [hydrated, config, safeBranchId]);

  const byId = useMemo(() => {
    const map = new Map<number, DisciplineConfig>();
    config.forEach((item) => map.set(item.idDiscipline, item));
    return map;
  }, [config]);

  function toggleEnabled(idDiscipline: number) {
    setConfig((prev) =>
      prev.map((item) => (item.idDiscipline === idDiscipline ? { ...item, enabled: !item.enabled } : item))
    );
  }

  function updateField(
    idDiscipline: number,
    patch: Partial<Pick<DisciplineConfig, "durationMin" | "basePrice">>
  ) {
    setConfig((prev) => prev.map((item) => (item.idDiscipline === idDiscipline ? { ...item, ...patch } : item)));
  }

  return { hydrated, config, byId, toggleEnabled, updateField };
}
