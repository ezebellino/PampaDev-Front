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
  const { isAuthed, user } = useAuth();

  if (!isAuthed) return <Navigate to="/login" replace />;
  if (allowRoles && user && !allowRoles.includes(user.role)) return <Navigate to="/app" replace />;

  return <>{children}</>;
}
