import { beforeEach, describe, expect, it } from "vitest";
import type { Discipline } from "../api/services/disciplines";
import {
  buildWeeklyAvailabilityFromSchedule,
  mergeScheduleConfigWithAvailability,
} from "./availabilityAdapter";
import { createDefaultBranchScheduleConfig } from "./storage";

const disciplines: Discipline[] = [
  { idDiscipline: 1, name: "Funcional" },
  { idDiscipline: 2, name: "Yoga" },
];

describe("scheduling availability adapter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("builds backend availability ranges from the current schedule config", () => {
    const config = createDefaultBranchScheduleConfig(7, disciplines);
    config.days[0] = { closed: true, reason: "Cerrado" };
    config.disciplines[0] = { ...config.disciplines[0], enabled: true, openTime: "07:00", closeTime: "12:00" };
    config.disciplines[1] = { ...config.disciplines[1], enabled: true, openTime: "09:00", closeTime: "21:00" };

    const availability = buildWeeklyAvailabilityFromSchedule(config);

    expect(availability.idBranch).toBe(7);
    expect(availability.days[0]).toEqual([]);
    expect(availability.days[1]).toEqual([{ start: "07:00", end: "21:00" }]);
  });

  it("merges backend availability into the local schedule without losing discipline settings", () => {
    const config = createDefaultBranchScheduleConfig(7, disciplines);
    config.days[1] = { closed: true, reason: "Mantenimiento" };
    config.disciplines[0] = { ...config.disciplines[0], slotDuration: 90, notes: "Priorizar socios" };

    const merged = mergeScheduleConfigWithAvailability(config, {
      idBranch: 7,
      timezone: "America/Argentina/Buenos_Aires",
      updatedAt: "2026-03-19T22:00:00Z",
      days: {
        0: [],
        1: [{ start: "08:00", end: "20:00" }],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
      },
    });

    expect(merged.days[1].closed).toBe(false);
    expect(merged.days[1].reason).toBe("");
    expect(merged.disciplines[0]?.slotDuration).toBe(90);
    expect(merged.updatedAt).toBe("2026-03-19T22:00:00Z");
  });
});
