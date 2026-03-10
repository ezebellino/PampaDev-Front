import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi } from "../api/services/auth";
import type { User } from "./authTypes";
import {
  buildUserFromLoginResponse,
  clearSession,
  getStoredSession,
  persistSession,
  refreshCurrentUser,
} from "./tokenRefresh";

export type { User } from "./authTypes";

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

  async function refreshMe() {
    const refreshedUser = await refreshCurrentUser();
    if (refreshedUser) {
      setUser(refreshedUser);
    }
  }

  useEffect(() => {
    let alive = true;

    async function bootstrapSession() {
      const stored = getStoredSession();

      if (!stored.token) {
        clearSession();
        if (!alive) return;
        setToken(null);
        setUser(null);
        setBootstrapped(true);
        return;
      }

      if (!alive) return;
      setToken(stored.token);
      if (stored.user) {
        setUser(stored.user);
      }

      try {
        const refreshedUser = await refreshCurrentUser();
        if (!alive) return;
        setUser(refreshedUser);
      } catch {
        clearSession();
        if (!alive) return;
        setToken(null);
        setUser(null);
      } finally {
        if (alive) {
          setBootstrapped(true);
        }
      }
    }

    void bootstrapSession();

    return () => {
      alive = false;
    };
  }, []);

  function updateProfile(patch: { name?: string; avatarUrl?: string }) {
    setUser((previousUser) => {
      if (!previousUser) return previousUser;

      const nextUser: User = {
        ...previousUser,
        name: patch.name ?? previousUser.name,
        avatarUrl: patch.avatarUrl ?? previousUser.avatarUrl,
      };

      if (token) {
        persistSession(token, nextUser);
      }

      return nextUser;
    });
  }

  async function loginWithApi(payload: { email: string; password: string }) {
    const response = await loginApi(payload);
    if (!response.token) {
      throw new Error("La API no devolvió token");
    }

    const quickUser = buildUserFromLoginResponse(response);
    persistSession(response.token, quickUser);
    setToken(response.token);
    setUser(quickUser);

    await refreshMe();
  }

  function logout() {
    clearSession();
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
