import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";

export default function User() {
  return (
    <Protected allowRoles={[ROLES.USER, ROLES.DEVS]}>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">👤 Mi cuenta</h1>
        <p className="text-zinc-400">
          Ver turnos, historial y editar perfil.
        </p>
      </div>
    </Protected>
  );
}
