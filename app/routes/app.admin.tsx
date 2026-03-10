import { NavLink, Outlet } from "react-router";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useCompany } from "../lib/companies/CompanyContext";
import { useBranch } from "../lib/branches/BranchContext";

const ADMIN_NAV_ITEMS = [
  { to: "/app/admin", label: "Panel", end: true },
  { to: "/app/admin/horarios", label: "Horarios" },
  { to: "/app/admin/rubros", label: "Rubros" },
  { to: "/app/admin/solicitudes", label: "Solicitudes" },
];

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
          "inline-flex min-h-11 items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium transition",
          isActive
            ? "border-zinc-700 bg-zinc-100 text-zinc-950"
            : "border-zinc-800 bg-zinc-950/65 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100",
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

  return (
    <Protected allowRoles={[ROLES.ADMIN, ROLES.DEVS]}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80">
          <div className="h-24 bg-linear-to-r from-cyan-500/15 via-emerald-500/10 to-transparent" />
          <div className="space-y-5 px-5 pb-5 pt-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <span className="inline-flex w-fit items-center rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-300">
                  Admin Workspace
                </span>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
                    Operación y catálogo administrativo
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
                    Desde este espacio podés coordinar solicitudes, disponibilidad operativa y la configuración
                    general que impacta en sucursales, rubros y atención.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/65 px-4 py-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa</div>
                  <div className="mt-2 font-medium text-zinc-100">{companyId ?? "Sin seleccionar"}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/65 px-4 py-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal</div>
                  <div className="mt-2 font-medium text-zinc-100">{branchId ?? "Sin seleccionar"}</div>
                </div>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {ADMIN_NAV_ITEMS.map((item) => (
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
