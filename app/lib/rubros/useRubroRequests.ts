import { useEffect, useMemo, useState } from "react";
import { loadRequests, saveRequests, type RubroRequest, makeId } from "./rubroRequests";

export function useRubroRequests() {
  const [hydrated, setHydrated] = useState(false);
  const [requests, setRequests] = useState<RubroRequest[]>([]);

  useEffect(() => {
    setRequests(loadRequests());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveRequests(requests);
  }, [requests, hydrated]);

  const api = useMemo(() => ({
    hydrated,
    requests,
    createRequest: (payload: Omit<RubroRequest, "id" | "createdAt" | "status">) => {
      const req: RubroRequest = {
        ...payload,
        id: makeId(),
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      setRequests(prev => [req, ...prev]);
      return req;
    },
    approve: (id: string, devNotes?: string) => {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved", devNotes } : r));
    },
    reject: (id: string, devNotes?: string) => {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", devNotes } : r));
    },
  }), [requests, hydrated]);

  return api;
}
