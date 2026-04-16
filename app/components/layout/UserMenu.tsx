import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../lib/auth/AuthContext";

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(event.target as Node)) setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initials = useMemo(() => (user ? initialsFromName(user.name) : ""), [user]);

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="group flex items-center gap-3 rounded-[1.35rem] border border-transparent bg-white px-2.5 py-2 text-left transition hover:border-teal-100 hover:bg-teal-50/70"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Menú de usuario"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="Avatar"
            className="h-10 w-10 rounded-full border border-stone-200 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white shadow-[0_16px_30px_-20px_rgba(13,148,136,0.7)]">
            {initials || "PD"}
          </div>
        )}

        <div className="hidden min-w-0 sm:block">
          <div className="truncate text-sm font-semibold leading-4 text-slate-900">{user.name}</div>
          <div className="mt-1 truncate text-xs font-medium uppercase tracking-[0.18em] text-stone-500">{user.role}</div>
        </div>

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={["h-4 w-4 text-stone-400 transition", open ? "rotate-180 text-teal-700" : "group-hover:text-teal-700"].join(" ")}>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-3 w-72 overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_28px_60px_-34px_rgba(15,23,42,0.35)]"
          role="menu"
        >
          <div className="border-b border-stone-200 bg-gradient-to-br from-stone-50 via-white to-teal-50/80 px-4 py-4">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="h-11 w-11 rounded-full border border-stone-200 object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white">
                  {initials || "PD"}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{user.name}</div>
                <div className="truncate text-xs font-medium uppercase tracking-[0.18em] text-stone-500">{user.role}</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setOpen(false);
                navigate("/app/profile");
              }}
              className="block w-full rounded-[1.2rem] px-3 py-3 text-left transition hover:bg-stone-50"
              role="menuitem"
            >
              <div className="text-sm font-semibold text-slate-900">Mi perfil</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">Datos personales, seguridad y configuración de cuenta.</div>
            </button>

            <button
              onClick={() => {
                setOpen(false);
                logout();
                navigate("/login", { replace: true });
              }}
              className="mt-1 block w-full rounded-[1.2rem] px-3 py-3 text-left transition hover:bg-rose-50"
              role="menuitem"
              title="Cerrar sesión"
            >
              <div className="text-sm font-semibold text-rose-700">Cerrar sesión</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">Salir de la cuenta actual y volver al acceso principal.</div>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
