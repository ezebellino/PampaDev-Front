import { useEffect, useMemo, useState } from "react";
import { saveTenantConfig, type TenantConfig } from "./tenantConfig";
import { mockRubros } from "../rubros/mockRubros";

const DEFAULT_CONFIG: TenantConfig = {
  enabledRubroIds: mockRubros.map((r) => r.id),
};

export function useTenantConfig() {
  const [hydrated, setHydrated] = useState(false);

  // 👇 Importante: arrancamos con un valor estable (igual en server y client)
  const [config, setConfig] = useState<TenantConfig>(DEFAULT_CONFIG);

  // 👇 Leemos localStorage SOLO en client, después de hidratar
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pampadev:tenant-config:v1");
      if (raw) {
        const parsed = JSON.parse(raw) as TenantConfig;
        if (Array.isArray(parsed.enabledRubroIds)) setConfig(parsed);
      }
    } catch {
      // si falla, dejamos DEFAULT_CONFIG
    } finally {
      setHydrated(true);
    }
  }, []);

  // 👇 Guardamos SOLO cuando ya hidrató (así no pisa el localStorage en el primer render)
  useEffect(() => {
    if (!hydrated) return;
    saveTenantConfig(config);
  }, [config, hydrated]);

  const api = useMemo(
    () => ({
      hydrated,
      config,
      setEnabledRubroIds: (enabledRubroIds: string[]) =>
        setConfig((prev) => ({ ...prev, enabledRubroIds })),
      toggleRubro: (id: string) =>
        setConfig((prev) => {
          const set = new Set(prev.enabledRubroIds);
          set.has(id) ? set.delete(id) : set.add(id);
          return { ...prev, enabledRubroIds: Array.from(set) };
        }),
      enableAll: (ids: string[]) => setConfig((prev) => ({ ...prev, enabledRubroIds: ids })),
      disableAll: () => setConfig((prev) => ({ ...prev, enabledRubroIds: [] })),
    }),
    [config, hydrated]
  );

  return api;
}
