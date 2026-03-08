// app/routes/app.admin.requests.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

// TODO (cuando exista backend):
// import { apiGet } from "../lib/api/api";

type RequestStatus = "pending" | "approved" | "rejected";

type DisciplineRequest = {
  id: string;
  createdAt: string; // ISO
  status: RequestStatus;

  // data del pedido
  name: string;
  description?: string;
  exampleServices?: string;
  notes?: string;

  // opcional: para auditoría
  requestedBy?: string; // email o nombre
  reviewedBy?: string;
  reviewedAt?: string; // ISO
  devMessage?: string; // motivo rechazo / comentario
};

function statusTone(s: RequestStatus) {
  if (s === "approved") return "neutral";
  if (s === "rejected") return "warning";
  return "neutral";
}

function statusLabel(s: RequestStatus) {
  if (s === "approved") return "APROBADA";
  if (s === "rejected") return "RECHAZADA";
  return "PENDIENTE";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", { hour12: false });
  } catch {
    return iso;
  }
}

/** Mock local mientras no exista endpoint */
function mockFetchRequests(): Promise<DisciplineRequest[]> {
  const now = Date.now();
  const data: DisciplineRequest[] = [
    {
      id: "req-001",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: "pending",
      name: "Pádel",
      description: "Reserva de canchas por hora",
      exampleServices: "Turno 60/90 min, clases",
      notes: "Agregar imagen representativa.",
      requestedBy: "admin@example.com",
    },
    {
      id: "req-002",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 6).toISOString(),
      status: "approved",
      name: "Pilates",
      description: "Clases grupales y particulares",
      requestedBy: "admin@example.com",
      reviewedBy: "dev@example.com",
      reviewedAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      devMessage: "Creada como Discipline #12",
    },
    {
      id: "req-003",
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
      status: "rejected",
      name: "Boxeo extremo (?)",
      description: "Rubro ambiguo, falta detalle",
      requestedBy: "admin@example.com",
      reviewedBy: "dev@example.com",
      reviewedAt: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
      devMessage: "Falta aclarar si es fitness o combate y qué servicios se ofrecen.",
    },
  ];

  return new Promise((r) => setTimeout(() => r(data), 250));
}

export default function AdminRequestsRoute() {
  return (
    <Protected allowRoles={[ROLES.ADMIN, ROLES.DEVS]}>
      <AdminRequests />
    </Protected>
  );
}

function AdminRequests() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DisciplineRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // TODO (cuando exista backend):
      // const data = await apiGet<DisciplineRequest[]>("/api/DisciplineRequests");
      const data = await mockFetchRequests();
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar solicitudes.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return rows
      .filter((r) => {
        const hay =
          `${r.name} ${r.description ?? ""} ${r.exampleServices ?? ""} ${r.notes ?? ""} ${r.status} ${
            r.devMessage ?? ""
          } ${r.requestedBy ?? ""}`.toLowerCase();
        return hay.includes(s);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [rows, q]);

  const counts = useMemo(() => {
    let pending = 0,
      approved = 0,
      rejected = 0;
    for (const r of rows) {
      if (r.status === "pending") pending++;
      else if (r.status === "approved") approved++;
      else rejected++;
    }
    return { pending, approved, rejected, total: rows.length };
  }, [rows]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">📨 Solicitudes de Rubros</h1>
        <p className="text-sm text-zinc-400">
          Pedidos de creación de rubros/disciplines hacia Devs (workflow).
        </p>
      </header>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
            <CardDescription>Solicitudes</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.total}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>En revisión</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.pending}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aprobadas</CardTitle>
            <CardDescription>Creadas</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.approved}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rechazadas</CardTitle>
            <CardDescription>Requieren ajustes</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.rejected}</CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Buscar, revisar y crear nuevas solicitudes</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, estado, notas, mensaje dev…"
                className="w-full sm:w-96 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />

              <Button variant="secondary" onClick={load} disabled={loading}>
                {loading ? "Cargando..." : "Refrescar"}
              </Button>
            </div>

            <Link to="/app/admin/solicitudes/nueva">
              <Button>+ Nueva solicitud</Button>
            </Link>
          </div>

          {error && <div className="text-sm text-red-300">{error}</div>}

          {loading ? (
            <div className="text-sm text-zinc-400">Cargando solicitudes…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-zinc-400">No hay solicitudes para mostrar.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div key={r.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold wrap-break-words">{r.name}</div>

                        <Badge tone={statusTone(r.status)} className="shrink-0">
                          {statusLabel(r.status)}
                        </Badge>

                        <div className="text-xs text-zinc-500">{formatDate(r.createdAt)}</div>

                        {r.requestedBy ? (
                          <div className="text-xs text-zinc-600">Por: {r.requestedBy}</div>
                        ) : null}
                      </div>

                      {r.description ? (
                        <div className="text-sm text-zinc-300 wrap-break-words">{r.description}</div>
                      ) : null}

                      {r.exampleServices ? (
                        <div className="text-xs text-zinc-400 wrap-break-words">
                          Servicios: {r.exampleServices}
                        </div>
                      ) : null}

                      {r.notes ? (
                        <div className="text-xs text-zinc-500 wrap-break-words">Notas: {r.notes}</div>
                      ) : null}

                      {r.devMessage ? (
                        <div className="text-xs text-zinc-400 wrap-break-words">
                          Dev: <span className="text-zinc-300">{r.devMessage}</span>
                        </div>
                      ) : null}

                      {r.reviewedBy && r.reviewedAt ? (
                        <div className="text-[11px] text-zinc-600">
                          Revisado por {r.reviewedBy} · {formatDate(r.reviewedAt)}
                        </div>
                      ) : null}
                    </div>

                    {/* Acciones futuras */}
                    <div className="flex gap-2 sm:pl-4">
                      {/* TODO: cuando exista endpoint / detalle */}
                      {/* <Link to={`/app/admin/solicitudes/${r.id}`}> */}
                      <Button variant="secondary" disabled title="Pendiente de backend (detalle)">
                        Ver
                      </Button>
                      {/* </Link> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}