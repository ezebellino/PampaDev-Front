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
        <Card className="border-rose-500/20 bg-rose-500/10">
          <CardContent className="space-y-2 py-5 text-sm text-rose-100">
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

      <Card className="border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))]">
        <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="space-y-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Bandeja técnica</div>
            <div className="max-w-3xl text-2xl font-semibold leading-tight text-white">
              Todo pedido pendiente del equipo admin se resuelve desde esta vista, sin mezclarlo con el workspace operativo de administración.
            </div>
            <p className="max-w-3xl leading-6 text-zinc-300/90">
              La idea es que Devs tenga un inbox propio para aprobar, rechazar o dejar feedback interno, y que el contador de pendientes siempre lleve a una acción real.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Pendientes</div>
              <div className="mt-2 text-2xl font-semibold text-white">{pendingCount}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Aprobadas</div>
              <div className="mt-2 text-2xl font-semibold text-white">{approvedCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {actionError ? (
        <Card className="border-rose-500/20 bg-rose-500/10">
          <CardContent className="py-4 text-sm text-rose-100">{actionError}</CardContent>
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
