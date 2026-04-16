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
    return <ScreenLoader title="Cargando disciplinas..." subtitle="Estamos preparando el catálogo base de la plataforma." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Disciplinas" subtitle="No pudimos cargar el catálogo global en este momento." />
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="space-y-3 py-6 text-sm text-rose-700">
            <div className="font-medium">Ocurrió un problema al cargar las disciplinas.</div>
            <div>{error}</div>
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
        subtitle="Gestioná el catálogo base que después cada sucursal publica como rubro operativo según su realidad."
        right={
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            + Nueva disciplina
          </Button>
        }
      />

      <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
        <div className="h-24 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.24),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,250,255,0.99))]" />
        <CardContent className="relative -mt-2 grid gap-5 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="text-xs uppercase tracking-[0.24em] text-sky-700">Catálogo base</div>
            <div className="max-w-3xl text-2xl font-semibold leading-tight text-slate-900">
              Acá nace el lenguaje común que después usan rubros, membresías, horarios y solicitudes.
            </div>
            <p className="max-w-3xl leading-6 text-slate-600">
              Mantener este catálogo limpio y consistente evita confusiones en toda la operación. La disciplina es el concepto base y la sucursal luego decide cómo se presenta y vende.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Disciplinas</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{disciplines.length}</div>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-stone-500">Próximo paso</div>
              <div className="mt-2 text-sm font-medium text-slate-900">Publicarlas por sucursal en Rubros</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-stone-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
        <div className="h-20 bg-[linear-gradient(135deg,rgba(125,211,252,0.18),transparent_55%)]" />
        <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-slate-600">
          <p>Pensalo así: disciplina = catálogo base. Rubro = esa disciplina ya configurada para una sucursal.</p>
          <p>
            Si un admin necesita algo nuevo, primero pasa por Solicitudes. Cuando se aprueba, se suma acá y después se publica en la sede correspondiente.
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
