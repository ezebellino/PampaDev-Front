import type { BranchClassRecord } from "../api/models/branchClass";
import type { Discipline } from "../api/services/disciplines";
import type { BranchScheduleConfig, Weekday } from "./types";

type BuildPlannedSlotsParams = {
  branchId: number;
  rubroId: string;
  rubroName: string;
  baseDurationMin: number;
  disciplines: Discipline[];
  scheduleConfig: BranchScheduleConfig | null;
  daysAhead?: number;
};

const DEFAULT_CAPACITY_BY_RUBRO: Record<string, number> = {
  padel: 4,
  futbol: 10,
  basquet: 10,
  pilates: 12,
  yoga: 14,
  taekwondo: 16,
  gym: 20,
};

function normalizeKey(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseTimeToMinutes(value: string) {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
}

function formatMinutes(totalMinutes: number) {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const minutes = String(normalized % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getDefaultCapacity(rubroId: string) {
  return DEFAULT_CAPACITY_BY_RUBRO[normalizeKey(rubroId)] ?? 8;
}

export function buildPlannedSlots({
  branchId,
  rubroId,
  rubroName,
  baseDurationMin,
  disciplines,
  scheduleConfig,
  daysAhead = 7,
}: BuildPlannedSlotsParams): BranchClassRecord[] {
  if (!scheduleConfig?.updatedAt) {
    return [];
  }

  const normalizedRubroId = normalizeKey(rubroId);
  const normalizedRubroName = normalizeKey(rubroName);

  const discipline = disciplines.find((item) => {
    const normalizedName = normalizeKey(item.name);
    return normalizedName === normalizedRubroId || normalizedName === normalizedRubroName;
  });

  if (!discipline) {
    return [];
  }

  const disciplineConfig = scheduleConfig.disciplines.find((item) => item.idDiscipline === discipline.idDiscipline);
  if (!disciplineConfig?.enabled) {
    return [];
  }

  const openMinutes = parseTimeToMinutes(disciplineConfig.openTime);
  const closeMinutes = parseTimeToMinutes(disciplineConfig.closeTime);
  if (openMinutes == null || closeMinutes == null) {
    return [];
  }

  const normalizedCloseMinutes = closeMinutes <= openMinutes ? closeMinutes + 24 * 60 : closeMinutes;
  const slotDuration = disciplineConfig.slotDuration || baseDurationMin;
  const capacity = getDefaultCapacity(rubroId);
  const slots: BranchClassRecord[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + offset);
    const weekday = currentDate.getDay() as Weekday;
    const dayConfig = scheduleConfig.days[weekday];

    if (dayConfig?.closed) {
      continue;
    }

    for (let currentMinutes = openMinutes; currentMinutes + slotDuration <= normalizedCloseMinutes; currentMinutes += slotDuration) {
      const date = toDateKey(currentDate);
      const time = formatMinutes(currentMinutes);

      slots.push({
        id: `planned-${branchId}-${normalizeKey(rubroId)}-${date}-${time}`,
        rubroId,
        branchId,
        date,
        time,
        capacity,
        available: capacity,
        duration: slotDuration,
        disciplineName: discipline.name,
        bookingSource: "planned",
        syncStatus: "pending-backend",
        status: "Solicitud abierta",
      });
    }
  }

  return slots;
}
