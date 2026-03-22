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
          <CardContent className="py-6 text-sm text-zinc-400">Preparando la vista...</CardContent>
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
        <PageHeader title="Elegi una sucursal" subtitle="Necesitamos una sede activa para mostrar horarios." />
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
          <CardContent className="py-6 text-sm text-red-400">
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
        subtitle="Elegi un horario y reserva."
        right={
          <Link to="/app/rubros">
            <Button variant="secondary">Volver</Button>
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardContent className="grid gap-3 py-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Duracion</div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">{rubro.durationMin} min</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Precio base</div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">{formatARS(rubro.basePrice)}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Agenda</div>
              <div className="mt-2 text-sm font-medium text-zinc-100">
                {hasBackendSlots ? "Clases reales" : usingFallbackSlots ? "Publicada" : "Sin horarios"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <div className="flex flex-wrap gap-2">
              {rubro.tags.map((tag) => (
                <Badge key={tag} className="text-zinc-400">
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

      <Card className="border-zinc-800 bg-zinc-950/80">
        <CardHeader>
          <CardTitle>Agenda disponible</CardTitle>
        </CardHeader>

        {infoMessage ? <CardContent className="pt-0 text-sm text-emerald-400">{infoMessage}</CardContent> : null}
        {errorMessage ? <CardContent className="pt-0 text-sm text-red-400">{errorMessage}</CardContent> : null}

        <CardContent className="space-y-4">
          {usingFallbackSlots ? (
            <div className="rounded-2xl border border-cyan-800/70 bg-cyan-950/20 px-4 py-3 text-sm text-cyan-100">
              Horarios publicados desde la planificacion de la sucursal.
            </div>
          ) : null}

          {slots.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-sm text-zinc-400">
              Todavia no hay horarios disponibles.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const full = slot.available <= 0;
                const syncReady =
                  slot.bookingSource === "api" &&
                  Number.isFinite(
                    Number((slot as Record<string, unknown>).idBranchDiscipline ?? (slot as Record<string, unknown>)["branchDisciplineId"])
                  );

                return (
                  <div
                    key={slot.id}
                    className={[
                      "rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:bg-zinc-900/30",
                      full ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-zinc-100">{slotLabel(slot.date, slot.time)}</div>
                      <Badge tone={full ? "warning" : "success"}>{full ? "Sin cupo" : `${slot.available}/${slot.capacity}`}</Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={slot.bookingSource === "api" ? "success" : "neutral"}>
                        {slot.bookingSource === "api" ? "Real" : "Publicada"}
                      </Badge>
                      <Badge tone={syncReady ? "success" : "warning"}>{syncReady ? "API" : "Local"}</Badge>
                    </div>

                    <div className="mt-3 text-xs text-zinc-500">
                      {slot.duration ? `${slot.duration} min` : "Duracion a confirmar"}
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
                            setErrorMessage("Debes iniciar sesion para reservar.");
                            return;
                          }

                          try {
                            const result = await reserveSlot(slot, { id: user.id, name: user.name });
                            setInfoMessage(
                              result.syncStatus === "synced"
                                ? "Reserva enviada y sincronizada."
                                : "Reserva enviada. Quedo lista para seguimiento."
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
