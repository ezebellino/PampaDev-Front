import { apiGet, apiPost } from "../api";
import type { Company } from "../models/company";
import { logApiError, logInfo } from "../../utils/logger";

export type CompanyCreatePayload = {
  fantasyName: string;
  tradeName: string;
  cuitCuilDNI: string;
};

export async function getCompanies() {
  try {
    const data = await apiGet<Company[]>("/api/Companies");
    logInfo("Companies: fetched", { count: data.length }, { feature: "companies", layer: "service" });
    return data;
  } catch (error) {
    logApiError("Companies: fetch failed", error, { feature: "companies", layer: "service" });
    throw error;
  }
}

export async function createCompany(payload: CompanyCreatePayload) {
  try {
    const data = await apiPost<Company | void>("/api/Companies", payload);
    logInfo("Companies: created", { fantasyName: payload.fantasyName }, { feature: "companies", layer: "service" });
    return data ?? null;
  } catch (error) {
    logApiError("Companies: create failed", error, {
      feature: "companies",
      layer: "service",
      meta: { fantasyName: payload.fantasyName },
    });
    throw error;
  }
}
