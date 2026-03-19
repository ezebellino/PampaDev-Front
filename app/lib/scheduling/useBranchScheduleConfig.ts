import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Discipline } from "../api/services/disciplines";
import type { BranchScheduleConfig } from "./types";
import {
  loadBranchScheduleConfig,
  saveBranchScheduleConfig,
  subscribeToBranchScheduleConfig,
} from "./storage";

function branchScheduleConfigQueryKey(branchId: number | null, disciplineIds: number[]) {
  return ["branch-schedule-config", branchId, ...disciplineIds] as const;
}

export function useBranchScheduleConfig(branchId: number | null, disciplines: Discipline[]) {
  const queryClient = useQueryClient();
  const disciplineIds = useMemo(
    () => disciplines.map((discipline) => discipline.idDiscipline).sort((a, b) => a - b),
    [disciplines]
  );
  const queryKey = branchScheduleConfigQueryKey(branchId, disciplineIds);

  const query = useQuery({
    queryKey,
    enabled: branchId != null,
    queryFn: async () => {
      if (branchId == null) {
        throw new Error("Sucursal no seleccionada.");
      }
      return loadBranchScheduleConfig(branchId, disciplines);
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (branchId == null) return;

    return subscribeToBranchScheduleConfig(branchId, () => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [branchId, queryClient, queryKey]);

  const saveMutation = useMutation({
    mutationFn: async (next: BranchScheduleConfig) => {
      if (branchId == null) {
        throw new Error("Selecciona una sucursal para guardar la planificación.");
      }
      return saveBranchScheduleConfig(branchId, next);
    },
    onSuccess: (savedConfig) => {
      queryClient.setQueryData(queryKey, savedConfig);
    },
  });

  return {
    data: branchId == null ? null : (query.data ?? null),
    loading: branchId != null && query.isLoading,
    error: query.error,
    refresh: async () => {
      if (branchId == null) return null;
      const result = await query.refetch();
      return result.data ?? null;
    },
    save: (next: BranchScheduleConfig) => saveMutation.mutateAsync(next),
    saving: saveMutation.isPending,
  };
}