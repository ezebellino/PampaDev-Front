import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../components/ui/Card";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { useRubroRequests } from "../lib/rubros/useRubroRequests";
import { getLogs, LOGS_EVENT, type LogEntry } from "../lib/utils/logger";

type DashboardAction = {
  title: string;
  desc: string;
  to: string;
  cta: string;
  disabled?: boolean;
};

function ActionCard({ title, desc, to, cta, disabled }: DashboardAction) {
  const base =
    "relative overflow-hidden rounded-3xl border bg-zinc-950/80 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.28)] transition duration-200";

  if (disabled) {
    return (
      <div className={`${base} border-zinc-800/90 opacity-65`}>
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-r from-white/5 to-transparent" />
        <div className="relative">
          <div className="text-base font-semibold tracking-tight text-zinc-100">{title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{desc}</div>
          <div className="mt-5 inline-flex rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500">{cta}</div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`${base} border-cyan-500/12 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-zinc-900/85`}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-r from-cyan-400/16 via-sky-400/10 to-transparent" />
      <div className="relative">
        <div className="text-base font-semibold tracking-tight text-zinc-100">{title}</div>
        <div className="mt-2 text-sm leading-6 text-zinc-400">{desc}</div>
        <div className="mt-5 inline-flex rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200">
          {cta}
        </div>
      </div>
    </Link>
  );
}

function ContextBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-200">{value}</div>
    </div>
  );
}

