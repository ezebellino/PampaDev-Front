import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../lib/auth/AuthContext";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useRubroRequests } from "../lib/rubros/useRubroRequests";

type Payload = {
  name: string;
  description?: string;
  exampleServices?: string;
  notes?: string;
};

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-zinc-200">{label}</label>
        {required ? <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500">Obligatorio</span> : null}
      </div>
      {hint ? <p className="text-xs leading-5 text-zinc-500">{hint}</p> : null}
      {children}
    </div>
  );
}

export default function AdminNewDisciplineRequestRoute() {
  return (
    <Protected allowRoles={[ROLES.ADMIN]}>
      <AdminNewDisciplineRequest />
    </Protected>
  );
}

function AdminNewDisciplineRequest() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { createRequest } = useRubroRequests();
  const [p, setP] = useState<Payload>({
    name: "",
    description: "",
    exampleServices: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Payload>(key: K, value: Payload[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const name = p.name.trim();
    if (!name) {
      setError("El nombre del rubro es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      createRequest({
        requestedBy: user?.email ?? user?.name ?? "admin@example.com",
        requestedByRole: user?.role ?? "ADMIN",
        title: name,
        description: p.description?.trim() || undefined,
        exampleServices: p.exampleServices?.trim() || undefined,
        notes: p.notes?.trim() || undefined,
      });

      nav("/app/admin/solicitudes", { replace: true });
    } catch (e: any) {
      setError(e?.message ?? "No se pudo enviar la solicitud.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva solicitud de rubro"
        subtitle="Prepará el pedido para Devs con el contexto suficiente para que puedan evaluar, crear o ajustar el catálogo sin ida y vuelta innecesaria."
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80">
          <div className="h-24 bg-linear-to-r from-cyan-500/12 via-emerald-500/8 to-transparent" />
          <CardHeader className="relative -mt-4">
            <CardTitle className="text-xl text-zinc-100">Solicitar nuevo rubro</CardTitle>
            <CardDescription>
              Completá la información clave para que el equipo Devs pueda revisar la solicitud y tomar una decisión.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <Field
                label="Nombre del rubro"
                hint="Usá un nombre claro y directamente reutilizable en el catálogo."
                required
              >
                <input
                  value={p.name}
                  onChange={(event) => set("name", event.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-cyan-500/40"
                  placeholder="Ej: Pilates, Pádel, Taekwondo…"
                />
              </Field>

              <Field
                label="Descripción"
                hint="Explicá qué servicio se necesita y cómo debería entenderlo el usuario final."
              >
                <textarea
                  value={p.description}
                  onChange={(event) => set("description", event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-cyan-500/40"
                  placeholder="Ej: clases grupales con cupos limitados, reservas por horario, modalidad mensual o por clase…"
                />
              </Field>

              <Field
                label="Ejemplos de servicios"
                hint="Podés listar formatos, variantes o productos que deberían existir dentro del rubro."
              >
                <input
                  value={p.exampleServices}
                  onChange={(event) => set("exampleServices", event.target.value)}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-cyan-500/40"
                  placeholder="Ej: clase grupal, clase individual, mensualidad, reserva por turno…"
                />
              </Field>

              <Field
                label="Notas para Devs"
                hint="Aclaraciones técnicas u operativas: prioridad, restricciones, material visual o reglas especiales."
              >
                <textarea
                  value={p.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-cyan-500/40"
                  placeholder="Ej: se usará en dos sucursales, requiere imagen representativa, necesita clases grupales e individuales…"
                />
              </Field>

              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => nav(-1)}>
                  Cancelar
                </Button>
                <Button disabled={saving}>{saving ? "Enviando..." : "Enviar solicitud"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Qué conviene incluir</CardTitle>
              <CardDescription>
                Una buena solicitud reduce fricción y acelera la incorporación del rubro.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-400">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                Nombre claro y consistente con el lenguaje del negocio.
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                Ejemplos concretos de servicios, variantes o formatos de cobro.
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 px-4 py-3">
                Cualquier contexto operativo que impacte en UX o lógica.
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>Flujo posterior</CardTitle>
              <CardDescription>
                Después de enviarla, la solicitud queda visible para Devs en la bandeja completa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-400">
              <p>
                Desde tu cuenta de Admin vas a poder seguir el estado, revisar feedback interno y confirmar si la
                propuesta fue aprobada, rechazada o necesita ajustes.
              </p>
              <Button variant="ghost" className="w-full" onClick={() => nav("/app/admin/solicitudes")}>
                Ver mis solicitudes
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
