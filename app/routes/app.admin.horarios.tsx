import { useMemo } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useBranchClasses } from "../lib/api/hooks/useBranchClasses";
import { useBranches } from "../lib/api/hooks/useBranches";
import type { BranchClassRecord } from "../lib/api/models/branchClass";
import { useBranch } from "../lib/branches/BranchContext";

type NormalizedClass = {
  id: string;
  title: string;
  branchLabel: string | null;
  discipline: string | null;
  instructor: string | null;
  dayLabel: string;
  startLabel: string | null;
  endLabel: string | null;
  capacity: number | null;
  available: number | null;
  status: string | null;
  raw: BranchClassRecord;
};

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function pickString(record: BranchClassRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function pickNumber(record: BranchClassRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

function pickBoolean(record: BranchClassRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return null;
}

function formatTimeValue(value: string | null) {
  if (!value) return null;

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  return value;
}

function resolveDayLabel(record: BranchClassRecord, fallbackStart: string | null) {
  const rawDayNumber = pickNumber(record, ["dayOfWeek", "weekDay", "weekday", "day"]);
  if (rawDayNumber != null && rawDayNumber >= 0 && rawDayNumber <= 6) {
    return DAY_NAMES[rawDayNumber];
  }

  const rawDayName = pickString(record, ["dayName", "weekdayName", "weekDayName"]);
  if (rawDayName) return rawDayName;

  if (fallbackStart) {
    const date = new Date(fallbackStart);
    if (!Number.isNaN(date.getTime())) return DAY_NAMES[date.getDay()];
  }

  return "Sin día definido";
}

function normalizeClass(item: BranchClassRecord, index: number): NormalizedClass {
  const startRaw = pickString(item, ["startTime", "startHour", "timeStart", "startsAt", "startAt", "dateStart", "date"]);
  const endRaw = pickString(item, ["endTime", "endHour", "timeEnd", "endsAt", "endAt", "dateEnd"]);
  const title =
    pickString(item, ["title", "name", "className", "disciplineName", "serviceName", "activityName"]) ??
    `Clase ${index + 1}`;

  const id =
    pickString(item, ["idClass", "classId", "id", "uuid"]) ??
    `${title}-${startRaw ?? "no-start"}-${index}`;

  const active = pickBoolean(item, ["active", "isActive", "enabled"]);
  const status =
    pickString(item, ["status", "state"]) ??
    (active == null ? null : active ? "Activa" : "Inactiva");

  return {
    id,
    title,
    branchLabel: pickString(item, ["branchName", "sucursal", "branchLabel"]),
    discipline: pickString(item, ["disciplineName", "rubro", "categoryName"]),
    instructor: pickString(item, ["instructorName", "teacherName", "coachName", "professorName"]),
    dayLabel: resolveDayLabel(item, startRaw),
    startLabel: formatTimeValue(startRaw),
    endLabel: formatTimeValue(endRaw),
    capacity: pickNumber(item, ["capacity", "quota", "maxCapacity", "slots"]),
    available: pickNumber(item, ["availableSlots", "available", "remainingSlots", "freeSlots"]),
    status,
    raw: item,
  };
}

function statusTone(status: string | null) {
  if (!status) return "neutral" as const;
  const normalized = status.toLowerCase();
  if (normalized.includes("act") || normalized.includes("disp") || normalized.includes("open")) return "success" as const;
  if (normalized.includes("cancel") || normalized.includes("inact") || normalized.includes("cerr")) return "warning" as const;
  return "neutral" as const;
}

function buildTimeRange(item: NormalizedClass) {
  if (item.startLabel && item.endLabel) return `${item.startLabel} a ${item.endLabel}`;
  if (item.startLabel) return `Desde ${item.startLabel}`;
  if (item.endLabel) return `Hasta ${item.endLabel}`;
  return "Horario a confirmar";
}

export default function AdminHorarios() {
  const { branchId } = useBranch();
  const { data: branches } = useBranches();
  const { data, loading, error, unavailable, refresh } = useBranchClasses(branchId);

  const activeBranch = useMemo(() => {
    if (branchId == null || !branches) return null;
    return branches.find((branch) => branch.idBranch === branchId) ?? null;
  }, [branchId, branches]);

  const classes = useMemo(() => {
    return (data ?? []).map((item, index) => normalizeClass(item, index));
  }, [data]);

  const grouped = useMemo(() => {
    const map = new Map<string, NormalizedClass[]>();

    for (const item of classes) {
      const group = map.get(item.dayLabel) ?? [];
      group.push(item);
      map.set(item.dayLabel, group);
    }

    return DAY_NAMES.concat("Sin día definido")
      .map((day) => ({ day, items: map.get(day) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [classes]);

  const activeCount = useMemo(() => {
    return classes.filter((item) => {
      if (!item.status) return true;
      const normalized = item.status.toLowerCase();
      return normalized.includes("act") || normalized.includes("disp") || normalized.includes("open");
    }).length;
  }, [classes]);

  if (branchId == null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Horarios"
          subtitle="Elegí una sucursal para ver las clases y franjas horarias asociadas a esa sede."
        />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">
            No hay una sucursal activa seleccionada.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <ScreenLoader
        title="Cargando horarios…"
        subtitle="Estamos consultando las clases configuradas para esta sucursal."
      />
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

  if (unavailable) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Horarios"
          subtitle="La consulta de clases por sucursal todavía no está disponible en este entorno."
        />
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
          <div className="h-20 bg-linear-to-r from-amber-500/12 to-transparent" />
          <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-zinc-400">
            <p>Cuando el backend publique esta información, la vista va a mostrar las clases de la sede activa.</p>
            <p>La fuente esperada es `/api/Classes/byBranch/{'{'}idBranch{'}'}`.</p>
          </CardContent>
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
            ? `Clases registradas para ${activeBranch.companyName} · ${activeBranch.cityName}.`
            : `Clases registradas para la sucursal ${branchId}.`
        }
        right={
          <Button variant="secondary" onClick={() => refresh()}>
            Actualizar
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
            <div className="text-xs uppercase tracking-wider text-zinc-500">Clases</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-100">{classes.length}</div>
            <div className="mt-1 text-sm text-zinc-400">Registros obtenidos desde la sucursal</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Activas</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-100">{activeCount}</div>
            <div className="mt-1 text-sm text-zinc-400">Clases con estado operativo o disponible</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="py-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Días con actividad</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-100">{grouped.length}</div>
            <div className="mt-1 text-sm text-zinc-400">Agrupación semanal detectada</div>
          </CardContent>
        </Card>
      </section>

      {classes.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader>
            <CardTitle>No hay horarios cargados</CardTitle>
            <CardDescription>
              Esta sucursal todavía no devolvió clases desde el endpoint configurado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-5">
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
                          <CardDescription className="mt-1 text-sm text-zinc-400">
                            {buildTimeRange(item)}
                          </CardDescription>
                        </div>
                        {item.status ? <Badge tone={statusTone(item.status)}>{item.status}</Badge> : null}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 text-sm text-zinc-300">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Rubro</div>
                          <div className="mt-2 text-sm text-zinc-100">{item.discipline ?? "Sin dato"}</div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Instructor</div>
                          <div className="mt-2 text-sm text-zinc-100">{item.instructor ?? "Sin asignar"}</div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Capacidad</div>
                          <div className="mt-2 text-sm text-zinc-100">
                            {item.capacity != null ? item.capacity : "No informada"}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Disponibles</div>
                          <div className="mt-2 text-sm text-zinc-100">
                            {item.available != null ? item.available : "Sin dato"}
                          </div>
                        </div>
                      </div>

                      {item.branchLabel ? (
                        <div className="text-xs text-zinc-500">Sucursal informada por API: {item.branchLabel}</div>
                      ) : null}

                      <details className="rounded-2xl border border-zinc-800 bg-zinc-900/35 px-4 py-3">
                        <summary className="cursor-pointer text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Ver payload recibido
                        </summary>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-zinc-500">
                          {JSON.stringify(item.raw, null, 2)}
                        </pre>
                      </details>
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
