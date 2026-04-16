import { Link } from "react-router";
import { useAuth } from "../lib/auth/AuthContext";
import { Card, CardContent } from "../components/ui/Card";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { useRubroRequests } from "../lib/rubros/useRubroRequests";

function AdminTile({
  title,
  desc,
  to,
  disabled,
  accent = "from-sky-100 via-lime-50 to-transparent",
}: {
  title: string;
  desc: string;
  to: string;
  disabled?: boolean;
  accent?: string;
}) {
  const base =
    "relative overflow-hidden rounded-3xl border border-stone-200 bg-white/96 p-5 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)] transition duration-200";

  return (
    <Link
      to={disabled ? "#" : to}
      onClick={(event) => disabled && event.preventDefault()}
      className={[
        base,
        disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white",
      ].join(" ")}
    >
      <div className={`absolute inset-x-0 top-0 h-20 bg-linear-to-r ${accent}`} />
      <div className="relative space-y-4">
        <div>
          <div className="text-lg font-semibold tracking-tight text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{desc}</div>
        </div>
        <div className="inline-flex rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-slate-700">
          Abrir
        </div>
      </div>
    </Link>
  );
}

function ContextCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export default function AdminIndex() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();
  const { requests } = useRubroRequests();

  const needBranch = branchId == null;
  const pendingRequests = requests.filter((request) => request.status === "pending").length;
  const reviewedRequests = requests.filter((request) => request.status !== "pending").length;

  return (
    <div className="space-y-7 lg:space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/96 shadow-[0_24px_70px_-44px_rgba(69,70,77,0.18)]">
        <div className="h-28 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.24),transparent_26%),linear-gradient(90deg,rgba(239,246,255,0.98),rgba(247,250,255,0.98))]" />
        <div className="space-y-5 px-6 pb-6 pt-4 md:px-8 md:pb-8">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-700">Módulo administrador</div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Panel admin</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Priorizamos primero lo operativo: sucursal activa, solicitudes pendientes y accesos directos a horarios,
              membresías y pedidos de catálogo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ContextCard label="Empresa activa" value={companyId ?? "Sin seleccionar"} />
            <ContextCard label="Sucursal activa" value={branchId ?? "Sin seleccionar"} />
            <ContextCard label="Solicitudes pendientes" value={pendingRequests} />
            <ContextCard label="Solicitudes resueltas" value={reviewedRequests} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="space-y-4 py-6">
            <div>
              <div className="text-sm font-semibold text-slate-900">Lo importante para administrar hoy</div>
              <div className="mt-1 text-sm leading-6 text-slate-600">
                Todo lo crítico del rol quedó a un clic: disponibilidad semanal, oferta comercial y solicitudes.
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <AdminTile
                title="Horarios"
                desc={
                  needBranch
                    ? "Elegí una sucursal activa para configurar la disponibilidad semanal."
                    : "Definí la disponibilidad semanal de la sucursal y ordená la operación."
                }
                to="/app/admin/horarios"
                disabled={needBranch}
              />
              <AdminTile
                title="Membresías"
                desc={
                  needBranch
                    ? "Seleccioná una sucursal para definir planes, beneficios y clase individual."
                    : "Armá la oferta comercial de la sede con planes recurrentes y clase individual."
                }
                to="/app/admin/memberships"
                disabled={needBranch}
                accent="from-emerald-100 via-cyan-50 to-transparent"
              />
              <AdminTile
                title="Solicitudes"
                desc={
                  pendingRequests > 0
                    ? `Tenés ${pendingRequests} solicitud${pendingRequests === 1 ? "" : "es"} pendiente${pendingRequests === 1 ? "" : "s"} para revisar.`
                    : "Creá solicitudes para nuevos rubros y seguí su estado desde una sola bandeja."
                }
                to="/app/admin/requests"
                accent="from-amber-100 via-orange-50 to-transparent"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <div className="h-24 bg-linear-to-r from-amber-100 via-lime-50 to-transparent" />
          <CardContent className="relative -mt-2 space-y-3 py-5">
            <div className="text-sm font-semibold text-slate-900">Siguiente paso recomendado</div>
            <div className="text-sm leading-6 text-slate-600">
              {needBranch
                ? "Antes de tocar horarios o membresías, eleg? una sucursal activa para trabajar con el contexto correcto."
                : pendingRequests > 0
                  ? "Hoy conviene revisar la bandeja de solicitudes para que no queden pedidos frenados."
                  : "Con la sucursal activa ya lista, seguí por horarios o por la oferta comercial según lo que necesite la sede."}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                to={needBranch ? "/app/branches" : pendingRequests > 0 ? "/app/admin/requests" : "/app/admin/horarios"}
                className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500"
              >
                {needBranch ? "Elegir sucursal" : pendingRequests > 0 ? "Revisar solicitudes" : "Configurar horarios"}
              </Link>

              <Link
                to="/app/admin/memberships"
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-white"
              >
                Gestionar membresías
              </Link>

              <Link
                to="/app/rubros"
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-white"
              >
                Ver rubros activos
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
