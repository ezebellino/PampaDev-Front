import { useCallback, useEffect, useState } from "react";
import type { BranchMembershipCatalog, MembershipPlan, MembershipPlanInput, PrivateClassOffer } from "./types";
import { buildMembershipPlan, loadBranchMembershipCatalog, saveBranchMembershipCatalog } from "./storage";

export function useBranchMembershipCatalog(branchId: number | null) {
  const [data, setData] = useState<BranchMembershipCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (branchId == null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const next = loadBranchMembershipCatalog(branchId);
    setData(next);
    setLoading(false);
  }, [branchId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveCatalog = useCallback(
    (next: BranchMembershipCatalog) => {
      if (branchId == null) return null;
      const saved = saveBranchMembershipCatalog(branchId, next);
      setData(saved);
      return saved;
    },
    [branchId]
  );

  const createPlan = useCallback(
    (input: MembershipPlanInput) => {
      if (!data) return null;
      const plan = buildMembershipPlan(input);
      return saveCatalog({
        ...data,
        plans: [plan, ...data.plans],
      });
    },
    [data, saveCatalog]
  );

  const updatePlan = useCallback(
    (idMembershipPlan: number, input: MembershipPlanInput) => {
      if (!data) return null;
      const current = data.plans.find((plan) => plan.idMembershipPlan === idMembershipPlan);
      if (!current) return null;

      const updated: MembershipPlan = {
        ...buildMembershipPlan(input, idMembershipPlan),
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      };

      return saveCatalog({
        ...data,
        plans: data.plans.map((plan) => (plan.idMembershipPlan === idMembershipPlan ? updated : plan)),
      });
    },
    [data, saveCatalog]
  );

  const removePlan = useCallback(
    (idMembershipPlan: number) => {
      if (!data) return null;
      return saveCatalog({
        ...data,
        plans: data.plans.filter((plan) => plan.idMembershipPlan !== idMembershipPlan),
      });
    },
    [data, saveCatalog]
  );

  const savePrivateClass = useCallback(
    (privateClass: PrivateClassOffer) => {
      if (!data) return null;
      return saveCatalog({
        ...data,
        privateClass,
      });
    },
    [data, saveCatalog]
  );

  return {
    data,
    loading,
    refresh,
    createPlan,
    updatePlan,
    removePlan,
    savePrivateClass,
  };
}
