
import { useEffect, useMemo, useState } from "react";
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
import {
  BILLING_CYCLE_OPTIONS,
  PRIVATE_CLASS_DURATION_OPTIONS,
  type MembershipPlan,
  type MembershipPlanInput,
  type PrivateClassOffer,
} from "../lib/memberships/types";

const DEFAULT_PLAN_FORM: MembershipPlanInput = {
  name: "",
  description: "",
  price: 0,
  billingCycle: "monthly",
  classLimit: null,
  unlimited: false,
  creditAmount: null,
  rolloverEnabled: false,
  isVisible: true,
  isActive: true,
  benefits: "",
  disciplineIds: [],
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

export default function AdminMembershipsPage() {
  const { branchId } = useBranch();
  const { data: branches } = useBranches();
  const { disciplines, loading: disciplinesLoading, error: disciplinesError } = useDisciplines();
  const {
    data,
    loading,
    error: catalogError,
    createPlan,
    updatePlan,
    removePlan,
    savePrivateClass,
    saving,
    syncMode,
  } = useBranchMembershipCatalog(branchId);

  const [planForm, setPlanForm] = useState<MembershipPlanInput>(DEFAULT_PLAN_FORM);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [privateClassForm, setPrivateClassForm] = useState<PrivateClassOffer>({
    enabled: false,
    price: 0,
    duration: 60,
    disciplineIds: [],
    notes: "",
    isActive: true,
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.privateClass) {
      setPrivateClassForm(data.privateClass);
    }
  }, [data]);

  const activeBranch = useMemo(() => {
    if (branchId == null || !branches) return null;
    return branches.find((branch) => branch.idBranch === branchId) ?? null;
  }, [branchId, branches]);

  const activePlans = useMemo(() => data?.plans.filter((plan) => plan.isActive).length ?? 0, [data]);
  const visiblePlans = useMemo(() => data?.plans.filter((plan) => plan.isVisible).length ?? 0, [data]);
  const syncedPlans = useMemo(() => data?.plans.filter((plan) => plan.syncSource === "api").length ?? 0, [data]);
  const localPlans = useMemo(() => data?.plans.filter((plan) => plan.syncSource !== "api").length ?? 0, [data]);
  const estimatedRevenue = useMemo(() => (data?.plans ?? []).reduce((total, plan) => total + plan.price, 0), [data]);

  function resetPlanForm() {
    setPlanForm(DEFAULT_PLAN_FORM);
    setEditingPlanId(null);
  }

  function toggleDisciplineSelection(currentIds: number[], idDiscipline: number) {
    return currentIds.includes(idDiscipline)
      ? currentIds.filter((item) => item !== idDiscipline)
      : [...currentIds, idDiscipline];
  }

  async function handlePlanSubmit() {
    setFeedback(null);
    setError(null);

    if (!planForm.name.trim()) {
      setError("El nombre del plan es obligatorio.");
      return;
    }

    if (planForm.price <= 0) {
      setError("El precio debe ser mayor a cero.");
      return;
    }

    if (!planForm.unlimited && (!planForm.classLimit || planForm.classLimit <= 0)) {
      setError("Defini la cantidad de clases o marca el plan como ilimitado.");
      return;
    }

    if (planForm.disciplineIds.length === 0) {
      setError("Selecciona al menos una disciplina para el plan.");
      return;
    }

    try {
      if (editingPlanId != null) {
        await updatePlan(editingPlanId, planForm);
        setFeedback("Plan actualizado correctamente.");
      } else {
        await createPlan(planForm);
        setFeedback("Plan creado correctamente.");
      }
      resetPlanForm();
    } catch (submitError: any) {
      setError(submitError?.message || "No pudimos guardar el plan.");
    }
  }

  function startEditPlan(plan: MembershipPlan) {
    setEditingPlanId(plan.idMembershipPlan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingCycle: plan.billingCycle,
      classLimit: plan.classLimit,
      unlimited: plan.unlimited,
      creditAmount: plan.creditAmount,
      rolloverEnabled: plan.rolloverEnabled,
      isVisible: plan.isVisible,
      isActive: plan.isActive,
      benefits: plan.benefits,
      disciplineIds: plan.disciplineIds,
    });
    setFeedback(null);
    setError(null);
  }

  async function handleRemovePlan(plan: MembershipPlan) {
    const actionLabel = plan.syncSource === "api" ? "ocultar" : "eliminar";
    if (!window.confirm(`¿Quieres ${actionLabel} este plan de la sucursal activa?`)) return;

    try {
      await removePlan(plan.idMembershipPlan);
      if (editingPlanId === plan.idMembershipPlan) resetPlanForm();
      setFeedback(
        plan.syncSource === "api"
          ? "Plan ocultado localmente. La eliminación definitiva todavía no está disponible desde esta vista."
          : "Plan eliminado correctamente."
      );
      setError(null);
    } catch (removeError: any) {
      setError(removeError?.message || "No pudimos actualizar la lista de planes.");
    }
  }

  async function handleSavePrivateClass() {
    setFeedback(null);
    setError(null);

    if (privateClassForm.enabled && privateClassForm.price <= 0) {
      setError("Define un precio válido para la clase individual.");
      return;
    }

    try {
      await savePrivateClass(privateClassForm);
      setFeedback("Configuración de clase individual guardada.");
    } catch (saveError: any) {
      setError(saveError?.message || "No pudimos guardar la clase individual.");
    }
  }

  if (branchId == null) {
    return (
      <Protected allowRoles={[ROLES.ADMIN]}>
        <div className="space-y-6">
          <PageHeader
            title="Membresías"
            subtitle="Eleg? una sucursal para definir la oferta comercial y los planes disponibles."
          />
          <Card>
            <CardContent className="py-6 text-sm text-slate-500">No hay una sucursal activa seleccionada.</CardContent>
          </Card>
        </div>
      </Protected>
    );
  }

  if (loading || disciplinesLoading) {
    return (
      <Protected allowRoles={[ROLES.ADMIN]}>
        <ScreenLoader
          title="Cargando membresías..."
          subtitle="Estamos preparando la configuraci?n comercial de la sucursal activa."
        />
      </Protected>
    );
  }

  if (disciplinesError || catalogError) {
    return (
      <Protected allowRoles={[ROLES.ADMIN]}>
        <div className="space-y-6">
          <PageHeader
            title="Membresías"
            subtitle="No pudimos cargar toda la informaci?n necesaria para administrar este m?dulo."
          />
          <Card>
            <CardContent className="py-6 text-sm text-rose-700">{disciplinesError ?? catalogError?.message}</CardContent>
          </Card>
        </div>
      </Protected>
    );
  }

  return (
    <Protected allowRoles={[ROLES.ADMIN]}>
      <div className="space-y-6">
        <PageHeader
          title="Membresías"
          subtitle={
            activeBranch
              ? `Define los planes y la clase particular de ${activeBranch.companyName} en ${activeBranch.cityName}.`
              : `Define los planes y la clase particular para la sucursal ${branchId}.`
          }
        />

        <Card className="border-teal-100 bg-[linear-gradient(135deg,rgba(94,234,212,0.16),rgba(255,255,255,0.96)_42%,rgba(254,249,195,0.22)_100%)]">
          <CardContent className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
            <div className="space-y-2 text-sm text-slate-600">
              <div className="text-xs uppercase tracking-[0.24em] text-teal-700/70">Estado de sincronización</div>
              <div className="text-lg font-semibold text-slate-900">
                {syncMode === "api+local" ? "Planes vinculados con API real" : "Gestión local temporal"}
              </div>
              <p className="max-w-3xl leading-6 text-slate-600">
                Desde acá podés distinguir qué planes ya existen en backend y cuáles siguen completándose sólo en esta sucursal.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-emerald-100 bg-white/92 px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-stone-500">API real</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{syncedPlans}</div>
                <div className="mt-1 text-sm text-emerald-700">Planes ya vinculados con backend</div>
              </div>
              <div className="rounded-3xl border border-amber-100 bg-white/92 px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-stone-500">Locales</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{localPlans}</div>
                <div className="mt-1 text-sm text-amber-700">Planes todavía sólo visibles en frontend</div>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/88 px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-wider text-stone-500">Clase individual</div>
                <div className="mt-2 text-sm font-medium text-slate-800">Configurable por sucursal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-stone-200 bg-white/92">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-stone-500">Sucursal</div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{activeBranch?.cityName ?? `#${branchId}`}</div>
              <div className="mt-1 text-sm text-slate-500">{activeBranch?.companyName ?? "Contexto actual"}</div>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white/92">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-stone-500">Planes activos</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{activePlans}</div>
              <div className="mt-1 text-sm text-slate-500">Opciones listas para vender</div>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white/92">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-stone-500">Planes visibles</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{visiblePlans}</div>
              <div className="mt-1 text-sm text-slate-500">Listos para mostrarse al usuario</div>
            </CardContent>
          </Card>
          <Card className="border-stone-200 bg-white/92">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-stone-500">Ticket estimado</div>
              <div className="mt-3 text-2xl font-semibold text-slate-900">{formatMoney(estimatedRevenue)}</div>
              <div className="mt-1 text-sm text-slate-500">Suma de precios cargados en este tablero</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <Card className="overflow-hidden border-stone-200 bg-white/94">
            <div className="h-20 bg-linear-to-r from-teal-100 via-sky-100/70 to-transparent" />
            <CardHeader className="relative -mt-4">
              <CardTitle>{editingPlanId != null ? "Editar plan" : "Nuevo plan"}</CardTitle>
              <CardDescription>
                Defin? el nombre, precio y beneficios del plan para esta sucursal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs uppercase tracking-wider text-stone-500">
                  Nombre
                  <input
                    value={planForm.name}
                    onChange={(event) => setPlanForm((current) => ({ ...current, name: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                    placeholder="Ej. Plan trimestral"
                  />
                </label>

                <label className="text-xs uppercase tracking-wider text-stone-500">
                  Precio
                  <input
                    type="number"
                    min={0}
                    value={planForm.price}
                    onChange={(event) => setPlanForm((current) => ({ ...current, price: Number(event.target.value) }))}
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                  />
                </label>
              </div>

              <label className="block text-xs uppercase tracking-wider text-stone-500">
                Descripción comercial
                <textarea
                  value={planForm.description}
                  onChange={(event) => setPlanForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  placeholder="Ej. Ideal para alumnos que entrenan dos veces por semana."
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="text-xs uppercase tracking-wider text-stone-500">
                  Ciclo
                  <select
                    value={planForm.billingCycle}
                    onChange={(event) =>
                      setPlanForm((current) => ({ ...current, billingCycle: event.target.value as MembershipPlanInput["billingCycle"] }))
                    }
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                  >
                    {BILLING_CYCLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs uppercase tracking-wider text-stone-500">
                  Meses
                  <input
                    value={BILLING_CYCLE_OPTIONS.find((item) => item.value === planForm.billingCycle)?.months ?? 1}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-500 outline-none"
                  />
                </label>

                <label className="text-xs uppercase tracking-wider text-stone-500">
                  Límite de clases
                  <input
                    type="number"
                    min={0}
                    value={planForm.classLimit ?? ""}
                    disabled={planForm.unlimited}
                    onChange={(event) =>
                      setPlanForm((current) => ({
                        ...current,
                        classLimit: event.target.value ? Number(event.target.value) : null,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none disabled:text-stone-400"
                    placeholder="Ej. 12"
                  />
                </label>

                <label className="text-xs uppercase tracking-wider text-stone-500">
                  Créditos
                  <input
                    type="number"
                    min={0}
                    value={planForm.creditAmount ?? ""}
                    onChange={(event) =>
                      setPlanForm((current) => ({
                        ...current,
                        creditAmount: event.target.value ? Number(event.target.value) : null,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                    placeholder="Opcional"
                  />
                </label>
              </div>

              <label className="block text-xs uppercase tracking-wider text-stone-500">
                Beneficios
                <textarea
                  value={planForm.benefits}
                  onChange={(event) => setPlanForm((current) => ({ ...current, benefits: event.target.value }))}
                  rows={3}
                  placeholder="Ej. Reserva anticipada y descuento en clase particular."
                  className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={planForm.unlimited}
                    onChange={(event) =>
                      setPlanForm((current) => ({
                        ...current,
                        unlimited: event.target.checked,
                        classLimit: event.target.checked ? null : current.classLimit,
                      }))
                    }
                    className="h-4 w-4 accent-teal-600"
                  />
                  Plan ilimitado
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={planForm.rolloverEnabled}
                    onChange={(event) => setPlanForm((current) => ({ ...current, rolloverEnabled: event.target.checked }))}
                    className="h-4 w-4 accent-teal-600"
                  />
                  Permite rollover
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={planForm.isVisible}
                    onChange={(event) => setPlanForm((current) => ({ ...current, isVisible: event.target.checked }))}
                    className="h-4 w-4 accent-teal-600"
                  />
                  Visible al usuario
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(event) => setPlanForm((current) => ({ ...current, isActive: event.target.checked }))}
                    className="h-4 w-4 accent-teal-600"
                  />
                  Plan activo
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas incluidas</div>
                  <Badge tone="neutral">{planForm.disciplineIds.length} disciplina{planForm.disciplineIds.length === 1 ? "" : "s"} seleccionada{planForm.disciplineIds.length === 1 ? "" : "s"}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {disciplines.map((discipline) => {
                    const selected = planForm.disciplineIds.includes(discipline.idDiscipline);
                    return (
                      <button
                        key={discipline.idDiscipline}
                        type="button"
                        onClick={() =>
                          setPlanForm((current) => ({
                            ...current,
                            disciplineIds: toggleDisciplineSelection(current.disciplineIds, discipline.idDiscipline),
                          }))
                        }
                        className={[
                          "rounded-2xl border px-4 py-3 text-left text-sm transition",
                          selected
                            ? "border-teal-200 bg-teal-50 text-teal-800"
                            : "border-stone-200 bg-stone-50 text-slate-700 hover:border-teal-200 hover:bg-white",
                        ].join(" ")}
                      >
                        {discipline.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void handlePlanSubmit()} disabled={saving}>
                  {editingPlanId != null ? "Guardar cambios" : "Crear plan"}
                </Button>
                {editingPlanId != null ? (
                  <Button variant="secondary" onClick={resetPlanForm} disabled={saving}>
                    Cancelar edición
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-stone-200 bg-white/92">
              <CardHeader>
                <CardTitle>Clase individual</CardTitle>
                <CardDescription>
                  Configurá la alternativa para quienes prefieren pagar una clase puntual sin tomar una membresía.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={privateClassForm.enabled}
                    onChange={(event) => setPrivateClassForm((current) => ({ ...current, enabled: event.target.checked }))}
                    className="h-4 w-4 accent-teal-600"
                  />
                  Habilitar clase individual
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs uppercase tracking-wider text-stone-500">
                    Precio
                    <input
                      type="number"
                      min={0}
                      value={privateClassForm.price}
                      onChange={(event) => setPrivateClassForm((current) => ({ ...current, price: Number(event.target.value) }))}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                    />
                  </label>

                  <label className="text-xs uppercase tracking-wider text-stone-500">
                    Duración
                    <select
                      value={privateClassForm.duration}
                      onChange={(event) =>
                        setPrivateClassForm((current) => ({ ...current, duration: Number(event.target.value) as PrivateClassOffer["duration"] }))
                      }
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                    >
                      {PRIVATE_CLASS_DURATION_OPTIONS.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration} min
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={privateClassForm.isActive}
                    onChange={(event) => setPrivateClassForm((current) => ({ ...current, isActive: event.target.checked }))}
                    className="h-4 w-4 accent-teal-600"
                  />
                  Oferta activa
                </label>

                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas disponibles</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {disciplines.map((discipline) => {
                      const selected = privateClassForm.disciplineIds.includes(discipline.idDiscipline);
                      return (
                        <button
                          key={discipline.idDiscipline}
                          type="button"
                          onClick={() =>
                            setPrivateClassForm((current) => ({
                              ...current,
                              disciplineIds: toggleDisciplineSelection(current.disciplineIds, discipline.idDiscipline),
                            }))
                          }
                          className={[
                            "rounded-2xl border px-4 py-3 text-left text-sm transition",
                            selected
                              ? "border-teal-200 bg-teal-50 text-teal-800"
                              : "border-stone-200 bg-stone-50 text-slate-700 hover:border-teal-200 hover:bg-white",
                          ].join(" ")}
                        >
                          {discipline.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block text-xs uppercase tracking-wider text-stone-500">
                  Notas operativas
                  <textarea
                    value={privateClassForm.notes}
                    onChange={(event) => setPrivateClassForm((current) => ({ ...current, notes: event.target.value }))}
                    rows={3}
                    placeholder="Ej. Sujeto a disponibilidad del instructor o reserva con anticipación."
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-stone-400"
                  />
                </label>

                <Button onClick={() => void handleSavePrivateClass()} disabled={saving}>Guardar clase individual</Button>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/92">
              <CardHeader>
                <CardTitle>Notas de gestión</CardTitle>
                <CardDescription>
                  Us? estas referencias para ordenar la oferta y mantenerla clara para el usuario.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  1. Revisá nombre, precio y disciplinas para que cada plan sea fácil de entender.
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  2. Mostrá sólo los planes que realmente querés ofrecer en esta sucursal.
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  3. Si un plan ya existe, podés editarlo, pausarlo u ocultarlo seg?n lo que necesites mostrar.
                </div>
                {feedback ? (
                  <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-teal-800">{feedback}</div>
                ) : null}
                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="overflow-hidden border-stone-200 bg-white/94">
          <div className="h-20 bg-linear-to-r from-amber-100 via-orange-50 to-transparent" />
          <CardHeader className="relative -mt-4">
            <CardTitle>Planes cargados</CardTitle>
            <CardDescription>
              Resumen de la oferta comercial actual para revisar y ordenar lo que ver? el usuario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.plans.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {data.plans.map((plan) => (
                  <Card key={plan.idMembershipPlan} className={["border-stone-200 bg-white/96", plan.syncSource === "api" ? "ring-1 ring-emerald-100" : "ring-1 ring-amber-100"].join(" ")}>
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg text-slate-900">{plan.name}</CardTitle>
                          <CardDescription className="mt-1 text-sm text-slate-500">
                            {plan.description || "Sin descripción comercial cargada"}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={plan.isActive ? "success" : "warning"}>{plan.isActive ? "Activo" : "Pausado"}</Badge>
                          <Badge tone={plan.isVisible ? "neutral" : "warning"}>{plan.isVisible ? "Visible" : "Oculto"}</Badge>
                          <Badge
                            tone={plan.syncSource === "api" ? "success" : "warning"}
                            className={plan.syncSource === "api" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}
                          >
                            {plan.syncSource === "api" ? "API real" : "Solo local"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-slate-600">
                      <div className={plan.syncSource === "api" ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" : "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"}>
                        {plan.syncSource === "api"
                          ? "Este plan ya quedó vinculado con una membresía real del backend."
                          : "Este plan sigue guardado sólo en frontend hasta que quede vinculado con la API."}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Precio</div>
                          <div className="mt-2 text-slate-900">{formatMoney(plan.price)}</div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Ciclo</div>
                          <div className="mt-2 text-slate-900">{BILLING_CYCLE_OPTIONS.find((item) => item.value === plan.billingCycle)?.label}</div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas</div>
                          <div className="mt-2 text-slate-900">{plan.disciplineIds.length || plan.disciplinesCount}</div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Clases</div>
                          <div className="mt-2 text-slate-900">{plan.unlimited ? "Ilimitado" : plan.classLimit ?? "Sin dato"}</div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Créditos</div>
                          <div className="mt-2 text-slate-900">{plan.creditAmount ?? "No definido"}</div>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Rollover</div>
                          <div className="mt-2 text-slate-900">{plan.rolloverEnabled ? "S?" : "No"}</div>
                        </div>
                      </div>

                      {plan.benefits ? (
                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-slate-600">
                          <div className="text-xs uppercase tracking-wider text-stone-500">Beneficios</div>
                          <div className="mt-2 leading-6 text-slate-900">{plan.benefits}</div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-3">
                        <Button variant="secondary" onClick={() => startEditPlan(plan)} disabled={saving}>
                          Editar plan
                        </Button>
                        <Button variant="ghost" onClick={() => void handleRemovePlan(plan)} disabled={saving}>
                          {plan.syncSource === "api" ? "Ocultar en esta sucursal" : "Eliminar"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-5 text-sm text-slate-500">
                Todav?a no hay planes cargados para esta sucursal.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Protected>
  );
}
