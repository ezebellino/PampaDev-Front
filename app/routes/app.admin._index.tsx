import { Link } from "react-router";
import { Card, CardContent } from "../components/ui/Card";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";

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
  const base = "relative overflow-hidden rounded-3xl border bg-zinc-950/75 p-5 transition duration-200";

  return (
    <Link
      to={disabled ? "#" : to}
      onClick={(event) => disabled && event.preventDefault()}
      className={[
        base,
        disabled
          ? "cursor-not-allowed border-zinc-800 opacity-60"
          : "border-zinc-800 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/75",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-r from-cyan-500/10 to-transparent" />
      <div className="relative">
        <div className="text-base font-semibold tracking-tight text-zinc-100">{title}</div>
        <div className="mt-2 text-sm leading-6 text-zinc-400">{desc}</div>
        <div className="mt-5 inline-flex rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200">
          Abrir
        </div>
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
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 md:p-8">
        <div className="absolute inset-0 bg-zinc-900/20" />
        <div className="relative space-y-4">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Módulo administrador</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Panel Admin</h1>
          <p className="max-w-2xl text-sm text-zinc-400 md:text-base md:leading-7">
            Desde acá gestionás configuración operativa, horarios base y solicitudes vinculadas al catálogo.
          </p>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa activa</div>
            <div className="mt-1 text-sm font-medium text-zinc-200">{companyId ?? "Sin seleccionar"}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal activa</div>
            <div className="mt-1 text-sm font-medium text-zinc-200">{branchId ?? "Sin seleccionar"}</div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Herramientas admin</h2>
          <p className="text-sm text-zinc-500">
            Accesos directos para continuar con la configuración y el seguimiento operativo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminTile
            title="Horarios base"
            desc={
              needBranch
                ? "Elegí una sucursal activa para configurar disponibilidad semanal."
                : "Definí la disponibilidad semanal de la sucursal y ordená la operación."
            }
            to="/app/admin/horarios"
            disabled={needBranch}
          />

          <AdminTile
            title="Solicitudes de rubros"
            desc="Creá y gestioná solicitudes para incorporar nuevos rubros o ajustar los existentes."
            to="/app/admin/solicitudes"
          />
        </div>
      </section>

      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
        <div className="h-20 bg-linear-to-r from-amber-500/12 to-transparent" />
        <CardContent className="relative -mt-2 space-y-3 py-5">
          <div className="text-sm font-semibold text-zinc-100">Acciones rápidas</div>
          <div className="text-sm leading-6 text-zinc-400">
            Podés crear una nueva solicitud, revisar el listado actual o volver al catálogo activo.
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to="/app/admin/solicitudes/nueva"
              className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
            >
              + Nueva solicitud
            </Link>

            <Link
              to="/app/admin/solicitudes"
              className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              Ver listado
            </Link>

            <Link
              to="/app/rubros"
              className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              Ver rubros activos
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
