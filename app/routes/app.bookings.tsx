import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import {
  getReservationOperationalCopy,
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
          title="Mis turnos y solicitudes"
          subtitle="Seguí el estado de lo que ya pediste en la sucursal activa y entendé rápido qué está confirmado, qué sigue pendiente y qué todavía espera backend."
          right={
            <Link to="/app/rubros">
              <Button>Agendar nuevo turno</Button>
            </Link>
          }
        />

        <section className="grid gap-4 lg:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-950/80 lg:col-span-1">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa</div>
              <div className="mt-3 text-sm font-medium text-zinc-100">{companyId ?? "Sin seleccionar"}</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80 lg:col-span-1">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal</div>
              <div className="mt-3 text-sm font-medium text-zinc-100">{branchId ?? "Sin seleccionar"}</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80 lg:col-span-1">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Pendientes</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{pending.length}</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80 lg:col-span-1">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Confirmadas</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{confirmed.length}</div>
            </CardContent>
          </Card>
        </section>

        {!branchId ? (
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Elegí una sucursal para ver tu agenda</CardTitle>
              <CardDescription>
                Tus solicitudes se organizan por sede porque cada sucursal maneja su propia disponibilidad e instructores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/app/branches">
                <Button>Seleccionar sucursal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Tu agenda todavía está vacía</CardTitle>
              <CardDescription>
                Cuando reserves desde un rubro, vas a poder seguir el pedido y su estado desde acá.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-400">
                El flujo ya está preparado para convivir con backend o con modo local listo para sincronizar más adelante.
              </div>
              <Link to="/app/rubros">
                <Button>Explorar rubros</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
              <div className="h-20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_32%),linear-gradient(90deg,rgba(24,24,27,0.24),transparent)]" />
              <CardHeader className="relative -mt-6">
                <CardTitle>Agenda completa</CardTitle>
                <CardDescription>
                  Cada tarjeta representa una reserva tuya dentro de la sucursal activa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requests.map((request) => {
                  const canCancel = request.status === "pending";

                  return (
                    <div
                      key={request.id}
                      className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/45 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div>
                            <div className="text-base font-semibold text-zinc-100">{request.rubroName ?? request.rubroId}</div>
                            <div className="mt-1 text-sm text-zinc-400">{request.date ?? "Fecha a confirmar"} · {request.time ?? "Hora a confirmar"}</div>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Estado</div>
                              <div className="mt-2">
                                <Badge tone={getReservationStatusTone(request.status)}>{getReservationStatusLabel(request.status)}</Badge>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Sincronización</div>
                              <div className="mt-2">
                                <Badge tone={getReservationSyncTone(request.syncStatus)}>
                                  {getReservationSyncLabel(request.syncStatus)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400">
                            <div className="font-medium text-zinc-200">Detalle de la reserva</div>
                            <div className="mt-1">{request.slotLabel ?? "Reserva enviada desde agenda de rubro"}</div>
                            <div className="mt-2 text-xs text-zinc-500">{getReservationOperationalCopy(request)}</div>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 lg:w-52">
                          <Badge tone={getReservationSourceTone(request.bookingSource)}>
                            {getReservationSourceLabel(request.bookingSource)}
                          </Badge>

                          {canCancel ? (
                            <Button variant="secondary" onClick={() => cancelRequest(request.id)}>
                              Cancelar reserva
                            </Button>
                          ) : null}

                          <Link to="/app/rubros" className="block">
                            <Button variant="ghost" className="w-full border border-zinc-800">
                              Volver a reservar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-zinc-800 bg-zinc-950/80">
                <CardHeader>
                  <CardTitle>Resumen de estados</CardTitle>
                  <CardDescription>
                    Una lectura rápida para saber dónde estás parado antes de volver a reservar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-400">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">Pendientes: {pending.length}</div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">Confirmadas: {confirmed.length}</div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">Rechazadas: {rejected.length}</div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">Canceladas: {cancelled.length}</div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950/80">
                <CardHeader>
                  <CardTitle>Cómo leer esta vista</CardTitle>
                  <CardDescription>
                    La misma lógica que ve el instructor, traducida para que entiendas rápido qué sigue en curso.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-400">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    `Pendiente` significa que tu reserva todavía espera confirmación operativa.
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    `Lista para backend` indica que la reserva ya quedó guardada y lista para sincronizarse.
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    `Clase real` aparece cuando la reserva ya se apoya sobre una clase concreta del backend.
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    Si la reserva sigue pendiente, podés cancelarla desde esta misma vista.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
