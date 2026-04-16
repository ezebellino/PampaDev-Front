import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/Card";
import type { RubroRequest } from "~/lib/rubros/rubroRequests";
import { buildRequestSearchText, formatRequestDate, statusLabel, statusTone } from "./requestPresentation";

type RequestsTableProps = {
  requests: RubroRequest[];
  onSelect: (request: RubroRequest) => void;
  canCreate?: boolean;
};

export default function RequestsTable({ requests, onSelect, canCreate = false }: RequestsTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sorted = requests.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (!normalized) return sorted;
    return sorted.filter((request) => buildRequestSearchText(request).includes(normalized));
  }, [requests, query]);

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    for (const request of requests) {
      if (request.status === "pending") pending += 1;
      else if (request.status === "approved") approved += 1;
      else rejected += 1;
    }

    return { total: requests.length, pending, approved, rejected };
  }, [requests]);

  const metricCards = [
    { label: "Solicitudes", value: counts.total, helper: "Total registradas", accent: "from-sky-100 via-sky-50 to-transparent" },
    { label: "Pendientes", value: counts.pending, helper: "Esperando revisión", accent: "from-amber-100 via-amber-50 to-transparent" },
    { label: "Aprobadas", value: counts.approved, helper: "Listas para el catálogo base", accent: "from-emerald-100 via-emerald-50 to-transparent" },
    { label: "Rechazadas", value: counts.rejected, helper: "Necesitan ajuste", accent: "from-rose-100 via-rose-50 to-transparent" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <article key={card.label} className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white/95 p-5 shadow-[0_18px_40px_-34px_rgba(69,70,77,0.18)]">
            <div className={`absolute inset-x-0 top-0 h-20 bg-linear-to-r ${card.accent}`} />
            <div className="relative">
              <div className="text-xs uppercase tracking-widest text-stone-500">{card.label}</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</div>
              <div className="mt-2 text-sm text-slate-500">{card.helper}</div>
            </div>
          </article>
        ))}
      </div>

      <Card className="overflow-hidden border-stone-200 bg-white/95 shadow-[0_18px_40px_-34px_rgba(69,70,77,0.18)]">
        <CardHeader>
          <CardTitle>Listado de solicitudes</CardTitle>
          <CardDescription>
            Buscá, abrí el detalle y seguí el estado de cada propuesta enviada para ampliar o ajustar el catálogo.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, estado, notas o solicitante..."
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white sm:w-96"
            />

            {canCreate ? (
              <Link to="/app/admin/requests/new">
                <Button>+ Nueva solicitud</Button>
              </Link>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-slate-500">
              No encontramos solicitudes con ese criterio.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((request) => (
                <article
                  key={request.id}
                  className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white/96 p-4 shadow-sm transition hover:border-sky-200 hover:bg-white"
                >
                  <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-r from-sky-50 to-transparent" />
                  <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="break-words text-base font-semibold text-slate-900">{request.title}</div>
                        <Badge tone={statusTone(request.status)} className="shrink-0">
                          {statusLabel(request.status)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        <span>{formatRequestDate(request.createdAt)}</span>
                        <span>{request.requestedBy}</span>
                        <span>{request.requestedByRole}</span>
                      </div>

                      {request.description ? <div className="break-words text-sm leading-6 text-slate-700">{request.description}</div> : null}
                      {request.exampleServices ? <div className="break-words text-xs text-slate-500">Servicios sugeridos: {request.exampleServices}</div> : null}
                      {request.notes ? <div className="break-words text-xs text-stone-500">Notas: {request.notes}</div> : null}

                      {request.devNotes ? (
                        <div className="break-words rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-slate-700">
                          Observación interna: {request.devNotes}
                        </div>
                      ) : null}

                      {request.reviewedBy && request.reviewedAt ? (
                        <div className="text-xs text-stone-500">Revisado por {request.reviewedBy} ? {formatRequestDate(request.reviewedAt)}</div>
                      ) : null}
                    </div>

                    <div className="flex gap-2 sm:pl-4">
                      <Button variant="secondary" onClick={() => onSelect(request)}>
                        Ver detalle
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
