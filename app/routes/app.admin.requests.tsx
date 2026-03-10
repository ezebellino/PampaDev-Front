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

function normalizeIdentity(value: string | undefined | null) {
  return value?.trim().toLowerCase() ?? "";
}

function AdminRequests() {
  const { user } = useAuth();
  const { requests, loading, approve, reject } = useRubroRequests();
  const [selectedId, setSelectedId] = useState<SelectedRequestId>(null);

  const isDev = user?.role === ROLES.DEVS;
  const requesterKeys = [normalizeIdentity(user?.email), normalizeIdentity(user?.name)].filter(Boolean);

  const visibleRequests = useMemo(() => {
    if (isDev) return requests;

    return requests.filter((request) => requesterKeys.includes(normalizeIdentity(request.requestedBy)));
  }, [isDev, requests, requesterKeys]);

  const selectedRequest = useMemo(
    () => visibleRequests.find((request) => request.id === selectedId) ?? null,
    [visibleRequests, selectedId]
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
        subtitle={
          isDev
            ? "Revisá el total de solicitudes enviadas por administración y definí qué entra al catálogo."
            : "Seguí las solicitudes que enviaste a Devs y consultá su estado de revisión."
        }
        right={
          !isDev ? (
            <Link to="/app/admin/solicitudes/nueva">
              <Button variant="secondary">+ Nueva solicitud</Button>
            </Link>
          ) : null
        }
      />

      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
        <div className="h-20 bg-linear-to-r from-emerald-500/12 to-transparent" />
        <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-zinc-400">
          <p>
            {isDev
              ? "Centralizá la revisión completa de nuevos rubros desde una sola vista y mantené trazabilidad sobre cada decisión."
              : "Concentrá acá tus pedidos de nuevos rubros y mantené seguimiento claro sobre cada respuesta del equipo Devs."}
          </p>
          <p>
            {isDev
              ? "Podés abrir cada solicitud, dejar observaciones y definir si entra al catálogo o si necesita ajustes."
              : "Podés abrir el detalle de cada solicitud, revisar feedback interno y consultar si ya fue aprobada o rechazada."}
          </p>
        </CardContent>
      </Card>

      <RequestsTable
        requests={visibleRequests}
        onSelect={(request) => setSelectedId(request.id)}
        canCreate={!isDev}
      />

      <RequestDetailModal
        request={selectedRequest}
        onClose={closeModal}
        onApprove={handleApprove}
        onReject={handleReject}
        canReview={isDev}
      />
    </div>
  );
}
