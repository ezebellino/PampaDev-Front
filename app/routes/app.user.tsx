import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import { usePublishedBranchAgenda } from "../lib/scheduling/publishedAgenda";
import { useBranchScheduleConfig } from "../lib/scheduling/useBranchScheduleConfig";
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
          ? "border-sky-200 bg-[linear-gradient(135deg,rgba(239,244,255,0.96),rgba(255,255,255,0.98)_48%,rgba(236,253,245,0.92)_100%)] hover:-translate-y-1 hover:border-sky-300"
          : "border-slate-200 bg-white/96 shadow-[0_24px_60px_-42px_rgba(69,70,77,0.18)] hover:-translate-y-1 hover:border-sky-200 hover:bg-white",
      ].join(" ")}
    >
      <div className="space-y-3">
        <div>
          <div className="text-lg font-semibold tracking-tight text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{description}</div>
        </div>
        <div
          className={[
            "inline-flex rounded-2xl px-4 py-2 text-sm font-medium transition",
            featured ? "bg-slate-900 text-white group-hover:bg-slate-800" : "bg-[#eff4ff] text-slate-900 group-hover:bg-white",
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
    <div className="rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 shadow-sm">
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export default function User() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();
  const { disciplines } = useDisciplines();
  const { data: scheduleConfig } = useBranchScheduleConfig(branchId, disciplines);
  const publishedAgenda = usePublishedBranchAgenda(branchId, disciplines, scheduleConfig);

  const { turnos, loading: turnosLoading, error: turnosError, pendingCount, confirmedCount } = useNextTurnos(user?.id ?? null, branchId);

  const nextTurno = turnos[0] ?? null;
  const nextPublishedSlots = publishedAgenda.publishedItems.filter((item) => item.available > 0).slice(0, 4);
  const priorityActions = USER_ACTIONS.filter((action) => action.priority);
  const secondaryActions = USER_ACTIONS.filter((action) => !action.priority);

  return (
    <Protected allowRoles={[ROLES.USER, ROLES.DEVS]}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(239,244,255,0.96),rgba(255,255,255,0.98)_48%,rgba(236,253,245,0.92)_100%)] p-6 shadow-[0_28px_80px_-48px_rgba(69,70,77,0.2)] md:p-8">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-sky-700/70">Mi cuenta</div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Hola{user?.name ? `, ${user.name}` : ""}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
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
          <Card className="border-slate-200 bg-white/96 shadow-[0_24px_60px_-42px_rgba(69,70,77,0.18)]">
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

          <Card className="border-slate-200 bg-white/96 shadow-[0_24px_60px_-42px_rgba(69,70,77,0.18)]">
            <CardHeader>
              <CardTitle>Tu estado actual</CardTitle>
              <CardDescription>Resumen simple para entender rápido cómo está tu actividad.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Pendientes</div>
                  <div className="mt-2 text-2xl font-semibold text-amber-600">{pendingCount}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Confirmadas</div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-600">{confirmedCount}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                <div className="text-sm font-medium text-slate-900">Próximo paso recomendado</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {nextTurno
                    ? `Ya tenés una reserva para ${nextTurno.date ?? "fecha a confirmar"} a las ${nextTurno.time ?? "hora a confirmar"}. Si querés más detalle, entrá a Mis turnos.`
                    : "Todavía no tenés reservas activas en esta sucursal. Lo más útil ahora es explorar rubros y elegir un horario disponible."}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to={nextTurno ? "/app/bookings" : "/app/rubros"}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {nextTurno ? "Ver mis turnos" : "Explorar rubros"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card className="border-slate-200 bg-white/96 shadow-[0_24px_60px_-42px_rgba(69,70,77,0.18)]">
            <CardHeader>
              <CardTitle>Agenda disponible</CardTitle>
              <CardDescription>Horarios publicados para reservar desde esta sucursal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextPublishedSlots.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4 text-sm text-slate-600">
Todavía no hay horarios publicados.
                </div>
              ) : (
                nextPublishedSlots.map((slot) => (
                  <Link
                    key={slot.id}
                    to={`/app/rubros/${slot.rubroId}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:bg-[#eff4ff]"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{String(slot.rubroName ?? slot.disciplineName ?? slot.rubroId)}</div>
                      <div className="mt-1 text-xs text-stone-500">{slot.date} - {slot.time}</div>
                    </div>
                    <div className="text-xs text-sky-700">{slot.available}/{slot.capacity}</div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <section className="grid gap-4 md:grid-cols-1">
            {secondaryActions.map((action) => (
              <UserActionCard key={action.title} {...action} />
            ))}
          </section>
        </section>

        <Card className="border-slate-200 bg-white/96 shadow-[0_24px_60px_-42px_rgba(69,70,77,0.18)]">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Mis solicitudes y próximos turnos</CardTitle>
                <CardDescription>
Acá ves tus solicitudes y próximos turnos de la sucursal activa en una sola lista.
                </CardDescription>
              </div>
              <Link
                to="/app/bookings"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-[#eff4ff]"
              >
                Ver vista completa
              </Link>
            </div>
          </CardHeader>

          <div className="border-t border-slate-200" />
          <CardContent className="space-y-4 pt-6">
            {turnosLoading && <p className="text-sm text-slate-600">Cargando tus turnos...</p>}

            {turnosError && <p className="text-sm text-rose-700">Error cargando turnos: {(turnosError as Error).message}</p>}

            {!turnosLoading && !turnosError && turnos.length === 0 && (
              <p className="text-sm text-slate-600">Todavía no tenés solicitudes enviadas en esta sucursal.</p>
            )}

            {!turnosLoading && !turnosError && turnos.length > 0 && (
              <div className="space-y-2">
                {turnos.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-stone-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{slot.rubroName ?? slot.rubroId}</div>
                      <div className="text-xs text-stone-500">
                        {slot.date ?? "Fecha a confirmar"} • {slot.time ?? "Hora a confirmar"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={slot.status === "confirmed" ? "success" : "warning"}>
                        {slot.status === "confirmed" ? "Confirmada" : slot.status === "rejected" ? "Rechazada" : "Pendiente"}
                      </Badge>
                      <Badge tone={slot.syncStatus === "synced" ? "success" : "neutral"}>
                        {slot.syncStatus === "synced" ? "Registrada" : "Pendiente de confirmar"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 border-t border-slate-200 pt-2">
              <Link
                to="/app/rubros"
                className="block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
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



