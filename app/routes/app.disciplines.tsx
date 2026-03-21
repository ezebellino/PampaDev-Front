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
    return <ScreenLoader title="Cargando disciplinas..." subtitle="Estamos preparando el catalogo base de la plataforma." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Disciplinas" subtitle="No pudimos cargar el catalogo global en este momento." />
        <Card>
          <CardContent className="space-y-3 py-6 text-sm">
            <div className="font-medium text-red-300">Ocurrio un problema al cargar las disciplinas.</div>
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
        subtitle="Gestiona el catalogo base que despues cada sucursal publica como rubro operativo segun su realidad."
        right={
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            + Nueva disciplina
          </Button>
        }
      />

      <Card className="border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_36%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(9,9,11,0.98))]">
        <CardContent className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="space-y-3 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Catalogo base</div>
            <div className="max-w-3xl text-2xl font-semibold leading-tight text-white">
              Aqui nace el lenguaje comun que despues usan rubros, membresias, horarios y solicitudes.
            </div>
            <p className="max-w-3xl leading-6 text-zinc-300/90">
              Mantener este catalogo limpio y consistente evita confusiones en toda la operacion. La disciplina es el concepto base; la sucursal luego decide como se presenta y vende.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Disciplinas</div>
              <div className="mt-2 text-2xl font-semibold text-white">{disciplines.length}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-400">Proximo paso</div>
              <div className="mt-2 text-sm font-medium text-white">Publicarlas por sucursal en Rubros</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
        <div className="h-20 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),transparent_55%)]" />
        <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-zinc-400">
          <p>
            Piensalo asi: disciplina = catalogo base. Rubro = esa disciplina ya configurada para una sucursal.
          </p>
          <p>
            Si un Admin necesita algo nuevo, primero pasa por Solicitudes. Cuando se aprueba, se suma aqui y despues se publica en la sede correspondiente.
          </p>
        </CardContent>
      </Card>

      <DisciplineList disciplines={disciplines} onEdit={setEditTarget} onDelete={handleDelete} onRefresh={refresh} />

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
