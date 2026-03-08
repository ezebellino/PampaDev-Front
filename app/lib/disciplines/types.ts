// app/lib/disciplines/types.ts
export type { Discipline } from "../api/services/disciplines";

export type DisciplineConfig = {
  idDiscipline: number;
  enabled: boolean;
  durationMin: number;
  basePrice: number;
};
