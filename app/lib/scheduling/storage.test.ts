import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Discipline } from "../api/services/disciplines";
import {
  createDefaultBranchScheduleConfig,
  loadBranchScheduleConfig,
  saveBranchScheduleConfig,
  subscribeToBranchScheduleConfig,
} from "./storage";

const disciplines: Discipline[] = [
  { idDiscipline: 1, name: "Funcional" },
  { idDiscipline: 2, name: "Yoga" },
];

describe("scheduling storage domain", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("builds a default config from the available disciplines", () => {
    const config = createDefaultBranchScheduleConfig(7, disciplines);

    expect(config.disciplines).toHaveLength(2);
    expect(config.days[1].closed).toBe(false);
  });

  it("saves, reloads and notifies branch schedule changes", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToBranchScheduleConfig(7, onChange);
    const draft = createDefaultBranchScheduleConfig(7, disciplines);
    draft.days[1] = { closed: true, reason: "Mantenimiento" };
    draft.disciplines[0] = {
      ...draft.disciplines[0],
      openTime: "09:00",
      closeTime: "18:00",
      slotDuration: 90,
    };

    const saved = saveBranchScheduleConfig(7, draft);
    const loaded = loadBranchScheduleConfig(7, disciplines);

    expect(saved.updatedAt).toBeTruthy();
    expect(loaded.days[1].closed).toBe(true);
    expect(loaded.disciplines[0]?.slotDuration).toBe(90);
    expect(onChange).toHaveBeenCalled();

    unsubscribe();
  });
});