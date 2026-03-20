import { useEffect, useState, type FormEvent } from "react";
import { Button } from "~/components/ui/Button";

export type BranchFormData = {
  companyName: string;
  cityName: string;
  address: string;
  description: string;
};

type BranchFormProps = {
  initialData?: Partial<BranchFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (data: BranchFormData) => void | Promise<void>;
  onCancel?: () => void;
};

export default function BranchForm({
  initialData,
  loading = false,
  submitLabel = "Guardar sucursal",
  onSubmit,
  onCancel,
}: BranchFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? "");
  const [cityName, setCityName] = useState(initialData?.cityName ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");

  useEffect(() => {
    setCompanyName(initialData?.companyName ?? "");
    setCityName(initialData?.cityName ?? "");
    setAddress(initialData?.address ?? "");
    setDescription(initialData?.description ?? "");
  }, [initialData?.companyName, initialData?.cityName, initialData?.address, initialData?.description]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit({
      companyName: companyName.trim(),
      cityName: cityName.trim(),
      address: address.trim(),
      description: description.trim(),
    });
  }

  const disabled = loading || !companyName.trim() || !cityName.trim() || !address.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4 rounded-[1.25rem] border border-zinc-800 bg-zinc-900/45 px-4 py-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Empresa visible</label>
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            placeholder="Ej: PampaDev Fitness"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Ciudad</label>
            <input
              value={cityName}
              onChange={(event) => setCityName(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: Santa Rosa"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Dirección</label>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: Av. San Martín 123"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Descripción</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            placeholder="Contá brevemente qué ofrece esta sucursal o qué la diferencia."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={disabled}>
          {loading ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
