import { useEffect, useState } from "react";
import { apiGet } from "../api";
import type { ApiError } from "../api";

export type Company = {
  idCompany: number;
  fantasyName: string;
  tradeName: string;
  cuitCuilDNI: string;
  createdAt: string; // ISO
};

export function useCompanies() {
  const [data, setData] = useState<Company[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let alive = true;

    setLoading(true);
    setError(null);

    apiGet<Company[]>("/api/Companies", ctrl.signal)
      .then((res) => {
        if (!alive) return;
        setData(res);
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

  return { data, loading, error };
}