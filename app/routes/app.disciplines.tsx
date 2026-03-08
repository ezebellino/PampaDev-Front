import { useMemo, useState } from "react";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";

import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import ScreenLoader from "../components/ui/ScreenLoader";

import { useDisciplines } from "../lib/disciplines/useDisciplines";
import {
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
  type Discipline,
} from "../lib/api/services/disciplines";

import { logInfo, logError } from "../lib/utils/logger";

export default function DisciplinesRoute() {
  return (
    <Protected allowRoles={[ROLES.DEVS]}>
      <DisciplinesPage />
    </Protected>
  );
}

function DisciplinesPage() {
  const { disciplines, loading, error, refresh } = useDisciplines();

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return disciplines;
    return disciplines.filter((d) => d.name.toLowerCase().includes(s));
  }, [disciplines, q]);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [busyCreate, setBusyCreate] = useState(false);

  // Edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<Discipline | null>(null);
  const [editName, setEditName] = useState("");
  const [busyEdit, setBusyEdit] = useState(false);

  async function onCreate() {
    const name = newName.trim();
    if (!name) return;

    setBusyCreate(true);
    try {
      await createDiscipline({ name });
      logInfo("Discipline created", { name });
      setOpenCreate(false);
      setNewName("");
      await refresh();
    } catch (e: any) {
      logError("Discipline create failed", { name, message: e?.message });
      alert(e?.message || "No se pudo crear la discipline");
    } finally {
      setBusyCreate(false);
    }
  }

  function openEditModal(d: Discipline) {
    setEditTarget(d);
    setEditName(d.name);
    setOpenEdit(true);
  }

  async function onEditSave() {
    if (!editTarget) return;
    const name = editName.trim();
    if (!name) return;

    if (name === editTarget.name) {
      setOpenEdit(false);
      setEditTarget(null);
      return;
    }

    setBusyEdit(true);
    try {
      await updateDiscipline(editTarget.idDiscipline, { name });
      logInfo("Discipline updated", { id: editTarget.idDiscipline, name });
      setOpenEdit(false);
      setEditTarget(null);
      await refresh(); // ✅ mejor await (estado consistente)
    } catch (e: any) {
      logError("Discipline update failed", { id: editTarget?.idDiscipline, message: e?.message });
      alert(e?.message || "No se pudo actualizar la discipline");
    } finally {
      setBusyEdit(false);
    }
  }

  async function onDelete(d: Discipline) {
    const ok = confirm(`¿Eliminar "${d.name}"?`);
    if (!ok) return;

    try {
      await deleteDiscipline(d.idDiscipline);
      logInfo("Discipline deleted", { id: d.idDiscipline, name: d.name });
      await refresh();
    } catch (e: any) {
      logError("Discipline delete failed", { id: d.idDiscipline, message: e?.message });
      alert(e?.message || "No se pudo eliminar la discipline");
    }
  }

  // ✅ Loader pantalla completa (consistente con Rubros)
  if (loading) {
    return <ScreenLoader label="Cargando disciplines desde la API…" />;
  }

  // ✅ Error pantalla (consistente)
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Disciplines" subtitle="Error cargando catálogo desde la API" />
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription className="text-zinc-400">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="secondary" onClick={refresh}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disciplines"
        subtitle="Catálogo base (global). Costos y duración se definen por sucursal/tenant."
        right={
          <Button variant="secondary" onClick={() => setOpenCreate(true)}>
            + Nueva discipline
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>GET /api/Disciplines</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full sm:w-80 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            />
            <div className="flex items-center gap-2">
              <Badge tone="neutral" className="text-zinc-300">
                {filtered.length} / {disciplines.length}
              </Badge>
              <Button variant="ghost" onClick={refresh}>
                Refrescar
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-sm text-zinc-400">No hay results.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <div
                  key={d.idDiscipline}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 hover:bg-zinc-900/25 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{d.name}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        idDiscipline: {d.idDiscipline}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(d)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-300 hover:text-red-200"
                        onClick={() => onDelete(d)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="text-xs text-zinc-500">
          Nota: precios y duración no viven en Discipline (eso es por sucursal/tenant).
        </CardFooter>
      </Card>

      {/* Create Modal */}
      <Modal open={openCreate} title="Nueva discipline" onClose={() => !busyCreate && setOpenCreate(false)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Nombre</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: Pádel, Boxeo, Natación…"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenCreate(false)} disabled={busyCreate}>
              Cancelar
            </Button>
            <Button onClick={onCreate} disabled={busyCreate || !newName.trim()}>
              {busyCreate ? "Creando…" : "Crear"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={openEdit} title="Editar discipline" onClose={() => !busyEdit && setOpenEdit(false)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Nombre</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Nombre…"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setOpenEdit(false);
                setEditTarget(null);
              }}
              disabled={busyEdit}
            >
              Cancelar
            </Button>
            <Button onClick={onEditSave} disabled={busyEdit || !editName.trim()}>
              {busyEdit ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}