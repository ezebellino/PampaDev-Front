import { useEffect, useState, type FormEvent } from "react";
import { Button } from "~/components/ui/Button";
import type { City } from "~/lib/api/services/locations";

export type BranchFormData = {
  idCity: number;
  address: string;
  description: string;
};

type BranchFormProps = {
  companyName?: string;
  cities: City[];
  initialData?: Partial<BranchFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (data: BranchFormData) => void | Promise<void>;
  onCancel?: () => void;
};

export default function BranchForm({
  companyName,
  cities,
  initialData,
  loading = false,
  submitLabel = "Guardar sucursal",
  onSubmit,
  onCancel,
}: BranchFormProps) {
  const [cityId, setCityId] = useState(initialData?.idCity ? String(initialData.idCity) : "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");

  useEffect(() => {
    setCityId(initialData?.idCity ? String(initialData.idCity) : "");
    setAddress(initialData?.address ?? "");
    setDescription(initialData?.description ?? "");
  }, [initialData?.idCity, initialData?.address, initialData?.description]);

  useEffect(() => {
    if (cityId || cities.length === 0) return;
    setCityId(String(cities[0]?.idCity ?? ""));
  }, [cities, cityId]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit({
      idCity: Number(cityId),
      address: address.trim(),
      description: description.trim(),
    });
  }

  const disabled = loading || !companyName || !cityId || !address.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4 rounded-[1.25rem] border border-zinc-800 bg-zinc-900/45 px-4 py-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/55 px-4 py-3">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Empresa vinculada</div>
          <div className="mt-1 text-sm font-medium text-zinc-200">
            {companyName || "Seleccioná una empresa activa antes de continuar."}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Ciudad</label>
            <select
              value={cityId}
              onChange={(event) => setCityId(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              disabled={loading || cities.length === 0}
            >
              <option value="">Seleccionar ciudad</option>
              {cities.map((city) => (
                <option key={city.idCity} value={city.idCity}>
                  {city.name} ({city.provinceName})
                </option>
              ))}
            </select>
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
          {loading ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
