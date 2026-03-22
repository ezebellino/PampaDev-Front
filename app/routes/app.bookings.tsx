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
import { useMyReservationRequests } from "../lib/scheduling/useInstructorRequests";

export default function UserBookingsPage() {
  const { user } = useAuth();
  const { branchId } = useBranch();
  const { companyId } = useCompany();
  const { requests, pending, confirmed } = useMyReservationRequests(user?.id ?? null, branchId);

  const rejected = requests.filter((item) => item.status === "rejected");

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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Card className="border-zinc-800 bg-zinc-950/80">
              <CardHeader>
                <CardTitle>Agenda completa</CardTitle>
                <CardDescription>
                  Cada tarjeta representa una solicitud o turno tuyo dentro de la sucursal activa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-base font-semibold text-zinc-100">{request.rubroName ?? request.rubroId}</div>
                        <div className="mt-1 text-sm text-zinc-400">{request.date ?? "Fecha a confirmar"} · {request.time ?? "Hora a confirmar"}</div>
                        <div className="mt-2 text-xs text-zinc-500">{request.slotLabel ?? "Solicitud enviada desde agenda de rubro"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={request.status === "confirmed" ? "success" : request.status === "rejected" ? "warning" : "warning"}>
                          {request.status === "confirmed" ? "Confirmada" : request.status === "rejected" ? "Rechazada" : "Pendiente"}
                        </Badge>
                        <Badge tone={request.syncStatus === "synced" ? "success" : "neutral"}>
                          {request.syncStatus === "synced" ? "Sincronizada" : "Lista para backend"}
                        </Badge>
                        <Badge tone={request.bookingSource === "api" ? "success" : "neutral"}>
                          {request.bookingSource === "api" ? "Clase real" : "Franja planificada"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    Pendientes: {pending.length}
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    Confirmadas: {confirmed.length}
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    Rechazadas: {rejected.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950/80">
                <CardHeader>
                  <CardTitle>Cómo leer esta vista</CardTitle>
                  <CardDescription>
                    Para que el usuario entienda qué ya está firme y qué todavía depende de operación o backend.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-400">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    `Pendiente` significa que la sucursal o el instructor todavía no confirmó tu solicitud.
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    `Lista para backend` indica que el frontend guardó el pedido y quedó listo para sincronizarse.
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    `Clase real` aparece cuando el turno ya se apoyó sobre una clase concreta del backend.
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
