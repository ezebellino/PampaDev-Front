import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../lib/auth/AuthContext";
export default function UserMenu() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="group flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/50 px-2 py-1.5 transition hover:border-cyan-500/30 hover:bg-zinc-900/50"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Menú de usuario"
      >
        <img
          src={user.avatarUrl || "https://i.pravatar.cc/150?img=8"}
          alt="Avatar"
          className="h-8 w-8 rounded-full border border-zinc-800 object-cover"
        />

        <div className="hidden text-left sm:block">
          <div className="text-sm leading-4 text-zinc-200">{user.name}</div>
          <div className="text-xs leading-4 text-zinc-500">{user.role}</div>
        </div>

        <span className="text-zinc-500 transition group-hover:text-cyan-200">▾</span>
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur"
          role="menu"
        >
          <div className="border-b border-zinc-800 bg-zinc-900/55 px-4 py-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || "https://i.pravatar.cc/150?img=8"}
                alt="Avatar"
                className="h-10 w-10 rounded-full border border-zinc-800 object-cover"
              />
              <div>
                <div className="text-sm font-medium text-zinc-100">{user.name}</div>
                <div className="text-xs text-zinc-500">{user.role}</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setOpen(false);
                nav("/app/profile");
              }}
              className="block w-full rounded-2xl px-3 py-3 text-left text-sm text-zinc-200 transition hover:bg-zinc-900/70 hover:text-zinc-100"
              role="menuitem"
            >
              <div className="font-medium">Mi perfil</div>
              <div className="mt-1 text-xs text-zinc-500">Datos personales y seguridad</div>
            </button>

            <button
              onClick={() => {
                setOpen(false);
                logout();
                nav("/login", { replace: true });
              }}
              className="mt-1 block w-full rounded-2xl px-3 py-3 text-left text-sm text-zinc-200 transition hover:bg-rose-500/10 hover:text-rose-100"
              role="menuitem"
              title="Cerrar sesión"
            >
              <div className="font-medium">Cerrar sesión</div>
              <div className="mt-1 text-xs text-zinc-500">Salir de la cuenta actual</div>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
