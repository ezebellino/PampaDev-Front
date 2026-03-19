import { useMemo } from "react";
import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import { useBranchMembershipCatalog } from "../lib/memberships/useBranchMembershipCatalog";
import { BILLING_CYCLE_OPTIONS } from "../lib/memberships/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

function getRecommendedPlanId(
  plans: Array<{
    idMembershipPlan: number;
    months: number;
    price: number;
    unlimited: boolean;
    classLimit: number | null;
  }>
) {
  if (plans.length === 0) return null;

  const sorted = [...plans].sort((a, b) => {
    const aScore = (a.unlimited ? 1000 : a.classLimit ?? 0) + a.months * 10 - a.price / 10000;
    const bScore = (b.unlimited ? 1000 : b.classLimit ?? 0) + b.months * 10 - b.price / 10000;
    return bScore - aScore;
  });

  return sorted[0]?.idMembershipPlan ?? null;
}

export default function MembershipsPage() {
  const { branchId } = useBranch();
  const { data: branches } = useBranches();
  const { disciplines, loading: disciplinesLoading } = useDisciplines();
  const { data, loading, error: catalogError } = useBranchMembershipCatalog(branchId);

  const activeBranch = useMemo(() => {
    if (branchId == null || !branches) return null;
    return branches.find((branch) => branch.idBranch === branchId) ?? null;
  }, [branchId, branches]);

  const visiblePlans = useMemo(() => {
    return (data?.plans ?? []).filter((plan) => plan.isActive && plan.isVisible);
  }, [data]);

  const disciplineNameMap = useMemo(() => {
    return new Map(disciplines.map((discipline) => [discipline.idDiscipline, discipline.name]));
  }, [disciplines]);

  const recommendedPlanId = useMemo(() => getRecommendedPlanId(visiblePlans), [visiblePlans]);

  if (branchId == null) {
    return (
      <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <div className="space-y-6">
          <PageHeader
            title="Membresías"
            subtitle="Elegí una sucursal para ver los planes disponibles y la opción de clase particular."
          />
          <Card>
            <CardContent className="py-6 text-sm text-zinc-400">No hay una sucursal activa seleccionada.</CardContent>
          </Card>
        </div>
      </Protected>
    );
  }

  if (loading || disciplinesLoading) {
    return (
      <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <ScreenLoader
          title="Cargando membresías..."
          subtitle="Estamos preparando la oferta comercial disponible para esta sucursal."
        />
      </Protected>
    );
  }

  const privateClass = data?.privateClass;
  const hasPrivateClass = Boolean(privateClass?.enabled && privateClass?.isActive);

  return (
    <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
      <div className="space-y-6">
        <PageHeader
          title="Membresías"
          subtitle={
            activeBranch
              ? `Conocé los planes disponibles en ${activeBranch.companyName} · ${activeBranch.cityName}.`
              : `Conocé los planes disponibles para la sucursal ${branchId}.`
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Sucursal</div>
              <div className="mt-3 text-lg font-semibold text-zinc-100">{activeBranch?.cityName ?? `#${branchId}`}</div>
              <div className="mt-1 text-sm text-zinc-400">{activeBranch?.companyName ?? "Contexto actual"}</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Planes visibles</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{visiblePlans.length}</div>
              <div className="mt-1 text-sm text-zinc-400">Opciones listas para contratar</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Clase particular</div>
              <div className="mt-3 text-2xl font-semibold text-zinc-100">{hasPrivateClass ? "Disponible" : "No disponible"}</div>
              <div className="mt-1 text-sm text-zinc-400">Alternativa para reservar sin plan</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Plan sugerido</div>
              <div className="mt-3 text-lg font-semibold text-zinc-100">
                {recommendedPlanId ? "Recomendado en la grilla" : "Sin sugerencia todavía"}
              </div>
              <div className="mt-1 text-sm text-zinc-400">Destacado automático según duración y propuesta del plan</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
            <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
            <CardHeader className="relative -mt-4">
              <CardTitle>Planes disponibles</CardTitle>
              <CardDescription>
                Propuesta comercial visible para esta sucursal. Elegí la modalidad que mejor acompañe tu frecuencia de entrenamiento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visiblePlans.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {visiblePlans.map((plan) => {
                    const isRecommended = plan.idMembershipPlan === recommendedPlanId;

                    return (
                      <article
                        key={plan.idMembershipPlan}
                        className={[
                          "group relative overflow-hidden rounded-3xl border transition duration-300 hover:-translate-y-1",
                          isRecommended
                            ? "border-cyan-400/40 bg-zinc-900/80 shadow-sm hover:border-cyan-300/50"
                            : "border-zinc-800 bg-zinc-900/45 hover:border-cyan-500/30 hover:bg-zinc-900/70",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "pointer-events-none absolute inset-0 bg-linear-to-br via-transparent to-transparent transition duration-300",
                            isRecommended ? "from-cyan-500/14 opacity-100" : "from-cyan-500/10 opacity-70 group-hover:opacity-100",
                          ].join(" ")}
                        />
                        <div
                          className={[
                            "pointer-events-none absolute -left-16 top-0 h-40 w-32 rotate-12 bg-linear-to-b from-cyan-300/18 to-transparent blur-2xl transition duration-500",
                            isRecommended ? "translate-x-6 opacity-100" : "opacity-0 group-hover:translate-x-8 group-hover:opacity-100",
                          ].join(" ")}
                        />
                        <div
                          className={[
                            "pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-cyan-200/60 to-transparent transition duration-300",
                            isRecommended ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                          ].join(" ")}
                        />

                        {isRecommended ? (
                          <div className="absolute right-4 top-4 z-10 rounded-full border border-cyan-300/30 bg-cyan-400/12 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-cyan-100">
                            Recomendado
                          </div>
                        ) : null}

                        <div className="relative">
                          <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-3 pr-28">
                              <div>
                                <CardTitle className="text-lg text-zinc-100 transition duration-300 group-hover:text-white">{plan.name}</CardTitle>
                                <CardDescription className="mt-1 text-sm text-zinc-400">
                                  {plan.description || "Plan pensado para acompañar tu ritmo de clases."}
                                </CardDescription>
                              </div>
                              <Badge tone="success">{BILLING_CYCLE_OPTIONS.find((item) => item.value === plan.billingCycle)?.label}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm text-zinc-300">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 transition duration-300 group-hover:border-cyan-500/20 group-hover:bg-zinc-950">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Precio</div>
                                <div className="mt-2 text-zinc-100">{formatMoney(plan.price)}</div>
                              </div>
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 transition duration-300 group-hover:border-cyan-500/20 group-hover:bg-zinc-950">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Duración</div>
                                <div className="mt-2 text-zinc-100">{plan.months} mes{plan.months === 1 ? "" : "es"}</div>
                              </div>
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 transition duration-300 group-hover:border-cyan-500/20 group-hover:bg-zinc-950">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Modalidad</div>
                                <div className="mt-2 text-zinc-100">{plan.unlimited ? "Ilimitado" : `${plan.classLimit ?? 0} clases`}</div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 transition duration-300 group-hover:border-cyan-500/20 group-hover:bg-zinc-950">
                              <div className="text-xs uppercase tracking-wider text-zinc-500">Incluye</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {plan.disciplineIds.length > 0 ? (
                                  plan.disciplineIds.map((idDiscipline) => (
                                    <Badge key={idDiscipline} tone="neutral">{disciplineNameMap.get(idDiscipline) ?? `Disciplina ${idDiscipline}`}</Badge>
                                  ))
                                ) : (
                                  <span className="text-zinc-400">Sin disciplinas informadas</span>
                                )}
                              </div>
                            </div>

                            {plan.benefits ? (
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 transition duration-300 group-hover:border-cyan-500/20 group-hover:bg-zinc-950">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Beneficios</div>
                                <div className="mt-2 leading-6 text-zinc-100">{plan.benefits}</div>
                              </div>
                            ) : null}

                            <Button className="w-full transition duration-300 group-hover:bg-white" disabled>
                              Próximamente vas a poder contratar este plan
                            </Button>
                          </CardContent>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-5 text-sm text-zinc-400">
                  Esta sucursal todavía no tiene planes visibles configurados.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-zinc-800 bg-zinc-950/80">
              <CardHeader>
                <CardTitle>Clase particular</CardTitle>
                <CardDescription>
                  Alternativa para quienes prefieren pagar una clase puntual en lugar de adherirse a un plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-zinc-300">
                {hasPrivateClass && privateClass ? (
                  <>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                      <div className="text-xs uppercase tracking-wider text-zinc-500">Precio</div>
                      <div className="mt-2 text-lg font-semibold text-zinc-100">{formatMoney(privateClass.price)}</div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                      <div className="text-xs uppercase tracking-wider text-zinc-500">Duración</div>
                      <div className="mt-2 text-zinc-100">{privateClass.duration} min</div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                      <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {privateClass.disciplineIds.length > 0 ? (
                          privateClass.disciplineIds.map((idDiscipline) => (
                            <Badge key={idDiscipline} tone="neutral">{disciplineNameMap.get(idDiscipline) ?? `Disciplina ${idDiscipline}`}</Badge>
                          ))
                        ) : (
                          <span className="text-zinc-400">Disponible según coordinación con la sede</span>
                        )}
                      </div>
                    </div>
                    {privateClass.notes ? (
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-zinc-400">
                        {privateClass.notes}
                      </div>
                    ) : null}
                    <Button variant="secondary" className="w-full" disabled>
                      Próximamente vas a poder reservar una clase particular
                    </Button>
                  </>
                ) : (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-5 text-zinc-400">
                    Por ahora no hay una opción de clase particular visible para esta sucursal.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950/80">
              <CardHeader>
                <CardTitle>Cómo seguir</CardTitle>
                <CardDescription>
                  Mientras se completa la contratación online, esta vista te ayuda a comparar la oferta disponible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-400">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                  1. Elegí una sucursal activa para ver su oferta real.
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                  2. Compará planes, beneficios y disciplinas incluidas.
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                  3. Próximamente se podrá contratar o reservar desde este mismo flujo.
                </div>
                <Link
                  to="/app/rubros"
                  className="block rounded-2xl border border-zinc-800 px-4 py-3 text-center text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  Ver rubros disponibles
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Protected>
  );
}
