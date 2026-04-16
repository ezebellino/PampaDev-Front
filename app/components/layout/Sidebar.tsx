import { NavLink, useLocation } from "react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import { ROLES } from "../../lib/auth/roles";
import { useUI } from "../../lib/ui/UIContext";

type IconName =
  | "home"
  | "catalog"
  | "branches"
  | "admin"
  | "profile"
  | "instructor"
  | "bookings"
  | "memberships"
  | "requests"
  | "dev";

type NavItem = { to: string; label: string; icon: IconName; hint?: string };

function AppIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (name) {
    case "home":
      return <svg viewBox="0 0 24 24" className={className} {...common}><path d="M4 10.5 12 4l8 6.5" /><path d="M6.5 9.5V20h11V9.5" /></svg>;
    case "catalog":
      return <svg viewBox="0 0 24 24" className={className} {...common}><path d="M5 6.5h14" /><path d="M5 12h14" /><path d="M5 17.5h10" /></svg>;
    case "branches":
      return <svg viewBox="0 0 24 24" className={className} {...common}><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" /><circle cx="12" cy="11" r="2.4" /></svg>;
    case "admin":
      return <svg viewBox="0 0 24 24" className={className} {...common}><rect x="4" y="5" width="16" height="14" rx="3" /><path d="M8 9h8" /><path d="M8 13h4" /></svg>;
    case "profile":
      return <svg viewBox="0 0 24 24" className={className} {...common}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 19c1.7-3 4.2-4.5 7-4.5s5.3 1.5 7 4.5" /></svg>;
    case "instructor":
      return <svg viewBox="0 0 24 24" className={className} {...common}><path d="M12 5v14" /><path d="M7 10.5 12 5l5 5.5" /><path d="M6 19h12" /></svg>;
    case "bookings":
      return <svg viewBox="0 0 24 24" className={className} {...common}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M7.5 11h9" /><path d="M7.5 15h5" /></svg>;
    case "memberships":
      return <svg viewBox="0 0 24 24" className={className} {...common}><path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5z" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>;
    case "requests":
      return <svg viewBox="0 0 24 24" className={className} {...common}><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h6" /></svg>;
    case "dev":
      return <svg viewBox="0 0 24 24" className={className} {...common}><path d="M8 9 5 12l3 3" /><path d="M16 9l3 3-3 3" /><path d="m13.5 6-3 12" /></svg>;
  }
}

function navByRole(role: string): NavItem[] {
  const common: NavItem[] = [
    { to: "/app", label: "Dashboard", icon: "home", hint: "Resumen general" },
    { to: "/app/rubros", label: "Rubros", icon: "catalog", hint: "Oferta activa" },
  ];

  if (role === ROLES.DEVS) {
    return [
      ...common,
            { to: "/app/disciplines", label: "Disciplinas", icon: "catalog", hint: "Catálogo global" },
      { to: "/app/dev/requests", label: "Solicitudes", icon: "requests", hint: "Pedidos de admins" },
      { to: "/app/dev", label: "Dev Panel", icon: "dev", hint: "Monitoreo y soporte" },
    ];
  }

  if (role === ROLES.ADMIN) {
    return [
      ...common,
      { to: "/app/admin", label: "Admin", icon: "admin", hint: "Catálogo y gestión" },
    ];
  }

  if (role === ROLES.INSTRUCTOR) {
    return [
      ...common,
      { to: "/app/instructor", label: "Instructor", icon: "instructor", hint: "Agenda y clases" },
      { to: "/app/bookings", label: "Calendario", icon: "bookings", hint: "Turnos por fecha" },
    ];
  }

  return [
    ...common,
    { to: "/app/bookings", label: "Calendario", icon: "bookings", hint: "Turnos por fecha" },
    { to: "/app/memberships", label: "Membresías", icon: "memberships", hint: "Planes y beneficios" },
  ];
}

