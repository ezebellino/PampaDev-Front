import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getClassesByBranch,
  createClassReservation,
  type ClassReservationRequest,
} from "../api/services/classes";
import type { BranchClassRecord } from "../api/models/branchClass";

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
  });

  const filteredSlots = useMemo(() => {
    if (!classesQuery.data) return [] as BranchClassRecord[];
    if (rubroId == null) return classesQuery.data;
    return classesQuery.data.filter((slot) => slot.rubroId === rubroId);
  }, [classesQuery.data, rubroId]);

  const reservationMutation = useMutation({
    mutationFn: (payload: ClassReservationRequest) => createClassReservation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-classes", branchId] });
    },
  });

  async function reserveSlot(slot: BranchClassRecord, userId: string) {
    if (!branchId) throw new Error("Sucursal no seleccionada");
    if (!rubroId) throw new Error("Rubro no seleccionado");
    if (slot.available <= 0) throw new Error("No hay cupos disponibles");

    return reservationMutation.mutateAsync({
      branchId,
      rubroId,
      slotId: slot.id,
      userId,
      date: slot.date,
      time: slot.time,
    });
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
