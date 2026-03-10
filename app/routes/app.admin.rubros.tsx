import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";

const MANAGEMENT_ACTIONS = [
  {
    title: "Catálogo por sucursal",
    description:
      "Revisá qué rubros están visibles, ajustá precio base y mantené una configuración consistente por sede.",
    to: "/app/rubros",
    cta: "Abrir catálogo operativo",
  },
  {
    title: "Nuevas solicitudes",
    description:
      "Canalizá pedidos para incorporar rubros o actualizar los existentes sin perder trazabilidad.",
    to: "/app/admin/solicitudes/nueva",
    cta: "Crear solicitud",
  },
  {
    title: "Bandeja administrativa",
    description: "Seguimiento centralizado de solicitudes, estados y próximos pasos del equipo.",
    to: "/app/admin/solicitudes",
    cta: "Ver solicitudes",
  },
];

export default function AdminRubrosPage() {
  const { companyId } = useCompany();
  const { branchId } = useBranch();
  const hasBranch = branchId !== null;

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
                Gestión del catálogo administrativo
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Ordená el crecimiento del catálogo, revisá qué servicios están listos para publicarse y
                mantené alineada la operación entre sucursales.
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
                {hasBranch ? "Listo para configurar" : "Elegí una sucursal para continuar"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader>
            <CardTitle>Qué podés hacer desde acá</CardTitle>
            <CardDescription>
              Unificamos los accesos clave para que el equipo administrativo no tenga que navegar a ciegas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              Ajustar visibilidad y parámetros por sucursal.
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              Crear solicitudes para nuevos servicios o cambios operativos.
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              Coordinar horarios y publicación desde un flujo más claro.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {MANAGEMENT_ACTIONS.map((action) => (
          <Card
            key={action.title}
            className="border-zinc-800 bg-zinc-950/80 transition hover:border-zinc-700 hover:bg-zinc-900/70"
          >
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
          <CardTitle>Recomendación operativa</CardTitle>
          <CardDescription>
            Para mantener el desempeño del sistema y evitar inconsistencias, el catálogo general debería crecer
            por solicitud y publicarse por sucursal solo cuando esté validado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-6">
            Si necesitás habilitar un nuevo rubro, primero registrá la solicitud. Después revisá el catálogo
            por sucursal y ajustá precio, duración y visibilidad en el flujo operativo principal.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/app/admin/solicitudes/nueva">
              <Button variant="primary">Solicitar nuevo rubro</Button>
            </Link>
            <Link to="/app/rubros">
              <Button variant="ghost">Ir a catálogo por sucursal</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
