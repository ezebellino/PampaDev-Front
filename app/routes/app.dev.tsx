import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";

export default function Dev() {
  return (
    <Protected allowRoles={[ROLES.DEV]}>
      <div className="text-lg">🧪 Dev Panel</div>
    </Protected>
  );
}
