import type { ApiError } from "../api/api";
import type { WeeklyAvailability, Weekday } from "../api/services/availability";
import type { BranchScheduleConfig, DisciplineScheduleConfig } from "./types";

const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";
const DEFAULT_OPEN_RANGE = { start: "08:00", end: "20:00" };
const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function compareTime(a: string, b: string) {
  return a.localeCompare(b);
}

function pickDayRange(config: BranchScheduleConfig): { start: string; end: string } {
  const eligible = config.disciplines
    .filter((discipline) => discipline.enabled)
    .filter((discipline) => isValidTime(discipline.openTime) && isValidTime(discipline.closeTime))
    .filter((discipline) => compareTime(discipline.openTime, discipline.closeTime) < 0);

  if (eligible.length === 0) {
    return DEFAULT_OPEN_RANGE;
  }

  return eligible.reduce(
    (acc, discipline) => ({
      start: compareTime(discipline.openTime, acc.start) < 0 ? discipline.openTime : acc.start,
      end: compareTime(discipline.closeTime, acc.end) > 0 ? discipline.closeTime : acc.end,
    }),
    { start: eligible[0].openTime, end: eligible[0].closeTime }
  );
}

export function buildWeeklyAvailabilityFromSchedule(config: BranchScheduleConfig): WeeklyAvailability {
  const baseRange = pickDayRange(config);

  return {
    idBranch: Number(config.branchId),
    timezone: DEFAULT_TIMEZONE,
    updatedAt: config.updatedAt,
    days: {
      0: config.days[0].closed ? [] : [{ ...baseRange }],
      1: config.days[1].closed ? [] : [{ ...baseRange }],
      2: config.days[2].closed ? [] : [{ ...baseRange }],
      3: config.days[3].closed ? [] : [{ ...baseRange }],
      4: config.days[4].closed ? [] : [{ ...baseRange }],
      5: config.days[5].closed ? [] : [{ ...baseRange }],
      6: config.days[6].closed ? [] : [{ ...baseRange }],
    },
  };
}

export function mergeScheduleConfigWithAvailability(
  config: BranchScheduleConfig,
  availability: WeeklyAvailability
): BranchScheduleConfig {
  const nextDays = { ...config.days };

  for (const day of WEEKDAYS) {
    const ranges = availability.days[day] ?? [];
    nextDays[day] = {
      closed: ranges.length === 0,
      reason: ranges.length === 0 ? config.days[day].reason : "",
    };
  }

  return {
    ...config,
    days: nextDays,
    updatedAt: availability.updatedAt ?? config.updatedAt,
  };
}

export function isAvailabilityEndpointUnavailable(error: unknown): error is ApiError {
  if (!error || typeof error !== "object") return false;
  const candidate = error as Partial<ApiError>;
  return candidate.status === 404 || candidate.status === 501 || candidate.status === 503;
}

export function hasEnabledDisciplines(config: BranchScheduleConfig) {
  return config.disciplines.some((discipline: DisciplineScheduleConfig) => discipline.enabled);
}
