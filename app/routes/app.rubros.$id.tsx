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
  const { id } = useParams(); // 👈 /app/rubros/:id
  const { user } = useAuth();
  const isBackOffice =
    user?.role === ROLES.DEVS ||
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.INSTRUCTOR;

  // tenant config (para bloquear rubros no habilitados)
  const { config, hydrated } = useTenantConfig();

  const isEnabled = !!id && config.enabledRubroIds.includes(id);

  const rubro = useMemo(() => mockRubros.find((r) => r.id === id), [id]);

  const { branchId } = useBranch();
  const {
    slots: apiSlots,
    loading: apiLoading,
    error: apiError,
    reserveSlot,
    reserving,
    reservationError,
  } = useBranchClassSlots(branchId, id ?? null);

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slots = apiSlots.length > 0 ? apiSlots : mockSlots.filter((s) => s.rubroId === id);

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

  // Si no hay rubro local, puede ser que el endpoint aún no sincronizó (dev backend)
  if (!rubro) {
    return (
      <div className="space-y-4">
        <PageHeader title="Rubro no encontrado" subtitle="El rubro solicitado no existe localmente." />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">
            Si el backend no está listo, el catálogo puede demorar o la claves pueden ser distintas.
            Intenta recargar o sincronizar el catálogo.
          </CardContent>
        </Card>
        <Link to="/app/rubros">
          <Button variant="secondary">← Volver a Rubros</Button>
        </Link>
      </div>
    );
  }

  // rubro existe pero NO está habilitado para el cliente
  if (!isEnabled) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Rubro no habilitado"
          subtitle="Este rubro no está disponible para este cliente."
        />
        <Card>
          <CardContent className="py-6 space-y-3">
            <Badge tone="warning">⚠️ No habilitado</Badge>
            <p className="text-sm text-zinc-400">
              Si sos Dev, habilitalo desde la lista de rubros.
            </p>
            <Link to="/app/rubros">
              <Button variant="secondary">← Volver a Rubros</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Error cargando horarios"
          subtitle="Ocurrió un problema al cargar los horarios desde el backend."
        />
        <Card>
          <CardContent className="py-6 text-sm text-red-400">
            {"Detalles: " + (apiError instanceof Error ? apiError.message : "Error desconocido")}
          </CardContent>
        </Card>
        <Link to="/app/rubros">
          <Button variant="secondary">← Volver a Rubros</Button>
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
            <Button variant="secondary">← Rubros</Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalle</CardTitle>
            <CardDescription>Información general del rubro</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {rubro.tags.map((t) => (
                <Badge key={t} className="text-zinc-400">
                  #{t}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Duración</span>
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
            <CardDescription>Según tu rol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full">Reservar</Button>

            {isBackOffice && (
              <Button variant="secondary" className="w-full">
                Administrar horarios
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horarios disponibles</CardTitle>
          <CardDescription>Seleccioná un turno para reservar</CardDescription>
        </CardHeader>

        {apiLoading && (
          <CardContent className="text-sm text-zinc-400">Cargando horarios desde el servidor...</CardContent>
        )}

        {apiError && (
          <CardContent className="text-sm text-red-400">Error al cargar horarios: {(apiError as Error).message}</CardContent>
        )}

        {infoMessage && (
          <CardContent className="text-sm text-emerald-400">{infoMessage}</CardContent>
        )}

        {errorMessage && (
          <CardContent className="text-sm text-red-400">{errorMessage}</CardContent>
        )}

        <CardContent className="space-y-3">
          {slots.length === 0 ? (
            <div className="text-sm text-zinc-400">
              No hay horarios cargados para este rubro todavía.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((s) => {
                const full = s.available <= 0;
                return (
                  <div
                    key={s.id}
                    className={[
                      "rounded-2xl border border-zinc-800 p-4",
                      "bg-zinc-950 hover:bg-zinc-900/30 transition",
                      full ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{slotLabel(s.date, s.time)}</div>
                      <Badge tone={full ? "warning" : "success"}>
                        {full ? "Completo" : `${s.available}/${s.capacity}`}
                      </Badge>
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
                            setErrorMessage("Debes iniciar sesión para reservar.");
                            return;
                          }

                          try {
                            await reserveSlot(s, user.id);
                            setInfoMessage("Reserva registrada correctamente. El instructor deberá confirmar el turno.");
                          } catch (err) {
                            const message = err instanceof Error ? err.message : "Error al reservar turno";
                            setErrorMessage(message);
                          }
                        }}
                      >
                        {full ? "No disponible" : reserving ? "Reservando..." : "Reservar turno"}
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
