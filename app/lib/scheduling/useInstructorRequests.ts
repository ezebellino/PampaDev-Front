import { useCallback, useEffect, useMemo, useState } from "react";

type InstructorReservationStatus = "pending" | "confirmed" | "rejected";

export type InstructorReservationRequest = {
  id: string;
  branchId: number;
  rubroId: string;
  slotId: string;
  userId: string;
  backendClassId?: string | number;
  date?: string;
  time?: string;
  status: InstructorReservationStatus;
  createdAt: string;
};

const STORAGE_KEY = "pampaDev-instructor-reservation-requests";

function readRequestsFromStorage(): InstructorReservationRequest[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InstructorReservationRequest[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeRequestsToStorage(requests: InstructorReservationRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function persistInstructorReservationRequest(request: InstructorReservationRequest) {
  const current = readRequestsFromStorage();
  const next = [...current, request];
  writeRequestsToStorage(next);
}

export function getInstructorReservationRequests(branchId?: number) {
  const all = readRequestsFromStorage();
  if (branchId == null) return all;
  return all.filter((request) => request.branchId === branchId);
}

export function updateInstructorReservationStatus(requestId: string, status: InstructorReservationStatus) {
  const all = readRequestsFromStorage();
  const next = all.map((item) => (item.id === requestId ? { ...item, status } : item));
  writeRequestsToStorage(next);
  return next;
}

export function useInstructorReservationRequests(branchId: number | null) {
  const [requests, setRequests] = useState<InstructorReservationRequest[]>([]);

  useEffect(() => {
    const items = getInstructorReservationRequests(branchId ?? undefined);
    setRequests(items);
  }, [branchId]);

  const refresh = useCallback(() => {
    const items = getInstructorReservationRequests(branchId ?? undefined);
    setRequests(items);
  }, [branchId]);

  const confirmRequest = useCallback(
    (requestId: string) => {
      const next = updateInstructorReservationStatus(requestId, "confirmed");
      setRequests(next.filter((item) => (branchId == null ? true : item.branchId === branchId)));
    },
    [branchId]
  );

  const rejectRequest = useCallback(
    (requestId: string) => {
      const next = updateInstructorReservationStatus(requestId, "rejected");
      setRequests(next.filter((item) => (branchId == null ? true : item.branchId === branchId)));
    },
    [branchId]
  );

  const pending = useMemo(() => requests.filter((item) => item.status === "pending"), [requests]);
  const confirmed = useMemo(() => requests.filter((item) => item.status === "confirmed"), [requests]);

  return { requests, pending, confirmed, refresh, confirmRequest, rejectRequest };
}
