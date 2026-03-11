export const SLOT_DURATION_OPTIONS = [150, 120, 90, 60, 30] as const;
export type SlotDuration = (typeof SLOT_DURATION_OPTIONS)[number];
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DaySchedule = {
  closed: boolean;
  reason: string;
};

export type DisciplineScheduleConfig = {
  idDiscipline: number;
  enabled: boolean;
  openTime: string;
  closeTime: string;
  slotDuration: SlotDuration;
  notes: string;
};

export type BranchScheduleConfig = {
  branchId: number | string;
  days: Record<Weekday, DaySchedule>;
  disciplines: DisciplineScheduleConfig[];
  updatedAt?: string;
};
