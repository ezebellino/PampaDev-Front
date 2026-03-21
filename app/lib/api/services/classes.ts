import { apiGet, apiPost } from "../api";
import type { BranchClassRecord } from "../models/branchClass";

export function getClassesByBranch(idBranch: number, signal?: AbortSignal) {
  return apiGet<BranchClassRecord[]>(`/api/Classes/byBranch/${idBranch}`, signal);
}

export type CreateClassPayload = {
  date: string;
  time: string;
  idBranchDiscipline: number;
  idUser: number;
  capacity: number;
  duration: number;
  creditUsage: number;
  creditRefund: number;
  status: number;
};

export type CreatedClassResponse = BranchClassRecord & Record<string, unknown>;

export function createClass(payload: CreateClassPayload) {
  return apiPost<CreatedClassResponse | void>("/api/Classes", payload);
}
