import { useEffect, useMemo, useRef, useState } from "react";
import AvailabilityEditor from "../components/admin/AvailabilityEditor";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import ScreenLoader from "../components/ui/ScreenLoader";
import { useBranchAvailability } from "../lib/api/hooks/useBranchAvailability";
import { updateBranchAvailability, type WeeklyAvailability } from "../lib/api/services/availability";
import { useBranch } from "../lib/branches/BranchContext";

function deepEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function AdminHorarios() {
  const { branchId } = useBranch();
  const { data, loading, error, unavailable } = useBranchAvailability(branchId);

  const [draft, setDraft] = useState<WeeklyAvailability | null>(null);
  const [saving, setSaving] = useState(false);
  const lastBranchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (branchId !== lastBranchIdRef.current) {
      lastBranchIdRef.current = branchId ?? null;
      setDraft(null);
    }
  }, [branchId]);

  useEffect(() => {
    if (!data) return;
    setDraft((previous) => (previous == null ? data : previous));
  }, [data]);

  const dirty = useMemo(() => {
    if (!data || !draft) return false;
    return !deepEqual(data, draft);
  }, [data, draft]);

  if (branchId == null) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Horarios base"
          subtitle="Elegí una sucursal para revisar la disponibilidad general antes de abrir turnos al público."
        />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">
            No hay una sucursal activa seleccionada.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <ScreenLoader
        title="Cargando horarios…"
        subtitle="Estamos preparando la disponibilidad general de esta sucursal."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Horarios base"
          subtitle="No pudimos cargar la disponibilidad en este momento."
        />
        <Card>
          <CardContent className="py-6 text-sm text-red-300">{String(error)}</CardContent>
        </Card>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="space-y-6">
        <PageHeader title="Horarios base" subtitle="Todavía no hay datos para esta sucursal." />
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">
            Cuando la disponibilidad esté lista, la vas a poder editar desde acá.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Horarios base"
          subtitle="La edición de disponibilidad todavía no está habilitada para esta sucursal."
        />
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
          <div className="h-20 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),transparent_55%)]" />
          <CardContent className="relative -mt-2 space-y-2 py-5 text-sm text-zinc-400">
            <p>
              Esta sección va a permitir definir los horarios base de atención y disponibilidad para
              cada sede.
            </p>
            <p>
              Por ahora, la edición todavía no está habilitada en este entorno.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horarios base"
        subtitle={`Configurá la disponibilidad general de la sucursal ${branchId} antes de habilitar reservas.`}
        right={
          <Button
            disabled={!dirty || saving}
            onClick={async () => {
              setSaving(true);
              try {
                const saved = await updateBranchAvailability(branchId, draft);
                setDraft(saved);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        }
      />

      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
        <div className="h-20 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),transparent_55%)]" />
        <CardContent className="relative -mt-2 flex flex-col gap-2 py-5 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
          <div>
            <p>
              Ajustá la disponibilidad semanal para ordenar la operación y dar una base clara al resto
              del sistema.
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs ${
              dirty
                ? "border border-amber-500/20 bg-amber-500/10 text-amber-100"
                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {dirty ? "Cambios sin guardar" : "Todo guardado"}
          </div>
        </CardContent>
      </Card>

      <AvailabilityEditor value={draft} onChange={setDraft} />
    </div>
  );
}
