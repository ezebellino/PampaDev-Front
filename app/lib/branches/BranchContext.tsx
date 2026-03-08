// app/lib/branches/BranchContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSelectedBranchId, setSelectedBranchId, clearSelectedBranchId } from "./branchStorage";

type BranchCtxValue = {
  branchId: number | null;
  setBranchId: (idBranch: number) => void;
  clearBranchId: () => void;
  setBranchIfValid: (validBranchIds: number[]) => void;
};

const BranchContext = createContext<BranchCtxValue | null>(null);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branchId, setBranchIdState] = useState<number | null>(null);

  useEffect(() => {
    setBranchIdState(getSelectedBranchId());
  }, []);

  function setBranchId(idBranch: number) {
    setBranchIdState(idBranch);
    setSelectedBranchId(idBranch);
  }

  function clearBranchId() {
    setBranchIdState(null);
    clearSelectedBranchId();
  }

  function setBranchIfValid(validBranchIds: number[]) {
    if (!Array.isArray(validBranchIds) || validBranchIds.length === 0) {
      clearBranchId();
      return;
    }

    // si el actual es válido, no tocamos
    if (branchId != null && validBranchIds.includes(branchId)) return;

    // si no, elegimos el primero válido
    setBranchId(validBranchIds[0]);
  }

  const value = useMemo(
    () => ({ branchId, setBranchId, clearBranchId, setBranchIfValid }),
    [branchId]
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch debe usarse dentro de BranchProvider");
  return ctx;
}