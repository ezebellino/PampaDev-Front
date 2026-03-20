import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../api";
import type { ApiError } from "../api";
import type { Company } from "../models/company";
import {
  createLocalCompany,
  mergeCompanies,
  type CompanyCreateInput,
} from "../../companies/companyCatalogStorage";

export type { Company } from "../models/company";

export function useCompanies() {
  const [data, setData] = useState<Company[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refresh = useCallback(() => {
    const ctrl = new AbortController();
    let alive = true;

    setLoading(true);
    setError(null);

    apiGet<Company[]>("/api/Companies", ctrl.signal)
      .then((res) => {
        if (!alive) return;
        setData(mergeCompanies(res));
      })
      .catch((e: ApiError) => {
        if (!alive) return;
        setData(null);
        setError(e);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, []);

  useEffect(() => {
    const cleanup = refresh();
    return cleanup;
  }, [refresh]);

  const create = useCallback(
    async (input: CompanyCreateInput) => {
      const existing = data ?? [];
      const newCompany = createLocalCompany(input, existing);
      setData(mergeCompanies(existing, [newCompany]));
      return newCompany;
    },
    [data]
  );

  return { data, loading, error, refresh, create };
}
