import { Link } from "react-router";
import { useCompany } from "../lib/companies/CompanyContext";
import { useBranch } from "../lib/branches/BranchContext";

function AdminTile({
  title,
  desc,
  to,
  disabled,
}: {
  title: string;
  desc: string;
  to: string;
  disabled?: boolean;
}) {
  const base =
    "rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition";

  return (
    <Link
      to={disabled ? "#" : to}
      onClick={(e) => disabled && e.preventDefault()}
      className={[
        base,
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-zinc-900/40",
      ].join(" ")}
    >
      <div className="text-base font-semibold tracking-tight">{title}</div>
      <div className="mt-2 text-sm text-zinc-400">{desc}</div>
      <div className="mt-5 inline-flex rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200">
        Abrir
      </div>
    </Link>
  );
}

export default function AdminIndex() {
  const { companyId } = useCompany();
  const { branchId } = useBranch();

  const needBranch = branchId == null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 md:p-8">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Módulo administrador
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Panel Admin
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400 md:text-base">
            Desde acá gestionás la configuración operativa del negocio: horarios base,
            solicitudes de rubros y próximos flujos administrativos.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Company activa</div>
            <div className="text-sm font-medium text-zinc-200">{companyId ?? "—"}</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Sucursal activa</div>
            <div className="text-sm font-medium text-zinc-200">{branchId ?? "—"}</div>
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Herramientas admin</h2>
          <p className="text-sm text-zinc-500">
            Accedé a las secciones principales para continuar con la configuración.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminTile
            title="Horarios base"
            desc={
              needBranch
                ? "Elegí una sucursal activa para configurar disponibilidad semanal."
                : "Definí la disponibilidad semanal de la sucursal."
            }
            to="/app/admin/horarios"
            disabled={needBranch}
          />

          <AdminTile
            title="Solicitudes de rubros"
            desc="Creá y gestioná solicitudes para que Devs creen nuevos rubros o disciplinas."
            to="/app/admin/solicitudes"
          />
        </div>
      </section>

      {/* CTA section */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="text-sm font-semibold">Acciones rápidas</div>
        <div className="mt-2 text-sm text-zinc-400">
          Podés crear una nueva solicitud o revisar el estado de las existentes.
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/app/admin/solicitudes/nueva"
            className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
          >
            + Nueva solicitud
          </Link>

          <Link
            to="/app/admin/solicitudes"
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            Ver listado
          </Link>

          <Link
            to="/app/rubros"
            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            Ver rubros activos
          </Link>
        </div>
      </section>
    </div>
  );
}