import AppLayout from "../components/layout/AppLayout";
import { AuthProvider } from "../lib/auth/AuthContext";
import { UIProvider } from "../lib/ui/UIContext";

export default function AppRouteLayout() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppLayout />
      </UIProvider>
    </AuthProvider>
  );
}
