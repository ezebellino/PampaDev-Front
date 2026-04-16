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
        <label className="text-sm font-medium text-slate-800">{label}</label>
        {required ? <span className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] text-stone-500">Obligatorio</span> : null}
      </div>
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
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
  const { createRequest, creating } = useRubroRequests();
  const [p, setP] = useState<Payload>({
    name: "",
    description: "",
    exampleServices: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Payload>(key: K, value: Payload[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const name = p.name.trim();
    if (!name) {
      setError("El nombre de la disciplina o propuesta es obligatorio.");
      return;
    }

    try {
      await createRequest({
        requestedBy: user?.email ?? user?.name ?? "admin@example.com",
        requestedByRole: user?.role ?? "ADMIN",
        title: name,
        description: p.description?.trim() || undefined,
        exampleServices: p.exampleServices?.trim() || undefined,
        notes: p.notes?.trim() || undefined,
      });

      nav("/app/admin/requests", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva solicitud"
        subtitle="Prepara el pedido con la información necesaria para que el equipo pueda evaluarlo y sumarlo al catálogo sin demoras innecesarias."
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <Card className="overflow-hidden border-stone-200 bg-white/95 shadow-sm">
          <div className="h-24 bg-linear-to-r from-sky-100 via-teal-100/70 to-transparent" />
          <CardHeader className="relative -mt-4">
            <CardTitle className="text-xl text-slate-900">Solicitar nueva disciplina o ajuste</CardTitle>
            <CardDescription>
              Completa la información clave para que el equipo pueda revisar la propuesta y decidir si corresponde incorporarla.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <Field
                label="Nombre"
                hint="Usa un nombre claro y fácil de reconocer para todo el equipo."
                required
              >
                <input
                  value={p.name}
                  onChange={(event) => set("name", event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white"
                  placeholder="Ej: Pilates, Padel, Taekwondo..."
                />
              </Field>

              <Field
                label="Descripción"
                hint="Explica qué servicio se necesita y cómo deber?a entenderlo el usuario final."
              >
                <textarea
                  value={p.description}
                  onChange={(event) => set("description", event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white"
                  placeholder="Ej: clases grupales con cupos limitados, reservas por horario, modalidad mensual o por clase..."
                />
              </Field>

              <Field
                label="Ejemplos de servicio"
                hint="Puedes listar formatos, variantes o productos que deberían existir dentro de la propuesta."
              >
                <input
                  value={p.exampleServices}
                  onChange={(event) => set("exampleServices", event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white"
                  placeholder="Ej: clase grupal, clase individual, mensualidad, reserva por turno..."
                />
              </Field>

              <Field
                label="Notas internas"
                hint="Aclaraciones operativas: prioridad, restricciones, material visual o reglas especiales."
              >
                <textarea
                  value={p.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white"
                  placeholder="Ej: se usará en dos sucursales, requiere imagen representativa y necesita clases grupales e individuales..."
                />
              </Field>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => nav(-1)}>
                  Cancelar
                </Button>
                <Button disabled={creating}>{creating ? "Enviando..." : "Enviar solicitud"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-stone-200 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle>Qu? conviene incluir</CardTitle>
              <CardDescription>
                Una buena solicitud reduce fricción y acelera la incorporación al catálogo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                Nombre claro y consistente con el lenguaje del negocio.
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                Ejemplos concretos de servicios, variantes o formatos de cobro.
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                Cualquier contexto operativo que impacte en la experiencia o en la organización del servicio.
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle>Cómo sigue después</CardTitle>
              <CardDescription>
                La solicitud queda visible para revisión y vuelve al flujo operativo cuando se aprueba.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                Desde tu cuenta vas a poder seguir el estado y confirmar si la propuesta fue aprobada, rechazada o necesita ajustes.
              </p>
              <Button variant="ghost" className="w-full" onClick={() => nav("/app/admin/requests")}>
                Ver mis solicitudes
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
