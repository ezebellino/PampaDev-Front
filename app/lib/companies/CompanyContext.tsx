import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSelectedCompanyId, saveSelectedCompanyId, clearSelectedCompanyId } from "./companyStorage";

type CompanyCtxValue = {
  companyId: number | null;
  setCompanyId: (idCompany: number) => void;
  clearCompanyId: () => void;
};

const CompanyContext = createContext<CompanyCtxValue | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companyId, setCompanyIdState] = useState<number | null>(null);

  useEffect(() => {
    setCompanyIdState(getSelectedCompanyId());
  }, []);

  function setCompanyId(idCompany: number) {
    setCompanyIdState(idCompany);
    saveSelectedCompanyId(idCompany);
  }

  function clearCompanyId() {
    setCompanyIdState(null);
    clearSelectedCompanyId();
  }

  const value = useMemo(() => ({ companyId, setCompanyId, clearCompanyId }), [companyId]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany debe usarse dentro de CompanyProvider");
  return ctx;
}