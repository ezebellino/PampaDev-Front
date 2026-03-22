import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { useBranchClasses } from "../lib/api/hooks/useBranchClasses";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import {
  buildClassTimeRange,
  classStatusTone,
  DAY_NAMES,
  groupBranchClassesByDay,
  normalizeBranchClass,
} from "../lib/scheduling/classPresentation";
import {
  getReservationOperationalCopy,
  getReservationSourceLabel,
  getReservationSourceTone,
  getReservationStatusLabel,
  getReservationStatusTone,
  getReservationSyncLabel,
  getReservationSyncTone,
} from "../lib/scheduling/reservationPresentation";
import { useBranchScheduleConfig } from "../lib/scheduling/useBranchScheduleConfig";
import { useInstructorReservationRequests } from "../lib/scheduling/useInstructorRequests";
import type { InstructorReservationRequest } from "../lib/scheduling/useInstructorRequests";
import type { Weekday } from "../lib/scheduling/types";

const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
type RequestFilter = "all" | "pending" | "confirmed" | "backlog";

function requestMatchesFilter(request: InstructorReservationRequest, filter: RequestFilter) {
  if (filter === "pending") return request.status === "pending";
  if (filter === "confirmed") return request.status === "confirmed";
  if (filter === "backlog") return request.syncStatus !== "synced";
  return true;
}

