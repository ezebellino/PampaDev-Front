import { useMemo } from "react";
import type { Branch } from "../models/branch";

export function useCompanyBranches(branches: Branch[] | null | undefined, companyId: number | null) {
  return useMemo(() => {
    if (!branches || companyId == null) return [];
    return branches.filter((b) => b.idCompany === companyId);
  }, [branches, companyId]);
}