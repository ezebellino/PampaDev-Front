import { apiGet, apiPost, apiPut } from "../api";
import { logApiError, logInfo } from "../../utils/logger";

export type BookingApiRecord = {
  idBooking: number;
  idClass?: number;
  idUser?: number;
  idBranch?: number;
  date?: string;
  time?: string;
  classStatus?: string | number | null;
  bookingStatus?: string | number | null;
  cancellationDate?: string | null;
  userName?: string;
  disciplineName?: string;
} & Record<string, unknown>;

export type CreateBookingPayload = {
  idClass: number;
  idUser: number;
  notes?: string;
};

export async function getBookingsByUser(idUser: number) {
  try {
    const data = await apiGet<BookingApiRecord[]>(`/api/bookings/byUser/${idUser}`);
    logInfo("Bookings: fetched by user", { idUser, count: data.length }, { feature: "bookings", layer: "service" });
    return data;
  } catch (error) {
    logApiError("Bookings: fetch by user failed", error, { feature: "bookings", layer: "service", meta: { idUser } });
    throw error;
  }
}

export async function getBookingsByBranch(idBranch: number) {
  try {
    const data = await apiGet<BookingApiRecord[]>(`/api/bookings/byBranch/${idBranch}`);
    logInfo("Bookings: fetched by branch", { idBranch, count: data.length }, { feature: "bookings", layer: "service" });
    return data;
  } catch (error) {
    logApiError("Bookings: fetch by branch failed", error, {
      feature: "bookings",
      layer: "service",
      meta: { idBranch },
    });
    throw error;
  }
}

export async function createBooking(payload: CreateBookingPayload) {
  try {
    const data = await apiPost<BookingApiRecord | void>("/api/bookings", payload);
    logInfo("Bookings: created", { idClass: payload.idClass, idUser: payload.idUser }, { feature: "bookings", layer: "service" });
    return data ?? null;
  } catch (error) {
    logApiError("Bookings: create failed", error, { feature: "bookings", layer: "service", meta: payload });
    throw error;
  }
}

export async function confirmBooking(idBooking: number) {
  try {
    await apiPut<void>(`/api/bookings/Confirm/${idBooking}`, {});
    logInfo("Bookings: confirmed", { idBooking }, { feature: "bookings", layer: "service" });
  } catch (error) {
    logApiError("Bookings: confirm failed", error, { feature: "bookings", layer: "service", meta: { idBooking } });
    throw error;
  }
}

export async function cancelBooking(idBooking: number) {
  try {
    await apiPut<void>(`/api/bookings/Cancel/${idBooking}`, {});
    logInfo("Bookings: cancelled", { idBooking }, { feature: "bookings", layer: "service" });
  } catch (error) {
    logApiError("Bookings: cancel failed", error, { feature: "bookings", layer: "service", meta: { idBooking } });
    throw error;
  }
}

export async function rejectBooking(idBooking: number) {
  try {
    await apiPut<void>(`/api/bookings/Reject/${idBooking}`, {});
    logInfo("Bookings: rejected", { idBooking }, { feature: "bookings", layer: "service" });
  } catch (error) {
    logApiError("Bookings: reject failed", error, { feature: "bookings", layer: "service", meta: { idBooking } });
    throw error;
  }
}
