import { NavLink, useLocation } from "react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { ROLES } from "../../lib/auth/roles";
import { useUI } from "../../lib/ui/UIContext";

import BranchPicker from "../branches/BranchPicker";
import CompanyPicker from "~/lib/companies/CompanyPicker";

import { useBranches } from "../../lib/api/hooks/useBranches";
import { useCompany } from "../../lib/companies/CompanyContext";
import { useCompanyBranches } from "../../lib/api/hooks/useCompanyBranches";

type NavItem = { to: string; label: string; icon: string };

function navByRole(role: string, opts: { canSeeBranches: boolean }) {
  const common: NavItem[] = [
    { to: "/app", label: "Dashboard", icon: "🏠" },
    { to: "/app/rubros", label: "Rubros", icon: "🧩" },
  ];

  if (role === ROLES.DEVS) {
    return [
      ...common,
      { to: "/app/branches", label: "Sucursales", icon: "🏢" },
      { to: "/app/dev", label: "Dev Panel", icon: "🧪" },
      { to: "/app/disciplines", label: "Disciplinas", icon: "🏷️" },
    ];
  }

  if (role === ROLES.ADMIN) {
    return [
      ...common,
      ...(opts.canSeeBranches ? [{ to: "/app/branches", label: "Sucursales", icon: "🏢" }] : []),
      { to: "/app/admin", label: "Admin", icon: "🛠️" },
      // ⚠️ Disciplinas globales: por ahora lo dejamos fuera para admin
    ];
  }

  if (role === ROLES.INSTRUCTOR) {
    return [...common, { to: "/app/instructor", label: "Turnos", icon: "📅" }];
  }

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
  const role = user?.role ?? ROLES.USER;

  const { companyId } = useCompany();
  const { data: branches, loading: branchesLoading } = useBranches();

  const companyBranches = useCompanyBranches(branches, companyId);

  // ✅ Regla actual:
  // - Devs: siempre pueden ver "Sucursales"
  // - Admin: solo si su company (seleccionada) tiene >1 sucursal
  // - Otros: no
  const canSeeBranches = useMemo(() => {
    if (role === ROLES.DEVS) return true;
    if (role === ROLES.ADMIN) return !branchesLoading && companyBranches.length > 1;
    return false;
  }, [role, branchesLoading, companyBranches.length]);

  const items = useMemo(() => navByRole(role, { canSeeBranches }), [role, canSeeBranches]);

  return (
    <div className="flex w-full flex-col">
      <div
        className={[
          "relative h-16 border-b border-zinc-800",
          "flex items-center",
          collapsed ? "px-1.5" : "justify-between px-4",
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
              "h-12 w-12",
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

        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className={[
              "right-2 top-1/2 -translate-y-1/2",
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

  useEffect(() => {
    if (mobileMenuOpen) closeMobileMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
        <div
          onClick={closeMobileMenu}
          className={[
            "fixed inset-0 z-40 bg-black/60 transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <aside
          className={[
            "fixed left-0 top-0 z-50 h-full w-72",
            "border-r border-zinc-800 bg-zinc-950/95 backdrop-blur",
            "transition-transform",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {/* Header mobile del drawer */}
          <div className="p-3 border-b border-zinc-800">
            <div className="text-xs text-zinc-400 uppercase tracking-wide">Empresa activa</div>
            <CompanyPicker onPick={closeMobileMenu} hideIfSingle />

            <div className="mt-3 text-xs text-zinc-400 uppercase tracking-wide">Sucursal activa</div>
            <BranchPicker onPick={closeMobileMenu} />

            <div className="mt-2 text-[11px] text-zinc-500">
              Tip: elegí empresa → sucursal antes de configurar rubros/horarios.
            </div>
          </div>

          <SidebarContent onNavigate={closeMobileMenu} />
        </aside>
      </div>
    </>
  );
}