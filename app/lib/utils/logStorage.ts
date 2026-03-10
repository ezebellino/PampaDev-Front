import { normalizeEntry } from "./logFormatter";
import type { LogEntry, LogLevel } from "./logger";

const KEY_V2 = "pampadev:logs:v2";
const MAX = 400;
const PERSIST_LEVELS: LogLevel[] = ["warning", "error"];

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function shouldPersist(level: LogLevel) {
  return PERSIST_LEVELS.includes(level);
}

export function migrateLogs() {
  const existingRaw = safeParse<unknown[]>(localStorage.getItem(KEY_V2), []);
  if (!Array.isArray(existingRaw) || existingRaw.length === 0) return;

  const normalized = existingRaw.map(normalizeEntry).filter(Boolean) as LogEntry[];
  const needsMigration = normalized.length !== existingRaw.length;

  if (!needsMigration) {
    const serialized = JSON.stringify(existingRaw);
    const normalizedSerialized = JSON.stringify(normalized);
    if (serialized === normalizedSerialized) return;
  }

  localStorage.setItem(KEY_V2, JSON.stringify(normalized.slice(-MAX)));
}

export function readLogs() {
  migrateLogs();
  const raw = safeParse<unknown[]>(localStorage.getItem(KEY_V2), []);
  if (!Array.isArray(raw)) return [] as LogEntry[];
  return raw.map(normalizeEntry).filter(Boolean) as LogEntry[];
}

export function appendLog(entry: LogEntry, eventName: string) {
  if (!shouldPersist(entry.level)) return;

  const existing = readLogs();
  const next = [...existing, entry].slice(-MAX);
  localStorage.setItem(KEY_V2, JSON.stringify(next));
  window.dispatchEvent(new Event(eventName));
}

export function clearStoredLogs(eventName: string) {
  localStorage.removeItem(KEY_V2);
  window.dispatchEvent(new Event(eventName));
}
