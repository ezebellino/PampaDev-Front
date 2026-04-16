import { useState } from "react";
import { Link, useParams } from "react-router";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import { mockRubros } from "../lib/rubros/mockRubros";
import { usePublishedBranchAgenda } from "../lib/scheduling/publishedAgenda";
import { useBranchClassSlots } from "../lib/scheduling/useBranchClassSlots";
import { useBranchScheduleConfig } from "../lib/scheduling/useBranchScheduleConfig";
import { useTenantConfig } from "../lib/tenant/useTenantConfig";

function formatARS(n: number) {
  return `$ ${n.toLocaleString("es-AR")}`;
}

function slotLabel(date: string, time: string) {
  return `${date} - ${time}`;
}

function resolveSlotAvailability(slot: { available?: number }) {
  if (typeof slot.available === "number" && Number.isFinite(slot.available)) return slot.available;
  return null;
}

function resolveSlotCapacity(slot: { capacity?: number }) {
  if (typeof slot.capacity === "number" && Number.isFinite(slot.capacity)) return slot.capacity;
  return null;
}

export default function RubroDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isBackOffice = user?.role === ROLES.DEVS || user?.role === ROLES.ADMIN || user?.role === ROLES.INSTRUCTOR;

  const { config, hydrated } = useTenantConfig();
  const { branchId } = useBranch();
  const { disciplines, loading: disciplinesLoading } = useDisciplines();
  const { data: scheduleConfig, loading: scheduleLoading } = useBranchScheduleConfig(branchId, disciplines);

  const isEnabled = !!id && config.enabledRubroIds.includes(id);
  const rubro = mockRubros.find((item) => item.id === id);

  const publishedAgenda = usePublishedBranchAgenda(branchId, disciplines, scheduleConfig, {
    rubroId: rubro?.id ?? null,
    rubroName: rubro?.name ?? null,
  });

  const { slots, loading: apiLoading, error: apiError, reserveSlot, reserving, usingFallbackSlots, hasBackendSlots } =
    useBranchClassSlots(branchId, id ?? null, publishedAgenda.publishedItems);

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!hydrated || apiLoading || disciplinesLoading || scheduleLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cargando..." subtitle="Preparando agenda" />
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">Preparando la vista...</CardContent>
        </Card>
      </div>
    );
  }

  if (!rubro) {
    return (
      <div className="space-y-4">
        <PageHeader title="Rubro no encontrado" subtitle="No pudimos abrir esta agenda." />
        <Link to="/app/rubros">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <PageHeader title="Rubro no disponible" subtitle="Este rubro no esta habilitado para esta cuenta." />
        <Link to="/app/rubros">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>
    );
  }

  if (!branchId) {
    return (
      <div className="space-y-4">
        <PageHeader title="Elegí una sucursal" subtitle="Necesitamos una sede activa para mostrar horarios." />
        <Link to="/app/branches">
          <Button>Elegir sucursal</Button>
        </Link>
      </div>
    );
  }

  if (apiError && slots.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title="No pudimos cargar la agenda" subtitle="Intenta nuevamente en unos instantes." />
        <Card>
          <CardContent className="py-6 text-sm text-rose-700">
            {apiError instanceof Error ? apiError.message : "Error desconocido al cargar horarios."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={rubro.name}
        subtitle="Elegí un horario y reservá de forma clara, sin pasos de más."
        right={
          <Link to="/app/rubros">
            <Button variant="secondary">Volver</Button>
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardContent className="grid gap-3 py-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Duración</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{rubro.durationMin} min</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Precio base</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{formatARS(rubro.basePrice)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Agenda</div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {hasBackendSlots ? "Clases reales" : usingFallbackSlots ? "Publicada" : "Sin horarios"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex flex-wrap gap-2">
              {rubro.tags.map((tag) => (
                <Badge key={tag} className="text-slate-600">
                  #{tag}
                </Badge>
              ))}
            </div>
            <div>Sucursal: {branchId}</div>
            {isBackOffice ? (
              <Link to="/app/instructor" className="block">
                <Button variant="secondary" className="w-full">Ver panel instructor</Button>
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
        <CardHeader>
          <CardTitle>Agenda disponible</CardTitle>
        </CardHeader>

        {infoMessage ? <CardContent className="pt-0 text-sm text-emerald-700">{infoMessage}</CardContent> : null}
        {errorMessage ? <CardContent className="pt-0 text-sm text-rose-700">{errorMessage}</CardContent> : null}

        <CardContent className="space-y-4">
          {usingFallbackSlots ? (
            <div className="rounded-2xl border border-sky-200 bg-[#eff4ff] px-4 py-3 text-sm text-sky-700">
              Horarios publicados desde la planificación de la sucursal.
            </div>
          ) : null}

          {slots.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4 text-sm text-slate-600">
              Todavía no hay horarios disponibles.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const available = resolveSlotAvailability(slot);
                const capacity = resolveSlotCapacity(slot);
                const full = available != null ? available <= 0 : false;
                const syncReady = slot.bookingSource === "api";

                return (
                  <div
                    key={slot.id}
                    className={[
                      "rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:bg-[#fdfefe]",
                      full ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-slate-900">{slotLabel(slot.date, slot.time)}</div>
                      <Badge tone={full ? "warning" : available == null ? "neutral" : "success"}>
                        {full
                          ? "Sin cupo"
                          : available != null && capacity != null
                            ? `${available}/${capacity}`
                            : capacity != null
                              ? `Capacidad ${capacity}`
                              : "Cupo a confirmar"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={slot.bookingSource === "api" ? "success" : "neutral"}>
                        {slot.bookingSource === "api" ? "Real" : "Publicada"}
                      </Badge>
                      <Badge tone={syncReady ? "success" : "warning"}>{syncReady ? "API" : "Local"}</Badge>
                    </div>

                    <div className="mt-3 text-xs text-stone-500">
                      {slot.duration ? `${slot.duration} min` : "Duración a confirmar"}
                    </div>

                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant={full ? "secondary" : "primary"}
                        className="w-full"
                        disabled={full || reserving}
                        onClick={async () => {
                          setInfoMessage(null);
                          setErrorMessage(null);

                          if (!user) {
                            setErrorMessage("Debés iniciar sesión para reservar.");
                            return;
                          }

                          try {
                            const result = await reserveSlot(slot, { id: user.id, name: user.name });
                            setInfoMessage(
                              result.syncStatus === "synced"
                                ? "Reserva enviada y sincronizada."
                                : "Reserva enviada. Quedó lista para seguimiento."
                            );
                          } catch (err) {
                            const message = err instanceof Error ? err.message : "Error al reservar turno";
                            setErrorMessage(message);
                          }
                        }}
                      >
                        {full ? "No disponible" : reserving ? "Enviando..." : "Reservar"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
