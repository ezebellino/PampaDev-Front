// app/lib/utils/logger.ts
export const LOGS_EVENT = "pampadev:logs:changed";

export type LogLevel = "info" | "warning" | "error";
export type LogOrigin = "frontend" | "backend" | "unknown";
export type LogLayer =
  | "ui"
  | "hook"
  | "service"
  | "api"
  | "auth"
  | "storage"
  | "router"
  | "other";

export type LogEntry = {
  id: string;
  timestamp: string; // ISO
  level: LogLevel;

  origin: LogOrigin;
  layer: LogLayer;
  feature?: string;
  route?: string;

  message: string;

  tags?: string[];
  meta?: Record<string, any>;
};

const KEY_V2 = "pampadev:logs:v2";
const MAX = 400;

// ✅ Decisión A: persistimos solo warning/error
const PERSIST_LEVELS: LogLevel[] = ["warning", "error"];

type LogInput = Omit<LogEntry, "id" | "timestamp">;

// ------------------------
// Helpers de seguridad
// ------------------------
function isValidLevel(v: any): v is LogLevel {
  return v === "info" || v === "warning" || v === "error";
}
function isValidOrigin(v: any): v is LogOrigin {
  return v === "frontend" || v === "backend" || v === "unknown";
}
function isValidLayer(v: any): v is LogLayer {
  return (
    v === "ui" ||
    v === "hook" ||
    v === "service" ||
    v === "api" ||
    v === "auth" ||
    v === "storage" ||
    v === "router" ||
    v === "other"
  );
}

function safeUpper(v: any, fallback: string) {
  return typeof v === "string" ? v.toUpperCase() : fallback;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeError(err: any) {
  try {
    if (!err) return err;
    if (err instanceof Error) {
      return { name: err.name, message: err.message, stack: err.stack };
    }
    return err;
  } catch {
    return { message: "Unserializable error" };
  }
}

// ------------------------
// Normalización / migración
// ------------------------
function normalizeEntry(raw: any): LogEntry | null {
  if (!raw || typeof raw !== "object") return null;

  const level: LogLevel = isValidLevel(raw.level) ? raw.level : "info";
  const origin: LogOrigin = isValidOrigin(raw.origin) ? raw.origin : "unknown";
  const layer: LogLayer = isValidLayer(raw.layer) ? raw.layer : "other";

  const id = typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID();
  const timestamp =
    typeof raw.timestamp === "string" && raw.timestamp
      ? raw.timestamp
      : new Date().toISOString();

  const message = typeof raw.message === "string" ? raw.message : "(no message)";

  return {
    id,
    timestamp,
    level,
    origin,
    layer,
    message,
    feature: typeof raw.feature === "string" ? raw.feature : undefined,
    route: typeof raw.route === "string" ? raw.route : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t: any) => typeof t === "string") : undefined,
    meta: raw.meta && typeof raw.meta === "object" ? raw.meta : undefined,
  };
}

function migrateIfNeeded() {
  const existingRaw = safeParse<any[]>(localStorage.getItem(KEY_V2), []);
  if (!Array.isArray(existingRaw) || existingRaw.length === 0) return;

  const needs = existingRaw.some(
    (x) => !x || !isValidLevel(x.level) || !isValidOrigin(x.origin) || !isValidLayer(x.layer)
  );
  if (!needs) return;

  const normalized = existingRaw.map(normalizeEntry).filter(Boolean) as LogEntry[];
  localStorage.setItem(KEY_V2, JSON.stringify(normalized.slice(-MAX)));
}

// ------------------------
// API pública
// ------------------------
export function logInfo(message: string, meta?: Record<string, any>, ctx?: Partial<LogInput>) {
  logSystem({
    ...(ctx ?? {}),
    level: "info",
    origin: "frontend",
    layer: "ui",
    message,
    meta,
  });
}

export function logWarn(message: string, meta?: Record<string, any>, ctx?: Partial<LogInput>) {
  logSystem({
    ...(ctx ?? {}),
    level: "warning",
    origin: "frontend",
    layer: "ui",
    message,
    meta,
  });
}

export function logError(message: string, meta?: Record<string, any>, ctx?: Partial<LogInput>) {
  logSystem({
    ...(ctx ?? {}),
    level: "error",
    origin: "frontend",
    layer: "ui",
    message,
    meta,
  });
}

export function logApiError(message: string, err: any, ctx?: Partial<LogInput>) {
  const status =
    typeof err?.status === "number"
      ? err.status
      : typeof err?.response?.status === "number"
      ? err.response.status
      : undefined;

  const url =
    typeof err?.url === "string"
      ? err.url
      : typeof err?.config?.url === "string"
      ? err.config.url
      : undefined;

  const apiMessage =
    typeof err?.message === "string"
      ? err.message
      : typeof err?.response?.data === "string"
      ? err.response.data
      : undefined;

  logSystem({
    ...(ctx ?? {}),
    level: "error",
    origin: "backend",
    layer: "api",
    message,
    meta: {
      status,
      url,
      apiMessage,
      raw: safeError(err),
    },
  });
}

export function logSystem(input: LogInput) {
  migrateIfNeeded();

  const normalized = normalizeEntry({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...input,
  });

  if (!normalized) return;

  // ✅ Consola siempre
  const fn =
    normalized.level === "error"
      ? console.error
      : normalized.level === "warning"
      ? console.warn
      : console.log;

  fn(
    `[${normalized.timestamp}] [${safeUpper(normalized.level, "LOG")}] [${normalized.origin}/${normalized.layer}] ${normalized.message}`,
    normalized.meta ?? ""
  );

  // ✅ Persistimos SOLO warning/error
  if (!PERSIST_LEVELS.includes(normalized.level)) return;

  const existing: LogEntry[] = safeParse(localStorage.getItem(KEY_V2), []);
  const next = [...existing, normalized].slice(-MAX);
  localStorage.setItem(KEY_V2, JSON.stringify(next));

  window.dispatchEvent(new Event(LOGS_EVENT));
}

export function getLogs(): LogEntry[] {
  migrateIfNeeded();
  const raw = safeParse<any[]>(localStorage.getItem(KEY_V2), []);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeEntry).filter(Boolean) as LogEntry[];
}

export function clearLogs() {
  localStorage.removeItem(KEY_V2);
  window.dispatchEvent(new Event(LOGS_EVENT));
}