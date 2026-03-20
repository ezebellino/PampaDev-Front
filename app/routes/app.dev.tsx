import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import LogsChart from "../components/dev/LogChart";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import {
  clearLogs,
  getLogs,
  type LogEntry,
  type LogLevel,
  type LogOrigin,
  LOGS_EVENT,
} from "../lib/utils/logger";

type LevelFilter = "all" | "warning" | "error";
type OriginFilter = "all" | "frontend" | "backend" | "unknown";

type AnyLog = LogEntry & {
  origin?: LogOrigin;
  layer?: string;
  feature?: string;
  route?: string;
  tags?: string[];
};

function levelBadgeTone(level: LogLevel) {
  if (level === "error") return "warning";
  return "neutral";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { hour12: false });
}

function originLabel(origin?: AnyLog["origin"]) {
  if (origin === "backend") return "BACKEND";
  if (origin === "frontend") return "FRONTEND";
  return "UNKNOWN";
}

function originAccent(origin?: AnyLog["origin"]) {
  if (origin === "backend") return "border-rose-500/20 bg-rose-500/5";
  if (origin === "frontend") return "border-cyan-500/20 bg-cyan-500/5";
  return "border-zinc-800 bg-zinc-950/85";
}

function buildMetaSummary(meta: any) {
  if (!meta || typeof meta !== "object") return "";

  const parts: string[] = [];

  if (typeof meta.status === "number") parts.push(`status ${meta.status}`);
  if (typeof meta.url === "string") parts.push(meta.url);
  if (typeof meta.apiMessage === "string") parts.push(meta.apiMessage);

  if (typeof meta.fromLabel === "string" && typeof meta.toLabel === "string") {
    parts.push(`${meta.fromLabel} → ${meta.toLabel}`);
  } else if (typeof meta.toLabel === "string") {
    parts.push(meta.toLabel);
  }

  return parts.join(" · ");
}

function safeLevel(level: any): Extract<LogLevel, "warning" | "error"> {
  if (level === "error") return "error";
  return "warning";
}

function safeUpperStr(value: unknown, fallback = "") {
  return typeof value === "string" ? value.toUpperCase() : fallback;
}

function MetricCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: number;
  helper: string;
  accent: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/75 p-5">
      <div className={`absolute inset-x-0 top-0 h-20 bg-linear-to-r ${accent}`} />
      <div className="relative">
        <div className="text-xs uppercase tracking-widest text-zinc-500">{label}</div>
        <div className="mt-3 text-3xl font-semibold text-zinc-100">{value}</div>
        <div className="mt-2 text-sm text-zinc-400">{helper}</div>
      </div>
    </article>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function LogRow({ log }: { log: AnyLog }) {
  const level = safeLevel(log.level);
  const tone = levelBadgeTone(level);
  const origin = log.origin ?? "unknown";
  const layer = safeUpperStr(log.layer, "OTHER");
  const feature = log.feature?.trim() || null;
  const route = log.route?.trim() || null;
  const metaSummary = buildMetaSummary(log.meta);

  return (
    <div className={`rounded-3xl border p-4 ${originAccent(origin)}`}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={tone} className="shrink-0">
            {safeUpperStr(level, "WARNING")}
          </Badge>

          <Badge tone="neutral" className="shrink-0">
            {originLabel(origin)} · {layer}
          </Badge>

          {feature ? <Badge tone="neutral">{feature}</Badge> : null}
          <div className="text-xs text-zinc-500">{formatTime(log.timestamp)}</div>
          {route ? <div className="text-xs text-zinc-600">{route}</div> : null}
        </div>

        <div className="wrap-break-words font-medium text-zinc-100">{log.message}</div>

        {metaSummary ? <div className="wrap-break-words text-xs text-zinc-400">{metaSummary}</div> : null}

        {Array.isArray(log.tags) && log.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {log.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {log.meta ? (
          <details>
            <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-200">
              Ver detalles técnicos
            </summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-zinc-400">
              {JSON.stringify(log.meta, null, 2)}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}

export default function Dev() {
  return (
    <Protected allowRoles={[ROLES.DEVS]}>
      <DevPanel />
    </Protected>
  );
}

function DevPanel() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [origin, setOrigin] = useState<OriginFilter>("all");
  const [tick, setTick] = useState(0);

  const logs = useMemo(() => {
    return (getLogs() as AnyLog[]).slice().reverse();
  }, [tick]);

  useEffect(() => {
    const onLogs = () => setTick((current) => current + 1);
    window.addEventListener(LOGS_EVENT, onLogs);
    return () => window.removeEventListener(LOGS_EVENT, onLogs);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return logs.filter((log) => {
      const safe = safeLevel(log.level);
      const currentOrigin = log.origin ?? "unknown";
      const matchesLevel = level === "all" ? true : safe === level;
      const matchesOrigin = origin === "all" ? true : currentOrigin === origin;

      if (!normalized) return matchesLevel && matchesOrigin;

      const haystack = [
        log.message ?? "",
        JSON.stringify(log.meta ?? {}),
        log.origin ?? "",
        log.layer ?? "",
        log.feature ?? "",
        log.route ?? "",
        Array.isArray(log.tags) ? log.tags.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesLevel && matchesOrigin && haystack.includes(normalized);
    });
  }, [logs, query, level, origin]);

  const counts = useMemo(() => {
    let warning = 0;
    let error = 0;
    let frontendErrors = 0;
    let backendErrors = 0;

    for (const log of logs) {
      const safe = safeLevel(log.level);
      const currentOrigin = log.origin ?? "unknown";
      if (safe === "warning") warning += 1;
      if (safe === "error") {
        error += 1;
        if (currentOrigin === "frontend") frontendErrors += 1;
        if (currentOrigin === "backend") backendErrors += 1;
      }
    }

    return { warning, error, frontendErrors, backendErrors };
  }, [logs]);

  const chartData = useMemo(() => {
    const map = new Map<string, { day: string; info: number; warning: number; error: number }>();

    for (const log of logs) {
      const day = log.timestamp.slice(0, 10);
      const row = map.get(day) ?? { day, info: 0, warning: 0, error: 0 };
      const safe = safeLevel(log.level);
      row[safe] += 1;
      map.set(day, row);
    }

    return Array.from(map.values())
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-10);
  }, [logs]);

  const originCounts = useMemo(() => {
    let frontend = 0;
    let backend = 0;
    let unknown = 0;

    for (const log of logs) {
      const currentOrigin = log.origin ?? "unknown";
      if (currentOrigin === "frontend") frontend += 1;
      else if (currentOrigin === "backend") backend += 1;
      else unknown += 1;
    }

    return { frontend, backend, unknown };
  }, [logs]);

  const metricCards = [
    {
      label: "Logs",
      value: logs.length,
      helper: "Eventos registrados",
      accent: "from-cyan-500/15 via-cyan-500/5 to-transparent",
    },
    {
      label: "Errores backend",
      value: counts.backendErrors,
      helper: "Fallos de API o servidor",
      accent: "from-rose-500/15 via-rose-500/5 to-transparent",
    },
    {
      label: "Errores frontend",
      value: counts.frontendErrors,
      helper: "Fallos de UI, hooks o cliente",
      accent: "from-amber-500/15 via-amber-500/5 to-transparent",
    },
    {
      label: "Warnings",
      value: counts.warning,
      helper: "Señales a revisar",
      accent: "from-zinc-500/15 via-zinc-500/5 to-transparent",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 md:p-8">
        <div className="absolute inset-0 bg-zinc-900/20" />
        <div className="relative space-y-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Dev Panel</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Observabilidad y monitoreo del frontend.
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400 md:text-base md:leading-7">
            Ahora el panel separa con claridad errores del frontend, errores de backend y warnings para evitar falsos diagnósticos.
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-zinc-800 bg-zinc-950/75">
          <CardHeader>
            <CardTitle>Actividad de logs</CardTitle>
            <CardDescription>Últimos 10 días con foco en warnings y errores.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <LogsChart data={chartData} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/75">
          <CardHeader>
            <CardTitle>Mapa de origen</CardTitle>
            <CardDescription>Qué parte del sistema está emitiendo más señales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-3">
              <span className="text-cyan-100">Frontend</span>
              <Badge tone="neutral">{originCounts.frontend}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/5 px-3 py-3">
              <span className="text-rose-100">Backend</span>
              <Badge tone="neutral">{originCounts.backend}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3 py-3">
              <span className="text-zinc-400">Unknown</span>
              <Badge tone="neutral">{originCounts.unknown}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/75">
        <CardHeader>
          <CardTitle>Visor de eventos</CardTitle>
          <CardDescription>Filtrá, buscá y limpiá el historial almacenado.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por mensaje, feature, ruta o meta…"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600 sm:w-96"
                />

                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value as LevelFilter)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="warning">Warnings</option>
                  <option value="error">Errores</option>
                </select>

                <Button variant="secondary" onClick={() => setTick((current) => current + 1)}>
                  Refrescar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterChip active={origin === "all"} label="Todos los orígenes" onClick={() => setOrigin("all")} />
                <FilterChip active={origin === "frontend"} label="Solo frontend" onClick={() => setOrigin("frontend")} />
                <FilterChip active={origin === "backend"} label="Solo backend" onClick={() => setOrigin("backend")} />
                <FilterChip active={origin === "unknown"} label="Solo unknown" onClick={() => setOrigin("unknown")} />
              </div>
            </div>

            <Button
              variant="ghost"
              className="text-red-300 hover:text-red-200"
              onClick={() => {
                clearLogs();
                setTick((current) => current + 1);
              }}
            >
              Limpiar logs
            </Button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
            {origin === "all"
              ? "Vista general de eventos técnicos."
              : origin === "backend"
              ? "Mostrando solo respuestas y fallos que provienen del servidor o la API."
              : origin === "frontend"
              ? "Mostrando solo errores y señales generadas por UI, hooks o cliente."
              : "Mostrando eventos sin origen clasificado."}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-5 text-sm text-zinc-400">
                No hay eventos para mostrar con los filtros actuales.
              </div>
            ) : (
              filtered.slice(0, 80).map((log) => <LogRow key={log.id} log={log} />)
            )}
          </div>

          {filtered.length > 80 ? (
            <div className="text-xs text-zinc-500">Mostrando 80 de {filtered.length} resultados.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
