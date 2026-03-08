import { useEffect, useState } from "react";
import type { Discipline } from "../api/services/disciplines"; // o tu types si querés, abajo te digo
import { getDisciplines } from "../api/services/disciplines";
import { logInfo, logError, logSystem } from "../utils/logger";

export function useDisciplines() {
  const [data, setData] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const res = await getDisciplines();
      setData(res);
      logSystem("info", "Disciplines loaded", { count: res.length });
    } catch (e: any) {
      const msg = e?.message || "Error cargando disciplinas";
      setError(msg);
      logSystem("error", "Disciplines load failed", { msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { disciplines: data, loading, error, refresh };
}
