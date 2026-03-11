import type { Discipline } from "../api/services/disciplines";
import type { BranchScheduleConfig, DaySchedule, DisciplineScheduleConfig, Weekday } from "./types";

function key(branchId: number | string) {
  return `pampadev:branch-schedule-config:v1:${branchId}`;
}

const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

const DEFAULT_DAY: DaySchedule = {
  closed: false,
  reason: "",
};

const DEFAULT_DISCIPLINE: Omit<DisciplineScheduleConfig, "idDiscipline"> = {
  enabled: true,
  openTime: "08:00",
  closeTime: "00:00",
  slotDuration: 60,
  notes: "",
};

function createDefaultDays(): Record<Weekday, DaySchedule> {
  return {
    0: { ...DEFAULT_DAY },
    1: { ...DEFAULT_DAY },
    2: { ...DEFAULT_DAY },
    3: { ...DEFAULT_DAY },
    4: { ...DEFAULT_DAY },
    5: { ...DEFAULT_DAY },
    6: { ...DEFAULT_DAY },
  };
}

export function createDefaultBranchScheduleConfig(
  branchId: number | string,
  disciplines: Discipline[]
): BranchScheduleConfig {
  return {
    branchId,
    days: createDefaultDays(),
    disciplines: disciplines.map((discipline) => ({
      idDiscipline: discipline.idDiscipline,
      ...DEFAULT_DISCIPLINE,
    })),
  };
}

export function loadBranchScheduleConfig(
  branchId: number | string,
  disciplines: Discipline[]
): BranchScheduleConfig {
  const fallback = createDefaultBranchScheduleConfig(branchId, disciplines);

  try {
    const raw = localStorage.getItem(key(branchId));
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<BranchScheduleConfig>;

    const storedDays = (parsed.days ?? {}) as Partial<Record<Weekday, Partial<DaySchedule>>>;
    const mergedDays = { ...fallback.days };

    WEEKDAYS.forEach((day) => {
      const current = storedDays[day];
      mergedDays[day] = {
        closed: Boolean(current?.closed),
        reason: typeof current?.reason === "string" ? current.reason : "",
      };
    });

    const storedDisciplineMap = new Map<number, Partial<DisciplineScheduleConfig>>();
    if (Array.isArray(parsed.disciplines)) {
      parsed.disciplines.forEach((item) => {
        if (typeof item?.idDiscipline === "number") {
          storedDisciplineMap.set(item.idDiscipline, item);
        }
      });
    }

    return {
      branchId,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
      days: mergedDays,
      disciplines: disciplines.map((discipline) => {
        const stored = storedDisciplineMap.get(discipline.idDiscipline);
        return {
          idDiscipline: discipline.idDiscipline,
          enabled: stored?.enabled ?? DEFAULT_DISCIPLINE.enabled,
          openTime: typeof stored?.openTime === "string" ? stored.openTime : DEFAULT_DISCIPLINE.openTime,
          closeTime: typeof stored?.closeTime === "string" ? stored.closeTime : DEFAULT_DISCIPLINE.closeTime,
          slotDuration:
            typeof stored?.slotDuration === "number"
              ? (stored.slotDuration as DisciplineScheduleConfig["slotDuration"])
              : DEFAULT_DISCIPLINE.slotDuration,
          notes: typeof stored?.notes === "string" ? stored.notes : DEFAULT_DISCIPLINE.notes,
        };
      }),
    };
  } catch {
    return fallback;
  }
}

export function saveBranchScheduleConfig(branchId: number | string, config: BranchScheduleConfig) {
  const payload: BranchScheduleConfig = {
    ...config,
    branchId,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(key(branchId), JSON.stringify(payload));
  return payload;
}
