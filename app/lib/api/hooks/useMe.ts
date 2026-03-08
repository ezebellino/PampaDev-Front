import { useEffect, useState } from "react";
import type { ApiError } from "../api";
import { getMe, type MeResponse } from "../services/users";

export function useMe(enabled: boolean) {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function refresh() {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      const res = await getMe();
      setData(res);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { me: data, loading, error, refresh };
}