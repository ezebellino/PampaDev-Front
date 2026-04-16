import { useAuth } from "../../lib/auth/AuthContext";
import { ROLES } from "../../lib/auth/roles";
import { useUI } from "../../lib/ui/UIContext";
import EntitySelector from "../companies/EntitySelector";
import UserMenu from "./UserMenu";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const { toggleMobileMenu } = useUI();
  const { user } = useAuth();
  const canChangeBranch = user?.role !== ROLES.ADMIN && user?.role !== ROLES.DEVS;

  return (
    <header
      className={[
        "fixed left-0 right-0 top-0 z-30 h-20 border-b border-slate-200/40 bg-white/72 shadow-[0_18px_50px_-36px_rgba(69,70,77,0.18)] backdrop-blur-xl",
        sidebarCollapsed ? "md:left-28" : "md:left-[19rem]",
      ].join(" ")}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/60 bg-[#eff4ff] text-slate-700 transition hover:border-sky-200 hover:bg-white hover:text-slate-900 md:hidden"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-2xl border border-slate-200/40 bg-[#eff4ff] px-3 py-2 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                Espacio
              </div>
              <div className="mt-1 text-sm font-semibold tracking-tight text-slate-900">
                PampaDev MultiRubro
              </div>
            </div>
            <div className="max-w-[18rem] text-sm leading-5 text-slate-500 lg:max-w-md">
              Una experiencia clara para moverte por la aplicación sin vueltas.
            </div>
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-4 lg:flex">
          {canChangeBranch ? (
            <div className="w-full max-w-3xl rounded-[1.75rem] border border-slate-200/35 bg-white/82 p-2 shadow-[0_22px_45px_-40px_rgba(69,70,77,0.15)]">
              <EntitySelector />
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right xl:block">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Estado
            </div>
            <div className="mt-1 text-sm font-medium text-slate-700">Empresa y sucursal activas</div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200/35 bg-white/82 p-1.5 shadow-[0_18px_40px_-34px_rgba(69,70,77,0.16)]">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}


