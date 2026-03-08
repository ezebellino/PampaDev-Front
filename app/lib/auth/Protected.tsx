import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";
import type { Role } from "./roles";

export default function Protected({
  allowRoles,
  children,
}: {
  allowRoles?: Role[];
  children: React.ReactNode;
}) {
  const { isAuthed, user, bootstrapped } = useAuth();

  // Evita mismatch SSR / warning de StaticRouter
  if (!bootstrapped) return null;

  // Sin token => fuera
  if (!isAuthed) return <Navigate to="/login" replace />;

  // Con token pero user todavía no cargó (/me) => esperamos (o podrías renderizar loader)
  if (allowRoles && !user) return null;

  // Role guard
  if (allowRoles && user && !allowRoles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}