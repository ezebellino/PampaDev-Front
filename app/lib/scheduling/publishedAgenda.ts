import { useCallback, useEffect, useMemo, useState } from "react";
import type { BranchClassRecord } from "../api/models/branchClass";
import type { Discipline } from "../api/services/disciplines";
import { mockRubros } from "../rubros/mockRubros";
import { matchesRubroCandidate, normalizeRubroKey } from "../rubros/rubroMatching";
import { buildPlannedSlots } from "./bookableSlots";
import type { BranchScheduleConfig } from "./types";

export type PublishedAgendaStatus = "published" | "closed";

export type PublishedAgendaItem = BranchClassRecord & {
  bookingSource: "published";
  agendaStatus: PublishedAgendaStatus;
  scheduleUpdatedAt?: string;
};

type PublishedAgendaState = {
  scheduleUpdatedAt?: string;
  items: PublishedAgendaItem[];
};

const STORAGE_PREFIX = "pampadev:published-agenda:v1";
const PUBLISHED_AGENDA_EVENT = "pampadev:published-agenda:changed";

function storageKey(branchId: number | string) {
  return `${STORAGE_PREFIX}:${branchId}`;
}

function emitPublishedAgendaChanged(branchId: number | string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PUBLISHED_AGENDA_EVENT, { detail: { branchId: String(branchId) } }));
}

function readState(branchId: number | string): PublishedAgendaState {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const raw = window.localStorage.getItem(storageKey(branchId));
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as Partial<PublishedAgendaState>;
    return {
      scheduleUpdatedAt: typeof parsed.scheduleUpdatedAt === "string" ? parsed.scheduleUpdatedAt : undefined,
      items: Array.isArray(parsed.items) ? (parsed.items as PublishedAgendaItem[]) : [],
    };
  } catch {
    return { items: [] };
  }
}

function writeState(branchId: number | string, state: PublishedAgendaState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(branchId), JSON.stringify(state));
  emitPublishedAgendaChanged(branchId);
}

function sortItems(items: PublishedAgendaItem[]) {
  return items.slice().sort((a, b) => {
    const left = `${a.date}T${a.time}`;
    const right = `${b.date}T${b.time}`;
    return left.localeCompare(right);
  });
}

function clampAvailable(value: unknown, capacity: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return capacity;
  return Math.max(0, Math.min(capacity, numeric));
}

function generateBaseAgenda(
  branchId: number,
  disciplines: Discipline[],
  scheduleConfig: BranchScheduleConfig,
  daysAhead: number
): PublishedAgendaItem[] {
  const slots = mockRubros.flatMap((rubro) =>
    buildPlannedSlots({
      branchId,
      rubroId: rubro.id,
      rubroName: rubro.name,
      baseDurationMin: rubro.durationMin,
      disciplines,
      scheduleConfig,
      daysAhead,
    })
  );

  const dedup = new Map<string, PublishedAgendaItem>();

  for (const slot of slots) {
    dedup.set(slot.id, {
      ...slot,
      bookingSource: "published",
      agendaStatus: "published",
      scheduleUpdatedAt: scheduleConfig.updatedAt,
      status: "Disponible",
    });
  }

  return sortItems(Array.from(dedup.values()));
}

export function syncPublishedAgenda(
  branchId: number,
  disciplines: Discipline[],
  scheduleConfig: BranchScheduleConfig | null,
  daysAhead = 14
) {
  if (!scheduleConfig?.updatedAt) {
    const empty = { scheduleUpdatedAt: undefined, items: [] as PublishedAgendaItem[] };
    writeState(branchId, empty);
    return empty.items;
  }

  const previous = readState(branchId);
  const previousMap = new Map(previous.items.map((item) => [item.id, item]));
  const generated = generateBaseAgenda(branchId, disciplines, scheduleConfig, daysAhead).map((item) => {
    const current = previousMap.get(item.id);
    if (!current) return item;

    return {
      ...item,
      agendaStatus: current.agendaStatus ?? item.agendaStatus,
      available: clampAvailable(current.available, item.capacity),
      capacity: Number.isFinite(Number(current.capacity)) ? Number(current.capacity) : item.capacity,
      status: current.agendaStatus === "closed" ? "Cerrado" : item.status,
    };
  });

  const nextState = {
    scheduleUpdatedAt: scheduleConfig.updatedAt,
    items: generated,
  };

  writeState(branchId, nextState);
  return generated;
}

export function getPublishedAgenda(branchId: number | null | undefined) {
  if (branchId == null) return [] as PublishedAgendaItem[];
  return sortItems(readState(branchId).items);
}

export function subscribeToPublishedAgenda(branchId: number | string, onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const expectedKey = storageKey(branchId);
  const expectedBranchId = String(branchId);

  function onStorage(event: StorageEvent) {
    if (event.key === expectedKey) onChange();
  }

  function onCustom(event: Event) {
    const custom = event as CustomEvent<{ branchId?: string }>;
    if (custom.detail?.branchId === expectedBranchId) onChange();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(PUBLISHED_AGENDA_EVENT, onCustom as EventListener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PUBLISHED_AGENDA_EVENT, onCustom as EventListener);
  };
}

