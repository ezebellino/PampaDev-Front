import AppLayout from "../components/layout/AppLayout";
import Protected from "../lib/auth/Protected";

export default function AppRouteLayout() {
  return (
    <Protected>
      <AppLayout />
    </Protected>
  );
}
