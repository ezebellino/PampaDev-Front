// app/lib/disciplines/useBranchDisciplineConfig.ts
import { useEffect, useMemo, useState } from "react";
import type { Discipline, DisciplineConfig } from "./types";
import { loadBranchDisciplineConfig, saveBranchDisciplineConfig } from "./branchDisciplineStorage";

const NO_BRANCH = "__none__";

export function useBranchDisciplineConfig(branchId: number | string, disciplines: Discipline[]) {
  const safeBranchId = branchId ?? NO_BRANCH;

  const [hydrated, setHydrated] = useState(false);
  const [config, setConfig] = useState<DisciplineConfig[]>([]);

  // hidratar cuando llegan disciplines o cambia branch
  useEffect(() => {
    // modo “desactivado”: no hay branch válido o no hay disciplines todavía
    if (safeBranchId === NO_BRANCH || disciplines.length === 0) {
      setConfig([]);
      setHydrated(false);
      return;
    }

    const initial = loadBranchDisciplineConfig(safeBranchId, disciplines);
    setConfig(initial);
    setHydrated(true);
  }, [safeBranchId, disciplines]);

  // persistir solo si está hidratado y hay branch real
  useEffect(() => {
    if (!hydrated) return;
    if (safeBranchId === NO_BRANCH) return;
    saveBranchDisciplineConfig(safeBranchId, config);
  }, [hydrated, config, safeBranchId]);

  const byId = useMemo(() => {
    const m = new Map<number, DisciplineConfig>();
    config.forEach((c) => m.set(c.idDiscipline, c));
    return m;
  }, [config]);

  function toggleEnabled(idDiscipline: number) {
    setConfig((prev) =>
      prev.map((c) => (c.idDiscipline === idDiscipline ? { ...c, enabled: !c.enabled } : c))
    );
  }

  function updateField(
    idDiscipline: number,
    patch: Partial<Pick<DisciplineConfig, "durationMin" | "basePrice">>
  ) {
    setConfig((prev) => prev.map((c) => (c.idDiscipline === idDiscipline ? { ...c, ...patch } : c)));
  }

  return { hydrated, config, byId, toggleEnabled, updateField };
}