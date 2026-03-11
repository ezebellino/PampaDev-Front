import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";

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

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Tu espacio de gestión</CardTitle>
              <CardDescription>
                La idea es que desde acá encuentres lo esencial sin ruido técnico ni pasos innecesarios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-zinc-400">
              <p>
                Podés revisar tus datos, comparar planes de membresía, entrar al catálogo de servicios y ubicar rápidamente la sucursal con
                la que querés operar.
              </p>
              <p>
                A medida que el producto crezca, este panel puede incorporar historial, reservas activas y
                accesos personalizados para cada usuario.
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Siguiente paso recomendado</CardTitle>
              <CardDescription>
                Si recién ingresaste, empezá por revisar qué planes ofrece tu sucursal y después completá tu perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/app/memberships"
                className="block rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-zinc-950 hover:bg-white"
              >
                Ver membresías disponibles
              </Link>
              <Link
                to="/app/profile"
                className="block rounded-2xl border border-zinc-800 px-4 py-3 text-center text-sm text-zinc-200 hover:bg-zinc-900"
              >
                Completar mi perfil
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </Protected>
  );
}
