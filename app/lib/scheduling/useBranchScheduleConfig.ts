import { useCallback, useEffect, useState } from "react";
import type { Discipline } from "../api/services/disciplines";
import type { BranchScheduleConfig } from "./types";
import { loadBranchScheduleConfig, saveBranchScheduleConfig } from "./storage";

export function useBranchScheduleConfig(branchId: number | null, disciplines: Discipline[]) {
  const [data, setData] = useState<BranchScheduleConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (branchId == null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const next = loadBranchScheduleConfig(branchId, disciplines);
    setData(next);
    setLoading(false);
  }, [branchId, disciplines]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    (next: BranchScheduleConfig) => {
      if (branchId == null) return null;
      const saved = saveBranchScheduleConfig(branchId, next);
      setData(saved);
      return saved;
    },
    [branchId]
  );

  return { data, loading, refresh, save };
}
