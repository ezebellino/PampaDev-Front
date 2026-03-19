import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MembershipPlanInput, PrivateClassOffer } from "./types";
import {
  createMembershipPlan,
  loadBranchMembershipCatalog,
  removeMembershipPlan,
  saveMembershipPrivateClass,
  subscribeToBranchMembershipCatalog,
  updateMembershipPlan,
} from "./storage";

function membershipCatalogQueryKey(branchId: number | null) {
  return ["branch-membership-catalog", branchId] as const;
}

export function useBranchMembershipCatalog(branchId: number | null) {
  const queryClient = useQueryClient();
  const queryKey = membershipCatalogQueryKey(branchId);

  const query = useQuery({
    queryKey,
    enabled: branchId != null,
    queryFn: async () => {
      if (branchId == null) {
        throw new Error("Sucursal no seleccionada.");
      }
      return loadBranchMembershipCatalog(branchId);
    },
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
      return createMembershipPlan(branchId, input);
    },
    onSuccess: (catalog) => {
      queryClient.setQueryData(queryKey, catalog);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (payload: { idMembershipPlan: number; input: MembershipPlanInput }) => {
      if (branchId == null) throw new Error("Selecciona una sucursal para editar planes.");
      return updateMembershipPlan(branchId, payload.idMembershipPlan, payload.input);
    },
    onSuccess: (catalog) => {
      queryClient.setQueryData(queryKey, catalog);
    },
  });

  const removePlanMutation = useMutation({
    mutationFn: async (idMembershipPlan: number) => {
      if (branchId == null) throw new Error("Selecciona una sucursal para eliminar planes.");
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