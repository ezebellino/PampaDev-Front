import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Discipline } from "../api/services/disciplines";
import { getBranchAvailability, updateBranchAvailability } from "../api/services/availability";
import type { BranchScheduleConfig } from "./types";
import {
  loadBranchScheduleConfig,
  saveBranchScheduleConfig,
} from "./storage";
import {
  buildWeeklyAvailabilityFromSchedule,
  isAvailabilityEndpointUnavailable,
  mergeScheduleConfigWithAvailability,
} from "./availabilityAdapter";

type ScheduleConfigState = {
  config: BranchScheduleConfig;
  source: "local" | "api+local";
  availabilityReady: boolean;
};

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

  const query = useQuery<ScheduleConfigState>({
    queryKey,
    enabled: branchId != null,
    queryFn: async () => {
      if (branchId == null) {
        throw new Error("Sucursal no seleccionada.");
      }

      const localConfig = loadBranchScheduleConfig(branchId, disciplines);

      try {
        const availability = await getBranchAvailability(branchId);
        return {
          config: mergeScheduleConfigWithAvailability(localConfig, availability),
          source: "api+local",
          availabilityReady: true,
        };
      } catch (error) {
        if (isAvailabilityEndpointUnavailable(error)) {
          return {
            config: localConfig,
            source: "local",
            availabilityReady: false,
          };
        }
        throw error;
      }
    },
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (next: BranchScheduleConfig) => {
      if (branchId == null) {
        throw new Error("Selecciona una sucursal para guardar la planificación.");
      }

      const localSaved = saveBranchScheduleConfig(branchId, next);

      try {
        const availabilityPayload = buildWeeklyAvailabilityFromSchedule(localSaved);
        const remoteSaved = await updateBranchAvailability(branchId, availabilityPayload);
        return {
          config: mergeScheduleConfigWithAvailability(localSaved, remoteSaved),
          source: "api+local" as const,
          availabilityReady: true,
        };
      } catch (error) {
        if (isAvailabilityEndpointUnavailable(error)) {
          return {
            config: localSaved,
            source: "local" as const,
            availabilityReady: false,
          };
        }
        throw error;
      }
    },
    onSuccess: (savedState) => {
      queryClient.setQueryData(queryKey, savedState);
    },
  });

  return {
    data: branchId == null ? null : (query.data?.config ?? null),
    loading: branchId != null && query.isLoading,
    error: query.error,
    refresh: async () => {
      if (branchId == null) return null;
      const result = await query.refetch();
      return result.data?.config ?? null;
    },
    save: (next: BranchScheduleConfig) => saveMutation.mutateAsync(next).then((result) => result.config),
    saving: saveMutation.isPending,
    source: query.data?.source ?? "local",
    usingBackendAvailability: query.data?.availabilityReady ?? false,
  };
}
