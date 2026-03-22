import { useMemo } from "react";
import { useMyReservationRequests } from "./useInstructorRequests";

export function useNextTurnos(userId: string | null, branchId: number | null) {
  const { requests, pending, confirmed, refresh } = useMyReservationRequests(userId, branchId);

  const nextTurnos = useMemo(() => {
    const now = new Date();

    return requests
      .filter((request) => {
        if (!request.date || !request.time) return true;
        const requestDate = new Date(`${request.date}T${request.time}`);
        return Number.isNaN(requestDate.getTime()) || requestDate >= now;
      })
      .sort((a, b) => {
        const aTime = a.date && a.time ? new Date(`${a.date}T${a.time}`).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.date && b.time ? new Date(`${b.date}T${b.time}`).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [requests]);

  return {
    turnos: nextTurnos,
    loading: false,
    error: null,
    pendingCount: pending.length,
    confirmedCount: confirmed.length,
    refetch: refresh,
  };
}
