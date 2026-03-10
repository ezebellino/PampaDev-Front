import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import type { RubroRequest } from "~/lib/rubros/rubroRequests";
import { formatRequestDate, statusLabel, statusTone } from "./requestPresentation";

type RequestDetailModalProps = {
  request: RubroRequest | null;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
};

export default function RequestDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
}: RequestDetailModalProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(request?.devNotes ?? "");
  }, [request]);

  if (!request) return null;

  const trimmedNotes = notes.trim() || undefined;
  const canReview = request.status === "pending";

  return (
    <Modal open={!!request} title={`Solicitud: ${request.title}`} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTone(request.status)}>{statusLabel(request.status)}</Badge>
          <span className="text-xs text-zinc-500">{formatRequestDate(request.createdAt)}</span>
        </div>

        <div className="grid gap-3 rounded-[1.25rem] border border-zinc-800 bg-zinc-900/45 px-4 py-4 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-500">Solicitó:</span> {request.requestedBy}
          </div>
          <div>
            <span className="text-zinc-500">Rol:</span> {request.requestedByRole}
          </div>
          {request.description ? (
            <div>
              <span className="text-zinc-500">Descripción:</span> {request.description}
            </div>
          ) : null}
          {request.exampleServices ? (
            <div>
              <span className="text-zinc-500">Servicios sugeridos:</span> {request.exampleServices}
            </div>
          ) : null}
          {request.notes ? (
            <div>
              <span className="text-zinc-500">Notas:</span> {request.notes}
            </div>
          ) : null}
          {request.reviewedBy && request.reviewedAt ? (
            <div>
              <span className="text-zinc-500">Última revisión:</span> {request.reviewedBy} · {formatRequestDate(request.reviewedAt)}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Feedback interno</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full min-h-32 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            placeholder="Dejá una observación para aprobación o rechazo"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {canReview ? (
            <>
              <Button variant="secondary" onClick={() => onReject(request.id, trimmedNotes)}>
                Rechazar
              </Button>
              <Button onClick={() => onApprove(request.id, trimmedNotes)}>Aprobar</Button>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
