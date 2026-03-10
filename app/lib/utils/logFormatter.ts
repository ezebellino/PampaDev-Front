import type { LogEntry, LogLayer, LogLevel, LogOrigin } from "./logger";

function isValidLevel(value: unknown): value is LogLevel {
  return value === "info" || value === "warning" || value === "error";
}

function isValidOrigin(value: unknown): value is LogOrigin {
  return value === "frontend" || value === "backend" || value === "unknown";
}

function isValidLayer(value: unknown): value is LogLayer {
  return (
    value === "ui" ||
    value === "hook" ||
    value === "service" ||
    value === "api" ||
    value === "auth" ||
    value === "storage" ||
    value === "router" ||
    value === "other"
  );
}

function safeUpper(value: unknown, fallback: string) {
  return typeof value === "string" ? value.toUpperCase() : fallback;
}

export function safeError(error: unknown) {
  try {
    if (!error) return error;
    if (error instanceof Error) {
      return { name: error.name, message: error.message, stack: error.stack };
    }
    return error;
  } catch {
    return { message: "Unserializable error" };
  }
}

export function normalizeEntry(raw: unknown): LogEntry | null {
  if (!raw || typeof raw !== "object") return null;

  const entry = raw as Partial<LogEntry>;
  const level: LogLevel = isValidLevel(entry.level) ? entry.level : "info";
  const origin: LogOrigin = isValidOrigin(entry.origin) ? entry.origin : "unknown";
  const layer: LogLayer = isValidLayer(entry.layer) ? entry.layer : "other";

  const id = typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID();
  const timestamp =
    typeof entry.timestamp === "string" && entry.timestamp
      ? entry.timestamp
      : new Date().toISOString();

  const message = typeof entry.message === "string" ? entry.message : "(no message)";

  return {
    id,
    timestamp,
    level,
    origin,
    layer,
    message,
    feature: typeof entry.feature === "string" ? entry.feature : undefined,
    route: typeof entry.route === "string" ? entry.route : undefined,
    tags: Array.isArray(entry.tags)
      ? entry.tags.filter((tag): tag is string => typeof tag === "string")
      : undefined,
    meta: entry.meta && typeof entry.meta === "object" ? entry.meta : undefined,
  };
}

export function formatConsoleLine(entry: LogEntry) {
  return `[${entry.timestamp}] [${safeUpper(entry.level, "LOG")}] [${entry.origin}/${entry.layer}] ${entry.message}`;
}
