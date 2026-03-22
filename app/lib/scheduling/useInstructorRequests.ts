import { useCallback, useEffect, useMemo, useState } from "react";

export type InstructorReservationStatus = "pending" | "confirmed" | "rejected";
export type InstructorReservationSyncStatus = "synced" | "pending-backend";
export type InstructorReservationSource = "api" | "planned";

export type InstructorReservationRequest = {
  id: string;
  branchId: number;
  rubroId: string;
  rubroName?: string;
  slotId: string;
  slotLabel?: string;
  userId: string;
  userName?: string;
  backendClassId?: string | number;
  branchDisciplineId?: number;
  date?: string;
  time?: string;
  status: InstructorReservationStatus;
  bookingSource?: InstructorReservationSource;
  syncStatus?: InstructorReservationSyncStatus;
  createdAt: string;
};

const STORAGE_KEY = "pampaDev-instructor-reservation-requests";
const REQUESTS_CHANGED_EVENT = "pampadev:instructor-reservation-requests:changed";

function emitRequestsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REQUESTS_CHANGED_EVENT));
}

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
  emitRequestsChanged();
}

function sortRequests(requests: InstructorReservationRequest[]) {
  return requests.slice().sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
}

export function persistInstructorReservationRequest(request: InstructorReservationRequest) {
  const current = readRequestsFromStorage();
  const duplicated = current.find(
    (item) => item.branchId === request.branchId && item.slotId === request.slotId && item.userId === request.userId && item.status !== "rejected"
  );

  if (duplicated) {
    return duplicated;
  }

  const next = sortRequests([...current, request]);
  writeRequestsToStorage(next);
  return request;
}

export function getInstructorReservationRequests(branchId?: number) {
  const all = readRequestsFromStorage();
  if (branchId == null) return all;
  return all.filter((request) => request.branchId === branchId);
}

export function getUserReservationRequests(userId?: string | null, branchId?: number | null) {
  if (!userId) return [];
  return getInstructorReservationRequests(branchId ?? undefined).filter((request) => request.userId === userId);
}

export function subscribeToInstructorReservationRequests(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      onChange();
    }
  }

  function handleCustomChange() {
    onChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(REQUESTS_CHANGED_EVENT, handleCustomChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(REQUESTS_CHANGED_EVENT, handleCustomChange);
  };
}

export function updateInstructorReservationStatus(requestId: string, status: InstructorReservationStatus) {
  const all = readRequestsFromStorage();
  const next = sortRequests(all.map((item) => (item.id === requestId ? { ...item, status } : item)));
  writeRequestsToStorage(next);
  return next;
}

export function useInstructorReservationRequests(branchId: number | null) {
  const [requests, setRequests] = useState<InstructorReservationRequest[]>([]);

  const refresh = useCallback(() => {
    const items = getInstructorReservationRequests(branchId ?? undefined);
    setRequests(sortRequests(items));
  }, [branchId]);

  useEffect(() => {
    refresh();
    return subscribeToInstructorReservationRequests(refresh);
  }, [refresh]);

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

export function useMyReservationRequests(userId: string | null | undefined, branchId: number | null) {
  const [requests, setRequests] = useState<InstructorReservationRequest[]>([]);

  const refresh = useCallback(() => {
    setRequests(sortRequests(getUserReservationRequests(userId, branchId)));
  }, [userId, branchId]);

  useEffect(() => {
    refresh();
    return subscribeToInstructorReservationRequests(refresh);
  }, [refresh]);

  const pending = useMemo(() => requests.filter((item) => item.status === "pending"), [requests]);
  const confirmed = useMemo(() => requests.filter((item) => item.status === "confirmed"), [requests]);

  return { requests, pending, confirmed, refresh };
}
