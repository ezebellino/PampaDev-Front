import { useUI } from "../../lib/ui/UIContext";
import UserMenu from "./UserMenu";
import CompanyPickerNavbar from "../companies/CompanyPickerNavbar";

export default function Navbar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const { toggleMobileMenu } = useUI();

  return (
    <header
      className={[
        "fixed top-0 right-0 z-30 h-16 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur",
        sidebarCollapsed ? "md:left-20" : "md:left-64",
        "left-0",
      ].join(" ")}
    >
      <div className="h-full flex items-center justify-between px-4 md:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden rounded-xl border border-zinc-800 px-3 py-2 hover:bg-zinc-900"
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>

        {/* Center (desktop) */}
        <div className="hidden md:flex flex-1 justify-center">
          <CompanyPickerNavbar />
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}