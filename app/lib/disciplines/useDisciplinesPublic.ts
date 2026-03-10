import { useEffect, useState } from "react";
import { apiGetPublic } from "~/lib/api/api";
import type { ApiError } from "~/lib/api/api";
import type { Discipline } from "~/lib/disciplines/types";

export type { Discipline } from "~/lib/disciplines/types";

export function useDisciplinesPublic() {
  const [data, setData] = useState<Discipline[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();

    setLoading(true);
    setForbidden(false);

    apiGetPublic<Discipline[]>("/api/Disciplines", ctrl.signal)
      .then((res) => setData(res))
      .catch((error: ApiError) => {
        if (error?.status === 401 || error?.status === 403) {
          setForbidden(true);
        }
        setData(null);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, []);

  return { data, loading, forbidden };
}
