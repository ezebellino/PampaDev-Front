import { NavLink, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { ROLES } from "../../lib/auth/roles";
import { useUI } from "../../lib/ui/UIContext";
// "../../../public/branding/pampadev-icon.png";

function navByRole(role: string) {
  const common = [
  { to: "/app", label: "Dashboard", icon: "🏠" },
  { to: "/app/rubros", label: "Rubros", icon: "🧾" },
];


  if (role === ROLES.DEV) return [...common, { to: "/app/dev", label: "Dev Panel", icon: "🧪" }];
  if (role === ROLES.ADMIN) return [...common, { to: "/app/admin", label: "Admin", icon: "🛠️" }];
  if (role === ROLES.INSTRUCTOR) return [...common, { to: "/app/instructor", label: "Turnos", icon: "📅" }];
  return [...common, { to: "/app/user", label: "Mis Turnos", icon: "👤" }];
}

function SidebarContent({
  collapsed,
  onToggleCollapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  const items = navByRole(user?.role ?? ROLES.USER);

  return (
    <div className="flex w-full flex-col">
      <div
        className={[
          "relative h-16 border-b border-zinc-800",
          "flex items-center",
          collapsed ? "px-2" : "justify-between px-4",
        ].join(" ")}
      >
        {/* Brand */}
        <NavLink
          to="/"
          aria-label="Ir al inicio"
          className="flex items-center gap-3 focus:outline-none"
        >
          <img
            src="/branding/pampadev-icondark.png"
            alt="PampaDev"
            className={[
              "object-contain shrink-0",
              collapsed ? "h-9 w-9" : "h-8 w-8",
              "brightness-110 contrast-110",
              "drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]",
            ].join(" ")}
          />

          {/* Texto */}
          {collapsed === undefined ? (
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">PampaDev</div>
              <div className="text-xs text-zinc-400">MultiRubro</div>
            </div>
          ) : (
            !collapsed && (
              <div className="leading-tight">
                <div className="font-semibold tracking-tight">PampaDev</div>
                <div className="text-xs text-zinc-400">MultiRubro</div>
              </div>
            )
          )}
        </NavLink>


        {/* Botón colapsar: absoluto para no “pisar” el logo */}
        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className={[
              "absolute right-2 top-1/2 -translate-y-1/2",
              "rounded-lg border border-zinc-800 px-2 py-1 hover:bg-zinc-900",
            ].join(" ")}
            aria-label="Toggle sidebar"
            title="Colapsar"
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        )}
      </div>


      <nav className="p-2 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2",
                "hover:bg-zinc-900",
                isActive ? "bg-zinc-900 border border-zinc-800" : "border border-transparent",
              ].join(" ")
            }
          >
            <span className="text-lg">{it.icon}</span>
            {/* en mobile siempre mostramos label; en desktop depende collapsed */}
            {collapsed === undefined ? (
              <span className="text-sm">{it.label}</span>
            ) : (
              !collapsed && <span className="text-sm">{it.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { mobileMenuOpen, closeMobileMenu } = useUI();
  const location = useLocation();

  // Cierra el menú mobile al navegar
  useEffect(() => {
    if (mobileMenuOpen) closeMobileMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Cierra con ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMobileMenu();
    }
    if (mobileMenuOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <>
      {/* Desktop sidebar fijo */}
      <aside
        className={[
          "hidden md:flex fixed left-0 top-0 h-full z-40",
          "border-r border-zinc-800 bg-zinc-950/80 backdrop-blur",
          "transition-all",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapsed={onToggle} />
      </aside>

      {/* Mobile drawer */}
      <div className={`md:hidden ${mobileMenuOpen ? "" : "pointer-events-none"}`}>
        {/* overlay */}
        <div
          onClick={closeMobileMenu}
          className={[
            "fixed inset-0 z-40 bg-black/60 transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        {/* panel */}
        <aside
          className={[
            "fixed left-0 top-0 z-50 h-full w-72",
            "border-r border-zinc-800 bg-zinc-950/95 backdrop-blur",
            "transition-transform",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <SidebarContent onNavigate={closeMobileMenu} />
        </aside>
      </div>
    </>
  );
}
