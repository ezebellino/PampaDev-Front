import { apiGet, apiPost } from "../api";
import type { BranchClassRecord } from "../models/branchClass";

export function getClassesByBranch(idBranch: number, signal?: AbortSignal) {
  return apiGet<BranchClassRecord[]>(`/api/Classes/byBranch/${idBranch}`, signal);
}

export type ClassReservationRequest = {
  branchId: number;
  rubroId: string;
  slotId: string;
  userId: string;
  date: string;
  time: string;
};

export type ClassReservationResponse = {
  id: string;
  branchId: number;
  rubroId: string;
  slotId: string;
  userId: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

export function createClassReservation(payload: ClassReservationRequest) {
  return apiPost<ClassReservationResponse>("/api/Reservations", payload);
}
