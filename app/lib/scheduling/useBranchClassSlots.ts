import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { BranchClassRecord } from "../api/models/branchClass";
import { createBooking, type CreateBookingPayload } from "../api/services/bookings";
import { matchesRubroCandidate } from "../rubros/rubroMatching";
import { reservePublishedAgendaSlot } from "./publishedAgenda";
import { persistInstructorReservationRequest } from "./useInstructorRequests";

export type ReservationActor = {
  id: string;
  name?: string;
};

export type ReservationResult = {
  mode: "api-booking" | "request-only";
  requestId: string;
  syncStatus: "synced" | "pending-backend";
};

function readNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveClassId(slot: BranchClassRecord) {
  return readNumber(slot.idClass) ?? readNumber(slot.id) ?? readNumber(slot["classId"]);
}

function buildCreateBookingPayload(slot: BranchClassRecord, userId: string): CreateBookingPayload {
  const idUser = readNumber(userId);
  if (idUser == null) {
    throw new Error("La sesion actual no tiene un idUser numerico para enviar al backend.");
  }

  const idClass = resolveClassId(slot);
  if (idClass == null) {
    throw new Error("El slot seleccionado no informa idClass. Necesitamos ese dato desde backend para reservar.");
  }

  return {
    idClass,
    idUser,
  };
}

function matchesRubro(slot: BranchClassRecord, rubroId: string) {
  const rubroName = typeof slot.rubroId === "string" ? slot.rubroId : rubroId;
  const candidates = [
    typeof slot.rubroId === "string" ? slot.rubroId : null,
    typeof slot.disciplineName === "string" ? slot.disciplineName : null,
    typeof slot["disciplineName"] === "string" ? String(slot["disciplineName"]) : null,
    typeof slot["rubro"] === "string" ? String(slot["rubro"]) : null,
    typeof slot["categoryName"] === "string" ? String(slot["categoryName"]) : null,
    typeof slot["title"] === "string" ? String(slot["title"]) : null,
  ];

  return candidates.some((candidate) => matchesRubroCandidate(rubroId, rubroName, candidate));
}

function toSlotTimestamp(date: string | null | undefined, time: string | null | undefined) {
  if (!date || !time) return null;
  const value = new Date(`${date}T${time}`);
  const stamp = value.getTime();
  return Number.isFinite(stamp) ? stamp : null;
}

function isUpcomingSlot(slot: Pick<BranchClassRecord, "date" | "time">) {
  const stamp = toSlotTimestamp(slot.date, slot.time);
  if (stamp == null) return true;
  return stamp >= Date.now();
}

function createRequestId() {
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useBranchClassSlots(branchId: number | null, rubroId: string | null, fallbackSlots: BranchClassRecord[] = []) {
  const queryClient = useQueryClient();

  const shouldFetch = branchId != null;

  const classesQuery = useQuery({
    queryKey: ["branch-classes", branchId],
    queryFn: async ({ signal }) => {
      if (branchId == null) return [] as BranchClassRecord[];
      const { getClassesByBranch } = await import("../api/services/classes");
      return getClassesByBranch(branchId, signal);
    },
    enabled: shouldFetch,
    staleTime: 1000 * 30,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const apiSlots = useMemo(() => {
    if (!classesQuery.data) return [] as BranchClassRecord[];
    const upcoming = classesQuery.data.filter((slot) => isUpcomingSlot(slot));
    if (rubroId == null) return upcoming;
    return upcoming.filter((slot) => matchesRubro(slot, rubroId)).map((slot) => ({
      ...slot,
      bookingSource: "api" as const,
      syncStatus: "synced" as const,
    }));
  }, [classesQuery.data, rubroId]);

  const filteredSlots = useMemo(() => {
    if (apiSlots.length > 0) {
      return apiSlots;
    }
    if (rubroId == null) return fallbackSlots;
    return fallbackSlots.filter((slot) => matchesRubro(slot, rubroId));
  }, [apiSlots, fallbackSlots, rubroId]);

  const reservationMutation = useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-classes", branchId] });
    },
  });

  async function reserveSlot(slot: BranchClassRecord, user: ReservationActor): Promise<ReservationResult> {
    if (!branchId) throw new Error("Sucursal no seleccionada");
    if (!rubroId) throw new Error("Rubro no seleccionado");
    if (slot.available != null && slot.available <= 0) throw new Error("No hay cupos disponibles");
    if (!isUpcomingSlot(slot)) throw new Error("Este horario ya pas? y no puede reservarse.");
    if (slot.bookingSource === "published" && String(slot.status ?? "").toLowerCase().includes("cerr")) {
      throw new Error("Este horario ya no esta publicado para nuevas reservas.");
    }

    const requestPayload = {
      id: createRequestId(),
      branchId,
      rubroId,
      rubroName: typeof slot.disciplineName === "string" ? slot.disciplineName : rubroId,
      slotId: slot.id,
      slotLabel: `${slot.date} · ${slot.time}`,
      userId: user.id,
      userName: user.name,
      branchDisciplineId: undefined,
      date: slot.date,
      time: slot.time,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    const canSyncWithBackend = slot.bookingSource !== "planned" && resolveClassId(slot) != null;

    if (!canSyncWithBackend) {
      if (slot.bookingSource === "published") {
        reservePublishedAgendaSlot(branchId, slot.id);
      }

      const saved = persistInstructorReservationRequest({
        ...requestPayload,
        bookingSource: slot.bookingSource === "planned" ? "planned" : "api",
        syncStatus: "pending-backend",
      });

      return {
        mode: "request-only",
        requestId: saved.id,
        syncStatus: "pending-backend",
      };
    }

    try {
      const payload = buildCreateBookingPayload(slot, user.id);
      const response = await reservationMutation.mutateAsync(payload);

      return {
        mode: "api-booking",
        requestId: String(readNumber(response?.idBooking) ?? requestPayload.id),
        syncStatus: "synced",
      };
    } catch {
      if (slot.bookingSource === "published") {
        reservePublishedAgendaSlot(branchId, slot.id);
      }

      const saved = persistInstructorReservationRequest({
        ...requestPayload,
        bookingSource: "api",
        syncStatus: "pending-backend",
      });

      return {
        mode: "request-only",
        requestId: saved.id,
        syncStatus: "pending-backend",
      };
    }
  }

  return {
    slots: filteredSlots,
    loading: classesQuery.isLoading,
    error: classesQuery.error,
    reserveSlot,
    reserving: reservationMutation.status === "pending",
    reservationError: reservationMutation.error,
    reservationSuccess: reservationMutation.isSuccess,
    usingFallbackSlots: apiSlots.length === 0 && fallbackSlots.length > 0,
    hasBackendSlots: apiSlots.length > 0,
  };
}

