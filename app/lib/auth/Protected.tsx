import React from "react";
import { Navigate } from "react-router";
import ScreenLoader from "../../components/ui/ScreenLoader";
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

  if (!bootstrapped) {
    return <ScreenLoader title="Recuperando tu sesion" subtitle="Estamos validando tu acceso y cargando tu contexto." />;
  }

  if (!isAuthed) return <Navigate to="/login" replace />;

  if (allowRoles && !user) {
    return <ScreenLoader title="Cargando permisos" subtitle="Estamos confirmando el rol y los accesos disponibles." />;
  }

  if (allowRoles && user && !allowRoles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}