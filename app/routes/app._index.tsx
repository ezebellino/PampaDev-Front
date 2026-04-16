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
    "relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/96 p-5 shadow-[0_24px_60px_-40px_rgba(69,70,77,0.18)] transition duration-200";

  if (disabled) {
    return (
      <div className={`${base} opacity-70`}>
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-r from-stone-100 via-white to-transparent" />
        <div className="relative">
          <div className="text-base font-semibold tracking-tight text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{desc}</div>
          <div className="mt-5 inline-flex rounded-xl border border-slate-200 bg-stone-50 px-4 py-2 text-sm text-slate-500">{cta}</div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`${base} hover:-translate-y-1 hover:border-sky-200 hover:bg-[#fdfefe]`}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-r from-sky-100 via-lime-50 to-transparent" />
      <div className="relative">
        <div className="text-base font-semibold tracking-tight text-slate-900">{title}</div>
        <div className="mt-2 text-sm leading-6 text-slate-600">{desc}</div>
        <div className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
          {cta}
        </div>
      </div>
    </Link>
  );
}

function ContextBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 shadow-sm">
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function DevMiniBars({ values }: { values: { label: string; value: number }[] }) {
  const max = Math.max(...values.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {values.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{item.label}</span>
            <span className="text-slate-600">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-stone-200">
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
          desc: "Creá la estructura empresarial base para ordenar toda la plataforma.",
          to: "/app/companies",
          cta: "Gestionar empresas",
        },
        {
          title: "Sucursales",
          desc: "Vinculá nuevas sedes a una empresa activa y dejá la red lista para administrar.",
          to: "/app/branches",
          cta: "Gestionar sucursales",
        },
        {
          title: "Disciplinas",
          desc: "Mantené el catálogo general que luego se adapta por sucursal.",
          to: "/app/disciplines",
          cta: "Abrir disciplinas",
        },
        {
          title: "Solicitudes técnicas",
          desc: "Entrá al inbox propio de Devs para aprobar o rechazar pedidos de rubros enviados por administración.",
          to: "/app/dev/requests",
          cta: "Revisar solicitudes",
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
          desc: "Entrá al panel administrativo principal y seguí desde ahí.",
          to: "/app/admin",
          cta: "Abrir admin",
        },
        {
          title: "Horarios base",
          desc: "Definí la disponibilidad semanal para ordenar turnos y atención.",
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
          desc: "Gestioná solicitudes y pedidos importantes de la empresa.",
          to: "/app/admin/requests",
          cta: "Ver requests",
        },
      ];
    }

    if (isInstructor) {
      return [
        {
          title: "Panel Instructor",
          desc: "Entrá a tu agenda y administrá la actividad de tu sucursal.",
          to: "/app/instructor",
          cta: "Abrir panel",
        },
        {
          title: "Rubros",
          desc: "Consultá servicios disponibles de la sede activa.",
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
          desc: "Revisá tus datos y dejá tu cuenta lista.",
          to: "/app/profile",
          cta: "Editar perfil",
        },
      ];
    }

    return [
      {
        title: "Membresías",
        desc: "Compará planes disponibles y revisá si esta sucursal ofrece clase individual.",
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
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(239,244,255,0.94),rgba(255,255,255,0.98)_42%,rgba(236,253,245,0.9)_100%)] p-6 shadow-[0_28px_80px_-48px_rgba(69,70,77,0.2)] md:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(163,230,53,0.12),transparent_28%)]" />

        <div className="relative space-y-4">
          <div className="text-xs uppercase tracking-[0.24em] text-sky-700/70">Panel principal</div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl xl:text-[2rem]">
            Bienvenido{user?.name ? `, ${user.name}` : ""}.
          </h1>

          <p className="max-w-3xl text-sm text-slate-600 md:text-base md:leading-7">
            Este punto de entrada te muestra primero lo que más vas a usar según tu rol.
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
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Accesos rápidos</h2>
          <p className="text-sm text-stone-500">Solo acciones útiles para seguir dentro de la aplicación.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <ActionCard key={`${action.title}-${action.to}`} {...action} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden border-slate-200 bg-white/96 shadow-[0_24px_60px_-42px_rgba(69,70,77,0.18)]">
          <div className="h-24 bg-linear-to-r from-cyan-400/16 via-sky-400/8 to-transparent" />
          <CardContent className="relative -mt-2 space-y-3 py-5">
            <div className="text-sm font-semibold text-slate-900">Resumen actual</div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Empresa seleccionada</span>
                <span className="text-slate-800">{companyId ?? "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sucursal seleccionada</span>
                <span className="text-slate-800">{branchId ?? "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Panel prioritario</span>
                <span className="text-slate-800">
                  {isDev ? "Dev" : isAdmin ? "Admin" : isInstructor ? "Instructor" : "Usuario"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white/96 shadow-[0_24px_60px_-42px_rgba(69,70,77,0.18)]">
          <div className={`h-24 bg-linear-to-r ${isDev ? "from-cyan-400/16 via-sky-400/8 to-transparent" : isAdmin ? "from-amber-100 via-orange-50 to-transparent" : "from-emerald-100 via-sky-50 to-transparent"}`} />
          <CardContent className="relative -mt-2 space-y-4 py-5">
            <div className="text-sm font-semibold text-slate-900">
              {isDev
                ? "Resumen de actividad"
                : isAdmin
                  ? "Siguiente paso admin"
                  : isInstructor
                    ? "Siguiente paso instructor"
                    : "Siguiente paso recomendado"}
            </div>

            {isDev ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-stone-500">Logs registrados</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{devMetrics.totalLogs}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider text-stone-500">Requests pendientes</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{devMetrics.pendingRequests}</div>
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
                    to="/app/dev/requests"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Resolver solicitudes
                  </Link>
                  <Link
                    to="/app/companies"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-[#eff4ff]"
                  >
                    Crear empresas
                  </Link>
                  <Link
                    to="/app/branches"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-[#eff4ff]"
                  >
                    Crear sucursales
                  </Link>
                </div>
              </>
            ) : isAdmin ? (
              <>
                <div className="text-sm leading-6 text-slate-600">
                  Tu recorrido principal hoy pasa por sucursales, horarios, planes y solicitudes.
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    to="/app/admin"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Ir al panel admin
                  </Link>
                  <Link
                    to="/app/branches"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-[#eff4ff]"
                  >
                    Revisar sucursales
                  </Link>
                </div>
              </>
            ) : isInstructor ? (
              <>
                <div className="text-sm leading-6 text-slate-600">
                  La mejor entrada para vos es el panel instructor con agenda, solicitudes y referencia operativa por sucursal.
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    to="/app/instructor"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Abrir panel instructor
                  </Link>
                  <Link
                    to="/app/branches"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-[#eff4ff]"
                  >
                    Cambiar sucursal
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm leading-6 text-slate-600">
                  Revisá los planes disponibles para tu sucursal y después completá tu perfil.
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    to="/app/memberships"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Ver membresías
                  </Link>

                  <Link
                    to="/app/profile"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-[#eff4ff]"
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




