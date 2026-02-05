import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";

export default function Admin() {
  return (
    <Protected allowRoles={[ROLES.ADMIN, ROLES.DEV]}>
      <div className="text-lg">🛠️ Admin Panel</div>
    </Protected>
  );
}
