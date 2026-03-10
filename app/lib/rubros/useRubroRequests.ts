import { useEffect, useState } from "react";
import { loadRequests, makeId, saveRequests, type RubroRequest } from "./rubroRequests";

export function useRubroRequests() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RubroRequest[]>([]);

  useEffect(() => {
    setRequests(loadRequests());
    setLoading(false);
  }, []);

  function updateRequests(updater: (current: RubroRequest[]) => RubroRequest[]) {
    setRequests((current) => {
      const next = updater(current);
      saveRequests(next);
      return next;
    });
  }

  function createRequest(payload: Omit<RubroRequest, "id" | "createdAt" | "status">) {
    const request: RubroRequest = {
      ...payload,
      id: makeId(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    updateRequests((current) => [request, ...current]);
    return request;
  }

  function approve(id: string, devNotes?: string, reviewedBy?: string) {
    updateRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "approved",
              devNotes,
              reviewedBy: reviewedBy ?? request.reviewedBy,
              reviewedAt: new Date().toISOString(),
            }
          : request
      )
    );
  }

  function reject(id: string, devNotes?: string, reviewedBy?: string) {
    updateRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "rejected",
              devNotes,
              reviewedBy: reviewedBy ?? request.reviewedBy,
              reviewedAt: new Date().toISOString(),
            }
          : request
      )
    );
  }

  return { requests, loading, createRequest, approve, reject };
}
