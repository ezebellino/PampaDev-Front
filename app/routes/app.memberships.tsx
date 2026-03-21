
import { useMemo } from "react";
import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useBranches } from "../lib/api/hooks/useBranches";
import { useBranch } from "../lib/branches/BranchContext";
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
  const { data, loading, error: catalogError, syncMode } = useBranchMembershipCatalog(branchId);

  const activeBranch = useMemo(() => {
    if (branchId == null || !branches) return null;
    return branches.find((branch) => branch.idBranch === branchId) ?? null;
  }, [branchId, branches]);

  const visiblePlans = useMemo(() => {
    return (data?.plans ?? []).filter((plan) => plan.isActive && plan.isVisible);
  }, [data]);

  const syncedPlans = useMemo(() => visiblePlans.filter((plan) => plan.syncSource === "api").length, [visiblePlans]);

  const disciplineNameMap = useMemo(() => {
    return new Map(disciplines.map((discipline) => [discipline.idDiscipline, discipline.name]));
  }, [disciplines]);

  const recommendedPlanId = useMemo(() => getRecommendedPlanId(visiblePlans), [visiblePlans]);
  const privateClass = data?.privateClass;
  const hasPrivateClass = Boolean(privateClass?.enabled && privateClass?.isActive);

  if (branchId == null) {
    return (
      <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <div className="space-y-6">
          <PageHeader
            title="Membresias"
            subtitle="Elige una sucursal para ver los planes disponibles y la opcion de clase particular."
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
          title="Cargando membresias..."
          subtitle="Estamos preparando la oferta comercial disponible para esta sucursal."
        />
      </Protected>
    );
  }

  if (catalogError) {
    return (
      <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <div className="space-y-6">
          <PageHeader
            title="Membresias"
            subtitle="No pudimos cargar la oferta disponible para esta sucursal."
          />
          <Card>
            <CardContent className="py-6 text-sm text-red-300">{catalogError.message}</CardContent>
          </Card>
        </div>
      </Protected>
    );
  }

  return (
    <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
      <div className="space-y-6">
        <PageHeader
          title="Membresias"
          subtitle={
            activeBranch
              ? `Conoce los planes disponibles en ${activeBranch.companyName} · ${activeBranch.cityName}.`
              : `Conoce los planes disponibles para la sucursal ${branchId}.`
          }
        />

        <Card className="border-sky-500/15 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_38%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))]">
          <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Oferta activa</div>
              <div className="max-w-2xl text-2xl font-semibold leading-tight text-white">
                Elige el plan que mejor acompane tu frecuencia de entrenamiento.
              </div>
              <p className="max-w-3xl text-sm leading-6 text-zinc-300">
                Esta vista ya toma el nucleo de memberships desde la API. Algunos detalles comerciales siguen completandose desde el frontend para que la experiencia sea mas clara mientras el backend termina de expandirse.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="success">{visiblePlans.length} planes visibles</Badge>
                <Badge tone="neutral">{syncedPlans} sincronizados con API</Badge>
                <Badge tone={hasPrivateClass ? "success" : "warning"}>
                  {hasPrivateClass ? "Clase particular disponible" : "Sin clase particular"}
                </Badge>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-zinc-400">Sucursal</div>
                <div className="mt-2 text-lg font-semibold text-white">{activeBranch?.cityName ?? `#${branchId}`}</div>
                <div className="mt-1 text-sm text-zinc-400">{activeBranch?.companyName ?? "Contexto actual"}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-zinc-400">Estado de sync</div>
                <div className="mt-2 text-sm font-medium text-white">
                  {syncMode === "api+local" ? "API activa + detalles de experiencia" : "Fallback local temporal"}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-zinc-400">Plan sugerido</div>
                <div className="mt-2 text-sm font-medium text-white">
                  {recommendedPlanId ? "Marcado en la grilla" : "Sin sugerencia por ahora"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Planes visibles</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{visiblePlans.length}</div>
              <div className="mt-1 text-sm text-zinc-400">Opciones listas para consultar</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Sincronizados</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{syncedPlans}</div>
              <div className="mt-1 text-sm text-zinc-400">Planes respaldados por API</div>
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
                {recommendedPlanId ? "Recomendado en la grilla" : "Sin sugerencia todavia"}
              </div>
              <div className="mt-1 text-sm text-zinc-400">Balance entre duracion, cupo y precio</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
            <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
            <CardHeader className="relative -mt-4">
              <CardTitle>Planes disponibles</CardTitle>
              <CardDescription>
                Compara modalidad, disciplinas y beneficios para encontrar la opcion que mejor encaja con tu ritmo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visiblePlans.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {visiblePlans.map((plan) => {
                    const isRecommended = plan.idMembershipPlan === recommendedPlanId;
                    const cycleLabel = BILLING_CYCLE_OPTIONS.find((item) => item.value === plan.billingCycle)?.label;
                    const visibleDisciplines = plan.disciplineIds.length;

                    return (
                      <article
                        key={plan.idMembershipPlan}
                        className={[
                          "group relative overflow-hidden rounded-[1.9rem] border transition duration-300 hover:-translate-y-1",
                          isRecommended
                            ? "border-cyan-400/40 bg-zinc-900/85 shadow-[0_22px_60px_rgba(34,211,238,0.10)]"
                            : "border-zinc-800 bg-zinc-900/45 hover:border-cyan-500/30 hover:bg-zinc-900/70",
                        ].join(" ")}
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(56,189,248,0.14),transparent_42%,transparent)]" />
                        <div className="relative">
                          <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-3 pr-20">
                              <div>
                                <CardTitle className="text-lg text-zinc-100 transition duration-300 group-hover:text-white">{plan.name}</CardTitle>
                                <CardDescription className="mt-1 text-sm text-zinc-400">
                                  {plan.description || "Plan pensado para acompanar tu ritmo de clases."}
                                </CardDescription>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge tone="success">{cycleLabel}</Badge>
                                <Badge tone={plan.syncSource === "api" ? "success" : "neutral"}>
                                  {plan.syncSource === "api" ? "API" : "Local"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm text-zinc-300">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Precio</div>
                                <div className="mt-2 text-zinc-100">{formatMoney(plan.price)}</div>
                              </div>
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Duracion</div>
                                <div className="mt-2 text-zinc-100">{plan.months} mes{plan.months === 1 ? "" : "es"}</div>
                              </div>
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Modalidad</div>
                                <div className="mt-2 text-zinc-100">{plan.unlimited ? "Ilimitado" : `${plan.classLimit ?? 0} clases`}</div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3">
                              <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {visibleDisciplines > 0 ? (
                                  plan.disciplineIds.map((idDiscipline) => (
                                    <Badge key={idDiscipline} tone="neutral">
                                      {disciplineNameMap.get(idDiscipline) ?? `Disciplina ${idDiscipline}`}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-zinc-400">
                                    {plan.disciplinesCount > 0
                                      ? `${plan.disciplinesCount} disciplina${plan.disciplinesCount === 1 ? "" : "s"} cargadas`
                                      : "Sin disciplinas informadas"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {plan.benefits ? (
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3">
                                <div className="text-xs uppercase tracking-wider text-zinc-500">Beneficios</div>
                                <div className="mt-2 leading-6 text-zinc-100">{plan.benefits}</div>
                              </div>
                            ) : null}

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button className="w-full transition duration-300 group-hover:bg-white" disabled>
                                Proximamente podras contratar este plan
                              </Button>
                              {isRecommended ? (
                                <div className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-center text-xs font-medium uppercase tracking-widest text-cyan-100 sm:w-auto">
                                  Recomendado
                                </div>
                              ) : null}
                            </div>
                          </CardContent>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-5 text-sm text-zinc-400">
                  Esta sucursal todavia no tiene planes visibles configurados.
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
                      <div className="text-xs uppercase tracking-wider text-zinc-500">Duracion</div>
                      <div className="mt-2 text-zinc-100">{privateClass.duration} min</div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                      <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {privateClass.disciplineIds.length > 0 ? (
                          privateClass.disciplineIds.map((idDiscipline) => (
                            <Badge key={idDiscipline} tone="neutral">
                              {disciplineNameMap.get(idDiscipline) ?? `Disciplina ${idDiscipline}`}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-zinc-400">Disponible segun coordinacion con la sede</span>
                        )}
                      </div>
                    </div>
                    {privateClass.notes ? (
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-zinc-400">
                        {privateClass.notes}
                      </div>
                    ) : null}
                    <Button variant="secondary" className="w-full" disabled>
                      Proximamente podras reservar una clase particular
                    </Button>
                  </>
                ) : (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-5 text-zinc-400">
                    Por ahora no hay una opcion de clase particular visible para esta sucursal.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950/80">
              <CardHeader>
                <CardTitle>Como seguir</CardTitle>
                <CardDescription>
                  Mientras se completa la contratacion online, esta vista te ayuda a comparar la oferta real de la sede.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-400">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                  1. Elige una sucursal activa para ver su oferta real.
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                  2. Compara planes, beneficios y disciplinas incluidas.
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                  3. Muy pronto vas a poder contratar o reservar desde este mismo flujo.
                </div>
                <Link
                  to="/app/rubros"
                  className="block rounded-2xl border border-zinc-800 px-4 py-3 text-center text-sm text-zinc-200 transition hover:bg-zinc-900"
                >
                  Ver oferta por rubros
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Protected>
  );
}
