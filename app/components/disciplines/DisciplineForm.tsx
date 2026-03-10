import { useEffect, useState, type FormEvent } from "react";
import { Button } from "~/components/ui/Button";

export type DisciplineFormData = {
  name: string;
};

type DisciplineFormProps = {
  initialData?: Partial<DisciplineFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (data: DisciplineFormData) => void | Promise<void>;
  onCancel?: () => void;
};

export default function DisciplineForm({
  initialData,
  loading = false,
  submitLabel = "Guardar",
  onSubmit,
  onCancel,
}: DisciplineFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");

  useEffect(() => {
    setName(initialData?.name ?? "");
  }, [initialData?.name]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit({ name: name.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-900/45 px-4 py-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Nombre de la disciplina</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            placeholder="Ej: Pádel, Boxeo, Natación…"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
