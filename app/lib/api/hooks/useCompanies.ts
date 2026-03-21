import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "../api";
import type { Company } from "../models/company";
import { mergeCompanies, type CompanyCreateInput } from "../../companies/companyCatalogStorage";
import { createCompany, getCompanies } from "../services/companies";

export type { Company } from "../models/company";

function enrichCompany(company: Company, input: CompanyCreateInput): Company {
  return {
    ...company,
    cityName: company.cityName ?? input.cityName?.trim() ?? "",
    provinceName: company.provinceName ?? input.provinceName?.trim() ?? "",
    countryName: company.countryName ?? input.countryName?.trim() ?? "",
  };
}

export function useCompanies() {
  const [data, setData] = useState<Company[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refresh = useCallback(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    getCompanies()
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
    };
  }, []);

  useEffect(() => {
    const cleanup = refresh();
    return cleanup;
  }, [refresh]);

  const create = useCallback(async (input: CompanyCreateInput) => {
    const created = await createCompany({
      fantasyName: input.fantasyName.trim(),
      tradeName: input.tradeName.trim(),
      cuitCuilDNI: input.cuitCuilDNI.trim(),
    });

    if (created) {
      const normalized = enrichCompany(created, input);
      setData((current) => mergeCompanies(current ?? [], [normalized]));
      return normalized;
    }

    const fresh = await getCompanies();
    const merged = mergeCompanies(fresh);
    setData(merged);

    const fallback = merged.find(
      (company) =>
        company.fantasyName.trim().toLowerCase() === input.fantasyName.trim().toLowerCase() &&
        company.tradeName.trim().toLowerCase() === input.tradeName.trim().toLowerCase() &&
        company.cuitCuilDNI.trim() === input.cuitCuilDNI.trim()
    );

    if (!fallback) {
      throw new Error("La empresa se creó, pero no pudimos recuperar sus datos desde la API.");
    }

    return enrichCompany(fallback, input);
  }, []);

  return { data, loading, error, refresh, create };
}
