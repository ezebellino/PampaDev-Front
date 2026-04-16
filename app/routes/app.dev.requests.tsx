import { useMemo, useState } from "react";
import RequestDetailModal from "../components/admin/RequestDetailModal";
import RequestsTable from "../components/admin/RequestsTable";
import { Card, CardContent } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useAuth } from "../lib/auth/AuthContext";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useRubroRequests } from "../lib/rubros/useRubroRequests";

type SelectedRequestId = string | null;

export default function DevRequestsRoute() {
  return (
    <Protected allowRoles={[ROLES.DEVS]}>
      <DevRequests />
    </Protected>
  );
}

function DevRequests() {
  const { user } = useAuth();
  const { requests, loading, error, approve, reject, reviewing } = useRubroRequests();
  const [selectedId, setSelectedId] = useState<SelectedRequestId>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const pendingCount = useMemo(() => requests.filter((request) => request.status === "pending").length, [requests]);
  const approvedCount = useMemo(() => requests.filter((request) => request.status === "approved").length, [requests]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedId) ?? null,
    [requests, selectedId]
  );

  if (loading) {
    return <ScreenLoader title="Cargando solicitudes..." subtitle="Estamos preparando la bandeja técnica de Devs." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Solicitudes para Devs" subtitle="No pudimos cargar la bandeja técnica en este momento." />
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="space-y-2 py-5 text-sm text-rose-700">
            <div className="font-medium">Ocurrió un problema al cargar las solicitudes.</div>
            <div>Volvé a intentar en unos instantes. Si persiste, revisamos storage local y sincronización del dominio.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function closeModal() {
    setSelectedId(null);
    setActionError(null);
  }

  async function handleApprove(id: string, notes?: string) {
    setActionError(null);
    try {
      await approve(id, notes, user?.email ?? user?.name);
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo aprobar la solicitud.");
    }
  }

  async function handleReject(id: string, notes?: string) {
    setActionError(null);
    try {
      await reject(id, notes, user?.email ?? user?.name);
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo rechazar la solicitud.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes para Devs"
        subtitle="Acá resolvés los pedidos de rubros que llegan desde administración y decidís qué entra al catálogo base o qué necesita ajuste antes de seguir."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-stone-200 bg-white/95 shadow-sm">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Pendientes</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-white/95 shadow-sm">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Aprobadas</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>


      {actionError ? (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-4 text-sm text-rose-700">{actionError}</CardContent>
        </Card>
      ) : null}

      <RequestsTable
        requests={requests}
        onSelect={(request) => {
          setActionError(null);
          setSelectedId(request.id);
        }}
        canCreate={false}
      />

      <RequestDetailModal
        request={selectedRequest}
        onClose={closeModal}
        onApprove={handleApprove}
        onReject={handleReject}
        canReview={!reviewing}
      />
    </div>
  );
}
