import { useMemo } from "react";
import { Link } from "react-router";

import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";

import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

import { mockRubros } from "../lib/rubros/mockRubros";
import { useTenantConfig } from "../lib/tenant/useTenantConfig";


function formatARS(n: number) {
    // simple y sin Intl para evitar configs; si querés lo pasamos a Intl luego
    return `$ ${n.toLocaleString("es-AR")}`;
}

export default function RubrosPage() {
    const { user } = useAuth();
    const isDev = user?.role === ROLES.DEV;
    const canManage = user?.role === ROLES.ADMIN || isDev;

    const { config, hydrated, toggleRubro, enableAll, disableAll } = useTenantConfig();

    const allIds = useMemo(() => mockRubros.map((r) => r.id), [mockRubros.length]);

    const rubros = useMemo(() => {
        const enabled = new Set(config.enabledRubroIds);
        return mockRubros.filter(r => enabled.has(r.id));
    }, [config.enabledRubroIds]);


    if (!hydrated) {
        return (
            <div className="space-y-6">
                <PageHeader title="Cargando rubros..." subtitle="Por favor, espere." />
                <Card>
                    <CardContent className="py-6 text-sm text-zinc-400">
                        Preparando la vista...
                    </CardContent>
                </Card>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <PageHeader
                title="Rubros"
                subtitle="Catálogo de actividades y espacios disponibles."
                right={
                    canManage ? (
                        <Button variant="secondary">+ Nuevo rubro</Button>
                    ) : (
                        <Button variant="secondary">Mis reservas</Button>
                    )
                }
            />
            {isDev && (
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración del cliente (Dev)</CardTitle>
                        <CardDescription>
                            Activá los rubros que este cliente va a ver. Esto simula un feature-flag por tenant.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {mockRubros.map((r) => {
                                const checked = config.enabledRubroIds.includes(r.id);
                                return (
                                    <label
                                        key={r.id}
                                        className={[
                                            "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer",
                                            checked ? "border-zinc-700 bg-zinc-900/40" : "border-zinc-800 bg-zinc-950",
                                            "hover:bg-zinc-900/30 transition",
                                        ].join(" ")}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleRubro(r.id)}
                                            className="accent-zinc-200"
                                        />
                                        <span className="font-medium">{r.name}</span>
                                        <span className="text-zinc-500 text-xs">({r.id})</span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-zinc-400">
                                Habilitados: <span className="text-zinc-200">{config.enabledRubroIds.length}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => enableAll(allIds)}>
                                    Habilitar todos
                                </Button>
                                <Button size="sm" variant="ghost" onClick={disableAll}>
                                    Deshabilitar todos
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {rubros.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No hay rubros habilitados</CardTitle>
                        <CardDescription>
                            {isDev
                                ? "Seleccioná al menos un rubro para este cliente."
                                : "Contactá al administrador para habilitar rubros."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isDev && (
                            <Badge tone="warning">
                                ⚠️ Dev: activá rubros desde el panel de arriba
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {rubros.map((r) => (
                        <Card key={r.id} className="hover:bg-zinc-900/35 transition">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle>{r.name}</CardTitle>
                                        <CardDescription>{r.description}</CardDescription>
                                    </div>
                                    <Badge className="shrink-0">⏱️ {r.durationMin}m</Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {r.tags.map((t) => (
                                        <Badge key={t} tone="neutral" className="text-zinc-400">
                                            #{t}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-zinc-400">Precio base</div>
                                    <div className="text-base font-semibold">{formatARS(r.basePrice)}</div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex items-center justify-between gap-3">
                                <Link to={`/app/rubros/${r.id}`} className="w-full sm:w-auto">
                                    <Button size="sm" variant="primary" className="w-full">
                                        Ver horarios
                                    </Button>
                                </Link>


                                {canManage ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost">
                                            Editar
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-300 hover:text-red-200">
                                            Eliminar
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="secondary">
                                        Reservar
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
