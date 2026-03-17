import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getClassesByBranch } from "../api/services/classes";
import type { BranchClassRecord } from "../api/models/branchClass";

export function useNextTurnos(branchId: number | null) {
  const query = useQuery({
    queryKey: ["branch-classes", branchId],
    queryFn: async ({ signal }) => {
      if (branchId == null) return [] as BranchClassRecord[];
      return getClassesByBranch(branchId, signal);
    },
    enabled: branchId != null,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const nextTurnos = useMemo(() => {
    if (!query.data) return [] as BranchClassRecord[];

    const now = new Date();

    return query.data
      .map((slot) => {
        const slotDate = new Date(`${slot.date}T${slot.time}`);
        return { slot, slotDate };
      })
      .filter(({ slotDate }) => slotDate >= now)
      .sort((a, b) => a.slotDate.getTime() - b.slotDate.getTime())
      .slice(0, 5)
      .map(({ slot }) => slot);
  }, [query.data]);

  return {
    turnos: nextTurnos,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
