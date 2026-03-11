import type { BranchClassRecord } from "../api/models/branchClass";

export type NormalizedBranchClass = {
  id: string;
  title: string;
  branchLabel: string | null;
  discipline: string | null;
  instructor: string | null;
  dayLabel: string;
  dayIndex: number | null;
  startLabel: string | null;
  endLabel: string | null;
  capacity: number | null;
  available: number | null;
  duration: number | null;
  creditUsage: number | null;
  creditRefund: number | null;
  status: string | null;
  raw: BranchClassRecord;
};

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function pickString(record: BranchClassRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function pickNumber(record: BranchClassRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

function pickBoolean(record: BranchClassRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return null;
}

function combineDateAndTime(dateValue: string | null, timeValue: string | null) {
  if (!dateValue && !timeValue) return null;
  if (dateValue && timeValue) {
    const safeTime = timeValue.length === 8 ? timeValue : `${timeValue}:00`;
    return `${dateValue.slice(0, 10)}T${safeTime}`;
  }
  return dateValue ?? timeValue;
}

function addMinutes(timeLabel: string | null, duration: number | null) {
  if (!timeLabel || duration == null) return null;
  const [hours, minutes] = timeLabel.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const total = hours * 60 + minutes + duration;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const endHours = String(Math.floor(normalized / 60)).padStart(2, "0");
  const endMinutes = String(normalized % 60).padStart(2, "0");
  return `${endHours}:${endMinutes}`;
}

function formatTimeValue(value: string | null) {
  if (!value) return null;

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  return value;
}

function resolveDay(record: BranchClassRecord, fallbackStart: string | null) {
  const rawDayNumber = pickNumber(record, ["dayOfWeek", "weekDay", "weekday", "day"]);
  if (rawDayNumber != null && rawDayNumber >= 0 && rawDayNumber <= 6) {
    return { dayIndex: rawDayNumber, dayLabel: DAY_NAMES[rawDayNumber] };
  }

  const rawDayName = pickString(record, ["dayName", "weekdayName", "weekDayName"]);
  if (rawDayName) return { dayIndex: null, dayLabel: rawDayName };

  if (fallbackStart) {
    const date = new Date(fallbackStart);
    if (!Number.isNaN(date.getTime())) {
      return { dayIndex: date.getDay(), dayLabel: DAY_NAMES[date.getDay()] };
    }
  }

  return { dayIndex: null, dayLabel: "Sin día definido" };
}

function resolveStatusLabel(record: BranchClassRecord, active: boolean | null) {
  const numericStatus = pickNumber(record, ["status"]);
  if (numericStatus != null) {
    if (numericStatus === 1) return "Activa";
    if (numericStatus === 0) return "Inactiva";
    return `Estado ${numericStatus}`;
  }

  const textStatus = pickString(record, ["status", "state"]);
  if (textStatus) return textStatus;

  if (active == null) return null;
  return active ? "Activa" : "Inactiva";
}

function resolveAvailable(record: BranchClassRecord, capacity: number | null) {
  const explicitAvailable = pickNumber(record, ["availableSlots", "available", "remainingSlots", "freeSlots"]);
  if (explicitAvailable != null) return explicitAvailable;

  const bookings = record.bookings;
  if (Array.isArray(bookings) && capacity != null) {
    return Math.max(capacity - bookings.length, 0);
  }

  return null;
}

export function normalizeBranchClass(item: BranchClassRecord, index: number): NormalizedBranchClass {
  const dateRaw = pickString(item, ["date", "dateStart", "startsAt", "startAt"]);
  const timeRaw = pickString(item, ["time", "startTime", "startHour", "timeStart"]);
  const duration = pickNumber(item, ["duration"]);
  const startSource = combineDateAndTime(dateRaw, timeRaw);
  const startLabel = formatTimeValue(timeRaw ?? startSource);
  const endLabel = addMinutes(startLabel, duration) ?? formatTimeValue(pickString(item, ["endTime", "endHour", "timeEnd", "endsAt", "endAt", "dateEnd"]));

  const title =
    pickString(item, ["title", "name", "className", "disciplineName", "serviceName", "activityName"]) ??
    `Clase ${index + 1}`;

  const id =
    pickString(item, ["idClass", "classId", "id", "uuid"]) ??
    `${title}-${startSource ?? "no-start"}-${index}`;

  const active = pickBoolean(item, ["active", "isActive", "enabled"]);
  const resolvedDay = resolveDay(item, startSource);
  const capacity = pickNumber(item, ["capacity", "quota", "maxCapacity", "slots"]);

  return {
    id,
    title,
    branchLabel: pickString(item, ["branchName", "sucursal", "branchLabel"]),
    discipline: pickString(item, ["disciplineName", "rubro", "categoryName"]),
    instructor: pickString(item, ["instructor", "instructorName", "teacherName", "coachName", "professorName"]),
    dayLabel: resolvedDay.dayLabel,
    dayIndex: resolvedDay.dayIndex,
    startLabel,
    endLabel,
    capacity,
    available: resolveAvailable(item, capacity),
    duration,
    creditUsage: pickNumber(item, ["creditUsage"]),
    creditRefund: pickNumber(item, ["creditRefund"]),
    status: resolveStatusLabel(item, active),
    raw: item,
  };
}

export function groupBranchClassesByDay(classes: NormalizedBranchClass[]) {
  const map = new Map<string, NormalizedBranchClass[]>();

  for (const item of classes) {
    const group = map.get(item.dayLabel) ?? [];
    group.push(item);
    map.set(item.dayLabel, group);
  }

  const orderedKnown = DAY_NAMES.map((day) => ({ day, items: map.get(day) ?? [] }))
    .filter((group) => group.items.length > 0)
    .map((group) => ({
      ...group,
      items: group.items.slice().sort((a, b) => (a.startLabel ?? "").localeCompare(b.startLabel ?? "")),
    }));

  const extras = Array.from(map.entries())
    .filter(([day]) => !DAY_NAMES.includes(day))
    .map(([day, items]) => ({
      day,
      items: items.slice().sort((a, b) => (a.startLabel ?? "").localeCompare(b.startLabel ?? "")),
    }));

  return [...orderedKnown, ...extras];
}

export function classStatusTone(status: string | null) {
  if (!status) return "neutral" as const;
  const normalized = status.toLowerCase();
  if (normalized.includes("act") || normalized.includes("disp") || normalized.includes("open")) return "success" as const;
  if (normalized.includes("cancel") || normalized.includes("inact") || normalized.includes("cerr")) return "warning" as const;
  return "neutral" as const;
}

export function buildClassTimeRange(item: NormalizedBranchClass) {
  if (item.startLabel && item.endLabel) return `${item.startLabel} a ${item.endLabel}`;
  if (item.startLabel) return `Desde ${item.startLabel}`;
  if (item.endLabel) return `Hasta ${item.endLabel}`;
  return "Horario a confirmar";
}
