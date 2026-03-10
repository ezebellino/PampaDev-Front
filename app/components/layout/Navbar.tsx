import { useUI } from "../../lib/ui/UIContext";
import CompanyPickerNavbar from "../companies/CompanyPickerNavbar";
import UserMenu from "./UserMenu";

export default function Navbar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const { toggleMobileMenu } = useUI();

  return (
    <header
      className={[
        "fixed left-0 right-0 top-0 z-30 h-16 border-b border-zinc-800 bg-zinc-950/75 backdrop-blur",
        sidebarCollapsed ? "md:left-24" : "md:left-72",
      ].join(" ")}
    >
      <div className="flex h-full items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 transition hover:border-cyan-500/40 hover:bg-zinc-900 hover:text-white md:hidden"
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <div className="h-9 w-px bg-zinc-800" />
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500">Workspace</div>
              <div className="text-sm font-medium text-zinc-200">PampaDev MultiRubro</div>
            </div>
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-6 md:flex">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition hover:border-cyan-500/30">
            <CompanyPickerNavbar />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden h-9 w-px bg-zinc-800 md:block" />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-1.5 py-1 transition hover:border-cyan-500/30">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
