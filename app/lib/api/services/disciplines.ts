import { apiGet, apiPost, apiPut, apiDelete } from "../api";
import { logInfo, logError } from "../../utils/logger";

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
        // muchos backends aceptan { name }
        const data = await apiPost<Discipline>("/api/Disciplines", payload);
        logInfo("Disciplines: created", { id: data.idDiscipline, name: data.name });
        return data;
    } catch (e) {
        logError("Disciplines: create failed", { payload, error: e });
        throw e;
    }
}

/** PUT /api/Disciplines/{id} */
export async function updateDiscipline(id: number, payload: Partial<DisciplineUpdate>) {
    try {
        const body = { idDiscipline: id, ...payload };

        // Si el backend devuelve 204, esto retorna undefined
        const data = await apiPut<Discipline | void>(`/api/Disciplines/${id}`, body);

        // Log seguro (no asumas data.name)
        logInfo("Disciplines: updated", {
            id,
            name: payload.name,
            returnedBody: !!data,
        });

        // devolvemos algo útil para el caller
        return data ?? { idDiscipline: id, name: payload.name ?? "" };
    } catch (e) {
        logError("Disciplines: update failed", { id, payload, error: e });
        throw e;
    }
}

/** DELETE /api/Disciplines/{id} */
export async function deleteDiscipline(id: number) {
    try {
        await apiDelete<void>(`/api/Disciplines/${id}`);
        logInfo("Disciplines: deleted", { id });
    } catch (e) {
        logError("Disciplines: delete failed", { id, error: e });
        throw e;
    }
}
