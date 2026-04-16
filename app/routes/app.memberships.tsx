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
  const { data, loading, error: catalogError } = useBranchMembershipCatalog(branchId);

  const activeBranch = useMemo(() => {
    if (branchId == null || !branches) return null;
    return branches.find((branch) => branch.idBranch === branchId) ?? null;
  }, [branchId, branches]);

  const visiblePlans = useMemo(() => {
    return (data?.plans ?? []).filter((plan) => plan.isActive && plan.isVisible);
  }, [data]);

  const apiLinkedPlans = useMemo(() => visiblePlans.filter((plan) => plan.syncSource === "api").length, [visiblePlans]);

  const disciplineNameMap = useMemo(() => {
    return new Map(disciplines.map((discipline) => [discipline.idDiscipline, discipline.name]));
  }, [disciplines]);

  const recommendedPlanId = useMemo(() => getRecommendedPlanId(visiblePlans), [visiblePlans]);
  const planGridClass = useMemo(() => (visiblePlans.length <= 1 ? "mx-auto max-w-3xl" : "grid gap-5 xl:grid-cols-2"), [visiblePlans.length]);
  const privateClass = data?.privateClass;
  const hasPrivateClass = Boolean(privateClass?.enabled && privateClass?.isActive);

  if (branchId == null) {
    return (
      <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <div className="space-y-6">
          <PageHeader title="Membresías" subtitle="Elegí una sucursal para ver los planes disponibles y la opción de clase individual." />
          <Card>
            <CardContent className="py-6 text-sm text-stone-500">No hay una sucursal activa seleccionada.</CardContent>
          </Card>
        </div>
      </Protected>
    );
  }

  if (loading || disciplinesLoading) {
    return (
      <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <ScreenLoader title="Cargando membresías..." subtitle="Estamos preparando la oferta disponible para esta sucursal." />
      </Protected>
    );
  }

  if (catalogError) {
    return (
      <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
        <div className="space-y-6">
          <PageHeader title="Membresías" subtitle="No pudimos cargar la oferta disponible para esta sucursal." />
          <Card>
            <CardContent className="py-6 text-sm text-rose-700">{catalogError.message}</CardContent>
          </Card>
        </div>
      </Protected>
    );
  }

  return (
    <Protected allowRoles={[ROLES.USER, ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.DEVS]}>
      <div className="space-y-6">
        <PageHeader
          title="Membresías"
          subtitle={activeBranch ? `Conocé los planes disponibles en ${activeBranch.companyName} · ${activeBranch.cityName}.` : `Conocé los planes disponibles para la sucursal ${branchId}.`}
        />

        <Card className="border-slate-200/70 bg-[linear-gradient(135deg,rgba(239,244,255,0.94),rgba(255,255,255,0.98)_44%,rgba(236,253,245,0.9)_100%)] shadow-[0_28px_80px_-48px_rgba(69,70,77,0.2)]">
          <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.24em] text-sky-700/75">Oferta activa</div>
              <div className="max-w-2xl text-2xl font-semibold leading-tight text-slate-900">Elegí el plan que mejor acompañe tu frecuencia de entrenamiento.</div>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">Compará precios, duración y disciplinas incluidas para elegir la opción que mejor te sirva.</p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="success">{visiblePlans.length} planes visibles</Badge>
                <Badge tone="neutral">{apiLinkedPlans} planes con API</Badge>
                <Badge tone={hasPrivateClass ? "success" : "warning"}>{hasPrivateClass ? "Clase individual disponible" : "Sin clase individual"}</Badge>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-slate-200 bg-white/88 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-stone-500">Sucursal</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{activeBranch?.cityName ?? `#${branchId}`}</div>
                <div className="mt-1 text-sm text-stone-500">{activeBranch?.companyName ?? "Contexto actual"}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/88 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-stone-500">Estado</div>
                <div className="mt-2 text-sm font-medium text-slate-900">Planes visibles para esta sucursal</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/88 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-stone-500">Plan sugerido</div>
                <div className="mt-2 text-sm font-medium text-slate-900">{recommendedPlanId ? "Recomendado en la lista" : "Sin sugerencia por ahora"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]"><CardContent className="py-5"><div className="text-xs uppercase tracking-wider text-stone-500">Planes visibles</div><div className="mt-3 text-3xl font-semibold text-slate-900">{visiblePlans.length}</div><div className="mt-1 text-sm text-stone-500">Opciones listas para consultar</div></CardContent></Card>
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]"><CardContent className="py-5"><div className="text-xs uppercase tracking-wider text-stone-500">Planes con API</div><div className="mt-3 text-3xl font-semibold text-slate-900">{apiLinkedPlans}</div><div className="mt-1 text-sm text-stone-500">Planes visibles ya vinculados con backend</div></CardContent></Card>
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]"><CardContent className="py-5"><div className="text-xs uppercase tracking-wider text-stone-500">Clase individual</div><div className="mt-3 text-2xl font-semibold text-slate-900">{hasPrivateClass ? "Disponible" : "No disponible"}</div><div className="mt-1 text-sm text-stone-500">Alternativa para reservar sin plan</div></CardContent></Card>
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]"><CardContent className="py-5"><div className="text-xs uppercase tracking-wider text-stone-500">Plan sugerido</div><div className="mt-3 text-lg font-semibold text-slate-900">{recommendedPlanId ? "Recomendado en la lista" : "Sin sugerencia todavía"}</div><div className="mt-1 text-sm text-stone-500">Una ayuda rápida para empezar a comparar</div></CardContent></Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <div className="h-20 bg-linear-to-r from-sky-100 via-lime-50 to-transparent" />
            <CardHeader className="relative -mt-4">
              <CardTitle>Planes disponibles</CardTitle>
              <CardDescription>Compará modalidad, disciplinas y beneficios para encontrar la opción que mejor encaja con tu ritmo.</CardDescription>
            </CardHeader>
            <CardContent>
              {visiblePlans.length > 0 ? (
                <div className={planGridClass}>
                  {visiblePlans.map((plan) => {
                    const isRecommended = plan.idMembershipPlan === recommendedPlanId;
                    const cycleLabel = BILLING_CYCLE_OPTIONS.find((item) => item.value === plan.billingCycle)?.label;
                    const visibleDisciplines = plan.disciplineIds.length;

                    return (
                      <article
                        key={plan.idMembershipPlan}
                        className={[
                          "group relative h-full overflow-hidden rounded-[1.9rem] border bg-white transition duration-300 hover:-translate-y-1",
                          isRecommended ? "border-sky-200 bg-[#eff4ff] shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]" : "border-slate-200 hover:border-sky-200",
                        ].join(" ")}
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(224,242,254,0.9),transparent_42%,transparent)]" />
                        <div className="relative flex h-full flex-col">
                          <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-3 pr-20">
                              <div>
                                <CardTitle className="text-lg text-slate-900">{plan.name}</CardTitle>
                                <CardDescription className="mt-1 text-sm text-stone-500">{plan.description || "Plan pensado para acompañar tu ritmo de clases."}</CardDescription>
                              </div>
                              <div className="flex flex-wrap gap-2"><Badge tone="success">{cycleLabel}</Badge>{plan.syncSource === "api" ? <Badge tone="success" className="border-emerald-200 bg-emerald-50 text-emerald-700">API real</Badge> : <Badge tone="warning" className="border-amber-200 bg-amber-50 text-amber-700">Solo local</Badge>}</div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-1 flex-col space-y-4 text-sm text-slate-600">
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3"><div className="text-xs uppercase tracking-wider text-stone-500">Precio</div><div className="mt-2 text-slate-900">{formatMoney(plan.price)}</div></div>
                              <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3"><div className="text-xs uppercase tracking-wider text-stone-500">Duración</div><div className="mt-2 text-slate-900">{plan.months} mes{plan.months === 1 ? "" : "es"}</div></div>
                              <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3"><div className="text-xs uppercase tracking-wider text-stone-500">Modalidad</div><div className="mt-2 text-slate-900">{plan.unlimited ? "Ilimitado" : `${plan.classLimit ?? 0} clases`}</div></div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                              <div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {visibleDisciplines > 0 ? plan.disciplineIds.map((idDiscipline) => (
                                  <Badge key={idDiscipline} tone="neutral">{disciplineNameMap.get(idDiscipline) ?? `Disciplina ${idDiscipline}`}</Badge>
                                )) : (
                                  <span className="text-stone-500">{plan.disciplinesCount > 0 ? `${plan.disciplinesCount} disciplina${plan.disciplinesCount === 1 ? "" : "s"} cargadas` : "Sin disciplinas informadas"}</span>
                                )}
                              </div>
                            </div>
                            {plan.benefits ? <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3"><div className="text-xs uppercase tracking-wider text-stone-500">Beneficios</div><div className="mt-2 leading-6 text-slate-900">{plan.benefits}</div></div> : null}
                            <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
                              <Button className="w-full transition duration-300 group-hover:bg-white" disabled>Próximamente vas a poder contratar este plan</Button>
                              {isRecommended ? <div className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-4 py-3 text-center text-xs font-medium uppercase tracking-widest text-sky-700 sm:min-w-[12rem]">Recomendado</div> : null}
                            </div>
                          </CardContent>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-5 text-sm text-stone-500">Esta sucursal todavía no tiene planes visibles configurados.</div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
              <CardHeader>
                <CardTitle>Clase individual</CardTitle>
                <CardDescription>Una alternativa para quienes prefieren reservar sin contratar un plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                {hasPrivateClass && privateClass ? (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3"><div className="text-xs uppercase tracking-wider text-stone-500">Precio</div><div className="mt-2 text-lg font-semibold text-slate-900">{formatMoney(privateClass.price)}</div></div>
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3"><div className="text-xs uppercase tracking-wider text-stone-500">Duración</div><div className="mt-2 text-slate-900">{privateClass.duration} min</div></div>
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3"><div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas</div><div className="mt-2 flex flex-wrap gap-2">{privateClass.disciplineIds.length > 0 ? privateClass.disciplineIds.map((idDiscipline) => (<Badge key={idDiscipline} tone="neutral">{disciplineNameMap.get(idDiscipline) ?? `Disciplina ${idDiscipline}`}</Badge>)) : <span className="text-stone-500">Disponible según coordinación con la sede</span>}</div></div>
                    {privateClass.notes ? <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-stone-500">{privateClass.notes}</div> : null}
                    <Button variant="secondary" className="w-full" disabled>Próximamente vas a poder reservar una clase individual</Button>
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-5 text-stone-500">Por ahora no hay una opción de clase individual visible para esta sucursal.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
              <CardHeader>
                <CardTitle>Qué podés hacer</CardTitle>
                <CardDescription>Elegí una sucursal, compará opciones y revisá qué plan se ajusta mejor a vos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-stone-500">
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">1. Elegí una sucursal activa para ver su oferta.</div>
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">2. Compará planes, beneficios y disciplinas incluidas.</div>
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">3. Muy pronto vas a poder contratar o reservar desde esta misma vista.</div>
                <Link to="/app/rubros" className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-700 transition hover:bg-[#eff4ff]">Ver oferta por rubros</Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Protected>
  );
}
