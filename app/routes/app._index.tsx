import { Link } from "react-router";
import { Card, CardContent } from "../components/ui/Card";
import { useAuth } from "../lib/auth/AuthContext";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { ROLES } from "../lib/auth/roles";

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
    "relative overflow-hidden rounded-[1.75rem] border bg-zinc-950/75 p-5 transition duration-200";

  if (disabled) {
    return (
      <div className={`${base} border-zinc-800 opacity-65`}>
        <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_60%)]" />
        <div className="relative">
          <div className="text-base font-semibold tracking-tight text-zinc-100">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{desc}</div>
          <div className="mt-5 inline-flex rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500">
            {cta}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={to} className={`${base} border-zinc-800 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/75`}>
      <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),transparent_60%)]" />
      <div className="relative">
        <div className="text-base font-semibold tracking-tight text-zinc-100">{title}</div>
        <div className="mt-2 text-sm leading-6 text-zinc-400">{desc}</div>
        <div className="mt-5 inline-flex rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white">
          {cta}
        </div>
      </div>
    </Link>
  );
}

function ContextBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-200">{value}</div>
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
      <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_55%)]" />

        <div className="relative space-y-4">
          <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Panel principal</div>

          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Bienvenido{user?.name ? `, ${user.name}` : ""}.
          </h1>

          <p className="max-w-2xl text-sm text-zinc-400 md:text-base md:leading-7">
            Este es tu punto de entrada para continuar trabajando con sucursales, rubros, horarios y
            herramientas según el rol que tengas activo.
          </p>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <ContextBadge label="Rol" value={role} />
          <ContextBadge label="Company activa" value={companyId ?? "—"} />
          <ContextBadge label="Sucursal activa" value={branchId ?? "—"} />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Accesos rápidos</h2>
          <p className="text-sm text-zinc-500">
            Entradas directas para seguir trabajando sin perder contexto.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ActionCard
            title="Ver rubros"
            desc="Consultá el catálogo disponible para la sucursal activa y seguí desde ahí."
            to="/app/rubros"
            cta="Abrir rubros"
          />

          {(isAdmin || isDev) && (
            <ActionCard
              title="Solicitudes de rubros"
              desc="Revisá propuestas nuevas, dejá feedback y seguí su estado de avance."
              to="/app/admin/solicitudes"
              cta="Ver solicitudes"
            />
          )}

          {(isAdmin || isDev) && (
            <ActionCard
              title="Horarios base"
              desc="Definí la disponibilidad semanal para ordenar turnos y operación." 
              to="/app/admin/horarios"
              cta={needsBranch && !branchSelected ? "Elegí sucursal primero" : "Configurar horarios"}
              disabled={needsBranch && !branchSelected}
            />
          )}

          {isDev && (
            <ActionCard
              title="Dev Panel"
              desc="Revisá logs, métricas internas y señales útiles para el seguimiento técnico."
              to="/app/dev"
              cta="Abrir Dev Panel"
            />
          )}
        </div>
      </section>

      {(isAdmin || isDev) && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
            <div className="h-20 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),transparent_55%)]" />
            <CardContent className="relative -mt-2 space-y-3 py-5">
              <div className="text-sm font-semibold text-zinc-100">Estado del entorno</div>
              <div className="space-y-2 text-sm text-zinc-400">
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
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
            <div className="h-20 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),transparent_55%)]" />
            <CardContent className="relative -mt-2 space-y-3 py-5">
              <div className="text-sm font-semibold text-zinc-100">Próximo paso recomendado</div>
              <div className="text-sm leading-6 text-zinc-400">
                {isAdmin
                  ? "Configurá horarios base o generá una nueva solicitud de rubro para seguir avanzando."
                  : isDev
                  ? "Revisá solicitudes pendientes o abrí el Dev Panel para monitorear el sistema."
                  : "Explorá rubros y comenzá a navegar por el sistema."}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
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
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Ir al módulo admin
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
