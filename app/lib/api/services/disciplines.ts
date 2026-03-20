import { apiDelete, apiGet, apiPost, apiPut } from "../api";
import { logApiError, logInfo } from "../../utils/logger";

export type Discipline = {
  idDiscipline: number;
  name: string;
};

export type DisciplineCreate = {
  name: string;
};

export type DisciplineUpdate = {
  idDiscipline: number;
  name: string;
};

/** GET /api/Disciplines */
export async function getDisciplines() {
  const data = await apiGet<Discipline[]>("/api/Disciplines");
  logInfo("Disciplines: fetched", { count: data.length });
  return data;
}

/** GET /api/Disciplines/{id} */
export async function getDiscipline(id: number) {
  const data = await apiGet<Discipline>(`/api/Disciplines/${id}`);
  logInfo("Disciplines: fetched one", { id });
  return data;
}

/** POST /api/Disciplines */
export async function createDiscipline(payload: DisciplineCreate) {
  try {
    const data = await apiPost<Discipline>("/api/Disciplines", payload);
    logInfo("Disciplines: created", { id: data.idDiscipline, name: data.name });
    return data;
  } catch (error) {
    logApiError("Disciplines: create failed", error, { feature: "disciplines", layer: "service" });
    throw error;
  }
}

/** PUT /api/Disciplines/{id} */
export async function updateDiscipline(id: number, payload: Partial<DisciplineUpdate>) {
  try {
    const body = { idDiscipline: id, ...payload };
    const data = await apiPut<Discipline | void>(`/api/Disciplines/${id}`, body);

    logInfo("Disciplines: updated", {
      id,
      name: payload.name,
      returnedBody: !!data,
    });

    return data ?? { idDiscipline: id, name: payload.name ?? "" };
  } catch (error) {
    logApiError("Disciplines: update failed", error, {
      feature: "disciplines",
      layer: "service",
      meta: { id, payload },
    });
    throw error;
  }
}

/** DELETE /api/Disciplines/{id} */
export async function deleteDiscipline(id: number) {
  try {
    await apiDelete<void>(`/api/Disciplines/${id}`);
    logInfo("Disciplines: deleted", { id });
  } catch (error) {
    logApiError("Disciplines: delete failed", error, {
      feature: "disciplines",
      layer: "service",
      meta: { id },
    });
    throw error;
  }
}
