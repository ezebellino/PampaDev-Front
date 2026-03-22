import { beforeEach, describe, expect, it } from "vitest";
import { syncPublishedAgenda, getPublishedAgenda, reservePublishedAgendaSlot, releasePublishedAgendaSlot, togglePublishedAgendaSlot } from "./publishedAgenda";
import { createDefaultBranchScheduleConfig } from "./storage";
import type { Discipline } from "../api/services/disciplines";

const disciplines: Discipline[] = [
  { idDiscipline: 1, name: "Padel" },
  { idDiscipline: 2, name: "Yoga" },
];

describe("publishedAgenda", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("generates local published slots from admin schedule", () => {
    const config = createDefaultBranchScheduleConfig(1, disciplines);
    config.updatedAt = new Date("2026-03-22T10:00:00.000Z").toISOString();
    config.disciplines = config.disciplines.map((item) =>
      item.idDiscipline === 1
        ? { ...item, enabled: true, openTime: "16:00", closeTime: "18:00", slotDuration: 60 }
        : { ...item, enabled: false }
    );

    const items = syncPublishedAgenda(1, disciplines, config, 3);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.bookingSource === "published")).toBe(true);
  });

  it("updates local availability and slot visibility", () => {
    const config = createDefaultBranchScheduleConfig(2, disciplines);
    config.updatedAt = new Date("2026-03-22T10:00:00.000Z").toISOString();
    config.disciplines = config.disciplines.map((item) =>
      item.idDiscipline === 1
        ? { ...item, enabled: true, openTime: "16:00", closeTime: "17:00", slotDuration: 60 }
        : { ...item, enabled: false }
    );

    const [slot] = syncPublishedAgenda(2, disciplines, config, 1);
    reservePublishedAgendaSlot(2, slot.id);
    let [updated] = getPublishedAgenda(2);
    expect(updated.available).toBe(slot.available - 1);

    releasePublishedAgendaSlot(2, slot.id);
    [updated] = getPublishedAgenda(2);
    expect(updated.available).toBe(slot.available);

    togglePublishedAgendaSlot(2, slot.id);
    [updated] = getPublishedAgenda(2);
    expect(updated.agendaStatus).toBe("closed");
  });
});
