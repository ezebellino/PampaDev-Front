import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { useAuth } from "../lib/auth/AuthContext";
import { useRubroRequests } from "../lib/rubros/useRubroRequests";

type Payload = {
  name: string;
  description?: string;
  exampleServices?: string;
  notes?: string;
};

export default function AdminNewDisciplineRequest() {
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
    <Card>
      <CardHeader>
        <CardTitle>Solicitar nuevo rubro</CardTitle>
        <CardDescription>
          Enviá una solicitud a Devs para que creen el rubro o disciplina.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Nombre del rubro *</label>
            <input
              value={p.name}
              onChange={(event) => set("name", event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: Pilates, Pádel, Taekwondo…"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Descripción</label>
            <textarea
              value={p.description}
              onChange={(event) => set("description", event.target.value)}
              className="w-full min-h-24 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="¿Qué es y para qué se usa?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Ejemplos de servicios</label>
            <input
              value={p.exampleServices}
              onChange={(event) => set("exampleServices", event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: clase grupal, clase individual, mensualidad…"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Notas para Devs</label>
            <textarea
              value={p.notes}
              onChange={(event) => set("notes", event.target.value)}
              className="w-full min-h-20 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Cualquier detalle útil: prioridad, imagen sugerida, reglas especiales, etc."
            />
          </div>

          {error ? <div className="text-sm text-red-300">{error}</div> : null}

          <div className="flex gap-2">
            <Button disabled={saving}>{saving ? "Enviando..." : "Enviar solicitud"}</Button>
            <Button type="button" variant="secondary" onClick={() => nav(-1)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
