import React, { createContext, useContext, useMemo, useState } from "react";
import type { Role } from "./roles";
import { ROLES } from "./roles";

type User = { name: string; role: Role; coins: number };
type AuthValue = {
  user: User | null;
  isAuthed: boolean;
  loginAs: (role: Role) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    name: "Zeqe",
    role: ROLES.ADMIN,
    coins: 120,
  });

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAuthed: !!user,
      loginAs: (role) => setUser((prev) => (prev ? { ...prev, role } : { name: "Zeqe", role, coins: 120 })),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
