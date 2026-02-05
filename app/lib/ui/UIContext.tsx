import React, { createContext, useContext, useMemo, useState } from "react";

type UIValue = {
  mobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
};

const UIContext = createContext<UIValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const value = useMemo(
    () => ({
      mobileMenuOpen,
      openMobileMenu: () => setMobileMenuOpen(true),
      closeMobileMenu: () => setMobileMenuOpen(false),
      toggleMobileMenu: () => setMobileMenuOpen((v) => !v),
    }),
    [mobileMenuOpen]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI debe usarse dentro de UIProvider");
  return ctx;
}
