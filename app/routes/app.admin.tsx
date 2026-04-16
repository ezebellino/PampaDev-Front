import { NavLink, Outlet } from "react-router";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useCompany } from "../lib/companies/CompanyContext";
import { useBranch } from "../lib/branches/BranchContext";

function AdminTab({
  to,
  label,
  end,
}: {
  to: string;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "inline-flex min-h-11 items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium transition shadow-sm",
          isActive
            ? "border-sky-200 bg-[#eff4ff] text-slate-900"
            : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-[#eff4ff] hover:text-slate-900",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { companyId } = useCompany();
  const { branchId } = useBranch();

  const adminNavItems = [
    { to: "/app/admin", label: "Panel", end: true },
    { to: "/app/admin/horarios", label: "Horarios" },
    { to: "/app/admin/memberships", label: "Membresías" },
    { to: "/app/admin/rubros", label: "Rubros" },
    { to: "/app/admin/requests", label: "Solicitudes" },
  ];

  return (
    <Protected allowRoles={[ROLES.ADMIN]}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/94 shadow-[0_24px_70px_-44px_rgba(69,70,77,0.18)]">
          <div className="h-24 bg-linear-to-r from-sky-100 via-lime-50 to-transparent" />
          <div className="space-y-5 px-5 pb-5 pt-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-[#eff4ff] px-3 py-1 text-xs font-medium uppercase tracking-widest text-sky-700">
                  Admin Workspace
                </span>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                    Operación y catálogo administrativo
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                    Desde este espacio podés coordinar solicitudes, disponibilidad operativa, oferta comercial y la configuración
                    general que impacta en sucursales, rubros y atención.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Empresa</div>
                  <div className="mt-2 font-medium text-slate-900">{companyId ?? "Sin seleccionar"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Sucursal</div>
                  <div className="mt-2 font-medium text-slate-900">{branchId ?? "Sin seleccionar"}</div>
                </div>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {adminNavItems.map((item) => (
                <AdminTab key={item.to} to={item.to} label={item.label} end={item.end} />
              ))}
            </nav>
          </div>
        </section>

        <Outlet />
      </div>
    </Protected>
  );
}
