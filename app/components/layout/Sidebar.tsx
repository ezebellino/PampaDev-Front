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

type NavItem = { to: string; label: string; icon: string; hint?: string };

function navByRole(role: string, opts: { canSeeBranches: boolean }) {
  const common: NavItem[] = [
    { to: "/app", label: "Dashboard", icon: "⌂", hint: "Resumen general" },
    { to: "/app/rubros", label: "Rubros", icon: "◫", hint: "Catálogo activo" },
  ];

  if (role === ROLES.DEVS) {
    return [
      ...common,
      { to: "/app/branches", label: "Sucursales", icon: "⌘", hint: "Contexto operativo" },
      { to: "/app/dev", label: "Dev Panel", icon: "◈", hint: "Logs y monitoreo" },
      { to: "/app/disciplines", label: "Disciplinas", icon: "◌", hint: "Catálogo global" },
    ];
  }

  if (role === ROLES.ADMIN) {
    return [
      ...common,
      ...(opts.canSeeBranches
        ? [{ to: "/app/branches", label: "Sucursales", icon: "⌘", hint: "Sedes disponibles" }]
        : []),
      { to: "/app/admin", label: "Admin", icon: "▣", hint: "Operación y solicitudes" },
    ];
  }

  if (role === ROLES.INSTRUCTOR) {
    return [...common, { to: "/app/instructor", label: "Instructor", icon: "◍", hint: "Panel de trabajo" }];
  }

  return [
    ...common,
    { to: "/app/memberships", label: "Membresías", icon: "◉", hint: "Planes y clases" },
    { to: "/app/user", label: "Mi cuenta", icon: "○", hint: "Perfil y accesos" },
  ];
}

function BrandBlock({ collapsed }: { collapsed?: boolean }) {
  return (
    <NavLink to="/" aria-label="Ir al inicio" className="flex items-center gap-3 focus:outline-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/15 bg-zinc-900/80 shadow-[0_0_0_1px_rgba(6,182,212,0.04)]">
        <img
          src="/branding/pampadev-icondark.png"
          alt="PampaDev"
          className="h-8 w-8 object-contain brightness-110 contrast-110"
        />
      </div>

      {collapsed === undefined || !collapsed ? (
        <div className="leading-tight">
          <div className="font-semibold tracking-tight text-zinc-100">PampaDev</div>
          <div className="text-xs text-cyan-200/65">MultiRubro Platform</div>
        </div>
      ) : null}
    </NavLink>
  );
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

  const canSeeBranches = useMemo(() => {
    if (role === ROLES.DEVS) return true;
    if (role === ROLES.ADMIN) return !branchesLoading && companyBranches.length > 1;
    return false;
  }, [role, branchesLoading, companyBranches.length]);

  const items = useMemo(() => navByRole(role, { canSeeBranches }), [role, canSeeBranches]);

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={[
          "flex h-20 items-center border-b border-zinc-800/80",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        ].join(" ")}
      >
        <BrandBlock collapsed={collapsed} />

        {onToggleCollapsed ? (
          <button
            onClick={onToggleCollapsed}
            className="rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-cyan-500/35 hover:bg-zinc-900 hover:text-zinc-100"
            aria-label="Alternar sidebar"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? ">" : "<"}
          </button>
        ) : null}
      </div>

      <div className="px-3 pt-4">
        {collapsed ? null : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Rol activo</div>
            <div className="mt-2 text-sm font-medium text-cyan-100">{role}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition",
                collapsed ? "justify-center" : "",
                isActive
                  ? "border-cyan-500/35 bg-cyan-400/10 text-cyan-50"
                  : "border-transparent text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100",
              ].join(" ")
            }
            title={collapsed ? it.label : undefined}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-current/15 bg-black/10 text-base">
              {it.icon}
            </span>

            {collapsed === undefined || !collapsed ? (
              <span className="min-w-0">
                <span className="block text-sm font-medium">{it.label}</span>
                {it.hint ? <span className="block text-xs opacity-70">{it.hint}</span> : null}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      {collapsed ? null : (
        <div className="border-t border-zinc-800/80 px-4 py-4 text-xs leading-5 text-zinc-500">
          Elegí empresa y sucursal antes de avanzar con configuración, rubros u operación diaria.
        </div>
      )}
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
  }, [location.pathname, mobileMenuOpen, closeMobileMenu]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMobileMenu();
    }
    if (mobileMenuOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <>
      <aside
        className={[
          "fixed left-0 top-0 z-40 hidden h-full border-r border-zinc-800 bg-zinc-950/85 backdrop-blur md:flex",
          "transition-all duration-200",
          collapsed ? "w-24" : "w-72",
        ].join(" ")}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapsed={onToggle} />
      </aside>

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
            "fixed left-0 top-0 z-50 h-full w-80 border-r border-zinc-800 bg-zinc-950/95 backdrop-blur",
            "transition-transform duration-200",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="border-b border-zinc-800 px-4 py-4">
            <BrandBlock />

            <div className="mt-4 space-y-4">
              <div>
                <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Empresa activa</div>
                <CompanyPicker onPick={closeMobileMenu} hideIfSingle />
              </div>

              <div>
                <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Sucursal activa</div>
                <BranchPicker onPick={closeMobileMenu} />
              </div>

              <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-3 text-xs leading-5 text-zinc-400">
                Elegí primero la empresa y después la sucursal para mantener el contexto correcto.
              </div>
            </div>
          </div>

          <SidebarContent onNavigate={closeMobileMenu} />
        </aside>
      </div>
    </>
  );
}
