
import { Link, useParams } from "react-router";
import { useMemo, useState } from "react";

import { mockRubros } from "../lib/rubros/mockRubros";
import { mockSlots } from "../lib/horarios/mockHorarios";

import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useBranchClassSlots } from "../lib/scheduling/useBranchClassSlots";

import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
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

  const isEnabled = !!id && config.enabledRubroIds.includes(id);
  const rubro = useMemo(() => mockRubros.find((item) => item.id === id), [id]);

  const { branchId } = useBranch();
  const { slots: apiSlots, loading: apiLoading, error: apiError, reserveSlot, reserving } = useBranchClassSlots(branchId, id ?? null);

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slots = apiSlots.length > 0 ? apiSlots : mockSlots.filter((slot) => slot.rubroId === id);

  if (!hydrated || apiLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cargando..." subtitle="Preparando el detalle del rubro" />
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
            Si el backend todavia no sincronizo este rubro, el catalogo puede demorar o usar una clave distinta.
            Intenta recargar o volver al catalogo principal.
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
        <PageHeader title="Rubro no habilitado" subtitle="Este rubro no esta disponible para el usuario actual." />
        <Card>
          <CardContent className="py-6 space-y-3">
            <Badge tone="warning">No habilitado</Badge>
            <p className="text-sm text-zinc-400">Si eres Devs, puedes publicarlo desde el catalogo por sucursal.</p>
            <Link to="/app/rubros">
              <Button variant="secondary">Volver a rubros</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Error cargando horarios" subtitle="Ocurrio un problema al consultar los slots del backend." />
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
        title={rubro.name}
        subtitle={rubro.description}
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
              El usuario agenda dentro de la franja que Admin habilito y el backend crea la clase con el contrato real de /api/Classes.
            </div>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300">
              Si el slot viene completo desde backend, la reserva usa fecha, hora, capacidad y creditos del turno seleccionado. Si falta idBranchDiscipline, frenamos la accion para no mandar datos inventados.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Duracion</div>
              <div className="mt-2 text-lg font-semibold text-white">{rubro.durationMin} min</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Precio base</div>
              <div className="mt-2 text-lg font-semibold text-white">{formatARS(rubro.basePrice)}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Sucursal</div>
              <div className="mt-2 text-sm font-medium text-white">{branchId ?? "Sin seleccionar"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalle</CardTitle>
            <CardDescription>Informacion general del rubro</CardDescription>
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
              <span className="text-sm text-zinc-400">Duracion base</span>
              <span className="font-medium">{rubro.durationMin} min</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Precio base</span>
              <span className="font-semibold">{formatARS(rubro.basePrice)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>Segun tu rol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" disabled>
              Selecciona un horario abajo
            </Button>

            {isBackOffice ? (
              <Button variant="secondary" className="w-full">
                Administrar horarios
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horarios disponibles</CardTitle>
          <CardDescription>Selecciona un turno dentro de la agenda permitida</CardDescription>
        </CardHeader>

        {infoMessage ? <CardContent className="text-sm text-emerald-400">{infoMessage}</CardContent> : null}
        {errorMessage ? <CardContent className="text-sm text-red-400">{errorMessage}</CardContent> : null}

        <CardContent className="space-y-3">
          {slots.length === 0 ? (
            <div className="text-sm text-zinc-400">No hay horarios cargados para este rubro todavia.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const full = slot.available <= 0;
                const branchDisciplineReady = Number.isFinite(Number((slot as Record<string, unknown>).idBranchDiscipline ?? (slot as Record<string, unknown>)["branchDisciplineId"]));

                return (
                  <div
                    key={slot.id}
                    className={[
                      "rounded-2xl border border-zinc-800 p-4",
                      "bg-zinc-950 hover:bg-zinc-900/30 transition",
                      full ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{slotLabel(slot.date, slot.time)}</div>
                      <Badge tone={full ? "warning" : "success"}>{full ? "Completo" : `${slot.available}/${slot.capacity}`}</Badge>
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-zinc-500">
                      <div>Capacidad: {slot.capacity}</div>
                      <div>Disponible: {slot.available}</div>
                      <div>{branchDisciplineReady ? "Slot listo para POST /api/Classes" : "Falta idBranchDiscipline desde backend"}</div>
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
                            await reserveSlot(slot, user.id);
                            setInfoMessage(
                              "Solicitud enviada correctamente. El backend recibio el POST /api/Classes y el turno quedo registrado para seguimiento del instructor."
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
