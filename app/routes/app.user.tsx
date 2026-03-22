import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { useNextTurnos } from "../lib/scheduling/useNextTurnos";

const USER_ACTIONS = [
  {
    title: "Mis turnos",
    description: "Seguí solicitudes, confirmaciones y reservas ya enviadas desde la sucursal activa.",
    to: "/app/bookings",
    cta: "Ver agenda",
    priority: true,
  },
  {
    title: "Explorar rubros",
    description: "Entrá al catálogo y reservá tu próxima clase o turno desde la agenda del rubro.",
    to: "/app/rubros",
    cta: "Reservar ahora",
    priority: true,
  },
  {
    title: "Membresías",
    description: "Compará planes disponibles y consultá si esta sucursal ofrece clase particular.",
    to: "/app/memberships",
    cta: "Ver planes",
    priority: true,
  },
  {
    title: "Mi perfil",
    description: "Actualizá tus datos personales y mantené tu cuenta al día.",
    to: "/app/profile",
    cta: "Editar perfil",
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
  featured = false,
}: {
  title: string;
  description: string;
  to: string;
  cta: string;
  featured?: boolean;
}) {
  return (
    <Link
      to={to}
      className={[
        "group block rounded-3xl border p-5 transition",
        featured
          ? "border-cyan-500/15 bg-linear-to-br from-zinc-950 via-zinc-950 to-slate-950 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-zinc-900/85"
          : "border-zinc-800 bg-zinc-950/80 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/80",
      ].join(" ")}
    >
      <div className="space-y-3">
        <div>
          <div className="text-lg font-semibold tracking-tight text-zinc-100">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{description}</div>
        </div>
        <div
          className={[
            "inline-flex rounded-2xl px-4 py-2 text-sm font-medium transition",
            featured ? "bg-cyan-300 text-slate-950 group-hover:bg-cyan-200" : "bg-zinc-100 text-zinc-950 group-hover:bg-white",
          ].join(" ")}
        >
          {cta}
        </div>
      </div>
    </Link>
  );
}

function ContextStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
}

export default function User() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();

  const { turnos, loading: turnosLoading, error: turnosError, pendingCount, confirmedCount } = useNextTurnos(user?.id ?? null, branchId);

  const nextTurno = turnos[0] ?? null;
  const priorityActions = USER_ACTIONS.filter((action) => action.priority);
  const secondaryActions = USER_ACTIONS.filter((action) => !action.priority);

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
                Acá tenés primero lo importante: tus reservas, el próximo paso recomendado y accesos directos para seguir operando sin perder tiempo.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ContextStat label="Rol" value={user?.role ?? ROLES.USER} />
            <ContextStat label="Empresa" value={companyId ?? "Sin seleccionar"} />
            <ContextStat label="Sucursal" value={branchId ?? "Sin seleccionar"} />
            <ContextStat label="Próximo foco" value={nextTurno ? "Tu próxima reserva" : "Explorar rubros"} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Lo más importante hoy</CardTitle>
              <CardDescription>Las tres acciones que más vas a usar en tu recorrido normal.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {priorityActions.map((action) => (
                <UserActionCard key={action.title} {...action} featured />
              ))}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Tu estado actual</CardTitle>
              <CardDescription>Resumen simple para entender rápido cómo está tu actividad.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Pendientes</div>
                  <div className="mt-2 text-2xl font-semibold text-amber-200">{pendingCount}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Confirmadas</div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-200">{confirmedCount}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="text-sm font-medium text-zinc-100">Próximo movimiento recomendado</div>
                <div className="mt-2 text-sm leading-6 text-zinc-400">
                  {nextTurno
                    ? `Ya tenés una reserva para ${nextTurno.date ?? "fecha a confirmar"} a las ${nextTurno.time ?? "hora a confirmar"}. Si querés más detalle, entrá a Mis turnos.`
                    : "Todavía no tenés reservas activas en esta sucursal. Lo más útil ahora es explorar rubros y elegir un horario disponible."}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to={nextTurno ? "/app/bookings" : "/app/rubros"}
                  className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                >
                  {nextTurno ? "Ver mis turnos" : "Explorar rubros"}
                </Link>
                <Link
                  to="/app/profile"
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  Revisar perfil
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {secondaryActions.map((action) => (
            <UserActionCard key={action.title} {...action} />
          ))}
        </section>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Mis solicitudes y próximos turnos</CardTitle>
                <CardDescription>
                  Acá ves lo que ya pediste a la sucursal activa, incluso si todavía está pendiente de sincronizarse con backend.
                </CardDescription>
              </div>
              <Link
                to="/app/bookings"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900"
              >
                Ver vista completa
              </Link>
            </div>
          </CardHeader>

          <div className="border-t border-zinc-800" />
          <CardContent className="space-y-4 pt-6">
            {turnosLoading && <p className="text-sm text-zinc-400">Cargando tus turnos...</p>}

            {turnosError && <p className="text-sm text-orange-300">Error cargando turnos: {(turnosError as Error).message}</p>}

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
                      <div className="text-xs text-zinc-500">
                        {slot.date ?? "Fecha a confirmar"} • {slot.time ?? "Hora a confirmar"}
                      </div>
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
      </div>
    </Protected>
  );
}
