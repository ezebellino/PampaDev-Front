import { Link } from "react-router";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
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
  const base =
    "relative overflow-hidden rounded-3xl border bg-zinc-950/80 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.28)] transition duration-200";

  return (
    <Link
      to={disabled ? "#" : to}
      onClick={(event) => disabled && event.preventDefault()}
      className={[
        base,
        disabled
          ? "cursor-not-allowed border-zinc-800 opacity-60"
          : "border-cyan-500/12 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-zinc-900/85",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-r from-cyan-400/14 via-sky-400/10 to-transparent" />
      <div className="relative">
        <div className="text-base font-semibold tracking-tight text-zinc-100">{title}</div>
        <div className="mt-2 text-sm leading-6 text-zinc-400">{desc}</div>
        <div className="mt-5 inline-flex rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200">Abrir</div>
      </div>
    </Link>
  );
}

export default function AdminIndex() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();

  const needBranch = branchId == null;
  const isDev = user?.role === ROLES.DEVS;

  return (
    <div className="space-y-7 lg:space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-500/12 bg-linear-to-br from-slate-950 via-zinc-950 to-slate-900 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.28)] md:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.14),transparent)]" />
        <div className="relative space-y-4">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/55">Módulo administrador</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl xl:text-[2rem]">Panel Admin</h1>
          <p className="max-w-3xl text-sm text-zinc-300 md:text-base md:leading-7">
            Desde acá gestionás configuración operativa, horarios base, oferta comercial y solicitudes vinculadas al catálogo.
          </p>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa activa</div>
            <div className="mt-1 text-sm font-medium text-zinc-200">{companyId ?? "Sin seleccionar"}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal activa</div>
            <div className="mt-1 text-sm font-medium text-zinc-200">{branchId ?? "Sin seleccionar"}</div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Herramientas admin</h2>
          <p className="text-sm text-zinc-500">
            Accesos directos para continuar con la configuración, la oferta comercial y el seguimiento operativo.
          </p>
        </div>

        <div className={`grid gap-4 ${isDev ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
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

          {!isDev ? (
            <AdminTile
              title="Membresías"
              desc={
                needBranch
                  ? "Seleccioná una sucursal para definir planes, beneficios y clase particular."
                  : "Armá la oferta comercial de la sede con planes recurrentes y clase particular."
              }
              to="/app/admin/memberships"
              disabled={needBranch}
            />
          ) : null}

          <AdminTile
            title="Solicitudes de rubros"
            desc={
              isDev
                ? "Revisá la bandeja completa de solicitudes enviadas por administración."
                : "Creá solicitudes para nuevos rubros y seguí su estado con Devs."
            }
            to="/app/admin/requests"
          />
        </div>
      </section>

      <Card className="overflow-hidden border-zinc-800/90 bg-zinc-950/78 shadow-[0_18px_48px_rgba(2,6,23,0.22)]">
        <div className="h-24 bg-linear-to-r from-amber-400/16 via-orange-300/8 to-transparent" />
        <CardContent className="relative -mt-2 space-y-3 py-5">
          <div className="text-sm font-semibold text-zinc-100">Acciones rápidas</div>
          <div className="text-sm leading-6 text-zinc-400">
            {isDev
              ? "Podés revisar el listado completo de solicitudes y volver al catálogo activo para seguir operando."
              : "Podés crear una nueva solicitud, ajustar la oferta comercial o volver al catálogo activo."}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {!isDev ? (
              <>
                <Link
                  to="/app/admin/memberships"
                  className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                >
                  Gestionar membresías
                </Link>

                <Link
                  to="/app/admin/requests/new"
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  + Nueva solicitud
                </Link>
              </>
            ) : null}

            <Link
              to="/app/admin/requests"
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

