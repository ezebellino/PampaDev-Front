import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import {
  getReservationSourceLabel,
  getReservationSourceTone,
  getReservationStatusLabel,
  getReservationStatusTone,
  getReservationSyncLabel,
  getReservationSyncTone,
} from "../lib/scheduling/reservationPresentation";
import { useMyReservationRequests } from "../lib/scheduling/useInstructorRequests";

export default function UserBookingsPage() {
  const { user } = useAuth();
  const { branchId } = useBranch();
  const { companyId } = useCompany();
  const { requests, pending, confirmed, cancelled, rejected, cancelRequest } = useMyReservationRequests(user?.id ?? null, branchId);

  return (
    <Protected allowRoles={[ROLES.USER, ROLES.DEVS]}>
      <div className="space-y-6">
        <PageHeader
          title="Mis turnos"
          subtitle="Tus reservas de la sucursal activa."
          right={
            <Link to="/app/rubros">
              <Button>Reservar</Button>
            </Link>
          }
        />

        <section className="grid gap-4 lg:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa</div>
              <div className="mt-3 text-sm font-medium text-zinc-100">{companyId ?? "Sin seleccionar"}</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal</div>
              <div className="mt-3 text-sm font-medium text-zinc-100">{branchId ?? "Sin seleccionar"}</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Pendientes</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{pending.length}</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Confirmadas</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{confirmed.length}</div>
            </CardContent>
          </Card>
        </section>

        {!branchId ? (
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-6">
              <Link to="/app/branches">
                <Button>Elegir sucursal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="space-y-4 py-6">
              <div className="text-sm text-zinc-400">Todavia no tenes reservas en esta sucursal.</div>
              <Link to="/app/rubros">
                <Button>Explorar rubros</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
            <Card className="border-zinc-800 bg-zinc-950/80">
              <CardHeader>
                <CardTitle>Reservas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.map((request) => {
                  const canCancel = request.status === "pending";

                  return (
                    <div key={request.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                          <div className="text-base font-semibold text-zinc-100">{request.rubroName ?? request.rubroId}</div>
                          <div className="text-sm text-zinc-400">{request.date ?? "Fecha a confirmar"} - {request.time ?? "Hora a confirmar"}</div>
                          <div className="flex flex-wrap gap-2">
                            <Badge tone={getReservationStatusTone(request.status)}>{getReservationStatusLabel(request.status)}</Badge>
                            <Badge tone={getReservationSyncTone(request.syncStatus)}>{getReservationSyncLabel(request.syncStatus)}</Badge>
                            <Badge tone={getReservationSourceTone(request.bookingSource)}>{getReservationSourceLabel(request.bookingSource)}</Badge>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 lg:w-44">
                          {canCancel ? (
                            <Button variant="secondary" onClick={() => cancelRequest(request.id)}>
                              Cancelar
                            </Button>
                          ) : null}
                          <Link to="/app/rubros" className="block">
                            <Button variant="ghost" className="w-full border border-zinc-800">
                              Reservar de nuevo
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950/80">
              <CardHeader>
                <CardTitle>Estados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-400">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">Pendientes: {pending.length}</div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">Confirmadas: {confirmed.length}</div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">Rechazadas: {rejected.length}</div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">Canceladas: {cancelled.length}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Protected>
  );
}
