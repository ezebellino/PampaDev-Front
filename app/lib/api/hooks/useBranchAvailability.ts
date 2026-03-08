import { useEffect, useState } from "react";
import type { WeeklyAvailability } from "../services/availability";
import { getBranchAvailability } from "../services/availability";
import type { ApiError } from "../api"; // si tu parseError devuelve {status,message,url}

function isAbort(e: any) {
  return e?.name === "AbortError";
}

function isApiError(e: any): e is ApiError {
  return e && typeof e === "object" && typeof e.status === "number";
}

export function useBranchAvailability(branchId: number | null) {
  const [data, setData] = useState<WeeklyAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false); // 👈 nuevo

  useEffect(() => {
    if (branchId == null) {
      setData(null);
      setError(null);
      setUnavailable(false);
      return;
    }

    const ctrl = new AbortController();
    let alive = true;

    setLoading(true);
    setError(null);
    setUnavailable(false);

    getBranchAvailability(branchId, ctrl.signal)
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e: any) => {
        if (!alive || isAbort(e)) return;

        // 👇 endpoint todavía no implementado / no disponible
        if (isApiError(e) && (e.status === 404 || e.status === 501 || e.status === 503)) {
          setUnavailable(true);
          setData(null);
          setError(null);
          return;
        }

        setError(e?.message ?? "No se pudo cargar disponibilidad");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [branchId]);

  return { data, loading, error, unavailable, setData };
}