function BrandBlock({ collapsed }: { collapsed?: boolean }) {
  return (
    <NavLink to="/app" aria-label="Ir al dashboard" className="flex items-center gap-3 focus:outline-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] border border-slate-200/40 bg-white shadow-[0_18px_38px_-28px_rgba(69,70,77,0.14)]">
        <img src="/branding/pampadev-icondark.png" alt="PampaDev" className="h-8 w-8 object-contain" />
      </div>

      {collapsed === undefined || !collapsed ? (
        <div className="leading-tight">
          <div className="font-semibold tracking-tight text-slate-900">PampaDev</div>
          <div className="text-xs font-medium text-sky-700/80">Operación multirol, simple de usar</div>
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
  const items = useMemo(() => navByRole(role), [role]);

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={[
          "flex min-h-24 items-center border-b border-stone-200/80",
          collapsed ? "justify-center px-3" : "justify-between px-5",
        ].join(" ")}
      >
        <BrandBlock collapsed={collapsed} />

        {onToggleCollapsed ? (
          <button
            onClick={onToggleCollapsed}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/55 bg-[#eff4ff] text-slate-600 transition hover:border-sky-200 hover:bg-white hover:text-slate-900"
            aria-label="Alternar sidebar"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={["h-4 w-4 transition-transform", collapsed ? "rotate-180" : ""].join(" ")}>
              <path d="m14.5 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="space-y-3 px-3 pt-4">
        {collapsed ? null : (
          <div className="rounded-[1.6rem] border border-slate-200/35 bg-[linear-gradient(180deg,#ffffff,#eff4ff)] px-4 py-4 shadow-[0_24px_45px_-38px_rgba(69,70,77,0.14)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Rol activo</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{role}</div>
            <div className="mt-1 text-sm leading-5 text-slate-500">Navegación ordenada según el trabajo que tenés que resolver.</div>
          </div>
        )}

      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-[1.45rem] border px-3 py-3 transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                  ? "border-sky-200/55 bg-[#eff4ff] text-slate-900 shadow-[0_18px_35px_-30px_rgba(69,70,77,0.14)]"
                  : "border-transparent text-slate-600 hover:bg-white hover:text-slate-900",
              ].join(" ")
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-slate-200/45 bg-white shadow-sm">
              <AppIcon name={item.icon} className="h-5 w-5" />
            </span>

            {collapsed === undefined || !collapsed ? (
              <span className="min-w-0">
                <span className="block text-sm font-semibold tracking-tight">{item.label}</span>
                {item.hint ? <span className="block text-xs text-slate-500">{item.hint}</span> : null}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      {collapsed ? null : (
        <div className="mx-3 mb-3 rounded-[1.6rem] border border-slate-200/35 bg-[#eff4ff] px-4 py-4 text-sm leading-6 text-slate-600">
          Navegá por secciones desde este menú y mantené el foco en la tarea actual.
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
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobileMenu();
    }
    if (mobileMenuOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <>
      <aside
        className={[
          "fixed left-0 top-0 z-40 hidden h-full border-r border-slate-200/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(239,244,255,0.92))] shadow-[18px_0_50px_-42px_rgba(69,70,77,0.12)] backdrop-blur-xl md:flex",
          "transition-all duration-300",
          collapsed ? "w-28" : "w-[19rem]",
        ].join(" ")}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapsed={onToggle} />
      </aside>

      <div className={`md:hidden ${mobileMenuOpen ? "" : "pointer-events-none"}`}>
        <div
          onClick={closeMobileMenu}
          className={[
            "fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <aside
          className={[
            "fixed left-0 top-0 z-50 h-full w-[21rem] border-r border-slate-200/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,244,255,0.96))] shadow-[18px_0_60px_-40px_rgba(69,70,77,0.14)] backdrop-blur-xl",
            "transition-transform duration-300",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <SidebarContent onNavigate={closeMobileMenu} />
        </aside>
      </div>
    </>
  );
}
