import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
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
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/50 px-2 py-1.5 hover:bg-zinc-900/40 transition"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Menú de usuario"
      >
        <img
          src={user.avatarUrl || "https://i.pravatar.cc/150?img=8"}
          alt="Avatar"
          className="h-8 w-8 rounded-full border border-zinc-800 object-cover"
        />
        <div className="hidden sm:block text-left">
          <div className="text-sm text-zinc-200 leading-4">{user.name}</div>
          <div className="text-xs text-zinc-500 leading-4">{user.role}</div>
        </div>
        <span className="text-zinc-500 group-hover:text-zinc-300 transition">▾</span>
      </button>

      {open && (
        <div
          className={[
            "absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl",
            "border border-zinc-800 bg-zinc-950/95 backdrop-blur",
            "shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
          ].join(" ")}
          role="menu"
        >
          <div className="px-4 py-3 border-b border-zinc-800">
            <div className="text-sm text-zinc-100">{user.name}</div>
            <div className="text-xs text-zinc-500">{user.role}</div>
          </div>

          <div className="p-2 space-y-1">
            <Link
              to="/app/profile"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/50 transition"
              role="menuitem"
            >
              👤 Perfil
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                logout();
                nav("/login", { replace: true }); // redirección inmediata (producto real)
              }}
              className={[
                "w-full text-left rounded-xl px-3 py-2 text-sm transition",
                "text-zinc-200 hover:bg-zinc-900/50",
                "relative overflow-hidden",
                // “reflejo” (gloss)
                "before:content-[''] before:absolute before:inset-0",
                "before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.10),transparent)]",
                "before:translate-x-[-120%] hover:before:translate-x-[120%] before:transition-transform before:duration-700",
              ].join(" ")}
              role="menuitem"
              title="Cerrar sesión"
            >
              🚪 Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
