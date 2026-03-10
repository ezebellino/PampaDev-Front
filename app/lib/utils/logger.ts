import { formatConsoleLine, normalizeEntry, safeError } from "./logFormatter";
import { appendLog, clearStoredLogs, migrateLogs, readLogs } from "./logStorage";

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
  timestamp: string;
  level: LogLevel;
  origin: LogOrigin;
  layer: LogLayer;
  feature?: string;
  route?: string;
  message: string;
  tags?: string[];
  meta?: Record<string, any>;
};

export type LogInput = Omit<LogEntry, "id" | "timestamp">;

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

export function logApiError(message: string, error: any, ctx?: Partial<LogInput>) {
  const status =
    typeof error?.status === "number"
      ? error.status
      : typeof error?.response?.status === "number"
      ? error.response.status
      : undefined;

  const url =
    typeof error?.url === "string"
      ? error.url
      : typeof error?.config?.url === "string"
      ? error.config.url
      : undefined;

  const apiMessage =
    typeof error?.message === "string"
      ? error.message
      : typeof error?.response?.data === "string"
      ? error.response.data
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
      raw: safeError(error),
    },
  });
}

export function logSystem(input: LogInput) {
  migrateLogs();

  const normalized = normalizeEntry({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...input,
  });

  if (!normalized) return;

  const loggerFn =
    normalized.level === "error"
      ? console.error
      : normalized.level === "warning"
      ? console.warn
      : console.log;

  loggerFn(formatConsoleLine(normalized), normalized.meta ?? "");
  appendLog(normalized, LOGS_EVENT);
}

export function getLogs() {
  return readLogs();
}

export function clearLogs() {
  clearStoredLogs(LOGS_EVENT);
}
