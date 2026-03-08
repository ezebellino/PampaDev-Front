import { useMemo } from "react";
import type { WeeklyAvailability, Weekday, TimeRange } from "../../lib/api/services/availability";

type Props = {
  value: WeeklyAvailability;
  onChange: (next: WeeklyAvailability) => void;
};

// Weekday = 0..6 (según tu backend)
const WEEKDAYS = [
  { key: 0 as Weekday, label: "Lunes" },
  { key: 1 as Weekday, label: "Martes" },
  { key: 2 as Weekday, label: "Miércoles" },
  { key: 3 as Weekday, label: "Jueves" },
  { key: 4 as Weekday, label: "Viernes" },
  { key: 5 as Weekday, label: "Sábado" },
  { key: 6 as Weekday, label: "Domingo" },
] as const;

function padTime(t: string) {
  // admite "9:00" => "09:00"
  if (typeof t !== "string") return "";
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return t;
  const hh = String(m[1]).padStart(2, "0");
  return `${hh}:${m[2]}`;
}

function toMin(t: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(padTime(t));
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

function normalizeRanges(ranges: TimeRange[]) {
  return (ranges ?? [])
    .map((r) => ({ start: padTime(r.start), end: padTime(r.end) }))
    .sort((a, b) => toMin(a.start) - toMin(b.start));
}

function validateRanges(ranges: TimeRange[]) {
  const sorted = normalizeRanges(ranges);

  for (const r of sorted) {
    const a = toMin(r.start);
    const b = toMin(r.end);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return { ok: false as const, message: "Formato de hora inválido." };
    }
    if (a >= b) {
      return { ok: false as const, message: "El inicio debe ser menor al fin." };
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (toMin(cur.start) < toMin(prev.end)) {
      return { ok: false as const, message: "Hay rangos que se solapan." };
    }
  }

  return { ok: true as const, message: "" };
}

export default function AvailabilityEditor({ value, onChange }: Props) {
  // Aseguramos que existan los 7 días (por si backend manda incompleto)
  const safeDays = useMemo(() => {
    const next: WeeklyAvailability["days"] = { ...value.days };
    for (const d of WEEKDAYS) {
      next[d.key] = normalizeRanges(next[d.key] ?? []);
    }
    return next;
  }, [value.days]);

  function setDayRanges(day: Weekday, ranges: TimeRange[]) {
    onChange({
      ...value,
      days: {
        ...value.days,
        [day]: normalizeRanges(ranges),
      },
    });
  }

  function toggleClosed(day: Weekday, closed: boolean) {
    if (closed) setDayRanges(day, []);
    else setDayRanges(day, [{ start: "09:00", end: "18:00" }]);
  }

  function addRange(day: Weekday) {
    const current = safeDays[day] ?? [];
    const last = current[current.length - 1];
    const start = last ? last.end : "09:00";

    const startMin = toMin(padTime(start));
    const endMin = Number.isFinite(startMin)
      ? Math.min(startMin + 60, 23 * 60 + 59)
      : 18 * 60;

    const hh = String(Math.floor(endMin / 60)).padStart(2, "0");
    const mm = String(endMin % 60).padStart(2, "0");

    setDayRanges(day, [...current, { start: padTime(start), end: `${hh}:${mm}` }]);
  }

  function removeRange(day: Weekday, idx: number) {
    const current = safeDays[day] ?? [];
    setDayRanges(day, current.filter((_, i) => i !== idx));
  }

  function updateRange(day: Weekday, idx: number, patch: Partial<TimeRange>) {
    const current = safeDays[day] ?? [];
    const next = current.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setDayRanges(day, next);
  }

  function copyDayToAll(fromDay: Weekday) {
    const fromRanges = safeDays[fromDay] ?? [];
    const nextDays: WeeklyAvailability["days"] = { ...value.days };

    for (const d of WEEKDAYS) {
      nextDays[d.key] = normalizeRanges(fromRanges);
    }
    onChange({ ...value, days: nextDays });
  }

  function clearAll() {
    const nextDays: WeeklyAvailability["days"] = { ...value.days };
    for (const d of WEEKDAYS) nextDays[d.key] = [];
    onChange({ ...value, days: nextDays });
  }

  return (
    <div className="space-y-4">
      {/* Acciones globales */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-zinc-300">
          Zona horaria:{" "}
          <span className="text-zinc-100 font-medium">{value.timezone}</span>
        </div>

        <button
          type="button"
          onClick={clearAll}
          className="rounded-xl border border-zinc-800 px-3 py-2 text-sm text-red-200 hover:bg-zinc-900"
        >
          Vaciar semana
        </button>
      </div>

      {/* Días */}
      <div className="grid gap-3">
        {WEEKDAYS.map(({ key, label }) => {
          const ranges = safeDays[key] ?? [];
          const closed = ranges.length === 0;
          const v = validateRanges(ranges);

          return (
            <div key={key} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{label}</div>

                  <label className="flex items-center gap-2 text-xs text-zinc-400 select-none">
                    <input
                      type="checkbox"
                      checked={closed}
                      onChange={(e) => toggleClosed(key, e.target.checked)}
                    />
                    Cerrado
                  </label>

                  {!v.ok ? (
                    <span className="text-xs text-red-300">⚠ {v.message}</span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addRange(key)}
                    disabled={closed}
                    className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900 disabled:opacity-50"
                  >
                    + Agregar rango
                  </button>

                  <button
                    type="button"
                    onClick={() => copyDayToAll(key)}
                    className="rounded-xl border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900"
                    title="Copia los rangos de este día a toda la semana"
                  >
                    Copiar a toda la semana
                  </button>
                </div>
              </div>

              {!closed ? (
                <div className="mt-4 space-y-2">
                  {ranges.map((r, idx) => (
                    <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={padTime(r.start)}
                          onChange={(e) => updateRange(key, idx, { start: e.target.value })}
                          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                        />
                        <span className="text-zinc-500">→</span>
                        <input
                          type="time"
                          value={padTime(r.end)}
                          onChange={(e) => updateRange(key, idx, { end: e.target.value })}
                          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeRange(key, idx)}
                        className="sm:ml-auto rounded-xl border border-zinc-800 px-3 py-2 text-sm text-red-200 hover:bg-zinc-900"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-zinc-500">Sin disponibilidad.</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}