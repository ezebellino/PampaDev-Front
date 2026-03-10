import { apiGet } from "../api";
import type { BranchClassRecord } from "../models/branchClass";

export function getClassesByBranch(idBranch: number, signal?: AbortSignal) {
  return apiGet<BranchClassRecord[]>(`/api/Classes/byBranch/${idBranch}`, signal);
}
