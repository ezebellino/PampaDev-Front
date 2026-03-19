import type { Discipline } from "../api/services/disciplines";
import type { BranchScheduleConfig, DaySchedule, DisciplineScheduleConfig, Weekday } from "./types";

const SCHEDULE_STORAGE_PREFIX = "pampadev:branch-schedule-config:v1";
export const SCHEDULE_CONFIG_EVENT = "pampadev:branch-schedule-config:changed";

function key(branchId: number | string) {
  return `${SCHEDULE_STORAGE_PREFIX}:${branchId}`;
}

function emitScheduleConfigChanged(branchId: number | string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SCHEDULE_CONFIG_EVENT, { detail: { branchId: String(branchId) } }));
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

function sanitizeText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function sanitizeOptionalText(value: unknown) {
  const normalized = sanitizeText(value);
  return normalized.length > 0 ? normalized : undefined;
}

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

function normalizeSlotDuration(value: unknown): DisciplineScheduleConfig["slotDuration"] {
  const numeric = Number(value);
  if (numeric === 30 || numeric === 60 || numeric === 90 || numeric === 120 || numeric === 150) {
    return numeric;
  }
  return DEFAULT_DISCIPLINE.slotDuration;
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
        reason: sanitizeText(current?.reason),
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
      updatedAt: sanitizeOptionalText(parsed.updatedAt),
      days: mergedDays,
      disciplines: disciplines.map((discipline) => {
        const stored = storedDisciplineMap.get(discipline.idDiscipline);
        return {
          idDiscipline: discipline.idDiscipline,
          enabled: stored?.enabled ?? DEFAULT_DISCIPLINE.enabled,
          openTime: sanitizeText(stored?.openTime, DEFAULT_DISCIPLINE.openTime),
          closeTime: sanitizeText(stored?.closeTime, DEFAULT_DISCIPLINE.closeTime),
          slotDuration: normalizeSlotDuration(stored?.slotDuration),
          notes: sanitizeText(stored?.notes, DEFAULT_DISCIPLINE.notes),
        };
      }),
    };
  } catch {
    return fallback;
  }
}

export function subscribeToBranchScheduleConfig(branchId: number | string, onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const expectedKey = key(branchId);
  const expectedBranchId = String(branchId);

  function onStorage(event: StorageEvent) {
    if (event.key === expectedKey) {
      onChange();
    }
  }

  function onScheduleChanged(event: Event) {
    const customEvent = event as CustomEvent<{ branchId?: string }>;
    if (customEvent.detail?.branchId === expectedBranchId) {
      onChange();
    }
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(SCHEDULE_CONFIG_EVENT, onScheduleChanged as EventListener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SCHEDULE_CONFIG_EVENT, onScheduleChanged as EventListener);
  };
}

export function saveBranchScheduleConfig(branchId: number | string, config: BranchScheduleConfig) {
  const payload: BranchScheduleConfig = {
    ...config,
    branchId,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(key(branchId), JSON.stringify(payload));
  emitScheduleConfigChanged(branchId);
  return payload;
}