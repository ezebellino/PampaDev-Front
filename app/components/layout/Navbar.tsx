import { useAuth } from "../../lib/auth/AuthContext";
import { ROLES } from "../../lib/auth/roles";
import { useUI } from "../../lib/ui/UIContext";

export default function Navbar() {
  const { user, loginAs } = useAuth();
  const { toggleMobileMenu } = useUI();

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-16 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
      <div className="h-full flex items-center justify-between px-4 md:px-8">

        {/* Mobile: botón menú + marca */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="rounded-xl border border-zinc-800 px-3 py-2 hover:bg-zinc-900"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <img src="/branding/pampadev-icon.png" alt="PampaDev" className="h-7 w-7" />
        </div>

        {/* Desktop: dejamos espacio a la izquierda */}
        <div className="hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="text-sm text-zinc-300 hidden sm:block">
            {user?.name} · <span className="text-zinc-400">{user?.role}</span>
          </div>

          <div className="rounded-xl border border-zinc-800 px-3 py-1 text-sm">
            🪙 {user?.coins ?? 0}
          </div>

          <select
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1 text-sm"
            value={user?.role}
            onChange={(e) => loginAs(e.target.value as any)}
            title="Cambiar rol (mock)"
          >
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
