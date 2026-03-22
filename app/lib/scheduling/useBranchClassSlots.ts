import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createClass, getClassesByBranch, type CreateClassPayload } from "../api/services/classes";
import type { BranchClassRecord } from "../api/models/branchClass";
import { persistInstructorReservationRequest } from "./useInstructorRequests";

function readNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeKey(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function resolveBranchDisciplineId(slot: BranchClassRecord) {
  return readNumber(slot.idBranchDiscipline) ?? readNumber(slot["branchDisciplineId"]) ?? readNumber(slot["idBranchDisciplineId"]);
}

function resolveIsoDate(date: string, time: string) {
  const candidate = new Date(`${date}T${time}`);
  if (!Number.isNaN(candidate.getTime())) {
    return candidate.toISOString();
  }

  const fallback = new Date(date);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toISOString();
  }

  throw new Error("No pudimos construir la fecha del turno con el slot seleccionado.");
}

function buildCreateClassPayload(slot: BranchClassRecord, userId: string): CreateClassPayload {
  const idUser = readNumber(userId);
  if (idUser == null) {
    throw new Error("La sesion actual no tiene un idUser numerico para enviar al backend.");
  }

  const idBranchDiscipline = resolveBranchDisciplineId(slot);
  if (idBranchDiscipline == null) {
    throw new Error("El slot seleccionado no informa idBranchDiscipline. Necesitamos ese dato desde backend para crear la clase.");
  }

  return {
    date: resolveIsoDate(slot.date, slot.time),
    time: slot.time,
    idBranchDiscipline,
    idUser,
    capacity: readNumber(slot.capacity) ?? 1,
    duration: readNumber(slot.duration) ?? 60,
    creditUsage: readNumber(slot.creditUsage) ?? 0,
    creditRefund: readNumber(slot.creditRefund) ?? 0,
    status: readNumber(slot.status) ?? 0,
  };
}

function matchesRubro(slot: BranchClassRecord, rubroId: string) {
  const expected = normalizeKey(rubroId);
  if (!expected) return true;

  const candidates = [
    typeof slot.rubroId === "string" ? slot.rubroId : null,
    typeof slot["disciplineName"] === "string" ? String(slot["disciplineName"]) : null,
    typeof slot["rubro"] === "string" ? String(slot["rubro"]) : null,
    typeof slot["categoryName"] === "string" ? String(slot["categoryName"]) : null,
  ];

  return candidates.some((candidate) => normalizeKey(candidate) === expected);
}

export function useBranchClassSlots(branchId: number | null, rubroId: string | null) {
  const queryClient = useQueryClient();

  const shouldFetch = branchId != null;

  const classesQuery = useQuery({
    queryKey: ["branch-classes", branchId],
    queryFn: async ({ signal }) => {
      if (branchId == null) return [] as BranchClassRecord[];
      return getClassesByBranch(branchId, signal);
    },
    enabled: shouldFetch,
    staleTime: 1000 * 30,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const filteredSlots = useMemo(() => {
    if (!classesQuery.data) return [] as BranchClassRecord[];
    if (rubroId == null) return classesQuery.data;
    return classesQuery.data.filter((slot) => matchesRubro(slot, rubroId));
  }, [classesQuery.data, rubroId]);

  const reservationMutation = useMutation({
    mutationFn: (payload: CreateClassPayload) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-classes", branchId] });
    },
  });

  async function reserveSlot(slot: BranchClassRecord, userId: string) {
    if (!branchId) throw new Error("Sucursal no seleccionada");
    if (!rubroId) throw new Error("Rubro no seleccionado");
    if (slot.available <= 0) throw new Error("No hay cupos disponibles");

    const payload = buildCreateClassPayload(slot, userId);
    const response = await reservationMutation.mutateAsync(payload);

    try {
      persistInstructorReservationRequest({
        id: `req-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        branchId,
        rubroId,
        slotId: slot.id,
        userId,
        backendClassId: readNumber(response?.idClass ?? response?.id) ?? String(response?.idClass ?? response?.id ?? ""),
        date: slot.date,
        time: slot.time,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    } catch {
      // no crash if localStorage no disponible.
    }

    return response;
  }

  return {
    slots: filteredSlots,
    loading: classesQuery.isLoading,
    error: classesQuery.error,
    reserveSlot,
    reserving: reservationMutation.status === "pending",
    reservationError: reservationMutation.error,
    reservationSuccess: reservationMutation.isSuccess,
  };
}
