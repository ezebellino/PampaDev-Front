
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useBranchClasses } from "../lib/api/hooks/useBranchClasses";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useBranch } from "../lib/branches/BranchContext";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import {
  buildClassTimeRange,
  classStatusTone,
  DAY_NAMES,
  groupBranchClassesByDay,
  normalizeBranchClass,
} from "../lib/scheduling/classPresentation";
import { useBranchScheduleConfig } from "../lib/scheduling/useBranchScheduleConfig";
import {
  getReservationOperationalCopy,
  getReservationSourceLabel,
  getReservationSourceTone,
  getReservationStatusLabel,
  getReservationStatusTone,
  getReservationSyncLabel,
  getReservationSyncTone,
} from "../lib/scheduling/reservationPresentation";
import { useInstructorReservationRequests } from "../lib/scheduling/useInstructorRequests";
import { SLOT_DURATION_OPTIONS, type BranchScheduleConfig, type Weekday } from "../lib/scheduling/types";

const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

function formatUpdatedAt(value?: string) {
  if (!value) return "Sin guardar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin guardar";
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminHorarios() {
  const { branchId } = useBranch();
  const { data: branches } = useBranches();
  const { disciplines, loading: disciplinesLoading, error: disciplinesError } = useDisciplines();
  const { data, loading, error, unavailable, refresh } = useBranchClasses(branchId);
  const {
    data: scheduleConfig,
    loading: scheduleLoading,
    error: scheduleError,
    save: saveScheduleConfig,
    saving: scheduleSaving,
    source: scheduleSource,
    usingBackendAvailability,
  } = useBranchScheduleConfig(branchId, disciplines);

  const [draftConfig, setDraftConfig] = useState<BranchScheduleConfig | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const { requests: instructorReservations, pending: pendingReservations, confirmed: confirmedReservations } =
    useInstructorReservationRequests(branchId);

  useEffect(() => {
    setDraftConfig(scheduleConfig);
  }, [scheduleConfig]);

  const activeBranch = useMemo(() => {
    if (branchId == null || !branches) return null;
    return branches.find((branch) => branch.idBranch === branchId) ?? null;
  }, [branchId, branches]);

  const classes = useMemo(() => {
    return (data ?? []).map((item, index) => normalizeBranchClass(item, index));
  }, [data]);

  const grouped = useMemo(() => groupBranchClassesByDay(classes), [classes]);

  const activeCount = useMemo(() => {
    return classes.filter((item) => {
      if (!item.status) return true;
      const normalized = item.status.toLowerCase();
      return normalized.includes("act") || normalized.includes("disp") || normalized.includes("open");
    }).length;
  }, [classes]);

  const uniqueDisciplines = useMemo(() => {
    return new Set(classes.map((item) => item.discipline).filter(Boolean)).size;
  }, [classes]);

  const plannedOpenDays = useMemo(() => {
    if (!draftConfig) return 0;
    return WEEKDAY_ORDER.filter((day) => !draftConfig.days[day].closed).length;
  }, [draftConfig]);

  const enabledDisciplines = useMemo(() => {
    if (!draftConfig) return 0;
    return draftConfig.disciplines.filter((item) => item.enabled).length;
  }, [draftConfig]);

  const busiestDay = useMemo(() => {
    if (grouped.length === 0) return null;
    return [...grouped].sort((a, b) => b.items.length - a.items.length)[0] ?? null;
  }, [grouped]);

  const pendingBackendReservations = useMemo(() => {
    return instructorReservations.filter((request) => request.syncStatus !== "synced");
  }, [instructorReservations]);

  const handleDayToggle = (day: Weekday) => {
    setDraftConfig((current) => {
      if (!current) return current;
      const nextClosed = !current.days[day].closed;
      return {
        ...current,
        days: {
          ...current.days,
          [day]: {
            ...current.days[day],
            closed: nextClosed,
            reason: nextClosed ? current.days[day].reason : "",
          },
        },
      };
    });
  };

  const handleDayReason = (day: Weekday, reason: string) => {
    setDraftConfig((current) => {
      if (!current) return current;
      return {
        ...current,
        days: {
          ...current.days,
          [day]: {
            ...current.days[day],
            reason,
          },
        },
      };
    });
  };

  const handleDisciplineChange = (
    idDiscipline: number,
    field: "enabled" | "openTime" | "closeTime" | "slotDuration" | "notes",
    value: boolean | string | number
  ) => {
    setDraftConfig((current) => {
      if (!current) return current;
      return {
        ...current,
        disciplines: current.disciplines.map((item) => {
          if (item.idDiscipline !== idDiscipline) return item;
          return {
            ...item,
            [field]: value,
          };
        }),
      };
    });
  };

  const handleSave = async () => {
    if (!draftConfig) return;

    try {
      const saved = await saveScheduleConfig(draftConfig);
      const sourceMessage = usingBackendAvailability
        ? "sincronizada con la disponibilidad real del backend"
        : "guardada en fallback local hasta que el backend publique availability";
      setSavedNotice(`Planificación ${sourceMessage} el ${formatUpdatedAt(saved.updatedAt)}.`);
    } catch (err) {
      setSavedNotice(err instanceof Error ? err.message : "No pudimos guardar la planificación semanal.");
    }
  };

  if (branchId == null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Horarios"
          subtitle="Elige una sucursal para planificar los días abiertos y validar la agenda activa de esa sede."
        />
        <Card>
          <CardContent className="py-6 text-sm text-slate-500">No hay una sucursal activa seleccionada.</CardContent>
        </Card>
      </div>
    );
  }

  if (loading || disciplinesLoading || scheduleLoading) {
    return (
      <ScreenLoader
        title="Cargando horarios..."
        subtitle="Estamos preparando la planificación semanal y consultando la agenda real de esta sucursal."
      />
    );
  }

  if (disciplinesError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Horarios"
          subtitle="No pudimos cargar las disciplinas necesarias para planificar esta sucursal."
          right={
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          }
        />
        <Card>
          <CardContent className="py-6 text-sm text-red-300">{disciplinesError}</CardContent>
        </Card>
      </div>
    );
  }

  if (scheduleError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Horarios" subtitle="No pudimos cargar la planificación semanal de esta sucursal." />
        <Card>
          <CardContent className="py-6 text-sm text-red-300">
            {scheduleError instanceof Error ? scheduleError.message : "Error inesperado al leer la planificación."}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Horarios"
          subtitle="No pudimos cargar las clases de esta sucursal en este momento."
          right={
            <Button variant="secondary" onClick={() => refresh()}>
              Reintentar
            </Button>
          }
        />
        <Card>
          <CardContent className="py-6 text-sm text-red-300">{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horarios"
        subtitle={
          activeBranch
            ? `Planificación semanal de ${activeBranch.companyName} en ${activeBranch.cityName}.`
            : `Planificá la semana operativa de la sucursal ${branchId}.`
        }
        right={
          <Button variant="secondary" onClick={() => refresh()}>
            Actualizar agenda
          </Button>
        }
      />

      <Card className="border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.22),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,250,255,0.99))]">
        <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-700">Semana operativa</div>
            <div className="max-w-3xl text-2xl font-semibold leading-tight text-slate-900">
              Apertura semanal y horarios por disciplina.
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Usá la disponibilidad real cuando exista. Si no, conservamos un respaldo local.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{plannedOpenDays} días abiertos</Badge>
              <Badge tone="neutral">{enabledDisciplines} disciplinas habilitadas</Badge>
              <Badge tone={usingBackendAvailability ? "success" : "warning"}>
                {usingBackendAvailability ? "Disponibilidad conectada" : "Respaldo local activo"}
              </Badge>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-stone-200 bg-white/88 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-slate-500">Última planificación</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{formatUpdatedAt(scheduleConfig?.updatedAt)}</div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white/88 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-slate-500">Origen semanal</div>
              <div className="mt-2 text-sm font-medium text-slate-900">{scheduleSource === "api+local" ? "API y respaldo local" : "Respaldo local"}</div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white/88 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-slate-500">Día más cargado</div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {busiestDay ? `${busiestDay.day} · ${busiestDay.items.length} clase${busiestDay.items.length === 1 ? "" : "s"}` : "Sin clases registradas"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
          <CardHeader className="relative -mt-4">
            <CardTitle>Reservas operadas sobre esta planificación</CardTitle>
            <CardDescription>
              Acá ves lo que el instructor ya está moviendo sobre las franjas que definiste desde administración.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {instructorReservations.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-slate-500">
                Todavía no hay reservas visibles en frontend para esta sucursal.
              </div>
            ) : (
              instructorReservations.slice(0, 6).map((request) => (
                <div key={request.id} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <div className="text-base font-semibold text-slate-900">{request.userName ?? request.userId}</div>
                        <div className="mt-1 text-sm text-slate-600">
                          {request.rubroName ?? request.rubroId} - {request.date ?? "Fecha a confirmar"} - {request.time ?? "Hora a confirmar"}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Estado</div>
                          <div className="mt-2">
                            <Badge tone={getReservationStatusTone(request.status)}>{getReservationStatusLabel(request.status)}</Badge>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Origen</div>
                          <div className="mt-2">
                            <Badge tone={getReservationSourceTone(request.bookingSource)}>{getReservationSourceLabel(request.bookingSource)}</Badge>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Sincronización</div>
                          <div className="mt-2">
                            <Badge tone={getReservationSyncTone(request.syncStatus)}>{getReservationSyncLabel(request.syncStatus)}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-slate-500">
                        <div className="font-medium text-slate-800">Detalle de la reserva</div>
                        <div className="mt-1">{request.slotLabel ?? "Reserva enviada desde agenda de rubro"}</div>
                        <div className="mt-2 text-xs text-stone-500">{getReservationOperationalCopy(request)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardHeader>
              <CardTitle>Resumen de reservas</CardTitle>
              <CardDescription>
                Una lectura rápida de lo que ya está ocurriendo sobre la planificación semanal actual.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-500">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">Pendientes: {pendingReservations.length}</div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">Confirmadas: {confirmedReservations.length}</div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">Pendientes de sincronizar: {pendingBackendReservations.length}</div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">Total visible: {instructorReservations.length}</div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardHeader>
              <CardTitle>Cómo leer este cruce</CardTitle>
              <CardDescription>
                Para ver en una sola pantalla qué definió admin y qué ya está operando el instructor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-500">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                `Reserva confirmada` significa que el instructor ya tomó ese pedido sobre tu franja operativa.
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                `Lista para backend` muestra reservas que frontend ya guarda pero todavía esperan sincronización completa.
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                Esto complementa la agenda real de clases y te ayuda a detectar si la operación va alineada con la planificación.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Sucursal activa</div>
            <div className="mt-3 text-lg font-semibold text-slate-900">{activeBranch?.cityName ?? `#${branchId}`}</div>
            <div className="mt-1 text-sm text-slate-500">{activeBranch?.companyName ?? "Contexto actual"}</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Días abiertos</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{plannedOpenDays}</div>
            <div className="mt-1 text-sm text-slate-500">Configurados por administración</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas habilitadas</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{enabledDisciplines}</div>
            <div className="mt-1 text-sm text-slate-500">Franjas listas para usar</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Fuente de planificación</div>
            <div className="mt-3 text-lg font-semibold text-slate-900">{usingBackendAvailability ? "API y respaldo local" : "Respaldo local"}</div>
            <div className="mt-1 text-sm text-slate-500">
              {usingBackendAvailability
                ? `Sincronizada con availability. Última actualización: ${formatUpdatedAt(scheduleConfig?.updatedAt)}`
                : "El backend todavía no expone disponibilidad para esta sede; conservamos la planificación local."}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
          <CardHeader className="relative -mt-4">
            <CardTitle>Calendario semanal de apertura</CardTitle>
            <CardDescription>
              Definí qué días abre la sucursal, qué cierres excepcionales tiene y dej? una referencia clara para el equipo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {draftConfig ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {WEEKDAY_ORDER.map((day) => {
                  const config = draftConfig.days[day];
                  return (
                    <div key={day} className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-900">{DAY_NAMES[day]}</div>
                          <div className="mt-1 text-sm text-stone-500">{config.closed ? "Día cerrado" : "Día habilitado"}</div>
                        </div>
                        <Badge tone={config.closed ? "warning" : "success"}>{config.closed ? "Cerrado" : "Abierto"}</Badge>
                      </div>

                      <Button variant="secondary" className="mt-4 w-full" onClick={() => handleDayToggle(day)}>
                        {config.closed ? "Habilitar día" : "Marcar cierre"}
                      </Button>

                      <label className="mt-4 block text-xs uppercase tracking-wider text-stone-500">
                        Motivo
                        <input
                          value={config.reason}
                          onChange={(event) => handleDayReason(day, event.target.value)}
                          disabled={!config.closed}
                          placeholder={config.closed ? "Ej. Feriado, mantenimiento" : "Disponible mientras el día esté abierto"}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400 disabled:cursor-not-allowed disabled:text-stone-500"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardHeader>
            <CardTitle>Estado del guardado</CardTitle>
            <CardDescription>Guardado y sincronización.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-500">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/8 px-4 py-3 text-cyan-700">
              {savedNotice ??
                (usingBackendAvailability
                  ? "La disponibilidad semanal ya está conectada con el backend para esta sede."
                  : "Todav?a no hay availability publicado para esta sede. Guardamos localmente sin cortar el flujo de trabajo.")}
            </div>
            <Button className="w-full" onClick={() => void handleSave()} disabled={!draftConfig || scheduleSaving}>
              Guardar planificación semanal
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
        <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
        <CardHeader className="relative -mt-4">
          <CardTitle>Horarios por disciplina</CardTitle>
          <CardDescription>Configuración por rubro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {draftConfig ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {disciplines.map((discipline) => {
                const item = draftConfig.disciplines.find((entry) => entry.idDiscipline === discipline.idDiscipline);
                if (!item) return null;

                return (
                  <div key={discipline.idDiscipline} className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{discipline.name}</div>
                        <div className="mt-1 text-sm text-stone-500">Configuración por sucursal</div>
                      </div>
                      <Badge tone={item.enabled ? "success" : "neutral"}>{item.enabled ? "Habilitada" : "Pausada"}</Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">Permitir turnos en esta disciplina</div>
                        <div className="mt-1 text-xs text-stone-500">Si está desactivada, el equipo no deber?a ofrecer nuevos horarios.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "enabled", event.target.checked)}
                        className="h-5 w-5 accent-cyan-400"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <label className="text-xs uppercase tracking-wider text-stone-500">
                        Desde
                        <input
                          type="time"
                          value={item.openTime}
                          onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "openTime", event.target.value)}
                          disabled={!item.enabled}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:text-stone-500"
                        />
                      </label>

                      <label className="text-xs uppercase tracking-wider text-stone-500">
                        Hasta
                        <input
                          type="time"
                          value={item.closeTime}
                          onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "closeTime", event.target.value)}
                          disabled={!item.enabled}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:text-stone-500"
                        />
                      </label>

                      <label className="text-xs uppercase tracking-wider text-stone-500">
                        Duración
                        <select
                          value={item.slotDuration}
                          onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "slotDuration", Number(event.target.value))}
                          disabled={!item.enabled}
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:text-stone-500"
                        >
                          {SLOT_DURATION_OPTIONS.map((duration) => (
                            <option key={duration} value={duration}>
                              {duration} min
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="mt-4 block text-xs uppercase tracking-wider text-stone-500">
                      Notas para el instructor
                      <textarea
                        value={item.notes}
                        onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "notes", event.target.value)}
                        disabled={!item.enabled}
                        rows={3}
                        placeholder="Ej. Priorizar alumnos con mensualidad o dejar 10 minutos entre grupos."
                        className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400 disabled:cursor-not-allowed disabled:text-stone-500"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>


      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Clases</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{classes.length}</div>
            <div className="mt-1 text-sm text-slate-500">Registros detectados en backend</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas con agenda</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{uniqueDisciplines}</div>
            <div className="mt-1 text-sm text-slate-500">Devueltas por Classes/byBranch</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Activas</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{activeCount}</div>
            <div className="mt-1 text-sm text-slate-500">Clases en estado operativo</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-stone-500">Origen actual</div>
            <div className="mt-3 text-lg font-semibold text-slate-900">{usingBackendAvailability ? "Disponibilidad lista" : "Respaldo local"}</div>
            <div className="mt-1 text-sm text-slate-500">Las clases siguen viniendo desde Classes/byBranch.</div>
          </CardContent>
        </Card>
      </section>

      {unavailable ? (
        <Card className="overflow-hidden border-stone-200 bg-white">
          <div className="h-20 bg-linear-to-r from-amber-500/12 to-transparent" />
          <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-slate-500">
            <p>Sin clases reales por ahora.</p>
            <p>Fuente esperada: /api/Classes/byBranch/{'{'}idBranch{'}'}.</p>
          </CardContent>
        </Card>
      ) : classes.length === 0 ? (
        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardHeader>
            <CardTitle>No hay horarios cargados</CardTitle>
            <CardDescription>Esta sucursal todavía no devolvió clases desde el endpoint configurado.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
            <CardHeader className="relative -mt-4">
              <CardTitle>Agenda real cargada en backend</CardTitle>
              <CardDescription>Clases creadas en backend.</CardDescription>
            </CardHeader>
          </Card>

          {grouped.map((group) => (
            <section key={group.day} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">{group.day}</h2>
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-slate-500">
                  {group.items.length} clase{group.items.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {group.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                    <div className="h-16 bg-linear-to-r from-cyan-500/12 to-transparent" />
                    <CardHeader className="relative -mt-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg text-slate-900">{item.title}</CardTitle>
                          <CardDescription className="mt-1 text-sm text-slate-500">{buildClassTimeRange(item)}</CardDescription>
                        </div>
                        {item.status ? <Badge tone={classStatusTone(item.status)}>{item.status}</Badge> : null}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 text-sm text-slate-600">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Rubro</div>
                          <div className="mt-2 text-sm text-slate-900">{item.discipline ?? "Sin dato"}</div>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Duración</div>
                          <div className="mt-2 text-sm text-slate-900">{item.duration != null ? `${item.duration} min` : "No informada"}</div>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Instructor</div>
                          <div className="mt-2 text-sm text-slate-900">{item.instructor ?? "Sin asignar"}</div>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Capacidad</div>
                          <div className="mt-2 text-sm text-slate-900">{item.capacity != null ? item.capacity : "No informada"}</div>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Disponibles</div>
                          <div className="mt-2 text-sm text-slate-900">{item.available != null ? item.available : "Sin dato"}</div>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Créditos</div>
                          <div className="mt-2 text-sm text-slate-900">
                            {item.creditUsage != null ? `${item.creditUsage} uso / ${item.creditRefund ?? 0}% reintegro` : "Sin dato"}
                          </div>
                        </div>
                      </div>

                      {item.branchLabel ? <div className="text-xs text-stone-500">Sucursal informada por API: {item.branchLabel}</div> : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}


