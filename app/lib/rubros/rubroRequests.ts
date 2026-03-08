export type RubroRequestStatus = "pending" | "approved" | "rejected";

export type RubroRequest = {
  id: string;
  requestedBy: string;      // email o nombre
  requestedByRole: string;  // "ADMIN"
  title: string;            // nombre sugerido
  description: string;
  createdAt: string;        // ISO
  status: RubroRequestStatus;
  devNotes?: string;        // opcional
};

const KEY = "pampadev:rubro-requests:v1";

export function loadRequests(): RubroRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RubroRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRequests(reqs: RubroRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(reqs));
}

export function makeId() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}
