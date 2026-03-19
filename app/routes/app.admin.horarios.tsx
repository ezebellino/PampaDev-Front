import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useBranchClasses } from "../lib/api/hooks/useBranchClasses";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import { useBranch } from "../lib/branches/BranchContext";
import {
  buildClassTimeRange,
  classStatusTone,
  DAY_NAMES,
  groupBranchClassesByDay,
  normalizeBranchClass,
} from "../lib/scheduling/classPresentation";
import { useBranchScheduleConfig } from "../lib/scheduling/useBranchScheduleConfig";
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
        ? "sincronizada con la disponibilidad del backend"
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
          subtitle="Elegí una sucursal para planificar los días abiertos y validar las clases activas de esa sede."
        />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">No hay una sucursal activa seleccionada.</CardContent>
        </Card>
      </div>
    );
  }

  if (loading || disciplinesLoading || scheduleLoading) {
    return (
      <ScreenLoader
        title="Cargando horarios..."
        subtitle="Estamos preparando la planificación semanal y consultando las clases configuradas para esta sucursal."
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
            ? `Planifica la semana operativa de ${activeBranch.companyName} en ${activeBranch.cityName} y valida la agenda real cargada en backend.`
            : `Planifica la semana operativa de la sucursal ${branchId}.`
        }
        right={
          <Button variant="secondary" onClick={() => refresh()}>
            Actualizar agenda
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal activa</div>
            <div className="mt-3 text-lg font-semibold text-zinc-100">{activeBranch?.cityName ?? `#${branchId}`}</div>
            <div className="mt-1 text-sm text-zinc-400">{activeBranch?.companyName ?? "Contexto actual"}</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Días abiertos</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-100">{plannedOpenDays}</div>
            <div className="mt-1 text-sm text-zinc-400">Configurados por administración</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas habilitadas</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-100">{enabledDisciplines}</div>
            <div className="mt-1 text-sm text-zinc-400">Franjas listas para operar</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Fuente de planificación</div>
            <div className="mt-3 text-lg font-semibold text-zinc-100">{scheduleSource === "api+local" ? "API + local" : "Fallback local"}</div>
            <div className="mt-1 text-sm text-zinc-400">
              {usingBackendAvailability
                ? `Sincronizada con availability. Última actualización: ${formatUpdatedAt(scheduleConfig?.updatedAt)}`
                : "El backend todavía no expone availability para esta sede; conservamos la planificación local."}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
          <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
          <CardHeader className="relative -mt-4">
            <CardTitle>Calendario semanal de apertura</CardTitle>
            <CardDescription>
              El administrador define qué días estará operativa la sucursal y deja visibles los cierres por feriado, mantenimiento o eventos especiales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {draftConfig ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {WEEKDAY_ORDER.map((day) => {
                  const config = draftConfig.days[day];
                  return (
                    <div key={day} className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-zinc-100">{DAY_NAMES[day]}</div>
                          <div className="mt-1 text-sm text-zinc-500">{config.closed ? "Día cerrado" : "Día habilitado"}</div>
                        </div>
                        <Badge tone={config.closed ? "warning" : "success"}>{config.closed ? "Cerrado" : "Abierto"}</Badge>
                      </div>

                      <Button variant="secondary" className="mt-4 w-full" onClick={() => handleDayToggle(day)}>
                        {config.closed ? "Habilitar día" : "Marcar cierre"}
                      </Button>

                      <label className="mt-4 block text-xs uppercase tracking-wider text-zinc-500">
                        Motivo
                        <input
                          value={config.reason}
                          onChange={(event) => handleDayReason(day, event.target.value)}
                          disabled={!config.closed}
                          placeholder={config.closed ? "Ej. Feriado, mantenimiento" : "Disponible mientras el día esté abierto"}
                          className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:text-zinc-500"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader>
            <CardTitle>Criterio operativo</CardTitle>
            <CardDescription>
              Esta capa ya intenta sincronizar la disponibilidad real del backend y conserva fallback local para notas, cierres y disciplina mientras el endpoint no esté listo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">1. Admin define días abiertos o cerrados para la sucursal.</div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">2. Admin habilita horarios base y duración por disciplina.</div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">3. Cuando availability exista, la apertura semanal se empuja al backend automáticamente.</div>
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/8 px-4 py-3 text-cyan-100">
              {savedNotice ??
                (usingBackendAvailability
                  ? "La disponibilidad semanal ya está conectada con el backend para esta sede."
                  : "Todavía no hay availability publicado para esta sede. Guardamos localmente sin perder el flujo operativo.")}
            </div>
            <Button className="w-full" onClick={() => void handleSave()} disabled={!draftConfig || scheduleSaving}>
              Guardar planificación semanal
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
        <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
        <CardHeader className="relative -mt-4">
          <CardTitle>Franjas por disciplina</CardTitle>
          <CardDescription>
            Define para cada disciplina si la sede puede operar, desde qué hora hasta qué hora y con qué duración de turno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {draftConfig ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {disciplines.map((discipline) => {
                const item = draftConfig.disciplines.find((entry) => entry.idDiscipline === discipline.idDiscipline);
                if (!item) return null;

                return (
                  <div key={discipline.idDiscipline} className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-zinc-100">{discipline.name}</div>
                        <div className="mt-1 text-sm text-zinc-500">Configuración operativa para la sucursal activa</div>
                      </div>
                      <Badge tone={item.enabled ? "success" : "neutral"}>{item.enabled ? "Habilitada" : "Pausada"}</Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">Permitir turnos en esta disciplina</div>
                        <div className="mt-1 text-xs text-zinc-500">Si está desactivada, el instructor no debería ofrecer nuevos horarios.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "enabled", event.target.checked)}
                        className="h-5 w-5 accent-cyan-400"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <label className="text-xs uppercase tracking-wider text-zinc-500">
                        Desde
                        <input
                          type="time"
                          value={item.openTime}
                          onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "openTime", event.target.value)}
                          disabled={!item.enabled}
                          className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed disabled:text-zinc-500"
                        />
                      </label>

                      <label className="text-xs uppercase tracking-wider text-zinc-500">
                        Hasta
                        <input
                          type="time"
                          value={item.closeTime}
                          onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "closeTime", event.target.value)}
                          disabled={!item.enabled}
                          className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed disabled:text-zinc-500"
                        />
                      </label>

                      <label className="text-xs uppercase tracking-wider text-zinc-500">
                        Duración
                        <select
                          value={item.slotDuration}
                          onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "slotDuration", Number(event.target.value))}
                          disabled={!item.enabled}
                          className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none disabled:cursor-not-allowed disabled:text-zinc-500"
                        >
                          {SLOT_DURATION_OPTIONS.map((duration) => (
                            <option key={duration} value={duration}>
                              {duration} min
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="mt-4 block text-xs uppercase tracking-wider text-zinc-500">
                      Notas para el instructor
                      <textarea
                        value={item.notes}
                        onChange={(event) => handleDisciplineChange(discipline.idDiscipline, "notes", event.target.value)}
                        disabled={!item.enabled}
                        rows={3}
                        placeholder="Ej. Priorizar alumnos con mensualidad o dejar 10 minutos entre grupos."
                        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:text-zinc-500"
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
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Clases</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-100">{classes.length}</div>
            <div className="mt-1 text-sm text-zinc-400">Registros detectados en el backend</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas con agenda</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-100">{uniqueDisciplines}</div>
            <div className="mt-1 text-sm text-zinc-400">Rubros devueltos por `Classes/byBranch`</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Activas</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-100">{activeCount}</div>
            <div className="mt-1 text-sm text-zinc-400">Clases en estado operativo</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Fuente actual</div>
            <div className="mt-3 text-lg font-semibold text-zinc-100">{usingBackendAvailability ? "Availability lista" : "Fallback local"}</div>
            <div className="mt-1 text-sm text-zinc-400">Las clases siguen viniendo desde `Classes/byBranch`.</div>
          </CardContent>
        </Card>
      </section>

      {unavailable ? (
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
          <div className="h-20 bg-linear-to-r from-amber-500/12 to-transparent" />
          <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-zinc-400">
            <p>Cuando el backend publique la agenda de clases para esta sucursal, el resumen inferior va a mostrar las clases reales de la sede activa.</p>
            <p>La fuente esperada es `/api/Classes/byBranch/{'{'}idBranch{'}'}`.</p>
          </CardContent>
        </Card>
      ) : classes.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader>
            <CardTitle>No hay horarios cargados</CardTitle>
            <CardDescription>Esta sucursal todavía no devolvió clases desde el endpoint configurado.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
            <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
            <CardHeader className="relative -mt-4">
              <CardTitle>Agenda real cargada en backend</CardTitle>
              <CardDescription>
                Este bloque muestra las clases efectivamente creadas en `Classes/byBranch` para contrastarlas con la planificación semanal definida por administración.
              </CardDescription>
            </CardHeader>
          </Card>

          {grouped.map((group) => (
            <section key={group.day} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{group.day}</h2>
                <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                  {group.items.length} clase{group.items.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {group.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-zinc-800 bg-zinc-950/80">
                    <div className="h-16 bg-linear-to-r from-cyan-500/12 to-transparent" />
                    <CardHeader className="relative -mt-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg text-zinc-100">{item.title}</CardTitle>
                          <CardDescription className="mt-1 text-sm text-zinc-400">{buildClassTimeRange(item)}</CardDescription>
                        </div>
                        {item.status ? <Badge tone={classStatusTone(item.status)}>{item.status}</Badge> : null}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 text-sm text-zinc-300">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Rubro</div>
                          <div className="mt-2 text-sm text-zinc-100">{item.discipline ?? "Sin dato"}</div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Duración</div>
                          <div className="mt-2 text-sm text-zinc-100">{item.duration != null ? `${item.duration} min` : "No informada"}</div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Instructor</div>
                          <div className="mt-2 text-sm text-zinc-100">{item.instructor ?? "Sin asignar"}</div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Capacidad</div>
                          <div className="mt-2 text-sm text-zinc-100">{item.capacity != null ? item.capacity : "No informada"}</div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Disponibles</div>
                          <div className="mt-2 text-sm text-zinc-100">{item.available != null ? item.available : "Sin dato"}</div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Créditos</div>
                          <div className="mt-2 text-sm text-zinc-100">
                            {item.creditUsage != null ? `${item.creditUsage} uso / ${item.creditRefund ?? 0}% reintegro` : "Sin dato"}
                          </div>
                        </div>
                      </div>

                      {item.branchLabel ? <div className="text-xs text-zinc-500">Sucursal informada por API: {item.branchLabel}</div> : null}
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
