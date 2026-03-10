import type { RubroRequest, RubroRequestStatus } from "~/lib/rubros/rubroRequests";

export function statusTone(status: RubroRequestStatus) {
  if (status === "approved") return "success" as const;
  if (status === "rejected") return "warning" as const;
  return "neutral" as const;
}

export function statusLabel(status: RubroRequestStatus) {
  if (status === "approved") return "APROBADA";
  if (status === "rejected") return "RECHAZADA";
  return "PENDIENTE";
}

export function formatRequestDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", { hour12: false });
  } catch {
    return iso;
  }
}

export function buildRequestSearchText(request: RubroRequest) {
  return [
    request.title,
    request.description,
    request.exampleServices,
    request.notes,
    request.status,
    request.devNotes,
    request.requestedBy,
    request.requestedByRole,
    request.reviewedBy,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
