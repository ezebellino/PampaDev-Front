import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";

const INSTRUCTOR_ACTIONS = [
  {
    title: "Rubros activos",
    description: "Consultá la oferta disponible y usala como punto de partida para la operación diaria.",
    to: "/app/rubros",
    cta: "Ver rubros",
  },
  {
    title: "Mi perfil",
    description: "Mantené tus datos actualizados y ordená la información de tu cuenta.",
    to: "/app/profile",
    cta: "Actualizar perfil",
  },
  {
    title: "Sucursales",
    description: "Verificá el contexto de trabajo y la sede activa antes de avanzar con la agenda.",
    to: "/app/branches",
    cta: "Revisar sucursales",
  },
];

function InstructorActionCard({
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
        <div className="text-lg font-semibold tracking-tight text-zinc-100">{title}</div>
        <div className="text-sm leading-6 text-zinc-400">{description}</div>
        <div className="inline-flex rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition group-hover:border-zinc-600 group-hover:bg-zinc-800">
          {cta}
        </div>
      </div>
    </Link>
  );
}

export default function Instructor() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();
  const hasBranch = branchId !== null;

  return (
    <Protected allowRoles={[ROLES.INSTRUCTOR, ROLES.DEVS]}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 md:p-8">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Panel instructor</div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
                Gestión operativa de agenda y servicio
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Este espacio organiza los accesos más útiles para trabajar con la sede activa, revisar el
                catálogo y mantener una experiencia clara tanto para el equipo como para los usuarios.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Instructor</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{user?.name ?? "Cuenta activa"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Rol</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{user?.role ?? ROLES.INSTRUCTOR}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{companyId ?? "Sin seleccionar"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">{branchId ?? "Pendiente"}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {INSTRUCTOR_ACTIONS.map((action) => (
            <InstructorActionCard key={action.title} {...action} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Contexto de trabajo</CardTitle>
              <CardDescription>
                La sucursal activa define qué catálogo y qué configuraciones conviene revisar antes de avanzar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-zinc-400">
              <p>
                Si trabajás en más de una sede, conviene verificar siempre el contexto actual para evitar
                confusiones con disponibilidad, oferta o configuración operativa.
              </p>
              <p>
                Aunque todavía no exista un módulo completo de agenda para instructores, este panel ya te deja
                entrar rápido a los puntos más relevantes del flujo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Siguiente paso recomendado</CardTitle>
              <CardDescription>
                {hasBranch
                  ? "Con la sucursal activa lista, podés revisar rubros y continuar con tu operación diaria."
                  : "Antes de seguir, elegí la sucursal con la que vas a trabajar para ordenar el contexto."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to={hasBranch ? "/app/rubros" : "/app/branches"}
                className="block rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-zinc-950 hover:bg-white"
              >
                {hasBranch ? "Ir a rubros" : "Elegir sucursal"}
              </Link>
              <Link
                to="/app/profile"
                className="block rounded-2xl border border-zinc-800 px-4 py-3 text-center text-sm text-zinc-200 hover:bg-zinc-900"
              >
                Revisar mi perfil
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </Protected>
  );
}
