import { Link } from "react-router";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useCompany } from "../lib/companies/CompanyContext";
import { useBranch } from "../lib/branches/BranchContext";

function ActionCard({
  title,
  desc,
  to,
  cta,
  disabled,
}: {
  title: string;
  desc: string;
  to: string;
  cta: string;
  disabled?: boolean;
}) {
  const base =
    "rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition";

  if (disabled) {
    return (
      <div className={`${base} opacity-65`}>
        <div className="text-base font-semibold tracking-tight">{title}</div>
        <div className="mt-2 text-sm text-zinc-400">{desc}</div>
        <div className="mt-5 inline-flex rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500">
          {cta}
        </div>
      </div>
    );
  }

  return (
    <Link to={to} className={`${base} hover:bg-zinc-900/40`}>
      <div className="text-base font-semibold tracking-tight">{title}</div>
      <div className="mt-2 text-sm text-zinc-400">{desc}</div>
      <div className="mt-5 inline-flex rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white">
        {cta}
      </div>
    </Link>
  );
}

function ContextBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="text-sm font-medium text-zinc-200">{value}</div>
    </div>
  );
}

export default function AppDashboard() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();

  const role = user?.role ?? ROLES.USER;
  const isAdmin = role === ROLES.ADMIN;
  const isDev = role === ROLES.DEVS;

  const needsBranch = isAdmin;
  const branchSelected = branchId != null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 md:p-8">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Panel principal
          </div>

          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Bienvenido{user?.name ? `, ${user.name}` : ""}.
          </h1>

          <p className="max-w-2xl text-sm text-zinc-400 md:text-base">
            Este es tu punto de entrada al sistema. Desde acá podés acceder rápidamente
            a las herramientas principales según tu rol.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ContextBadge label="Rol" value={role} />
          <ContextBadge label="Company activa" value={companyId ?? "—"} />
          <ContextBadge label="Sucursal activa" value={branchId ?? "—"} />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Accesos rápidos</h2>
          <p className="text-sm text-zinc-500">
            Acciones frecuentes para continuar trabajando sin perder tiempo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ActionCard
            title="Ver rubros"
            desc="Consultá el listado de rubros disponibles para la sucursal activa."
            to="/app/rubros"
            cta="Abrir rubros"
          />

          {(isAdmin || isDev) && (
            <ActionCard
              title="Solicitudes de rubros"
              desc="Creá solicitudes para nuevos rubros y seguí su estado."
              to="/app/admin/solicitudes"
              cta="Ver solicitudes"
            />
          )}

          {(isAdmin || isDev) && (
            <ActionCard
              title="Horarios base"
              desc="Definí la disponibilidad semanal para organizar turnos."
              to="/app/admin/horarios"
              cta={needsBranch && !branchSelected ? "Elegí sucursal primero" : "Configurar horarios"}
              disabled={needsBranch && !branchSelected}
            />
          )}

          {isDev && (
            <ActionCard
              title="Dev Panel"
              desc="Revisá logs, debugging rápido y métricas internas del frontend."
              to="/app/dev"
              cta="Abrir Dev Panel"
            />
          )}
        </div>
      </section>

      {/* Estado / Próximo paso */}
      {(isAdmin || isDev) && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-sm font-semibold">Estado del entorno</div>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Company seleccionada</span>
                <span className="text-zinc-200">{companyId ?? "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sucursal seleccionada</span>
                <span className="text-zinc-200">{branchId ?? "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Módulo admin</span>
                <span className="text-zinc-200">{isAdmin || isDev ? "Disponible" : "No aplica"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-sm font-semibold">Próximo paso recomendado</div>
            <div className="mt-2 text-sm text-zinc-400">
              {isAdmin
                ? "Configurá horarios base o creá una nueva solicitud de rubro para seguir avanzando."
                : isDev
                ? "Revisá solicitudes pendientes o abrí el Dev Panel para monitorear el sistema."
                : "Explorá rubros y comenzá a navegar por el sistema."}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(isAdmin || isDev) && (
                <Link
                  to="/app/admin/solicitudes/nueva"
                  className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
                >
                  + Nueva solicitud
                </Link>
              )}

              {(isAdmin || isDev) && (
                <Link
                  to="/app/admin"
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900"
                >
                  Ir al módulo admin
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}