import { useMemo, useState } from "react";
import { Link } from "react-router";
import RequestDetailModal from "../components/admin/RequestDetailModal";
import RequestsTable from "../components/admin/RequestsTable";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useAuth } from "../lib/auth/AuthContext";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useRubroRequests } from "../lib/rubros/useRubroRequests";

type SelectedRequestId = string | null;

export default function AdminRequestsRoute() {
  return (
    <Protected allowRoles={[ROLES.ADMIN, ROLES.DEVS]}>
      <AdminRequests />
    </Protected>
  );
}

function AdminRequests() {
  const { user } = useAuth();
  const { requests, loading, approve, reject } = useRubroRequests();
  const [selectedId, setSelectedId] = useState<SelectedRequestId>(null);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedId) ?? null,
    [requests, selectedId]
  );

  if (loading) {
    return (
      <ScreenLoader
        title="Cargando solicitudes…"
        subtitle="Estamos preparando la bandeja de revisión del equipo."
      />
    );
  }

  function closeModal() {
    setSelectedId(null);
  }

  function handleApprove(id: string, notes?: string) {
    approve(id, notes, user?.email ?? user?.name);
    closeModal();
  }

  function handleReject(id: string, notes?: string) {
    reject(id, notes, user?.email ?? user?.name);
    closeModal();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes de Rubros"
        subtitle="Revisá propuestas, devolvé feedback y aprobá nuevas incorporaciones al catálogo."
        right={
          <Link to="/app/admin/solicitudes/nueva">
            <Button variant="secondary">+ Nueva solicitud</Button>
          </Link>
        }
      />

      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
        <div className="h-20 bg-[linear-gradient(135deg,rgba(34,197,94,0.12),transparent_55%)]" />
        <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-zinc-400">
          <p>
            Centralizá la revisión de nuevos rubros desde una sola vista y mantené trazabilidad sobre
            cada decisión.
          </p>
          <p>
            Podés abrir cada solicitud, dejar observaciones y definir si entra al catálogo o si
            necesita ajustes.
          </p>
        </CardContent>
      </Card>

      <RequestsTable requests={requests} onSelect={(request) => setSelectedId(request.id)} />

      <RequestDetailModal
        request={selectedRequest}
        onClose={closeModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
