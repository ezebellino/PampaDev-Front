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
import {
  getPublishedAgendaSlotStatusLabel,
  getPublishedAgendaSlotStatusTone,
  summarizeAgendaByDay,
  usePublishedBranchAgenda,
} from "../lib/scheduling/publishedAgenda";
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

  const publishedAgenda = usePublishedBranchAgenda(branchId, disciplines, scheduleConfig);
  const agendaByDay = useMemo(() => summarizeAgendaByDay(publishedAgenda.items), [publishedAgenda.items]);

  const { requests, pending, confirmed, refresh: refreshRequests, confirmRequest, rejectRequest } = useInstructorReservationRequests(branchId);

  const syncBacklog = useMemo(() => requests.filter((request) => request.syncStatus !== "synced"), [requests]);
  const visibleRequests = useMemo(() => requests.filter((request) => requestMatchesFilter(request, requestFilter)), [requests, requestFilter]);

  if (loading || disciplinesLoading || scheduleLoading) {
    return (
      <Protected allowRoles={[ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-10 text-sm text-slate-600">Cargando agenda operativa...</CardContent>
        </Card>
      </Protected>
    );
  }

  return (
    <Protected allowRoles={[ROLES.INSTRUCTOR, ROLES.DEVS]}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-[linear-gradient(135deg,rgba(239,244,255,0.94),rgba(255,255,255,0.98)_44%,rgba(236,253,245,0.9)_100%)] p-6 shadow-[0_28px_80px_-48px_rgba(69,70,77,0.2)] md:p-8">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-stone-500">Panel instructor</div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Gestión operativa de turnos
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Esta vista combina la planificación semanal definida por administración con las reservas de usuarios y las clases reales creadas para la sucursal activa.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Instructor</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{user?.name ?? "Cuenta activa"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Rol</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{user?.role ?? ROLES.INSTRUCTOR}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Empresa</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{companyId ?? "Sin seleccionar"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Sucursal</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{branchId ?? "Pendiente"}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Lo esencial del día.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Link
                to={hasBranch ? "/app/instructor" : "/app/branches"}
                className="rounded-3xl border border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.98))] p-5 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.14)] transition hover:-translate-y-1 hover:border-amber-300"
              >
                <div className="text-lg font-semibold text-slate-900">Reservas pendientes</div>
                <div className="mt-2 text-3xl font-semibold text-amber-700">{pending.length}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">Lo que aún espera respuesta.</div>
              </Link>

              <Link
                to={hasBranch ? "/app/rubros" : "/app/branches"}
                className="rounded-3xl border border-sky-200 bg-[linear-gradient(135deg,rgba(239,244,255,0.98),rgba(255,255,255,0.98))] p-5 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.14)] transition hover:-translate-y-1 hover:border-sky-300"
              >
                <div className="text-lg font-semibold text-slate-900">Agenda y rubros</div>
                <div className="mt-2 text-3xl font-semibold text-sky-700">{classes.length}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">Clases activas en esta sede.</div>
              </Link>

              <Link
                to="/app/branches"
                className="rounded-3xl border border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(255,255,255,0.98))] p-5 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.14)] transition hover:-translate-y-1 hover:border-emerald-300"
              >
                <div className="text-lg font-semibold text-slate-900">Contexto de trabajo</div>
                <div className="mt-2 text-sm font-medium text-emerald-700">{branchId ?? "Elegí sucursal"}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">Sucursal activa para operar.</div>
              </Link>
            </CardContent>
          </Card>

        </section>

        {hasBranch ? (
          <>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
              <CardHeader>
                <CardTitle>Agenda publicada</CardTitle>
                <CardDescription>Horarios visibles para el usuario.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {publishedAgenda.items.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4 text-sm text-slate-600">
                    Todavía no hay horarios publicados.
                  </div>
                ) : (
                  publishedAgenda.items.slice(0, 8).map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-stone-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{String(item.rubroName ?? item.disciplineName ?? item.rubroId)}</div>
                        <div className="mt-1 text-xs text-stone-500">{item.date} - {item.time} - {item.available}/{item.capacity}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={getPublishedAgendaSlotStatusTone(item)}>{getPublishedAgendaSlotStatusLabel(item)}</Badge>
                        <Button size="sm" variant="secondary" onClick={() => publishedAgenda.toggleSlot(item.id)}>
                          {item.agendaStatus === "closed" ? "Publicar" : "Cerrar"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
              <CardHeader>
                <CardTitle>Resumen de agenda</CardTitle>
                <CardDescription>Disponibilidad de hoy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-stone-500">Publicados</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{publishedAgenda.openCount}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-stone-500">Cerrados</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{publishedAgenda.closedCount}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {agendaByDay.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4 text-sm text-slate-600">
                      Sin días publicados por ahora.
                    </div>
                  ) : (
                    agendaByDay.slice(0, 6).map((day) => (
                      <div key={day.date} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm">
                        <span className="text-slate-900">{day.date}</span>
                        <span className="text-slate-600">{day.open}/{day.count} disponibles</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/80 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Reservas de usuarios</h2>
                <p className="text-sm text-slate-600">
                  Acá recibís las reservas que llegan desde rubros y podés confirmar, rechazar o detectar rápido qué sigue pendiente de backend.
                </p>
              </div>
              <Button variant="ghost" onClick={refreshRequests} size="sm">
                Actualizar
              </Button>
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
                      ? "border-cyan-500/35 bg-cyan-400/10 text-sky-700"
                      : "border-slate-200 bg-stone-50 text-slate-600 hover:bg-[#eff4ff]",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                  <span className="rounded-full border border-current/15 px-2 py-0.5 text-xs">{item.count}</span>
                </button>
              ))}
            </div>

            {visibleRequests.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-stone-50 p-4 text-sm text-slate-600">
                No hay reservas para este filtro en la sucursal activa.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {visibleRequests.map((request) => {
                  const canOperate = request.status === "pending";

                  return (
                    <div
                      key={request.id}
                      className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(69,70,77,0.18)]"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                          <div>
                            <div className="text-base font-semibold text-slate-900">{request.userName ?? request.userId}</div>
                            <div className="mt-1 text-sm text-slate-600">
                              {request.rubroName ?? request.rubroId} · {request.date ?? "Fecha a confirmar"} · {request.time ?? "Hora a confirmar"}
                            </div>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Estado</div>
                              <div className="mt-2">
                                <Badge tone={getReservationStatusTone(request.status)}>{getReservationStatusLabel(request.status)}</Badge>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Origen</div>
                              <div className="mt-2">
                                <Badge tone={getReservationSourceTone(request.bookingSource)}>
                                  {getReservationSourceLabel(request.bookingSource)}
                                </Badge>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Sincronización</div>
                              <div className="mt-2">
                                <Badge tone={getReservationSyncTone(request.syncStatus)}>
                                  {getReservationSyncLabel(request.syncStatus)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <div className="font-medium text-slate-900">Detalle de la reserva</div>
                            <div className="mt-1">{request.slotLabel ?? "Reserva enviada desde agenda de rubro"}</div>
                            <div className="mt-2 text-xs text-stone-500">{getReservationOperationalCopy(request)}</div>
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
                            className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-700 transition hover:bg-[#eff4ff]"
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
          </>
        ) : null}

        {!hasBranch ? (
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardHeader>
              <CardTitle>Elegí una sucursal para continuar</CardTitle>
              <CardDescription>
                El instructor trabaja siempre sobre una sede activa para evitar conflictos con agenda, rubros y disponibilidad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/app/branches"
                className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Seleccionar sucursal
              </Link>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardContent className="py-6 text-sm text-red-300">{error}</CardContent>
          </Card>
        ) : unavailable ? (
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
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
              <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                <CardContent className="py-5">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Clases</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">{classes.length}</div>
                  <div className="mt-1 text-sm text-slate-600">Turnos base detectados en la agenda</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                <CardContent className="py-5">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Activas</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">{openClasses}</div>
                  <div className="mt-1 text-sm text-slate-600">Clases listas para operar</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                <CardContent className="py-5">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">{uniqueDisciplines}</div>
                  <div className="mt-1 text-sm text-slate-600">Rubros con agenda activa</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                <CardContent className="py-5">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Cupos libres</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-900">{pendingCapacity}</div>
                  <div className="mt-1 text-sm text-slate-600">Disponibilidad informada por backend</div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <Card className="overflow-hidden border-slate-200 bg-white/92 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.16)]">
                <div className="h-20 bg-linear-to-r from-sky-100 via-lime-50 to-transparent" />
                <CardHeader className="relative -mt-4">
                  <CardTitle>Agenda operativa</CardTitle>
                  <CardDescription>
                    Cada tarjeta refleja una clase real creada en `Classes/byBranch` y ayuda a decidir asignaciones manuales.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {classes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-5 text-sm text-slate-600">
                      No hay clases cargadas todavía para esta sucursal.
                    </div>
                  ) : (
                    grouped.map((group) => (
                      <div key={group.day} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="text-base font-semibold text-slate-900">{group.day}</div>
                          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                            {group.items.length} clase{group.items.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {group.items.map((item) => (
                            <div key={item.id} className="rounded-3xl border border-slate-200 bg-stone-50 p-4">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                                  <div className="mt-1 text-sm text-stone-500">{buildClassTimeRange(item)}</div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.status ? <Badge tone={classStatusTone(item.status)}>{item.status}</Badge> : null}
                                  {item.available != null ? <Badge tone="neutral">{item.available} libres</Badge> : null}
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-stone-500">Disciplina</div>
                                  <div className="mt-2 text-slate-900">{item.discipline ?? "Sin dato"}</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-stone-500">Duración</div>
                                  <div className="mt-2 text-slate-900">{item.duration != null ? `${item.duration} min` : "No informada"}</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-stone-500">Instructor</div>
                                  <div className="mt-2 text-slate-900">{item.instructor ?? "Sin asignar"}</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-stone-500">Capacidad</div>
                                  <div className="mt-2 text-slate-900">{item.capacity != null ? item.capacity : "No informada"}</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-stone-500">Créditos</div>
                                  <div className="mt-2 text-slate-900">
                                    {item.creditUsage != null ? `${item.creditUsage} uso / ${item.creditRefund ?? 0}% reintegro` : "Sin dato"}
                                  </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                  <div className="text-xs uppercase tracking-wider text-stone-500">Disponibles</div>
                                  <div className="mt-2 text-slate-900">{item.available != null ? item.available : "Sin dato"}</div>
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
                <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                  <CardHeader>
                    <CardTitle>Planificación de administración</CardTitle>
                    <CardDescription>Base semanal definida por admin.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {WEEKDAY_ORDER.map((day) => {
                        const closed = scheduleConfig?.days[day].closed ?? false;
                        const reason = scheduleConfig?.days[day].reason ?? "";
                        return (
                          <div key={day} className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-600">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-slate-900">{DAY_NAMES[day]}</span>
                              <Badge tone={closed ? "warning" : "success"}>{closed ? "Cerrado" : "Abierto"}</Badge>
                            </div>
                            <div className="mt-2 text-xs text-stone-500">
                              {closed ? reason || "Sin motivo informado" : "Disponible para organizar turnos"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                      <div className="text-sm font-medium text-slate-900">Franjas habilitadas por disciplina</div>
                      <div className="mt-3 space-y-3">
                        {enabledSchedules.length === 0 ? (
                          <div className="text-sm text-slate-600">Todavía no hay disciplinas habilitadas en la planificación semanal.</div>
                        ) : (
                          enabledSchedules.map((item) => {
                            const disciplineName = disciplines.find((discipline) => discipline.idDiscipline === item.idDiscipline)?.name ?? `Disciplina ${item.idDiscipline}`;
                            return (
                              <div key={item.idDiscipline} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-medium text-slate-900">{disciplineName}</div>
                                  <Badge tone="neutral">{item.slotDuration} min</Badge>
                                </div>
                                <div className="mt-2 text-sm text-slate-600">
                                  {item.openTime} a {item.closeTime}
                                </div>
                                {item.notes ? <div className="mt-2 text-xs text-stone-500">{item.notes}</div> : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {closedDays.length > 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4 text-sm text-slate-600">
                        Días cerrados: {closedDays.map((item) => DAY_NAMES[item.day]).join(", ")}.
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                  <CardHeader>
                    <CardTitle>Referencia operativa</CardTitle>
                    <CardDescription>
                      Mientras el backend solo exponga `GET`, esta vista sirve para validar la agenda vigente y trabajar sobre ella.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                      1. Revisar si el día está abierto según la planificación del Admin.
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                      2. Confirmar cupos, duración y créditos antes de asignar.
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                      3. Contrastar la clase real del backend con la franja habilitada por disciplina.
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                  <CardHeader>
                    <CardTitle>Acciones rápidas</CardTitle>
                    <CardDescription>Lo más usado.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="secondary" className="w-full" onClick={() => refresh()}>
                      Actualizar agenda
                    </Button>
                    <Link
                      to="/app/rubros"
                      className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-700 hover:bg-[#eff4ff]"
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
