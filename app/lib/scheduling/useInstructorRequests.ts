import { useCallback, useEffect, useMemo, useState } from "react";
import { releasePublishedAgendaSlot } from "./publishedAgenda";
import {
  cancelBooking,
  confirmBooking,
  getBookingsByBranch,
  getBookingsByUser,
  rejectBooking,
  type BookingApiRecord,
} from "../api/services/bookings";

export type InstructorReservationStatus = "pending" | "confirmed" | "rejected" | "cancelled";
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
  backendBookingId?: string | number;
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

function readNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBookingStatus(value: unknown): InstructorReservationStatus {
  if (typeof value === "number") {
    if (value === 1) return "confirmed";
    if (value === 2) return "cancelled";
    if (value === 3) return "rejected";
    return "pending";
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes("confirm")) return "confirmed";
    if (normalized.includes("cancel")) return "cancelled";
    if (normalized.includes("reject") || normalized.includes("rech")) return "rejected";
    if (normalized.includes("reserv") || normalized.includes("pend")) return "pending";
  }

  return "pending";
}

function buildSlotLabel(date?: string, time?: string) {
  const parts = [date, time].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function buildSyncedRequest(record: BookingApiRecord, fallbackBranchId?: number | null, fallbackUserId?: string | null): InstructorReservationRequest {
  const bookingId = readNumber(record.idBooking) ?? Date.now();
  const branchId = readNumber(record.idBranch) ?? readNumber(fallbackBranchId) ?? 0;
  const userId = readNumber(record.idUser)?.toString() ?? fallbackUserId ?? `booking-${bookingId}`;
  const date = typeof record.date === "string" ? record.date : undefined;
  const time = typeof record.time === "string" ? record.time : undefined;
  const disciplineName =
    typeof record.disciplineName === "string" && record.disciplineName.trim().length > 0
      ? record.disciplineName.trim()
      : undefined;

  return {
    id: `booking-${bookingId}`,
    branchId,
    rubroId: disciplineName ?? `Reserva #${bookingId}`,
    rubroName: disciplineName,
    slotId: String(readNumber(record.idClass) ?? bookingId),
    slotLabel: buildSlotLabel(date, time),
    userId,
    userName: typeof record.userName === "string" && record.userName.trim().length > 0 ? record.userName.trim() : undefined,
    backendBookingId: bookingId,
    backendClassId: readNumber(record.idClass) ?? undefined,
    date,
    time,
    status: normalizeBookingStatus(record.bookingStatus),
    bookingSource: "api",
    syncStatus: "synced",
    createdAt:
      (typeof record.cancellationDate === "string" && record.cancellationDate) ||
      (typeof record.date === "string" && record.date) ||
      new Date().toISOString(),
  };
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

function getUnsyncedRequests(branchId?: number, userId?: string | null) {
  return sortRequests(
    readRequestsFromStorage().filter((item) => {
      if (item.syncStatus === "synced") return false;
      if (branchId != null && item.branchId !== branchId) return false;
      if (userId != null && item.userId !== userId) return false;
      return true;
    })
  );
}

async function readSyncedBranchRequests(branchId: number) {
  const records = await getBookingsByBranch(branchId);
  return sortRequests(records.map((record) => buildSyncedRequest(record, branchId, null)));
}

async function readSyncedUserRequests(userId: string, branchId: number | null) {
  const numericUserId = readNumber(userId);
  if (numericUserId == null) {
    return [] as InstructorReservationRequest[];
  }

  const records = await getBookingsByUser(numericUserId);
  return sortRequests(records.map((record) => buildSyncedRequest(record, branchId, userId)));
}

export function persistInstructorReservationRequest(request: InstructorReservationRequest) {
  const current = readRequestsFromStorage();
  const duplicated = current.find(
    (item) => item.branchId === request.branchId && item.slotId === request.slotId && item.userId === request.userId && item.status !== "rejected" && item.status !== "cancelled"
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
  let releasedBranchId: number | null = null;
  let releasedSlotId: string | null = null;
  const next = sortRequests(
    all.map((item) => {
      if (item.id !== requestId) return item;
      const previousStatus = item.status;
      const shouldRelease = (status === "rejected" || status === "cancelled") && previousStatus !== "rejected" && previousStatus !== "cancelled";
      if (shouldRelease) {
        releasedBranchId = item.branchId;
        releasedSlotId = item.slotId;
      }
      return { ...item, status };
    })
  );

  if (releasedBranchId != null && releasedSlotId) {
    releasePublishedAgendaSlot(releasedBranchId, releasedSlotId);
  }

  writeRequestsToStorage(next);
  return next;
}

export function useInstructorReservationRequests(branchId: number | null) {
  const [requests, setRequests] = useState<InstructorReservationRequest[]>([]);

  const refresh = useCallback(async () => {
    const localItems = getUnsyncedRequests(branchId ?? undefined);

    if (branchId == null) {
      setRequests(localItems);
      return localItems;
    }

    try {
      const synced = await readSyncedBranchRequests(branchId);
      const next = sortRequests([...synced, ...localItems]);
      setRequests(next);
      return next;
    } catch {
      setRequests(localItems);
      return localItems;
    }
  }, [branchId]);

  useEffect(() => {
    void refresh();
    return subscribeToInstructorReservationRequests(() => {
      void refresh();
    });
  }, [refresh]);

  const confirmRequest = useCallback(
    async (requestId: string) => {
      const request = requests.find((item) => item.id === requestId);
      if (!request) return;

      if (request.syncStatus === "synced" && request.backendBookingId != null) {
        try {
          await confirmBooking(Number(request.backendBookingId));
        } finally {
          await refresh();
        }
        return;
      }

      const next = updateInstructorReservationStatus(requestId, "confirmed");
      setRequests(next.filter((item) => (branchId == null ? true : item.branchId === branchId)));
    },
    [branchId, refresh, requests]
  );

  const rejectRequest = useCallback(
    async (requestId: string) => {
      const request = requests.find((item) => item.id === requestId);
      if (!request) return;

      if (request.syncStatus === "synced" && request.backendBookingId != null) {
        try {
          await rejectBooking(Number(request.backendBookingId));
        } finally {
          await refresh();
        }
        return;
      }

      const next = updateInstructorReservationStatus(requestId, "rejected");
      setRequests(next.filter((item) => (branchId == null ? true : item.branchId === branchId)));
    },
    [branchId, refresh, requests]
  );

  const pending = useMemo(() => requests.filter((item) => item.status === "pending"), [requests]);
  const confirmed = useMemo(() => requests.filter((item) => item.status === "confirmed"), [requests]);

  return { requests, pending, confirmed, refresh, confirmRequest, rejectRequest };
}

export function useMyReservationRequests(userId: string | null | undefined, branchId: number | null) {
  const [requests, setRequests] = useState<InstructorReservationRequest[]>([]);

  const refresh = useCallback(async () => {
    const localItems = getUnsyncedRequests(branchId ?? undefined, userId ?? null);

    if (!userId) {
      setRequests(localItems);
      return localItems;
    }

    try {
      const synced = await readSyncedUserRequests(userId, branchId);
      const next = sortRequests([...synced, ...localItems]);
      setRequests(next);
      return next;
    } catch {
      setRequests(localItems);
      return localItems;
    }
  }, [userId, branchId]);

  useEffect(() => {
    void refresh();
    return subscribeToInstructorReservationRequests(() => {
      void refresh();
    });
  }, [refresh]);

  const pending = useMemo(() => requests.filter((item) => item.status === "pending"), [requests]);
  const confirmed = useMemo(() => requests.filter((item) => item.status === "confirmed"), [requests]);
  const cancelled = useMemo(() => requests.filter((item) => item.status === "cancelled"), [requests]);
  const rejected = useMemo(() => requests.filter((item) => item.status === "rejected"), [requests]);

  const cancelRequest = useCallback(
    async (requestId: string) => {
      const request = requests.find((item) => item.id === requestId);
      if (!request) return;

      if (request.syncStatus === "synced" && request.backendBookingId != null) {
        try {
          await cancelBooking(Number(request.backendBookingId));
        } finally {
          await refresh();
        }
        return;
      }

      const next = updateInstructorReservationStatus(requestId, "cancelled");
      setRequests(sortRequests(next.filter((item) => item.userId === userId && (branchId == null ? true : item.branchId === branchId))));
    },
    [userId, branchId, refresh, requests]
  );

  return { requests, pending, confirmed, cancelled, rejected, refresh, cancelRequest };
}
