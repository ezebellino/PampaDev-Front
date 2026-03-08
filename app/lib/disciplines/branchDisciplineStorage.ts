// app/lib/disciplines/branchDisciplineStorage.ts
import type { Discipline, DisciplineConfig } from "./types";

function key(branchId: number | string) {
  return `pampadev:branch-discipline-config:v1:${branchId}`;
}

const DEFAULTS = {
  enabled: true,
  durationMin: 60,
  basePrice: 0,
};

export function loadBranchDisciplineConfig(
  branchId: number | string,
  disciplines: Discipline[]
): DisciplineConfig[] {
  let stored: DisciplineConfig[] = [];
  try {
    const raw = localStorage.getItem(key(branchId));
    if (raw) stored = JSON.parse(raw) as DisciplineConfig[];
  } catch {
    stored = [];
  }

  const byId = new Map<number, DisciplineConfig>();
  stored.forEach((c) => byId.set(c.idDiscipline, c));

  // ✅ merge: mantené lo guardado y agregá lo que falta
  const merged = disciplines.map((d) => {
    const existing = byId.get(d.idDiscipline);
    return (
      existing ?? {
        idDiscipline: d.idDiscipline,
        ...DEFAULTS,
      }
    );
  });

  return merged;
}

export function saveBranchDisciplineConfig(branchId: number | string, config: DisciplineConfig[]) {
  localStorage.setItem(key(branchId), JSON.stringify(config));
}
