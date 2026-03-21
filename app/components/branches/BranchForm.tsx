import { useEffect, useState, type FormEvent } from "react";
import { Button } from "~/components/ui/Button";

export type BranchFormData = {
  cityName: string;
  address: string;
  description: string;
};

type BranchFormProps = {
  companyName?: string;
  initialData?: Partial<BranchFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (data: BranchFormData) => void | Promise<void>;
  onCancel?: () => void;
};

export default function BranchForm({
  companyName,
  initialData,
  loading = false,
  submitLabel = "Guardar sucursal",
  onSubmit,
  onCancel,
}: BranchFormProps) {
  const [cityName, setCityName] = useState(initialData?.cityName ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");

  useEffect(() => {
    setCityName(initialData?.cityName ?? "");
    setAddress(initialData?.address ?? "");
    setDescription(initialData?.description ?? "");
  }, [initialData?.cityName, initialData?.address, initialData?.description]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit({
      cityName: cityName.trim(),
      address: address.trim(),
      description: description.trim(),
    });
  }

  const disabled = loading || !companyName || !cityName.trim() || !address.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4 rounded-[1.25rem] border border-zinc-800 bg-zinc-900/45 px-4 py-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/55 px-4 py-3">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa vinculada</div>
          <div className="mt-1 text-sm font-medium text-zinc-200">
            {companyName || "Selecciona una empresa activa antes de continuar."}
          </div>
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
            <label className="text-sm text-zinc-300">Direccion</label>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: Av. San Martin 123"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Descripcion</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            placeholder="Conta brevemente que ofrece esta sucursal o que la diferencia."
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
          {loading ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
