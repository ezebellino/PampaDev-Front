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
      title: "Catálogo por sucursal",
      description:
        "Revisá qué disciplinas se publican como rubros operativos, ajustá precio base y mantené una configuración consistente por sede.",
      to: "/app/rubros",
      cta: "Abrir catálogo operativo",
    },
    !isDev
      ? {
          title: "Nueva solicitud",
          description:
            "Canalizá pedidos para incorporar nuevas disciplinas al catálogo base o actualizar las existentes sin perder trazabilidad.",
          to: "/app/admin/requests/new",
          cta: "Crear solicitud",
        }
      : null,
    {
      title: "Bandeja administrativa",
      description: isDev
        ? "Seguimiento centralizado de todas las solicitudes enviadas por administración."
        : "Seguimiento centralizado de las solicitudes enviadas y sus próximos pasos.",
      to: "/app/admin/requests",
      cta: "Ver solicitudes",
    },
  ].filter(Boolean) as { title: string; description: string; to: string; cta: string }[];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <div className="h-24 bg-linear-to-r from-amber-100 via-sky-50 to-transparent" />
          <CardHeader className="relative -mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">Rubros</Badge>
              <Badge tone={hasBranch ? "success" : "warning"}>
                {hasBranch ? "Sucursal activa" : "Falta seleccionar sucursal"}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-2xl tracking-tight text-slate-900 md:text-3xl">
                Catálogo operativo por sucursal
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                En este módulo administrás cómo una disciplina base se transforma en oferta real dentro de una sede.
                El trabajo no es crear disciplinas nuevas, sino publicarlas con reglas claras por sucursal.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
              <div className="text-xs uppercase tracking-wider text-stone-500">Empresa</div>
              <div className="mt-2 text-base font-semibold text-slate-900">{companyId ?? "Sin seleccionar"}</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
              <div className="text-xs uppercase tracking-wider text-stone-500">Sucursal</div>
              <div className="mt-2 text-base font-semibold text-slate-900">{branchId ?? "Pendiente"}</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 sm:col-span-2 xl:col-span-1">
              <div className="text-xs uppercase tracking-wider text-stone-500">Estado</div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {hasBranch ? "Listo para configurar" : "Elegí una sucursal para continuar"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardHeader>
            <CardTitle>Cómo funciona este flujo</CardTitle>
            <CardDescription>
              La diferencia entre disciplina base, rubro operativo y solicitud queda clara en una sola lectura.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              1. Disciplinas define el catálogo base de la plataforma.
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              2. Rubros publica esa disciplina dentro de una sucursal concreta.
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              3. Solicitudes sirve para pedir altas o cambios cuando la base todavía no alcanza.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={`grid gap-4 ${managementActions.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {managementActions.map((action) => (
          <Card
            key={action.title}
            className="border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)] transition hover:border-sky-200 hover:bg-white"
          >
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">{action.title}</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">{action.description}</CardDescription>
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

    </div>
  );
}
