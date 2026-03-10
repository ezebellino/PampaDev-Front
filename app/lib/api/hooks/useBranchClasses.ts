import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "../api";
import type { BranchClassRecord } from "../models/branchClass";
import { getClassesByBranch } from "../services/classes";

function isAbort(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error && (error as { name?: string }).name === "AbortError";
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number";
}

export function useBranchClasses(branchId: number | null) {
  const [data, setData] = useState<BranchClassRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

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

    getClassesByBranch(branchId, ctrl.signal)
      .then((response) => {
        if (!alive) return;
        setData(Array.isArray(response) ? response : []);
      })
      .catch((err: unknown) => {
        if (!alive || isAbort(err)) return;

        if (isApiError(err) && (err.status === 404 || err.status === 501 || err.status === 503)) {
          setUnavailable(true);
          setData(null);
          setError(null);
          return;
        }

        setData(null);
        setError(err instanceof Error ? err.message : "No se pudieron cargar las clases de la sucursal.");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [branchId, version]);

  return { data, loading, error, unavailable, refresh };
}
