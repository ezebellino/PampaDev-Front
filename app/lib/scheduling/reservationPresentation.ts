import type { InstructorReservationRequest } from "./useInstructorRequests";

type BadgeTone = "neutral" | "success" | "warning";

export function getReservationStatusLabel(status: InstructorReservationRequest["status"]) {
  if (status === "confirmed") return "Confirmada";
  if (status === "rejected") return "Rechazada";
  if (status === "cancelled") return "Cancelada";
  return "Reservada";
}

export function getReservationStatusTone(status: InstructorReservationRequest["status"]): BadgeTone {
  if (status === "confirmed") return "success";
  if (status === "pending") return "warning";
  return "neutral";
}

export function getReservationSyncLabel(syncStatus: InstructorReservationRequest["syncStatus"]) {
  return syncStatus === "synced" ? "Registrada en backend" : "Fallback local";
}

export function getReservationSyncTone(syncStatus: InstructorReservationRequest["syncStatus"]): BadgeTone {
  return syncStatus === "synced" ? "success" : "warning";
}

export function getReservationSourceLabel(source: InstructorReservationRequest["bookingSource"]) {
  return source === "api" ? "Booking real" : "Franja planificada";
}

export function getReservationSourceTone(source: InstructorReservationRequest["bookingSource"]): BadgeTone {
  return source === "api" ? "success" : "neutral";
}

export function getReservationOperationalCopy(request: InstructorReservationRequest) {
  return request.syncStatus === "synced"
    ? "La reserva ya existe en backend y puede confirmarse, rechazarse o cancelarse desde los endpoints reales de bookings."
    : "La reserva sigue en fallback local porque ese horario todavia no expone un idClass utilizable para crear el booking real.";
}
