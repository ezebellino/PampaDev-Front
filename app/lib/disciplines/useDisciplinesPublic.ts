import { useEffect, useState } from "react";
import { apiGet } from "~/lib/api/api";

export type Discipline = { idDiscipline: number; name: string };

export function useDisciplinesPublic() {
  const [data, setData] = useState<Discipline[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);

    apiGet<Discipline[]>("/api/Disciplines", ctrl.signal)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, []);

  return { data, loading };
}