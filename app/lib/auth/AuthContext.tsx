import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi } from "../api/services/auth";
import { saveToken, getToken, clearToken, saveUser, getSavedUser, clearUser } from "./authStorage";
import { getRoleFromJwt } from "./jwt";
import { ROLES, type Role } from "./roles";
import { getMe } from "../api/services/users";

export type User = {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatarUrl?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthed: boolean;
  bootstrapped: boolean;
  updateProfile: (patch: { name?: string; avatarUrl?: string }) => void;
  loginWithApi: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  function normalizeRole(apiRole: string): Role {
    const r = (apiRole || "").trim().toLowerCase();
    if (r === "dev" || r === "devs" || r === "developer") return ROLES.DEVS;
    if (r === "admin" || r === "admins") return ROLES.ADMIN;
    if (r === "instructor" || r === "instructors") return ROLES.INSTRUCTOR;
    return ROLES.USER;
  }

  async function refreshMe() {
    const t = getToken();
    if (!t) return;

    const me = await getMe();

    const u: User = {
      id: String(me.idUser),
      name: `${me.firstName} ${me.lastname}`.trim(),
      role: normalizeRole(me.roleName),
      email: me.email,
    };

    saveUser(u);
    setUser(u);
  }

  // ✅ Bootstrap correcto: si no hay token, no hay sesión.
  useEffect(() => {
    const t = getToken();

    if (!t) {
      // Sin token => forzamos estado “logged out”
      clearUser();
      setToken(null);
      setUser(null);
      setBootstrapped(true);
      return;
    }

    // Hay token => podemos restaurar user (opcional) y luego refrescar /me
    setToken(t);

    const savedUser = getSavedUser<User>();
    if (savedUser) setUser(savedUser);

    refreshMe()
      .catch(() => {
        clearToken();
        clearUser();
        setToken(null);
        setUser(null);
      })
      .finally(() => setBootstrapped(true));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateProfile(patch: { name?: string; avatarUrl?: string }) {
    setUser((prev) => {
      if (!prev) return prev;
      const next: User = {
        ...prev,
        name: patch.name ?? prev.name,
        avatarUrl: patch.avatarUrl ?? prev.avatarUrl,
      };
      saveUser(next);
      return next;
    });
  }

  async function loginWithApi(payload: { email: string; password: string }) {
    const res = await loginApi(payload);
    if (!res.token) throw new Error("La API no devolvió token");

    saveToken(res.token);
    setToken(res.token);

    // set “rápido” para UI inmediata
    const u: User = {
      id: res.email,
      name: `${res.firstName} ${res.lastname}`.trim(),
      role: normalizeRole(getRoleFromJwt(res.token) ?? ""),
      email: res.email,
    };

    saveUser(u);
    setUser(u);

    // luego /me lo deja 100% consistente
    await refreshMe();
  }

  function logout() {
    clearToken();
    clearUser();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthed: !!token,
      bootstrapped,
      updateProfile,
      loginWithApi,
      logout,
      refreshMe,
    }),
    [user, token, bootstrapped]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}