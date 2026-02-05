import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";

export default function Instructor() {
  return (
    <Protected allowRoles={[ROLES.INSTRUCTOR, ROLES.DEV]}>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">📅 Panel Instructor</h1>
        <p className="text-zinc-400">
          Gestión de turnos, horarios disponibles y cobros.
        </p>
      </div>
    </Protected>
  );
}
