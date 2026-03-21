import { Link } from "react-router";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";

export default function AdminRubrosPage() {
  const { user } = useAuth();
  const { companyId } = useCompany();
  const { branchId } = useBranch();
  const hasBranch = branchId !== null;
  const isDev = user?.role === ROLES.DEVS;

  const managementActions = [
    {
      title: "Catalogo por sucursal",
      description:
        "Revisa que disciplinas se publican como rubros operativos, ajusta precio base y mantiene una configuracion consistente por sede.",
      to: "/app/rubros",
      cta: "Abrir catalogo operativo",
    },
    !isDev
      ? {
          title: "Nueva solicitud",
          description:
            "Canaliza pedidos para incorporar nuevas disciplinas al catalogo base o actualizar las existentes sin perder trazabilidad.",
          to: "/app/admin/requests/new",
          cta: "Crear solicitud",
        }
      : null,
    {
      title: "Bandeja administrativa",
      description: isDev
        ? "Seguimiento centralizado de todas las solicitudes enviadas por administracion."
        : "Seguimiento centralizado de las solicitudes enviadas y sus proximos pasos.",
      to: "/app/admin/requests",
      cta: "Ver solicitudes",
    },
  ].filter(Boolean) as { title: string; description: string; to: string; cta: string }[];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
          <div className="h-24 bg-linear-to-r from-amber-500/15 via-cyan-500/10 to-transparent" />
          <CardHeader className="relative -mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-zinc-700 bg-zinc-900/80 text-zinc-200">Rubros</Badge>
              <Badge className="border-zinc-800 bg-zinc-950/70 text-zinc-400">
                {hasBranch ? "Sucursal activa" : "Falta seleccionar sucursal"}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-2xl tracking-tight text-zinc-100 md:text-3xl">
                Catalogo operativo por sucursal
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                En este modulo administras como una disciplina base se transforma en oferta real dentro de una sede. El trabajo no es crear disciplinas nuevas, sino publicarlas con reglas claras por sucursal.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/65 px-4 py-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa</div>
              <div className="mt-2 text-base font-semibold text-zinc-100">{companyId ?? "Sin seleccionar"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/65 px-4 py-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal</div>
              <div className="mt-2 text-base font-semibold text-zinc-100">{branchId ?? "Pendiente"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/65 px-4 py-4 sm:col-span-2 xl:col-span-1">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Estado</div>
              <div className="mt-2 text-base font-semibold text-zinc-100">
                {hasBranch ? "Listo para configurar" : "Elige una sucursal para continuar"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader>
            <CardTitle>Lectura rapida del flujo</CardTitle>
            <CardDescription>
              Dejamos mucho mas clara la diferencia entre disciplina base, rubro operativo y solicitud administrativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              1. Disciplinas define el catalogo base de la plataforma.
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              2. Rubros publica esa disciplina dentro de una sucursal concreta.
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              3. Requests sirve para pedir altas o cambios cuando la base todavia no alcanza.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={`grid gap-4 ${managementActions.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {managementActions.map((action) => (
          <Card key={action.title} className="border-zinc-800 bg-zinc-950/80 transition hover:border-zinc-700 hover:bg-zinc-900/70">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100">{action.title}</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={action.to} className="block">
                <Button variant="secondary" className="w-full">
                  {action.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-zinc-800 bg-zinc-950/80">
        <CardHeader>
          <CardTitle>Recomendacion operativa</CardTitle>
          <CardDescription>
            Para evitar duplicaciones y confusion, la ampliacion del catalogo base deberia pasar por solicitud y despues publicarse por sucursal solo cuando este validada.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-6">
            {isDev
              ? "Desde aqui puedes revisar el catalogo por sucursal y controlar la bandeja completa de solicitudes enviadas por administracion."
              : "Si necesitas habilitar un nuevo rubro, primero registra la solicitud. Despues revisa el catalogo por sucursal y ajusta precio, duracion y visibilidad desde el flujo operativo principal."}
          </p>
          <div className="flex flex-wrap gap-2">
            {!isDev ? (
              <Link to="/app/admin/requests/new">
                <Button variant="primary">Solicitar nueva disciplina</Button>
              </Link>
            ) : null}
            <Link to="/app/rubros">
              <Button variant="ghost">Ir a catalogo por sucursal</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
