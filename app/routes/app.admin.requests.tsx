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
  const { requests, loading, error, approve, reject, reviewing } = useRubroRequests();
  const [selectedId, setSelectedId] = useState<SelectedRequestId>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
        title="Cargando solicitudes..."
        subtitle="Estamos preparando la bandeja de revision del equipo."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Solicitudes de Rubros"
          subtitle="No pudimos cargar la bandeja de solicitudes en este momento."
        />

        <Card className="border-rose-500/20 bg-rose-500/10">
          <CardContent className="space-y-2 py-5 text-sm text-rose-100">
            <div className="font-medium">Ocurrio un problema al cargar las solicitudes.</div>
            <div>Volve a intentar en unos instantes. Si persiste, revisamos storage local y sincronizacion del dominio.</div>
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
        title="Solicitudes de Rubros"
        subtitle={
          isDev
            ? "Revisa el total de solicitudes enviadas por administracion y defini que entra al catalogo."
            : "Segui las solicitudes que enviaste a Devs y consulta su estado de revision."
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
              ? "Centraliza la revision completa de nuevos rubros desde una sola vista y manten trazabilidad sobre cada decision."
              : "Concentra aca tus pedidos de nuevos rubros y manten seguimiento claro sobre cada respuesta del equipo Devs."}
          </p>
          <p>
            {isDev
              ? "Podes abrir cada solicitud, dejar observaciones y definir si entra al catalogo o si necesita ajustes."
              : "Podes abrir el detalle de cada solicitud, revisar feedback interno y consultar si ya fue aprobada o rechazada."}
          </p>
        </CardContent>
      </Card>

      {actionError ? (
        <Card className="border-rose-500/20 bg-rose-500/10">
          <CardContent className="py-4 text-sm text-rose-100">{actionError}</CardContent>
        </Card>
      ) : null}

      <RequestsTable
        requests={visibleRequests}
        onSelect={(request) => {
          setActionError(null);
          setSelectedId(request.id);
        }}
        canCreate={!isDev}
      />

      <RequestDetailModal
        request={selectedRequest}
        onClose={closeModal}
        onApprove={handleApprove}
        onReject={handleReject}
        canReview={isDev && !reviewing}
      />
    </div>
  );
}