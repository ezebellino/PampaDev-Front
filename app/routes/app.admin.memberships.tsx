import { useEffect, useMemo, useState } from "react";
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
  const { data, loading, createPlan, updatePlan, removePlan, savePrivateClass } = useBranchMembershipCatalog(branchId);

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
  const estimatedRevenue = useMemo(() => {
    return (data?.plans ?? []).reduce((total, plan) => total + plan.price, 0);
  }, [data]);

  function resetPlanForm() {
    setPlanForm(DEFAULT_PLAN_FORM);
    setEditingPlanId(null);
  }

  function toggleDisciplineSelection(currentIds: number[], idDiscipline: number) {
    return currentIds.includes(idDiscipline)
      ? currentIds.filter((item) => item !== idDiscipline)
      : [...currentIds, idDiscipline];
  }

  function handlePlanSubmit() {
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
      setError("Definí la cantidad de clases o marcá el plan como ilimitado.");
      return;
    }

    if (planForm.disciplineIds.length === 0) {
      setError("Seleccioná al menos una disciplina para el plan.");
      return;
    }

    if (editingPlanId != null) {
      updatePlan(editingPlanId, planForm);
      setFeedback("Plan actualizado correctamente.");
    } else {
      createPlan(planForm);
      setFeedback("Plan creado correctamente.");
    }

    resetPlanForm();
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

  function handleRemovePlan(idMembershipPlan: number) {
    if (!window.confirm("¿Querés eliminar este plan de la sucursal activa?")) return;
    removePlan(idMembershipPlan);
    if (editingPlanId === idMembershipPlan) resetPlanForm();
    setFeedback("Plan eliminado correctamente.");
    setError(null);
  }

  function handleSavePrivateClass() {
    setFeedback(null);
    setError(null);

    if (privateClassForm.enabled && privateClassForm.price <= 0) {
      setError("Definí un precio válido para la clase particular.");
      return;
    }

    savePrivateClass(privateClassForm);
    setFeedback("Configuración de clase particular guardada.");
  }

  if (branchId == null) {
    return (
      <Protected allowRoles={[ROLES.ADMIN]}>
        <div className="space-y-6">
          <PageHeader
            title="Membresías"
            subtitle="Elegí una sucursal para definir la oferta comercial y los planes disponibles."
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
      <Protected allowRoles={[ROLES.ADMIN]}>
        <ScreenLoader
          title="Cargando membresías..."
          subtitle="Estamos preparando la configuración comercial de la sucursal activa."
        />
      </Protected>
    );
  }

  if (disciplinesError) {
    return (
      <Protected allowRoles={[ROLES.ADMIN]}>
        <div className="space-y-6">
          <PageHeader
            title="Membresías"
            subtitle="No pudimos cargar las disciplinas necesarias para armar los planes."
          />
          <Card>
            <CardContent className="py-6 text-sm text-red-300">{disciplinesError}</CardContent>
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
              ? `Definí los planes y la clase particular de ${activeBranch.companyName} en ${activeBranch.cityName}.`
              : `Definí los planes y la clase particular para la sucursal ${branchId}.`
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
              <div className="text-xs uppercase tracking-wider text-zinc-500">Planes activos</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{activePlans}</div>
              <div className="mt-1 text-sm text-zinc-400">Opciones listas para vender</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Planes visibles</div>
              <div className="mt-3 text-3xl font-semibold text-zinc-100">{visiblePlans}</div>
              <div className="mt-1 text-sm text-zinc-400">Listos para mostrarse al usuario</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Ticket estimado</div>
              <div className="mt-3 text-2xl font-semibold text-zinc-100">{formatMoney(estimatedRevenue)}</div>
              <div className="mt-1 text-sm text-zinc-400">Suma de precios de planes cargados</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
            <div className="h-20 bg-linear-to-r from-cyan-500/12 to-transparent" />
            <CardHeader className="relative -mt-4">
              <CardTitle>{editingPlanId != null ? "Editar plan" : "Nuevo plan"}</CardTitle>
              <CardDescription>
                Definí nombre, ciclo, precio, beneficios y disciplinas alcanzadas por cada membresía.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs uppercase tracking-wider text-zinc-500">
                  Nombre
                  <input
                    value={planForm.name}
                    onChange={(event) => setPlanForm((current) => ({ ...current, name: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                    placeholder="Ej. Plan trimestral"
                  />
                </label>

                <label className="text-xs uppercase tracking-wider text-zinc-500">
                  Precio
                  <input
                    type="number"
                    min={0}
                    value={planForm.price}
                    onChange={(event) => setPlanForm((current) => ({ ...current, price: Number(event.target.value) }))}
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                  />
                </label>
              </div>

              <label className="block text-xs uppercase tracking-wider text-zinc-500">
                Descripción comercial
                <textarea
                  value={planForm.description}
                  onChange={(event) => setPlanForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  placeholder="Ej. Ideal para alumnos que entrenan dos veces por semana."
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="text-xs uppercase tracking-wider text-zinc-500">
                  Ciclo
                  <select
                    value={planForm.billingCycle}
                    onChange={(event) => setPlanForm((current) => ({ ...current, billingCycle: event.target.value as MembershipPlanInput["billingCycle"] }))}
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                  >
                    {BILLING_CYCLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs uppercase tracking-wider text-zinc-500">
                  Meses
                  <input
                    value={BILLING_CYCLE_OPTIONS.find((item) => item.value === planForm.billingCycle)?.months ?? 1}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400 outline-none"
                  />
                </label>

                <label className="text-xs uppercase tracking-wider text-zinc-500">
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
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none disabled:text-zinc-500"
                    placeholder="Ej. 12"
                  />
                </label>

                <label className="text-xs uppercase tracking-wider text-zinc-500">
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
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                    placeholder="Opcional"
                  />
                </label>
              </div>

              <label className="block text-xs uppercase tracking-wider text-zinc-500">
                Beneficios
                <textarea
                  value={planForm.benefits}
                  onChange={(event) => setPlanForm((current) => ({ ...current, benefits: event.target.value }))}
                  rows={3}
                  placeholder="Ej. Reserva anticipada y descuento en clase particular."
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-200">
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
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Plan ilimitado
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={planForm.rolloverEnabled}
                    onChange={(event) => setPlanForm((current) => ({ ...current, rolloverEnabled: event.target.checked }))}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Permite rollover
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={planForm.isVisible}
                    onChange={(event) => setPlanForm((current) => ({ ...current, isVisible: event.target.checked }))}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Visible al usuario
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(event) => setPlanForm((current) => ({ ...current, isActive: event.target.checked }))}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Plan activo
                </label>
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas incluidas</div>
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
                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
                            : "border-zinc-800 bg-zinc-900/45 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900",
                        ].join(" ")}
                      >
                        {discipline.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handlePlanSubmit}>{editingPlanId != null ? "Guardar cambios" : "Crear plan"}</Button>
                {editingPlanId != null ? (
                  <Button variant="secondary" onClick={resetPlanForm}>
                    Cancelar edición
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-zinc-800 bg-zinc-950/80">
              <CardHeader>
                <CardTitle>Clase particular</CardTitle>
                <CardDescription>
                  Configurá la alternativa para usuarios que prefieran pagar una clase puntual sin tomar una membresía.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={privateClassForm.enabled}
                    onChange={(event) => setPrivateClassForm((current) => ({ ...current, enabled: event.target.checked }))}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Habilitar clase particular
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500">
                    Precio
                    <input
                      type="number"
                      min={0}
                      value={privateClassForm.price}
                      onChange={(event) => setPrivateClassForm((current) => ({ ...current, price: Number(event.target.value) }))}
                      className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                    />
                  </label>

                  <label className="text-xs uppercase tracking-wider text-zinc-500">
                    Duración
                    <select
                      value={privateClassForm.duration}
                      onChange={(event) =>
                        setPrivateClassForm((current) => ({ ...current, duration: Number(event.target.value) as PrivateClassOffer["duration"] }))
                      }
                      className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                    >
                      {PRIVATE_CLASS_DURATION_OPTIONS.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration} min
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={privateClassForm.isActive}
                    onChange={(event) => setPrivateClassForm((current) => ({ ...current, isActive: event.target.checked }))}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Oferta activa
                </label>

                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas disponibles</div>
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
                              ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
                              : "border-zinc-800 bg-zinc-900/45 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900",
                          ].join(" ")}
                        >
                          {discipline.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block text-xs uppercase tracking-wider text-zinc-500">
                  Notas operativas
                  <textarea
                    value={privateClassForm.notes}
                    onChange={(event) => setPrivateClassForm((current) => ({ ...current, notes: event.target.value }))}
                    rows={3}
                    placeholder="Ej. Sujeto a disponibilidad del instructor o reserva con anticipación."
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none"
                  />
                </label>

                <Button onClick={handleSavePrivateClass}>Guardar clase particular</Button>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950/80">
              <CardHeader>
                <CardTitle>Estado de edición</CardTitle>
                <CardDescription>
                  Esta pantalla hoy persiste localmente por sucursal para avanzar la UX mientras se completa el backend.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-400">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                  1. Admin define la oferta comercial disponible para su sucursal.
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
                  2. Después se conecta a los endpoints de membresías sin cambiar la experiencia visual.
                </div>
                {feedback ? (
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-cyan-100">{feedback}</div>
                ) : null}
                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">{error}</div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
          <div className="h-20 bg-linear-to-r from-amber-500/12 to-transparent" />
          <CardHeader className="relative -mt-4">
            <CardTitle>Planes cargados</CardTitle>
            <CardDescription>
              Resumen de la oferta comercial definida hasta ahora para esta sucursal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.plans.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {data.plans.map((plan) => (
                  <Card key={plan.idMembershipPlan} className="border-zinc-800 bg-zinc-900/45">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg text-zinc-100">{plan.name}</CardTitle>
                          <CardDescription className="mt-1 text-sm text-zinc-400">{plan.description || "Sin descripción comercial"}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={plan.isActive ? "success" : "warning"}>{plan.isActive ? "Activo" : "Pausado"}</Badge>
                          <Badge tone={plan.isVisible ? "neutral" : "warning"}>{plan.isVisible ? "Visible" : "Oculto"}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-zinc-300">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Precio</div>
                          <div className="mt-2 text-zinc-100">{formatMoney(plan.price)}</div>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Duración</div>
                          <div className="mt-2 text-zinc-100">{BILLING_CYCLE_OPTIONS.find((item) => item.value === plan.billingCycle)?.label}</div>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Clases</div>
                          <div className="mt-2 text-zinc-100">{plan.unlimited ? "Ilimitado" : plan.classLimit ?? "Sin dato"}</div>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Créditos</div>
                          <div className="mt-2 text-zinc-100">{plan.creditAmount ?? "No definido"}</div>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Rollover</div>
                          <div className="mt-2 text-zinc-100">{plan.rolloverEnabled ? "Sí" : "No"}</div>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Disciplinas</div>
                          <div className="mt-2 text-zinc-100">{plan.disciplineIds.length}</div>
                        </div>
                      </div>

                      {plan.benefits ? (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-300">
                          <div className="text-xs uppercase tracking-wider text-zinc-500">Beneficios</div>
                          <div className="mt-2 leading-6 text-zinc-100">{plan.benefits}</div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-3">
                        <Button variant="secondary" onClick={() => startEditPlan(plan)}>
                          Editar plan
                        </Button>
                        <Button variant="ghost" onClick={() => handleRemovePlan(plan.idMembershipPlan)}>
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-5 text-sm text-zinc-400">
                Todavía no hay planes cargados para esta sucursal.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Protected>
  );
}
