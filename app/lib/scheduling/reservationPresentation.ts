import type { InstructorReservationRequest } from "./useInstructorRequests";

type BadgeTone = "neutral" | "success" | "warning";

export function getReservationStatusLabel(status: InstructorReservationRequest["status"]) {
  if (status === "confirmed") return "Confirmada";
  if (status === "rejected") return "Rechazada";
  if (status === "cancelled") return "Cancelada";
  return "Pendiente";
}

export function getReservationStatusTone(status: InstructorReservationRequest["status"]): BadgeTone {
  if (status === "confirmed") return "success";
  if (status === "pending") return "warning";
  return "neutral";
}

export function getReservationSyncLabel(syncStatus: InstructorReservationRequest["syncStatus"]) {
  return syncStatus === "synced" ? "Sincronizada" : "Lista para backend";
}

export function getReservationSyncTone(syncStatus: InstructorReservationRequest["syncStatus"]): BadgeTone {
  return syncStatus === "synced" ? "success" : "neutral";
}

export function getReservationSourceLabel(source: InstructorReservationRequest["bookingSource"]) {
  return source === "api" ? "Clase real" : "Franja planificada";
}

export function getReservationSourceTone(source: InstructorReservationRequest["bookingSource"]): BadgeTone {
  return source === "api" ? "success" : "neutral";
}

export function getReservationOperationalCopy(request: InstructorReservationRequest) {
  return request.syncStatus === "synced"
    ? "La reserva ya quedó vinculada al backend y sigue su operación normal en sucursal."
    : "La reserva quedó guardada en frontend y está lista para conectarse cuando el backend complete esa parte del flujo.";
}