export default function Instructor() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();
  const { disciplines, loading: disciplinesLoading } = useDisciplines();
  const { data: scheduleConfig, loading: scheduleLoading } = useBranchScheduleConfig(branchId, disciplines);
  const { data, loading, error, unavailable, refresh } = useBranchClasses(branchId);
  const [requestFilter, setRequestFilter] = useState<RequestFilter>("all");

  const hasBranch = branchId !== null;

  const classes = useMemo(() => {
    return (data ?? []).map((item, index) => normalizeBranchClass(item, index));
  }, [data]);

  const grouped = useMemo(() => groupBranchClassesByDay(classes), [classes]);

  const openClasses = useMemo(() => {
    return classes.filter((item) => {
      if (!item.status) return true;
      const normalized = item.status.toLowerCase();
      return normalized.includes("act") || normalized.includes("disp") || normalized.includes("open");
    }).length;
  }, [classes]);

  const pendingCapacity = useMemo(() => {
    return classes.reduce((acc, item) => acc + (item.available ?? 0), 0);
  }, [classes]);

  const uniqueDisciplines = useMemo(() => {
    return new Set(classes.map((item) => item.discipline).filter(Boolean)).size;
  }, [classes]);

  const closedDays = useMemo(() => {
    if (!scheduleConfig) return [] as Array<{ day: Weekday; reason: string }>;
    return WEEKDAY_ORDER.filter((day) => scheduleConfig.days[day].closed).map((day) => ({
      day,
      reason: scheduleConfig.days[day].reason,
    }));
  }, [scheduleConfig]);

  const enabledSchedules = useMemo(() => {
    if (!scheduleConfig) return [];
    return scheduleConfig.disciplines.filter((item) => item.enabled);
  }, [scheduleConfig]);

  const { requests, pending, confirmed, refresh: refreshRequests, confirmRequest, rejectRequest } = useInstructorReservationRequests(branchId);

  const syncBacklog = useMemo(() => requests.filter((request) => request.syncStatus !== "synced"), [requests]);
  const visibleRequests = useMemo(() => requests.filter((request) => requestMatchesFilter(request, requestFilter)), [requests, requestFilter]);

  if (loading || disciplinesLoading || scheduleLoading) {
    return (
      <Protected allowRoles={[ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-10 text-sm text-zinc-400">Cargando agenda operativa...</CardContent>
        </Card>
      </Protected>
    );
  }

  return (
    <Protected allowRoles={[ROLES.INSTRUCTOR, ROLES.DEVS]}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 md:p-8">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Panel instructor</div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
                Gestión operativa de turnos
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Esta vista combina la planificación semanal definida por administración con las reservas de usuarios y las clases reales creadas para la sucursal activa.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Instructor</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{user?.name ?? "Cuenta activa"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Rol</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{user?.role ?? ROLES.INSTRUCTOR}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{companyId ?? "Sin seleccionar"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{branchId ?? "Pendiente"}</div>
            </div>
          </div>
        </section>

        {hasBranch ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Reservas de usuarios</h2>
                <p className="text-sm text-zinc-400">
                  Acá recibís las reservas que llegan desde rubros y podés confirmar, rechazar o detectar rápido qué sigue pendiente de backend.
                </p>
              </div>
              <Button variant="ghost" onClick={refreshRequests} size="sm">
                Actualizar
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-zinc-500">Total</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-100">{requests.length}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-zinc-500">Pendientes</div>
                <div className="mt-2 text-2xl font-semibold text-amber-200">{pending.length}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-zinc-500">Confirmadas</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-200">{confirmed.length}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-zinc-500">Pendientes backend</div>
                <div className="mt-2 text-2xl font-semibold text-cyan-200">{syncBacklog.length}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { id: "all", label: "Todas", count: requests.length },
                { id: "pending", label: "Pendientes", count: pending.length },
                { id: "confirmed", label: "Confirmadas", count: confirmed.length },
                { id: "backlog", label: "Listas para backend", count: syncBacklog.length },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRequestFilter(item.id as RequestFilter)}
                  className={[
                    "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition",
                    requestFilter === item.id
                      ? "border-cyan-500/35 bg-cyan-400/10 text-cyan-50"
                      : "border-zinc-800 bg-zinc-900/45 text-zinc-300 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                  <span className="rounded-full border border-current/15 px-2 py-0.5 text-xs">{item.count}</span>
                </button>
              ))}
            </div>

            {visibleRequests.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/65 p-4 text-sm text-zinc-400">
                No hay reservas para este filtro en la sucursal activa.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {visibleRequests.map((request) => {
                  const canOperate = request.status === "pending";

                  return (
                    <div
                      key={request.id}
                      className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/55 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.14)]"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                          <div>
                            <div className="text-base font-semibold text-zinc-100">{request.userName ?? request.userId}</div>
                            <div className="mt-1 text-sm text-zinc-300">
                              {request.rubroName ?? request.rubroId} · {request.date ?? "Fecha a confirmar"} · {request.time ?? "Hora a confirmar"}
                            </div>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-4 py-3">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Estado</div>
                              <div className="mt-2">
                                <Badge tone={getReservationStatusTone(request.status)}>{getReservationStatusLabel(request.status)}</Badge>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-4 py-3">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Origen</div>
                              <div className="mt-2">
                                <Badge tone={getReservationSourceTone(request.bookingSource)}>
                                  {getReservationSourceLabel(request.bookingSource)}
                                </Badge>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-4 py-3">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Sincronización</div>
                              <div className="mt-2">
                                <Badge tone={getReservationSyncTone(request.syncStatus)}>
                                  {getReservationSyncLabel(request.syncStatus)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-4 py-3 text-sm text-zinc-400">
                            <div className="font-medium text-zinc-200">Detalle de la reserva</div>
                            <div className="mt-1">{request.slotLabel ?? "Reserva enviada desde agenda de rubro"}</div>
                            <div className="mt-2 text-xs text-zinc-500">{getReservationOperationalCopy(request)}</div>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 xl:w-56">
                          {canOperate ? (
                            <>
                              <Button size="sm" onClick={() => confirmRequest(request.id)}>
                                Confirmar reserva
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => rejectRequest(request.id)}>
                                Rechazar reserva
                              </Button>
                            </>
                          ) : null}

                          <Link
                            to="/app/rubros"
                            className="block rounded-2xl border border-zinc-800 px-4 py-3 text-center text-sm text-zinc-200 transition hover:bg-zinc-900"
                          >
                            Ver agenda pública
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        {!hasBranch ? (
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Elegí una sucursal para continuar</CardTitle>
              <CardDescription>
                El instructor trabaja siempre sobre una sede activa para evitar conflictos con agenda, rubros y disponibilidad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/app/branches"
                className="inline-flex rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-950 hover:bg-white"
              >
                Seleccionar sucursal
              </Link>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-6 text-sm text-red-300">{error}</CardContent>
          </Card>
        ) : unavailable ? (
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Agenda no disponible</CardTitle>
              <CardDescription>
                Todavía no se pudo consultar la agenda de la sucursal desde el backend.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="border-zinc-800 bg-zinc-950/80">
                <CardContent className="py-5">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Clases</div>
                  <div className="mt-3 text-3xl font-semibold text-zinc-100">{classes.length}</div>
                  <div className="mt-1 text-sm text-zinc-400">Turnos base detectados en la agenda</div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950/80">
                <CardContent className="py-5">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Activas</div>
                  <div className="mt-3 text-3xl font-semibold text-zinc-100">{openClasses}</div>
                  <div className="mt-1 text-sm text-zinc-400">Clases listas para operar</div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950/80">
                <CardContent className="py-5">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas</div>
                  <div className="mt-3 text-3xl font-semibold text-zinc-100">{uniqueDisciplines}</div>
                  <div className="mt-1 text-sm text-zinc-400">Rubros con agenda activa</div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950/80">
                <CardContent className="py-5">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Cupos libres</div>
                  <div className="mt-3 text-3xl font-semibold text-zinc-100">{pendingCapacity}</div>
                  <div className="mt-1 text-sm text-zinc-400">Disponibilidad informada por backend</div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
                <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
                <CardHeader className="relative -mt-4">
                  <CardTitle>Agenda operativa</CardTitle>
                  <CardDescription>
                    Cada tarjeta refleja una clase real creada en `Classes/byBranch` y ayuda a decidir asignaciones manuales.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {classes.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-5 text-sm text-zinc-400">
                      No hay clases cargadas todavía para esta sucursal.
                    </div>
                  ) : (
                    grouped.map((group) => (
                      <div key={group.day} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="text-base font-semibold text-zinc-100">{group.day}</div>
                          <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                            {group.items.length} clase{group.items.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {group.items.map((item) => (
                            <div key={item.id} className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-4">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="text-lg font-semibold text-zinc-100">{item.title}</div>
                                  <div className="mt-1 text-sm text-zinc-500">{buildClassTimeRange(item)}</div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.status ? <Badge tone={classStatusTone(item.status)}>{item.status}</Badge> : null}
                                  {item.available != null ? <Badge tone="neutral">{item.available} libres</Badge> : null}
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplina</div>
                                  <div className="mt-2 text-zinc-100">{item.discipline ?? "Sin dato"}</div>
                                </div>
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-zinc-500">Duración</div>
                                  <div className="mt-2 text-zinc-100">{item.duration != null ? `${item.duration} min` : "No informada"}</div>
                                </div>
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-zinc-500">Instructor</div>
                                  <div className="mt-2 text-zinc-100">{item.instructor ?? "Sin asignar"}</div>
                                </div>
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-zinc-500">Capacidad</div>
                                  <div className="mt-2 text-zinc-100">{item.capacity != null ? item.capacity : "No informada"}</div>
                                </div>
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-zinc-500">Créditos</div>
                                  <div className="mt-2 text-zinc-100">
                                    {item.creditUsage != null ? `${item.creditUsage} uso / ${item.creditRefund ?? 0}% reintegro` : "Sin dato"}
                                  </div>
                                </div>
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-zinc-500">Disponibles</div>
                                  <div className="mt-2 text-zinc-100">{item.available != null ? item.available : "Sin dato"}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-zinc-800 bg-zinc-950/80">
                  <CardHeader>
                    <CardTitle>Planificación de administración</CardTitle>
                    <CardDescription>
                      Esta referencia ayuda a ordenar pedidos sobre la base semanal definida por el Admin para la sucursal activa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {WEEKDAY_ORDER.map((day) => {
                        const closed = scheduleConfig?.days[day].closed ?? false;
                        const reason = scheduleConfig?.days[day].reason ?? "";
                        return (
                          <div key={day} className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-300">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-zinc-100">{DAY_NAMES[day]}</span>
                              <Badge tone={closed ? "warning" : "success"}>{closed ? "Cerrado" : "Abierto"}</Badge>
                            </div>
                            <div className="mt-2 text-xs text-zinc-500">
                              {closed ? reason || "Sin motivo informado" : "Disponible para organizar turnos"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4">
                      <div className="text-sm font-medium text-zinc-100">Franjas habilitadas por disciplina</div>
                      <div className="mt-3 space-y-3">
                        {enabledSchedules.length === 0 ? (
                          <div className="text-sm text-zinc-400">Todavía no hay disciplinas habilitadas en la planificación semanal.</div>
                        ) : (
                          enabledSchedules.map((item) => {
                            const disciplineName = disciplines.find((discipline) => discipline.idDiscipline === item.idDiscipline)?.name ?? `Disciplina ${item.idDiscipline}`;
                            return (
                              <div key={item.idDiscipline} className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-medium text-zinc-100">{disciplineName}</div>
                                  <Badge tone="neutral">{item.slotDuration} min</Badge>
                                </div>
                                <div className="mt-2 text-sm text-zinc-400">
                                  {item.openTime} a {item.closeTime}
                                </div>
                                {item.notes ? <div className="mt-2 text-xs text-zinc-500">{item.notes}</div> : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {closedDays.length > 0 ? (
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4 text-sm text-zinc-400">
                        Días cerrados: {closedDays.map((item) => DAY_NAMES[item.day]).join(", ")}.
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-950/80">
                  <CardHeader>
                    <CardTitle>Referencia operativa</CardTitle>
                    <CardDescription>
                      Mientras el backend solo exponga `GET`, esta vista sirve para validar la agenda vigente y trabajar sobre ella.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-zinc-400">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                      1. Revisar si el día está abierto según la planificación del Admin.
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                      2. Confirmar cupos, duración y créditos antes de asignar.
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                      3. Contrastar la clase real del backend con la franja habilitada por disciplina.
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-950/80">
                  <CardHeader>
                    <CardTitle>Acciones rápidas</CardTitle>
                    <CardDescription>
                      Entradas directas para seguir operando sin salir del contexto de la sucursal activa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="secondary" className="w-full" onClick={() => refresh()}>
                      Actualizar agenda
                    </Button>
                    <Link
                      to="/app/rubros"
                      className="block rounded-2xl border border-zinc-800 px-4 py-3 text-center text-sm text-zinc-200 hover:bg-zinc-900"
                    >
                      Ver catálogo por sucursal
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </div>
    </Protected>
  );
}
