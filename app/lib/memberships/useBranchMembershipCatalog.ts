import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMembership, getMemberships, updateMembership } from "../api/services/memberships";
import type { MembershipPlanInput, PrivateClassOffer } from "./types";
import {
  buildMembershipPlan,
  createMembershipPlan,
  hideMembershipPlan,
  loadBranchMembershipCatalog,
  mergeApiMembershipCatalog,
  removeMembershipPlan,
  saveMembershipPrivateClass,
  subscribeToBranchMembershipCatalog,
  updateMembershipPlan,
  upsertMembershipPlan,
} from "./storage";

function membershipCatalogQueryKey(branchId: number | null) {
  return ["branch-membership-catalog", branchId] as const;
}

export function useBranchMembershipCatalog(branchId: number | null) {
  const queryClient = useQueryClient();
  const queryKey = membershipCatalogQueryKey(branchId);
  const [syncMode, setSyncMode] = useState<"api+local" | "local-only">("local-only");

  const fetchCatalog = useCallback(async () => {
    if (branchId == null) {
      throw new Error("Sucursal no seleccionada.");
    }

    try {
      const apiPlans = await getMemberships();
      setSyncMode("api+local");
      return mergeApiMembershipCatalog(branchId, apiPlans);
    } catch {
      setSyncMode("local-only");
      return loadBranchMembershipCatalog(branchId);
    }
  }, [branchId]);

  const query = useQuery({
    queryKey,
    enabled: branchId != null,
    queryFn: fetchCatalog,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (branchId == null) return;

    return subscribeToBranchMembershipCatalog(branchId, () => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [branchId, queryClient, queryKey]);

  const createPlanMutation = useMutation({
    mutationFn: async (input: MembershipPlanInput) => {
      if (branchId == null) throw new Error("Selecciona una sucursal para crear planes.");

      try {
        const created = await createMembership({
          name: input.name.trim(),
          price: Math.round(input.price),
          disciplinesCount: input.disciplineIds.length,
        });

        if (created) {
          setSyncMode("api+local");
          const syncedPlan = buildMembershipPlan(input, created.idMembership, {
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            disciplinesCount: created.disciplinesCount,
            syncSource: "api",
          });
          return upsertMembershipPlan(branchId, syncedPlan);
        }
      } catch {
        setSyncMode("local-only");
      }

      return createMembershipPlan(branchId, input);
    },
    onSuccess: (catalog) => {
      queryClient.setQueryData(queryKey, catalog);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (payload: { idMembershipPlan: number; input: MembershipPlanInput }) => {
      if (branchId == null) throw new Error("Selecciona una sucursal para editar planes.");

      const catalog = loadBranchMembershipCatalog(branchId);
      const existing = catalog.plans.find((plan) => plan.idMembershipPlan === payload.idMembershipPlan);
      const nextDisciplinesCount = payload.input.disciplineIds.length;

      if (existing?.syncSource === "api") {
        try {
          await updateMembership(payload.idMembershipPlan, {
            idMembership: payload.idMembershipPlan,
            name: payload.input.name.trim(),
            price: Math.round(payload.input.price),
            disciplinesCount: nextDisciplinesCount,
          });
          setSyncMode("api+local");
          return updateMembershipPlan(branchId, payload.idMembershipPlan, payload.input, {
            disciplinesCount: nextDisciplinesCount,
            syncSource: "api",
          });
        } catch {
          setSyncMode("local-only");
        }
      }

      return updateMembershipPlan(branchId, payload.idMembershipPlan, payload.input, {
        disciplinesCount: nextDisciplinesCount,
        syncSource: existing?.syncSource ?? "local",
      });
    },
    onSuccess: (catalog) => {
      queryClient.setQueryData(queryKey, catalog);
    },
  });

  const removePlanMutation = useMutation({
    mutationFn: async (idMembershipPlan: number) => {
      if (branchId == null) throw new Error("Selecciona una sucursal para ocultar o eliminar planes.");

      const catalog = loadBranchMembershipCatalog(branchId);
      const existing = catalog.plans.find((plan) => plan.idMembershipPlan === idMembershipPlan);

      if (existing?.syncSource === "api") {
        return hideMembershipPlan(branchId, idMembershipPlan);
      }

      return removeMembershipPlan(branchId, idMembershipPlan);
    },
    onSuccess: (catalog) => {
      queryClient.setQueryData(queryKey, catalog);
    },
  });

  const privateClassMutation = useMutation({
    mutationFn: async (privateClass: PrivateClassOffer) => {
      if (branchId == null) throw new Error("Selecciona una sucursal para guardar la clase particular.");
      return saveMembershipPrivateClass(branchId, privateClass);
    },
    onSuccess: (catalog) => {
      queryClient.setQueryData(queryKey, catalog);
    },
  });

  return {
    data: branchId == null ? null : (query.data ?? null),
    loading: branchId != null && query.isLoading,
    error: query.error,
    syncMode,
    refresh: async () => {
      if (branchId == null) return null;
      const result = await query.refetch();
      return result.data ?? null;
    },
    createPlan: (input: MembershipPlanInput) => createPlanMutation.mutateAsync(input),
    updatePlan: (idMembershipPlan: number, input: MembershipPlanInput) =>
      updatePlanMutation.mutateAsync({ idMembershipPlan, input }),
    removePlan: (idMembershipPlan: number) => removePlanMutation.mutateAsync(idMembershipPlan),
    savePrivateClass: (privateClass: PrivateClassOffer) => privateClassMutation.mutateAsync(privateClass),
    saving:
      createPlanMutation.isPending ||
      updatePlanMutation.isPending ||
      removePlanMutation.isPending ||
      privateClassMutation.isPending,
  };
}
