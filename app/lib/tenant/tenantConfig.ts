import { mockRubros } from "../rubros/mockRubros";

export type TenantConfig = {
  enabledRubroIds: string[];
};

const KEY = "pampadev:tenant-config:v1";

// default: habilitamos todos para que no quede vacío al inicio
const DEFAULT_CONFIG: TenantConfig = {
  enabledRubroIds: mockRubros.map(r => r.id),
};

export function loadTenantConfig(): TenantConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as TenantConfig;
    if (!Array.isArray(parsed.enabledRubroIds)) return DEFAULT_CONFIG;
    return parsed;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveTenantConfig(cfg: TenantConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}
