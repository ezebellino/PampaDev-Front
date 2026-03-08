import { useMemo, useState, useEffect, useRef } from "react";
import { useBranch } from "../lib/branches/BranchContext";
import { useBranchAvailability } from "../lib/api/hooks/useBranchAvailability";
import { updateBranchAvailability, type WeeklyAvailability } from "../lib/api/services/availability";
import { Button } from "../components/ui/Button";
import AvailabilityEditor from "../components/admin/AvailabilityEditor";

function deepEqual(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
}

export default function AdminHorarios() {
    const { branchId } = useBranch();
    const { data, loading, error, unavailable } = useBranchAvailability(branchId);

    const [draft, setDraft] = useState<WeeklyAvailability | null>(null);
    const [saving, setSaving] = useState(false);

    // Para saber si cambiamos de sucursal (y no pisar ediciones por re-fetch)
    const lastBranchIdRef = useRef<number | null>(null);

    useEffect(() => {
        // si cambia branch => reseteamos draft para evitar mezclar estados
        if (branchId !== lastBranchIdRef.current) {
            lastBranchIdRef.current = branchId ?? null;
            setDraft(null);
        }
    }, [branchId]);

    useEffect(() => {
        if (!data) return;

        // Solo inicializamos draft si está vacío (o fue reseteado por cambio de branch)
        setDraft((prev) => (prev == null ? data : prev));
    }, [data]);

    const dirty = useMemo(() => {
        if (!data || !draft) return false;
        return !deepEqual(data, draft);
    }, [data, draft]);

    if (branchId == null) return <div className="text-sm text-zinc-400">Elegí una sucursal.</div>;
    if (loading) return <div className="text-sm text-zinc-400">Cargando horarios…</div>;
    if (error) return <div className="text-sm text-red-300">{String(error)}</div>;
    if (!draft) return <div className="text-sm text-zinc-400">Sin datos.</div>;
    if (unavailable) {
        return (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
                🔧 El endpoint de horarios todavía no está disponible en backend.
                <div className="mt-2 text-xs text-zinc-500">
                    Volvé a intentar cuando tu amigo lo termine.
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Horarios base</h2>
                    <div className="text-xs text-zinc-500">
                        Branch #{branchId} · {dirty ? "Cambios sin guardar" : "Guardado"}
                    </div>
                </div>

                <Button
                    disabled={!dirty || saving}
                    onClick={async () => {
                        setSaving(true);
                        try {
                            const saved = await updateBranchAvailability(branchId, draft);
                            setDraft(saved); // ✅ alinear draft con lo guardado
                        } finally {
                            setSaving(false);
                        }
                    }}
                >
                    {saving ? "Guardando..." : "Guardar"}
                </Button>
            </div>

            <AvailabilityEditor value={draft} onChange={setDraft} />
        </div>
    );
}