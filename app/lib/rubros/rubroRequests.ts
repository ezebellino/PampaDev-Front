export type RubroRequestStatus = "pending" | "approved" | "rejected";

export type RubroRequest = {
  id: string;
  requestedBy: string;
  requestedByRole: string;
  title: string;
  description?: string;
  exampleServices?: string;
  notes?: string;
  createdAt: string;
  status: RubroRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  devNotes?: string;
};

export type CreateRubroRequestInput = {
  requestedBy: string;
  requestedByRole: string;
  title: string;
  description?: string;
  exampleServices?: string;
  notes?: string;
};

const KEY = "pampadev:rubro-requests:v1";
export const RUBRO_REQUESTS_EVENT = "pampadev:rubro-requests:changed";

const DEFAULT_REQUESTS: RubroRequest[] = [
  {
    id: "req-001",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "pending",
    title: "Padel",
    description: "Reserva de canchas por hora.",
    exampleServices: "Turno 60/90 min, clases.",
    notes: "Agregar imagen representativa.",
    requestedBy: "admin@example.com",
    requestedByRole: "ADMIN",
  },
  {
    id: "req-002",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    status: "approved",
    title: "Pilates",
    description: "Clases grupales y particulares.",
    requestedBy: "admin@example.com",
    requestedByRole: "ADMIN",
    reviewedBy: "dev@example.com",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    devNotes: "Creada como Discipline #12.",
  },
  {
    id: "req-003",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    status: "rejected",
    title: "Boxeo extremo (?)",
    description: "Rubro ambiguo, falta detalle.",
    requestedBy: "admin@example.com",
    requestedByRole: "ADMIN",
    reviewedBy: "dev@example.com",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    devNotes: "Falta aclarar si es fitness o combate y que servicios se ofrecen.",
  },
];

function emitRequestsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RUBRO_REQUESTS_EVENT));
}

function sanitizeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function isStatus(value: unknown): value is RubroRequestStatus {
  return value === "pending" || value === "approved" || value === "rejected";
}

function normalizeRequest(value: unknown): RubroRequest | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const title = sanitizeText(record.title);
  const requestedBy = sanitizeText(record.requestedBy);
  const requestedByRole = sanitizeText(record.requestedByRole);
  const createdAt = sanitizeText(record.createdAt);
  const id = sanitizeText(record.id);
  const status = isStatus(record.status) ? record.status : null;

  if (!title || !requestedBy || !requestedByRole || !createdAt || !id || !status) {
    return null;
  }

  return {
    id,
    title,
    requestedBy,
    requestedByRole,
    createdAt,
    status,
    description: sanitizeText(record.description),
    exampleServices: sanitizeText(record.exampleServices),
    notes: sanitizeText(record.notes),
    reviewedBy: sanitizeText(record.reviewedBy),
    reviewedAt: sanitizeText(record.reviewedAt),
    devNotes: sanitizeText(record.devNotes),
  };
}

export function listRubroRequests(): RubroRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_REQUESTS;

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_REQUESTS;

    const normalized = parsed.map(normalizeRequest).filter(Boolean) as RubroRequest[];
    return normalized.length > 0 ? normalized : DEFAULT_REQUESTS;
  } catch {
    return DEFAULT_REQUESTS;
  }
}

function saveRubroRequests(requests: RubroRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(requests));
  emitRequestsChanged();
}

export function subscribeToRubroRequests(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function onStorage(event: StorageEvent) {
    if (event.key === KEY) {
      onChange();
    }
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(RUBRO_REQUESTS_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RUBRO_REQUESTS_EVENT, onChange);
  };
}

export function createRubroRequest(input: CreateRubroRequestInput): RubroRequest {
  const title = sanitizeText(input.title);
  const requestedBy = sanitizeText(input.requestedBy);
  const requestedByRole = sanitizeText(input.requestedByRole);

  if (!title) {
    throw new Error("El nombre del rubro es obligatorio.");
  }

  if (!requestedBy || !requestedByRole) {
    throw new Error("No pudimos identificar correctamente al solicitante.");
  }

  const request: RubroRequest = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    status: "pending",
    title,
    requestedBy,
    requestedByRole,
    description: sanitizeText(input.description),
    exampleServices: sanitizeText(input.exampleServices),
    notes: sanitizeText(input.notes),
  };

  const next = [request, ...listRubroRequests()];
  saveRubroRequests(next);
  return request;
}

export function reviewRubroRequest(
  id: string,
  status: Extract<RubroRequestStatus, "approved" | "rejected">,
  options?: { devNotes?: string; reviewedBy?: string }
): RubroRequest {
  const requests = listRubroRequests();
  const reviewedBy = sanitizeText(options?.reviewedBy);
  const devNotes = sanitizeText(options?.devNotes);
  let updated: RubroRequest | null = null;

  const next = requests.map((request) => {
    if (request.id !== id) return request;

    updated = {
      ...request,
      status,
      devNotes,
      reviewedBy: reviewedBy ?? request.reviewedBy,
      reviewedAt: new Date().toISOString(),
    };

    return updated;
  });

  if (!updated) {
    throw new Error("No encontramos la solicitud seleccionada.");
  }

  saveRubroRequests(next);
  return updated;
}

export function makeId() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}