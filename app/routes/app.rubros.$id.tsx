import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import { mockRubros } from "../lib/rubros/mockRubros";
import { buildPlannedSlots } from "../lib/scheduling/bookableSlots";
import { useBranchClassSlots } from "../lib/scheduling/useBranchClassSlots";
import { useBranchScheduleConfig } from "../lib/scheduling/useBranchScheduleConfig";
import { useTenantConfig } from "../lib/tenant/useTenantConfig";

function formatARS(n: number) {
  return `$ ${n.toLocaleString("es-AR")}`;
}

function slotLabel(date: string, time: string) {
  return `${date} · ${time}`;
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
  const rubro = useMemo(() => mockRubros.find((item) => item.id === id), [id]);

  const plannedSlots = useMemo(() => {
    if (!branchId || !rubro) return [];
    return buildPlannedSlots({
      branchId,
      rubroId: rubro.id,
      rubroName: rubro.name,
      baseDurationMin: rubro.durationMin,
      disciplines,
      scheduleConfig,
    });
  }, [branchId, disciplines, rubro, scheduleConfig]);

  const {
    slots,
    loading: apiLoading,
    error: apiError,
    reserveSlot,
    reserving,
    usingFallbackSlots,
    hasBackendSlots,
  } = useBranchClassSlots(branchId, id ?? null, plannedSlots);

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!hydrated || apiLoading || disciplinesLoading || scheduleLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cargando..." subtitle="Preparando la agenda del rubro" />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">Preparando la vista...</CardContent>
        </Card>
      </div>
    );
  }

  if (!rubro) {
    return (
      <div className="space-y-4">
        <PageHeader title="Rubro no encontrado" subtitle="El rubro solicitado no existe localmente." />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">
            Si el backend todavía no sincronizó este rubro, el catálogo puede demorar o usar una clave distinta.
            Intentá recargar o volver al catálogo principal.
          </CardContent>
        </Card>
        <Link to="/app/rubros">
          <Button variant="secondary">Volver a rubros</Button>
        </Link>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <PageHeader title="Rubro no habilitado" subtitle="Este rubro no está disponible para el usuario actual." />
        <Card>
          <CardContent className="space-y-3 py-6">
            <Badge tone="warning">No habilitado</Badge>
            <p className="text-sm text-zinc-400">Si sos parte del backoffice, podés publicarlo desde el catálogo por sucursal.</p>
            <Link to="/app/rubros">
              <Button variant="secondary">Volver a rubros</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!branchId) {
    return (
      <div className="space-y-4">
        <PageHeader title="Seleccioná una sucursal" subtitle="Necesitamos una sede activa para mostrar la agenda del rubro." />
        <Card>
          <CardContent className="space-y-4 py-6 text-sm text-zinc-400">
            La disponibilidad depende de la sucursal activa, porque cada sede define sus propias franjas y turnos.
            <div>
              <Link to="/app/branches">
                <Button>Elegir sucursal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiError && slots.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title="Error cargando agenda" subtitle="Ocurrió un problema al consultar los horarios de la sucursal." />
        <Card>
          <CardContent className="py-6 text-sm text-red-400">
            {apiError instanceof Error ? apiError.message : "Error desconocido al cargar horarios."}
          </CardContent>
        </Card>
        <Link to="/app/rubros">
          <Button variant="secondary">Volver a rubros</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Agenda del rubro · ${rubro.name}`}
        subtitle="Elegi un horario y reserva en pocos pasos."
        right={
          <Link to="/app/rubros">
            <Button variant="secondary">Volver</Button>
          </Link>
        }
      />

      <Card className="border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_36%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))]">
        <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Reserva guiada</div>
            <div className="max-w-3xl text-2xl font-semibold leading-tight text-white">
              El usuario reserva dentro de la franja que Admin habilitó y el instructor recibe la solicitud lista para operar.
            </div>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300">
              Si la clase ya viene desde backend, sincronizamos el pedido con `POST /api/Classes`. Si todavía no existe esa clase real, guardamos la solicitud localmente para que el frontend siga operando sin baches.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Duración</div>
              <div className="mt-2 text-lg font-semibold text-white">{rubro.durationMin} min</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Precio base</div>
              <div className="mt-2 text-lg font-semibold text-white">{formatARS(rubro.basePrice)}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Fuente de agenda</div>
              <div className="mt-2 text-sm font-medium text-white">
                {hasBackendSlots ? "Clases reales del backend" : usingFallbackSlots ? "Planificación del admin" : "Sin agenda cargada"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Información general del rubro y su agenda operativa</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {rubro.tags.map((tag) => (
                <Badge key={tag} className="text-zinc-400">
                  #{tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Duración base</span>
              <span className="font-medium">{rubro.durationMin} min</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Precio base</span>
              <span className="font-semibold">{formatARS(rubro.basePrice)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Sucursal activa</span>
              <span className="font-medium">{branchId}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cómo funciona</CardTitle>
            <CardDescription>Lectura rápida del flujo de reserva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
              1. Elegís un horario disponible dentro de la sucursal activa.
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
              2. El frontend sincroniza con backend si la clase ya existe o deja la solicitud lista para conectar después.
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3">
              3. El instructor la confirma o la rechaza.
            </div>
            {isBackOffice ? (
              <Link to="/app/instructor" className="block">
                <Button variant="secondary" className="w-full">Ver panel instructor</Button>
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda disponible</CardTitle>
          <CardDescription>Elegí un turno dentro de la agenda habilitada para esta sucursal</CardDescription>
        </CardHeader>

        {infoMessage ? <CardContent className="text-sm text-emerald-400">{infoMessage}</CardContent> : null}
        {errorMessage ? <CardContent className="text-sm text-red-400">{errorMessage}</CardContent> : null}

        <CardContent className="space-y-4">
          {usingFallbackSlots ? (
            <div className="rounded-2xl border border-cyan-800/70 bg-cyan-950/20 px-4 py-3 text-sm text-cyan-100">
              Estás viendo una agenda generada desde la planificación semanal del admin. Queda lista para conectar con backend cuando aparezcan las clases reales.
            </div>
          ) : null}

          {!hasBackendSlots && !usingFallbackSlots && scheduleConfig && !scheduleConfig.updatedAt ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-3 text-sm text-zinc-400">
              Todavía no hay una planificación guardada para esta disciplina en la sucursal activa. Cuando admin defina y guarde la franja horaria, la agenda aparecerá acá.
            </div>
          ) : null}

          {slots.length === 0 ? (
            <div className="text-sm text-zinc-400">No hay horarios cargados para este rubro todavía.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const full = slot.available <= 0;
                const syncReady = slot.bookingSource === "api" && Number.isFinite(Number((slot as Record<string, unknown>).idBranchDiscipline ?? (slot as Record<string, unknown>)["branchDisciplineId"]));

                return (
                  <div
                    key={slot.id}
                    className={[
                      "rounded-2xl border border-zinc-800 p-4",
                      "bg-zinc-950 transition hover:bg-zinc-900/30",
                      full ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{slotLabel(slot.date, slot.time)}</div>
                      <Badge tone={full ? "warning" : "success"}>{full ? "Completo" : `${slot.available}/${slot.capacity}`}</Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={slot.bookingSource === "api" ? "success" : "neutral"}>
                        {slot.bookingSource === "api" ? "Clase real" : "Franja planificada"}
                      </Badge>
                      <Badge tone={syncReady ? "success" : "warning"}>
                        {syncReady ? "Lista para API" : "Lista para solicitud"}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-zinc-500">
                      <div>Capacidad: {slot.capacity}</div>
                      <div>Disponible: {slot.available}</div>
                      <div>{slot.duration ? `Duración estimada: ${slot.duration} min` : "Duración a confirmar"}</div>
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
                                ? "Solicitud enviada correctamente. Ya quedó sincronizada con backend y visible para seguimiento del instructor."
                                : "Solicitud guardada correctamente. Quedó lista en frontend para el instructor y preparada para conectarse con backend cuando esté disponible."
                            );
                          } catch (err) {
                            const message = err instanceof Error ? err.message : "Error al reservar turno";
                            setErrorMessage(message);
                          }
                        }}
                      >
                        {full ? "No disponible" : reserving ? "Enviando..." : "Solicitar turno"}
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
