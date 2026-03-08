// app/routes/app.dev.tsx
import { useMemo, useState, useEffect } from "react";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { clearLogs, getLogs, type LogEntry, type LogLevel, LOGS_EVENT } from "../lib/utils/logger";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import LogsChart from "../components/dev/LogChart";

// ✅ filtro del panel (Decision A): solo warning/error + all
type LevelFilter = "all" | "warning" | "error";

type AnyLog = LogEntry & {
  // compat con logs viejos (si no existen, caemos a defaults)
  origin?: "frontend" | "backend" | "unknown";
  layer?: string;
  feature?: string;
  route?: string;
  tags?: string[];
};

function levelBadgeTone(level: LogLevel) {
  if (level === "error") return "warning";
  if (level === "warning") return "neutral";
  return "neutral";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", { hour12: false });
}

function originLabel(origin?: AnyLog["origin"]) {
  if (origin === "backend") return "BACKEND";
  if (origin === "frontend") return "FRONTEND";
  return "UNKNOWN";
}

// arma un resumen “humano” sin spamear JSON
function buildMetaSummary(meta: any) {
  if (!meta || typeof meta !== "object") return "";

  const parts: string[] = [];

  if (typeof meta.status === "number") parts.push(`status ${meta.status}`);
  if (typeof meta.url === "string") parts.push(meta.url);
  if (typeof meta.apiMessage === "string") parts.push(meta.apiMessage);

  // branch logs (BranchPicker)
  if (typeof meta.fromLabel === "string" && typeof meta.toLabel === "string") {
    parts.push(`${meta.fromLabel} → ${meta.toLabel}`);
  } else if (typeof meta.toLabel === "string") {
    parts.push(meta.toLabel);
  }

  return parts.join(" · ");
}

/**
 * Decision A:
 * - En la UI solo mostramos WARNING/ERROR.
 * - Si viene level viejo / inválido, lo tratamos como WARNING para que se vea y no rompa.
 */
function safeLevel(level: any): Extract<LogLevel, "warning" | "error"> {
  if (level === "error") return "error";
  return "warning";
}

function safeUpperStr(v: any, fallback = "") {
  return typeof v === "string" ? v.toUpperCase() : fallback;
}

function LogRow({ l }: { l: AnyLog }) {
  const lvl = safeLevel(l.level);
  const tone = levelBadgeTone(lvl);

  const origin = l.origin ?? "unknown";
  const layer = safeUpperStr(l.layer, "OTHER");
  const feature = l.feature?.trim() || null;
  const route = l.route?.trim() || null;

  const metaSummary = buildMetaSummary(l.meta);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={tone} className="shrink-0">
              {safeUpperStr(lvl, "WARNING")}
            </Badge>

            <Badge tone="neutral" className="shrink-0">
              {originLabel(origin)} · {layer}
            </Badge>

            {feature ? (
              <Badge tone="neutral" className="shrink-0">
                {feature}
              </Badge>
            ) : null}

            <div className="text-xs text-zinc-500">{formatTime(l.timestamp)}</div>

            {route ? <div className="text-xs text-zinc-600">{route}</div> : null}
          </div>

          <div className="font-medium wrap-break-words">{l.message}</div>

          {metaSummary ? (
            <div className="text-xs text-zinc-400 wrap-break-words">{metaSummary}</div>
          ) : null}

          {Array.isArray(l.tags) && l.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {l.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          ) : null}

          {l.meta ? (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-200">
                Ver detalles técnicos
              </summary>
              <pre className="mt-2 text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(l.meta, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>
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
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [tick, setTick] = useState(0); // para “refrescar”

  const logs = useMemo(() => {
    const all = (getLogs() as AnyLog[]).slice().reverse(); // más nuevo primero
    return all;
  }, [tick]);

  // ✅ actualiza automáticamente cuando se loguea algo
  useEffect(() => {
    const onLogs = () => setTick((t) => t + 1);
    window.addEventListener(LOGS_EVENT, onLogs);
    return () => window.removeEventListener(LOGS_EVENT, onLogs);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return logs.filter((l) => {
      const lvl = safeLevel(l.level);
      const matchesLevel = level === "all" ? true : lvl === level;

      if (!s) return matchesLevel;

      const haystack =
        (l.message ?? "") +
        " " +
        JSON.stringify(l.meta ?? {}) +
        " " +
        (l.origin ?? "") +
        " " +
        (l.layer ?? "") +
        " " +
        (l.feature ?? "") +
        " " +
        (l.route ?? "") +
        " " +
        (Array.isArray(l.tags) ? l.tags.join(" ") : "");

      return matchesLevel && haystack.toLowerCase().includes(s);
    });
  }, [logs, q, level]);

  const counts = useMemo(() => {
    let warning = 0,
      error = 0;
    for (const l of logs) {
      const lvl = safeLevel(l.level);
      if (lvl === "warning") warning++;
      if (lvl === "error") error++;
    }
    return { warning, error };
  }, [logs]);

  const chartData = useMemo(() => {
    const map = new Map<string, { day: string; info: number; warning: number; error: number }>();
    for (const l of logs) {
      const day = l.timestamp.slice(0, 10);
      const row = map.get(day) ?? { day, info: 0, warning: 0, error: 0 };
      const lvl = safeLevel(l.level);
      row[lvl]++; // lvl solo warning/error
      map.set(day, row);
    }
    return Array.from(map.values())
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-10);
  }, [logs]);

  const originCounts = useMemo(() => {
    let frontend = 0,
      backend = 0,
      unknown = 0;
    for (const l of logs) {
      const o = (l as AnyLog).origin ?? "unknown";
      if (o === "frontend") frontend++;
      else if (o === "backend") backend++;
      else unknown++;
    }
    return { frontend, backend, unknown };
  }, [logs]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">🧪 Dev Panel</h1>
        <p className="text-sm text-zinc-400">Visor de logs + métricas (localStorage).</p>
      </header>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
            <CardDescription>Total registrados</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{logs.length}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errores</CardTitle>
            <CardDescription>Eventos críticos</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.error}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Origen</CardTitle>
            <CardDescription>Frontend / Backend</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Frontend</span>
              <Badge tone="neutral">{originCounts.frontend}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Backend</span>
              <Badge tone="neutral">{originCounts.backend}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Unknown</span>
              <Badge tone="neutral">{originCounts.unknown}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad de logs</CardTitle>
          <CardDescription>Últimos 10 días (warning / error)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <LogsChart data={chartData} />
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Visor</CardTitle>
          <CardDescription>Filtrá, buscá y limpiá logs</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar: mensaje, meta, origin, layer, feature…"
                className="w-full sm:w-96 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as LevelFilter)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              >
                <option value="all">Todos</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>

              <Button variant="secondary" onClick={() => setTick((t) => t + 1)}>
                Refrescar
              </Button>
            </div>

            <Button
              variant="ghost"
              className="text-red-300 hover:text-red-200"
              onClick={() => {
                clearLogs();
                setTick((t) => t + 1);
              }}
            >
              Limpiar logs
            </Button>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-sm text-zinc-400">No hay logs para mostrar.</div>
            ) : (
              filtered.slice(0, 80).map((l) => <LogRow key={l.id} l={l} />)
            )}
          </div>

          {filtered.length > 80 && (
            <div className="text-xs text-zinc-500">Mostrando 80 de {filtered.length} resultados.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}