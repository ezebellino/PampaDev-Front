import { getToken } from "../auth/authStorage";

const USE_PROXY = import.meta.env.VITE_USE_PROXY === "true";

// en dev con proxy → base vacío y path empieza con /api
const BASE_URL = USE_PROXY ? "" : import.meta.env.VITE_API_URL;
console.log("API CONFIG", {
  VITE_USE_PROXY: import.meta.env.VITE_USE_PROXY,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  USE_PROXY,
  BASE_URL,
});

export type ApiError = {
  status: number;
  message: string;
  url: string;
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function buildUrl(path: string) {
  // permite pasar "/api/Branches" o "api/Branches"
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${p}`;
}

async function parseError(res: Response, url: string): Promise<ApiError> {
  const contentType = res.headers.get("content-type") || "";
  let message = res.statusText || "Request failed";

  try {
    if (contentType.includes("application/json")) {
      const data = await res.json();
      message = data?.message || JSON.stringify(data);
    } else if (contentType.includes("text/html")) {
      message = `Error ${res.status}: el servidor devolvió HTML en lugar de JSON (${url})`;
    } else {
      const text = await res.text();
      message = text || message;
    }
  } catch {
    // ignore
  }

  return { status: res.status, message, url };
}


export async function api<T>(
  path: string,
  options?: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    auth?: boolean; // por ahora no hace nada, pero podría usarse para forzar que no se envíe el token, o para lanzar un error si no hay token (producto real)
  }
): Promise<T> {
  const url = buildUrl(path);
  const method = options?.method ?? "GET";
  const auth = options?.auth ?? true;
  const token = auth ? getToken() : null;
  const res = await fetch(url, {
    method,
    signal: options?.signal,
    headers: {
      Accept: "application/json",
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) throw await parseError(res, url);

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // fallback: texto
    return (await res.text()) as unknown as T;
  }

  return (await res.json()) as T;
}


/** Helpers opcionales */
export const apiGet = <T>(path: string, signal?: AbortSignal) =>
  api<T>(path, { method: "GET", signal });

export const apiGetPublic = <T>(path: string, signal?: AbortSignal) =>
  api<T>(path, { method: "GET", signal, auth: false });

export const apiPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body });

export const apiPut = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PUT", body });

export const apiPatch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PATCH", body });

export const apiDelete = <T>(path: string) =>
  api<T>(path, { method: "DELETE" });
