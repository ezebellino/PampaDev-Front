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
      <ScreenLoader title="Cargando solicitudes..." subtitle="Estamos preparando la bandeja de seguimiento del equipo." />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Solicitudes" subtitle="No pudimos cargar la bandeja de solicitudes en este momento." />

        <Card className="border-rose-500/20 bg-rose-500/10">
          <CardContent className="space-y-2 py-5 text-sm text-rose-100">
            <div className="font-medium">Ocurrio un problema al cargar las solicitudes.</div>
            <div>Vuelve a intentar en unos instantes. Si persiste, revisamos storage local y sincronizacion del dominio.</div>
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
        title="Solicitudes"
        subtitle={
          isDev
            ? "Revisa pedidos del equipo admin y decide que entra al catalogo base o necesita ajuste."
            : "Sigue tus pedidos de nuevas disciplinas o cambios de catalogo desde una sola vista."
        }
        right={
          !isDev ? (
            <Link to="/app/admin/requests/new">
              <Button variant="secondary">+ Nueva solicitud</Button>
            </Link>
          ) : null
        }
      />

      <Card className="border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_36%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))]">
        <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="space-y-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">Flujo de solicitudes</div>
            <div className="max-w-3xl text-2xl font-semibold leading-tight text-white">
              Un solo lugar para pedir cambios de catalogo y seguir cada decision con contexto.
            </div>
            <p className="max-w-3xl leading-6 text-zinc-300/90">
              El objetivo de esta bandeja es que admin y devs compartan el mismo idioma: primero se pide una nueva disciplina o ajuste del catalogo base, despues se publica como rubro operativo por sucursal.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Tu rol</div>
              <div className="mt-2 text-sm font-medium text-white">{isDev ? "Devs" : "Admin"}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Vista</div>
              <div className="mt-2 text-sm font-medium text-white">{isDev ? "Bandeja completa" : "Mis solicitudes"}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Objetivo</div>
              <div className="mt-2 text-sm font-medium text-white">Menos ida y vuelta, mas claridad</div>
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
