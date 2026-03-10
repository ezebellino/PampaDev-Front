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
};

export default function RequestsTable({ requests, onSelect }: RequestsTableProps) {
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
    {
      label: "Solicitudes",
      value: counts.total,
      helper: "Total recibidas",
      accent: "from-cyan-400/18 via-cyan-400/6 to-transparent",
    },
    {
      label: "Pendientes",
      value: counts.pending,
      helper: "Esperando revisión",
      accent: "from-amber-300/18 via-amber-300/6 to-transparent",
    },
    {
      label: "Aprobadas",
      value: counts.approved,
      helper: "Listas para catálogo",
      accent: "from-emerald-400/18 via-emerald-400/6 to-transparent",
    },
    {
      label: "Rechazadas",
      value: counts.rejected,
      helper: "Necesitan ajustes",
      accent: "from-rose-400/18 via-rose-400/6 to-transparent",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <article
            key={card.label}
            className="relative overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950/75 p-5"
          >
            <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-br ${card.accent}`} />
            <div className="relative">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{card.label}</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{card.value}</div>
              <div className="mt-2 text-sm text-zinc-400">{card.helper}</div>
            </div>
          </article>
        ))}
      </div>

      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
        <CardHeader>
          <CardTitle>Listado de solicitudes</CardTitle>
          <CardDescription>Buscá, abrí el detalle y tomá decisiones sobre cada propuesta.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, estado, notas o solicitante…"
              className="w-full sm:w-96 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            />

            <Link to="/app/admin/solicitudes/nueva">
              <Button>+ Nueva solicitud</Button>
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-5 text-sm text-zinc-400">
              No encontramos solicitudes con ese criterio.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((request) => (
                <article
                  key={request.id}
                  className="relative overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950/85 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/75"
                >
                  <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_60%)]" />
                  <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold text-zinc-100 break-words">{request.title}</div>
                        <Badge tone={statusTone(request.status)} className="shrink-0">
                          {statusLabel(request.status)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span>{formatRequestDate(request.createdAt)}</span>
                        <span>{request.requestedBy}</span>
                        <span>{request.requestedByRole}</span>
                      </div>

                      {request.description ? (
                        <div className="text-sm leading-6 text-zinc-300 break-words">{request.description}</div>
                      ) : null}

                      {request.exampleServices ? (
                        <div className="text-xs text-zinc-400 break-words">
                          Servicios sugeridos: {request.exampleServices}
                        </div>
                      ) : null}

                      {request.notes ? (
                        <div className="text-xs text-zinc-500 break-words">Notas: {request.notes}</div>
                      ) : null}

                      {request.devNotes ? (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/55 px-3 py-2 text-xs text-zinc-300 break-words">
                          {request.devNotes}
                        </div>
                      ) : null}

                      {request.reviewedBy && request.reviewedAt ? (
                        <div className="text-[11px] text-zinc-600">
                          Revisado por {request.reviewedBy} · {formatRequestDate(request.reviewedAt)}
                        </div>
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
