import { useEffect, useState } from "react";
import type { Branch } from "../models/branch";
import { getBranches } from "../services/branches";
import type { ApiError } from "../api";

export function useBranches() {
  const [data, setData] = useState<Branch[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    getBranches()
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}
