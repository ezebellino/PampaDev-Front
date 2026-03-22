import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { useNextTurnos } from "../lib/scheduling/useNextTurnos";

const USER_ACTIONS = [
  {
    title: "Membresías",
    description: "Compará planes disponibles y consultá si esta sucursal ofrece clase particular.",
    to: "/app/memberships",
    cta: "Ver planes",
  },
  {
    title: "Mi perfil",
    description: "Actualizá tus datos personales y mantené tu cuenta al día.",
    to: "/app/profile",
    cta: "Editar perfil",
  },
  {
    title: "Explorar rubros",
    description: "Revisá servicios disponibles y seguí desde ahí con tu próxima reserva.",
    to: "/app/rubros",
    cta: "Ver rubros",
  },
  {
    title: "Sucursales",
    description: "Consultá las sedes activas y encontrá dónde querés operar.",
    to: "/app/branches",
    cta: "Ver sucursales",
  },
];

function UserActionCard({
  title,
  description,
  to,
  cta,
}: {
  title: string;
  description: string;
  to: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group block rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 transition hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/80"
    >
      <div className="space-y-3">
        <div>
          <div className="text-lg font-semibold tracking-tight text-zinc-100">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{description}</div>
        </div>
        <div className="inline-flex rounded-2xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition group-hover:bg-white">
          {cta}
        </div>
      </div>
    </Link>
  );
}

export default function User() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();

  const { turnos, loading: turnosLoading, error: turnosError, pendingCount, confirmedCount } = useNextTurnos(user?.id ?? null, branchId);

  return (
    <Protected allowRoles={[ROLES.USER, ROLES.DEVS]}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 md:p-8">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Mi cuenta</div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
                Hola{user?.name ? `, ${user.name}` : ""}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Este panel concentra los accesos principales para revisar tu cuenta, explorar servicios,
                comparar membresías y mantener tu experiencia ordenada desde cualquier dispositivo.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Rol</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{user?.role ?? ROLES.USER}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{companyId ?? "Sin seleccionar"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{branchId ?? "Sin seleccionar"}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {USER_ACTIONS.map((action) => (
            <UserActionCard key={action.title} {...action} />
          ))}
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Resumen general</h2>
                <p className="text-xs text-zinc-500">Accesos rápidos y tu agenda próxima.</p>
              </div>
              <div className="h-8 w-px bg-zinc-700" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {USER_ACTIONS.map((action) => (
                <UserActionCard key={action.title} {...action} />
              ))}
            </div>
          </div>

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Mis solicitudes y próximos turnos</CardTitle>
              <CardDescription>
                Acá ves lo que ya pediste a la sucursal activa, incluso si todavía está pendiente de sincronizarse con backend.
              </CardDescription>
            </CardHeader>

            <div className="border-t border-zinc-800" />
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Pendientes</div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-100">{pendingCount}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Confirmadas</div>
                  <div className="mt-2 text-2xl font-semibold text-zinc-100">{confirmedCount}</div>
                </div>
              </div>

              {turnosLoading && <p className="text-sm text-zinc-400">Cargando tus turnos...</p>}

              {turnosError && (
                <p className="text-sm text-orange-300">Error cargando turnos: {(turnosError as Error).message}</p>
              )}

              {!turnosLoading && !turnosError && turnos.length === 0 && (
                <p className="text-sm text-zinc-400">Todavía no tenés solicitudes enviadas en esta sucursal.</p>
              )}

              {!turnosLoading && !turnosError && turnos.length > 0 && (
                <div className="space-y-2">
                  {turnos.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-zinc-100">{slot.rubroName ?? slot.rubroId}</div>
                        <div className="text-xs text-zinc-500">{slot.date ?? "Fecha a confirmar"} • {slot.time ?? "Hora a confirmar"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={slot.status === "confirmed" ? "success" : "warning"}>
                          {slot.status === "confirmed" ? "Confirmada" : slot.status === "rejected" ? "Rechazada" : "Pendiente"}
                        </Badge>
                        <Badge tone={slot.syncStatus === "synced" ? "success" : "neutral"}>
                          {slot.syncStatus === "synced" ? "Sincronizada" : "Lista para backend"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2 border-t border-zinc-800 pt-2">
                <Link
                  to="/app/rubros"
                  className="block rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-zinc-950 hover:bg-white"
                >
                  Agendar nuevo turno
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Protected>
  );
}

