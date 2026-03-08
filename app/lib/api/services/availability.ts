import { apiGet, apiPut } from "../api";

export type TimeRange = { start: string; end: string };
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WeeklyAvailability = {
  idBranch: number;
  timezone: string;
  days: Record<Weekday, TimeRange[]>;
  updatedAt?: string;
};

export function getBranchAvailability(idBranch: number, signal?: AbortSignal) {
  return apiGet<WeeklyAvailability>(`/api/Branches/${idBranch}/availability`, signal);
}

export function updateBranchAvailability(idBranch: number, body: WeeklyAvailability) {
  return apiPut<WeeklyAvailability>(`/api/Branches/${idBranch}/availability`, body);
}