function updateItems(branchId: number, updater: (items: PublishedAgendaItem[]) => PublishedAgendaItem[]) {
  const state = readState(branchId);
  const nextItems = sortItems(updater(state.items));
  writeState(branchId, { ...state, items: nextItems });
  return nextItems;
}

export function reservePublishedAgendaSlot(branchId: number, slotId: string) {
  return updateItems(branchId, (items) =>
    items.map((item) => {
      if (item.id !== slotId || item.agendaStatus === "closed") return item;
      if (item.available <= 0) return item;
      return {
        ...item,
        available: item.available - 1,
      };
    })
  );
}

export function releasePublishedAgendaSlot(branchId: number, slotId: string) {
  return updateItems(branchId, (items) =>
    items.map((item) => {
      if (item.id !== slotId) return item;
      return {
        ...item,
        available: Math.min(item.capacity, item.available + 1),
      };
    })
  );
}

export function togglePublishedAgendaSlot(branchId: number, slotId: string) {
  return updateItems(branchId, (items) =>
    items.map((item) => {
      if (item.id !== slotId) return item;
      const agendaStatus: PublishedAgendaStatus = item.agendaStatus === "closed" ? "published" : "closed";
      return {
        ...item,
        agendaStatus,
        status: agendaStatus === "closed" ? "Cerrado" : "Disponible",
      };
    })
  );
}

function readAgendaRubroName(item: PublishedAgendaItem) {
  if (typeof item.rubroName === "string") return item.rubroName;
  if (typeof item.disciplineName === "string") return item.disciplineName;
  return item.rubroId;
}

export function findPublishedAgendaByRubro(branchId: number | null, rubroId: string | null, rubroName?: string | null) {
  if (branchId == null) return [] as PublishedAgendaItem[];
  const items = getPublishedAgenda(branchId).filter((item) => item.agendaStatus === "published" && item.available > 0);
  if (!rubroId) return items;
  return items.filter((item) => {
    const itemName = readAgendaRubroName(item);
    return matchesRubroCandidate(rubroId, rubroName ?? itemName, itemName);
  });
}

export function usePublishedBranchAgenda(
  branchId: number | null,
  disciplines: Discipline[],
  scheduleConfig: BranchScheduleConfig | null,
  options?: { rubroId?: string | null; rubroName?: string | null; daysAhead?: number }
) {
  const rubroId = options?.rubroId ?? null;
  const rubroName = options?.rubroName ?? null;
  const daysAhead = options?.daysAhead ?? 14;
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    if (branchId == null) return;
    syncPublishedAgenda(branchId, disciplines, scheduleConfig, daysAhead);
    setVersion((current) => current + 1);
  }, [branchId, disciplines, scheduleConfig, daysAhead]);

  useEffect(() => {
    if (branchId == null) return;
    return subscribeToPublishedAgenda(branchId, () => setVersion((current) => current + 1));
  }, [branchId]);

  const allItems = useMemo(() => getPublishedAgenda(branchId), [branchId, version]);

  const items = useMemo(() => {
    if (rubroId == null) return allItems;
    return allItems.filter((item) => {
      const itemName = readAgendaRubroName(item);
      return matchesRubroCandidate(rubroId, rubroName ?? itemName, itemName);
    });
  }, [allItems, rubroId, rubroName]);

  const publishedItems = useMemo(() => items.filter((item) => item.agendaStatus === "published"), [items]);
  const openCount = useMemo(() => publishedItems.filter((item) => item.available > 0).length, [publishedItems]);
  const closedCount = useMemo(() => items.filter((item) => item.agendaStatus === "closed").length, [items]);

  return {
    items,
    publishedItems,
    openCount,
    closedCount,
    refresh,
    toggleSlot: (slotId: string) => {
      if (branchId == null) return [] as PublishedAgendaItem[];
      return togglePublishedAgendaSlot(branchId, slotId);
    },
  };
}

export function summarizeAgendaByDay(items: PublishedAgendaItem[]) {
  const map = new Map<string, { date: string; count: number; open: number }>();
  for (const item of items) {
    const row = map.get(item.date) ?? { date: item.date, count: 0, open: 0 };
    row.count += 1;
    if (item.agendaStatus === "published" && item.available > 0) row.open += 1;
    map.set(item.date, row);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getPublishedAgendaSlotStatusLabel(item: PublishedAgendaItem) {
  if (item.agendaStatus === "closed") return "Cerrado";
  if (item.available <= 0) return "Sin cupo";
  return "Disponible";
}

export function getPublishedAgendaSlotStatusTone(item: PublishedAgendaItem) {
  if (item.agendaStatus === "closed") return "warning" as const;
  if (item.available <= 0) return "warning" as const;
  return "success" as const;
}
