import { useEffect, useState } from "react";
import {
  createDiscipline,
  deleteDiscipline,
  getDisciplines,
  updateDiscipline,
  type Discipline,
} from "../api/services/disciplines";
import { logApiError, logInfo } from "../utils/logger";

export function useDisciplines() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const result = await getDisciplines();
      setDisciplines(result);
      logInfo("Disciplines loaded", { count: result.length }, { layer: "hook", feature: "disciplines" });
    } catch (error: any) {
      const message = error?.message || "Error cargando disciplinas";
      setError(message);
      logApiError("Disciplines load failed", error, { layer: "hook", feature: "disciplines" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("El nombre es obligatorio.");

    await createDiscipline({ name: trimmed });
    logInfo("Discipline created", { name: trimmed }, { layer: "hook", feature: "disciplines" });
    await refresh();
  }

  async function update(id: number, name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("El nombre es obligatorio.");

    await updateDiscipline(id, { name: trimmed });
    logInfo("Discipline updated", { id, name: trimmed }, { layer: "hook", feature: "disciplines" });
    await refresh();
  }

  async function remove(discipline: Discipline) {
    await deleteDiscipline(discipline.idDiscipline);
    logInfo(
      "Discipline deleted",
      { id: discipline.idDiscipline, name: discipline.name },
      { layer: "hook", feature: "disciplines" }
    );
    await refresh();
  }

  return { disciplines, loading, error, refresh, create, update, remove };
}
