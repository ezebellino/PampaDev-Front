import { useState } from "react";
import DisciplineForm, { type DisciplineFormData } from "../components/disciplines/DisciplineForm";
import DisciplineList from "../components/disciplines/DisciplineList";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import type { Discipline } from "../lib/api/services/disciplines";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";
import { useDisciplines } from "../lib/disciplines/useDisciplines";

export default function DisciplinesRoute() {
  return (
    <Protected allowRoles={[ROLES.DEVS]}>
      <DisciplinesPage />
    </Protected>
  );
}

function DisciplinesPage() {
  const { disciplines, loading, error, refresh, create, update, remove } = useDisciplines();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Discipline | null>(null);
  const [createBusy, setCreateBusy] = useState(false);
  const [editBusy, setEditBusy] = useState(false);

  if (loading) {
    return (
      <ScreenLoader
        title="Cargando disciplinas…"
        subtitle="Estamos preparando el catálogo general de la plataforma."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Disciplinas"
          subtitle="No pudimos cargar el catálogo global en este momento."
        />
        <Card>
          <CardContent className="space-y-3 py-6 text-sm">
            <div className="font-medium text-red-300">Ocurrió un problema al cargar las disciplinas.</div>
            <div className="text-zinc-400">{error}</div>
            <div>
              <Button variant="secondary" onClick={() => void refresh()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleCreate(data: DisciplineFormData) {
    setCreateBusy(true);
    try {
      await create(data.name);
      setCreateOpen(false);
    } catch (e: any) {
      alert(e?.message || "No se pudo crear la disciplina.");
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleEdit(data: DisciplineFormData) {
    if (!editTarget) return;

    setEditBusy(true);
    try {
      await update(editTarget.idDiscipline, data.name);
      setEditTarget(null);
    } catch (e: any) {
      alert(e?.message || "No se pudo actualizar la disciplina.");
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDelete(discipline: Discipline) {
    const confirmed = confirm(`¿Eliminar "${discipline.name}"?`);
    if (!confirmed) return;

    try {
      await remove(discipline);
    } catch (e: any) {
      alert(e?.message || "No se pudo eliminar la disciplina.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disciplinas"
        subtitle="Gestioná el catálogo base que después se adapta a cada sucursal según su operación."
        right={
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            + Nueva disciplina
          </Button>
        }
      />

      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
        <div className="h-20 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),transparent_55%)]" />
        <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-zinc-400">
          <p>
            Este catálogo funciona como base común para el resto del producto. Después, cada sucursal
            puede decidir visibilidad, duración y precio.
          </p>
          <p>
            Mantenerlo limpio y consistente hace que la configuración operativa sea más simple en el
            resto de las pantallas.
          </p>
        </CardContent>
      </Card>

      <DisciplineList
        disciplines={disciplines}
        onEdit={setEditTarget}
        onDelete={handleDelete}
        onRefresh={refresh}
      />

      <Modal
        open={createOpen}
        title="Nueva disciplina"
        onClose={() => {
          if (!createBusy) setCreateOpen(false);
        }}
      >
        <DisciplineForm
          loading={createBusy}
          submitLabel="Crear disciplina"
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        open={!!editTarget}
        title="Editar disciplina"
        onClose={() => {
          if (!editBusy) setEditTarget(null);
        }}
      >
        <DisciplineForm
          initialData={editTarget ? { name: editTarget.name } : undefined}
          loading={editBusy}
          submitLabel="Guardar cambios"
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      </Modal>
    </div>
  );
}
