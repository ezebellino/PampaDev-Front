import { apiGet, apiPost, apiPut } from "../api";
import { logApiError, logInfo } from "../../utils/logger";

export type MembershipApiRecord = {
  idMembership: number;
  name: string;
  price: number;
  disciplinesCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type MembershipCreatePayload = {
  name: string;
  price: number;
  disciplinesCount: number;
};

export type MembershipUpdatePayload = MembershipCreatePayload & {
  idMembership: number;
};

export async function getMemberships() {
  try {
    const data = await apiGet<MembershipApiRecord[]>("/api/Memberships");
    logInfo("Memberships: fetched", { count: data.length }, { feature: "memberships", layer: "service" });
    return data;
  } catch (error) {
    logApiError("Memberships: fetch failed", error, { feature: "memberships", layer: "service" });
    throw error;
  }
}

export async function createMembership(payload: MembershipCreatePayload) {
  try {
    const data = await apiPost<MembershipApiRecord | void>("/api/Memberships", payload);
    logInfo("Memberships: created", { name: payload.name }, { feature: "memberships", layer: "service" });
    return data ?? null;
  } catch (error) {
    logApiError("Memberships: create failed", error, {
      feature: "memberships",
      layer: "service",
      meta: payload,
    });
    throw error;
  }
}

export async function updateMembership(idMembership: number, payload: MembershipUpdatePayload) {
  try {
    await apiPut<void>(`/api/Memberships/${idMembership}`, payload);
    logInfo("Memberships: updated", { idMembership, name: payload.name }, { feature: "memberships", layer: "service" });
  } catch (error) {
    logApiError("Memberships: update failed", error, {
      feature: "memberships",
      layer: "service",
      meta: payload,
    });
    throw error;
  }
}