function DevMiniBars({ values }: { values: { label: string; value: number }[] }) {
  const max = Math.max(...values.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {values.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{item.label}</span>
            <span className="text-zinc-300">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-900">
            <div
              className="h-2 rounded-full bg-linear-to-r from-cyan-300 via-sky-300 to-blue-300"
              style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 12 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppDashboard() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();
  const { requests } = useRubroRequests();
  const [logsTick, setLogsTick] = useState(0);

  const role = user?.role ?? ROLES.USER;
  const isAdmin = role === ROLES.ADMIN;
  const isDev = role === ROLES.DEVS;
  const isInstructor = role === ROLES.INSTRUCTOR;

  const needsBranch = isAdmin;
  const branchSelected = branchId != null;

  useEffect(() => {
    if (!isDev) return;

    const onLogsChanged = () => setLogsTick((current) => current + 1);
    window.addEventListener(LOGS_EVENT, onLogsChanged);
    return () => window.removeEventListener(LOGS_EVENT, onLogsChanged);
  }, [isDev]);

  const devMetrics = useMemo(() => {
    const logs = isDev ? (getLogs() as LogEntry[]) : [];
    let warning = 0;
    let error = 0;

    for (const log of logs) {
      if (log.level === "warning") warning += 1;
      if (log.level === "error") error += 1;
    }

    const pendingRequests = requests.filter((request) => request.status === "pending").length;
    const approvedRequests = requests.filter((request) => request.status === "approved").length;

    return {
      totalLogs: logs.length,
      warning,
      error,
      pendingRequests,
      approvedRequests,
    };
  }, [isDev, logsTick, requests]);

  const quickActions = useMemo<DashboardAction[]>(() => {
    if (isDev) {
      return [
        {
          title: "Empresas",
          desc: "Creá la estructura empresarial base con ciudad, provincia y país para ordenar toda la plataforma.",
          to: "/app/companies",
          cta: "Gestionar empresas",
        },
        {
          title: "Sucursales",
          desc: "Vinculá nuevas sedes a una empresa activa y dejá la red operativa lista para administración.",
          to: "/app/branches",
          cta: "Gestionar sucursales",
        },
        {
          title: "Disciplinas",
          desc: "Mantené el catálogo global que luego se adapta por sucursal como oferta operativa.",
          to: "/app/disciplines",
          cta: "Abrir disciplinas",
        },
        {
          title: "Dev Panel",
          desc: "Revisá logs, métricas internas y señales útiles para el seguimiento técnico.",
          to: "/app/dev",
          cta: "Abrir Dev Panel",
        },
      ];
    }

    if (isAdmin) {
      return [
        {
          title: "Panel Admin",
          desc: "Entrá al workspace administrativo principal y seguí desde ahí.",
          to: "/app/admin",
          cta: "Abrir admin",
        },
        {
          title: "Horarios base",
          desc: "Definí la disponibilidad semanal para ordenar turnos y operación.",
          to: "/app/admin/horarios",
          cta: needsBranch && !branchSelected ? "Elegí sucursal primero" : "Configurar horarios",
          disabled: needsBranch && !branchSelected,
        },
        {
          title: "Membresías",
          desc: "Gestioná la oferta comercial de la sucursal activa.",
          to: "/app/admin/memberships",
          cta: needsBranch && !branchSelected ? "Elegí sucursal primero" : "Gestionar planes",
          disabled: needsBranch && !branchSelected,
        },
        {
          title: "Solicitudes",
          desc: "Gestioná la empresa y las sucursales ya creadas, y canalizá pedidos estructurales hacia Devs.",
          to: "/app/admin/requests",
          cta: "Ver requests",
        },
      ];
    }

    if (isInstructor) {
      return [
        {
          title: "Panel Instructor",
          desc: "Entrá a la agenda operativa y administrá la actividad de tu sucursal.",
          to: "/app/instructor",
          cta: "Abrir panel",
        },
        {
          title: "Rubros",
          desc: "Consultá servicios disponibles y validá el contexto operativo de la sede.",
          to: "/app/rubros",
          cta: "Ver rubros",
        },
        {
          title: "Sucursales",
          desc: "Elegí o revisá la sede activa antes de tomar nuevos turnos.",
          to: "/app/branches",
          cta: "Cambiar sucursal",
        },
        {
          title: "Mi perfil",
          desc: "Revisá tus datos y dejá tu cuenta lista para operar.",
          to: "/app/profile",
          cta: "Editar perfil",
        },
      ];
    }

    return [
      {
        title: "Membresías",
        desc: "Compará planes disponibles y consultá si esta sucursal ofrece clase particular.",
        to: "/app/memberships",
        cta: "Ver planes",
      },
      {
        title: "Mi perfil",
        desc: "Actualizá tus datos personales y mantené tu cuenta al día.",
        to: "/app/profile",
        cta: "Editar perfil",
      },
      {
        title: "Explorar rubros",
        desc: "Revisá servicios disponibles y seguí desde ahí con tu próxima reserva.",
        to: "/app/rubros",
        cta: "Ver rubros",
      },
      {
        title: "Sucursales",
        desc: "Consultá las sedes activas y elegí dónde querés operar.",
        to: "/app/branches",
        cta: "Ver sucursales",
      },
    ];
  }, [isAdmin, isDev, isInstructor, needsBranch, branchSelected]);

  return (
    <div className="space-y-7 lg:space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-500/12 bg-linear-to-br from-slate-950 via-zinc-950 to-slate-900 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.28)] md:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.14),transparent)]" />

        <div className="relative space-y-4">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/55">Panel principal</div>

          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl xl:text-[2rem]">
            Bienvenido{user?.name ? `, ${user.name}` : ""}.
          </h1>

          <p className="max-w-3xl text-sm text-zinc-300 md:text-base md:leading-7">
            Este punto de entrada prioriza accesos reales según tu rol para que no tengas botones vacíos ni desvíos innecesarios.
          </p>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <ContextBadge label="Rol" value={role} />
          <ContextBadge label="Empresa activa" value={companyId ?? "Sin seleccionar"} />
          <ContextBadge label="Sucursal activa" value={branchId ?? "Sin seleccionar"} />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Accesos rápidos</h2>
          <p className="text-sm text-zinc-500">Solo acciones que hoy tienen destino útil dentro de la aplicación.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <ActionCard key={`${action.title}-${action.to}`} {...action} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden border-zinc-800/90 bg-zinc-950/78 shadow-[0_18px_48px_rgba(2,6,23,0.22)]">
          <div className="h-24 bg-linear-to-r from-cyan-400/16 via-sky-400/8 to-transparent" />
          <CardContent className="relative -mt-2 space-y-3 py-5">
            <div className="text-sm font-semibold text-zinc-100">Estado del entorno</div>
            <div className="space-y-2 text-sm text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Empresa seleccionada</span>
                <span className="text-zinc-200">{companyId ?? "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sucursal seleccionada</span>
                <span className="text-zinc-200">{branchId ?? "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Panel prioritario</span>
                <span className="text-zinc-200">
                  {isDev ? "Dev" : isAdmin ? "Admin" : isInstructor ? "Instructor" : "Usuario"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-zinc-800/90 bg-zinc-950/78 shadow-[0_18px_48px_rgba(2,6,23,0.22)]">
          <div className={`h-24 bg-linear-to-r ${isDev ? "from-cyan-400/16 via-sky-400/8 to-transparent" : isAdmin ? "from-amber-400/16 via-orange-300/8 to-transparent" : "from-emerald-400/16 via-cyan-300/8 to-transparent"}`} />
          <CardContent className="relative -mt-2 space-y-4 py-5">
            <div className="text-sm font-semibold text-zinc-100">
              {isDev
                ? "Resumen técnico"
                : isAdmin
                  ? "Siguiente paso admin"
                  : isInstructor
                    ? "Siguiente paso instructor"
                    : "Siguiente paso recomendado"}
            </div>

            {isDev ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-zinc-500">Logs registrados</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-100">{devMetrics.totalLogs}</div>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-zinc-500">Requests pendientes</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-100">{devMetrics.pendingRequests}</div>
                  </div>
                </div>

                <DevMiniBars
                  values={[
                    { label: "Warnings", value: devMetrics.warning },
                    { label: "Errores", value: devMetrics.error },
                    { label: "Aprobadas", value: devMetrics.approvedRequests },
                  ]}
                />

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    to="/app/companies"
                    className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                  >
                    Crear empresas
                  </Link>
                  <Link
                    to="/app/branches"
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Crear sucursales
                  </Link>
                </div>
              </>
            ) : isAdmin ? (
              <>
                <div className="text-sm leading-6 text-zinc-400">
                  Tu recorrido principal hoy queda concentrado en administrar la empresa y las sucursales ya creadas: horarios, membresías, rubros y requests reales.
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    to="/app/admin"
                    className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                  >
                    Ir al panel admin
                  </Link>
                  <Link
                    to="/app/branches"
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Revisar sucursales
                  </Link>
                </div>
              </>
            ) : isInstructor ? (
              <>
                <div className="text-sm leading-6 text-zinc-400">
                  La mejor entrada para vos es el panel instructor con agenda, solicitudes y referencia operativa por sucursal.
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    to="/app/instructor"
                    className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                  >
                    Abrir panel instructor
                  </Link>
                  <Link
                    to="/app/branches"
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Cambiar sucursal
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm leading-6 text-zinc-400">
                  Revisá los planes disponibles para tu sucursal y después completá tu perfil para dejar tu cuenta lista.
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    to="/app/memberships"
                    className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                  >
                    Ver membresías
                  </Link>

                  <Link
                    to="/app/profile"
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Completar perfil
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}


