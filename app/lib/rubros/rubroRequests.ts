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

const KEY = "pampadev:rubro-requests:v1";

const DEFAULT_REQUESTS: RubroRequest[] = [
  {
    id: "req-001",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "pending",
    title: "Pádel",
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
    devNotes: "Falta aclarar si es fitness o combate y qué servicios se ofrecen.",
  },
];

export function loadRequests(): RubroRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_REQUESTS;
    const parsed = JSON.parse(raw) as RubroRequest[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REQUESTS;
  } catch {
    return DEFAULT_REQUESTS;
  }
}

export function saveRequests(reqs: RubroRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(reqs));
}

export function makeId() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}
