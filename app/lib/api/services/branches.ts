import type { Branch } from "../models/branch";
import { apiGet, apiPost } from "../api";
import { logApiError, logInfo } from "../../utils/logger";

export type BranchCreatePayload = {
  address: string;
  description: string;
  idCompany: number;
  idCity: number;
};

export async function getBranches() {
  try {
    const data = await apiGet<Branch[]>("/api/Branches");
    logInfo("Branches: fetched", { count: data.length }, { feature: "branches", layer: "service" });
    return data;
  } catch (error) {
    logApiError("Branches: fetch failed", error, { feature: "branches", layer: "service" });
    throw error;
  }
}

export async function createBranch(payload: BranchCreatePayload) {
  try {
    const data = await apiPost<Branch | void>("/api/Branches", payload);
    logInfo(
      "Branches: created",
      { idCompany: payload.idCompany, idCity: payload.idCity },
      { feature: "branches", layer: "service" }
    );
    return data ?? null;
  } catch (error) {
    logApiError("Branches: create failed", error, {
      feature: "branches",
      layer: "service",
      meta: payload,
    });
    throw error;
  }
}
