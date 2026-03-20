import { useEffect, useState, type FormEvent } from "react";
import { Button } from "~/components/ui/Button";

export type CompanyFormData = {
  fantasyName: string;
  tradeName: string;
  cuitCuilDNI: string;
  cityName: string;
  provinceName: string;
  countryName: string;
};

type CompanyFormProps = {
  initialData?: Partial<CompanyFormData>;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (data: CompanyFormData) => void | Promise<void>;
  onCancel?: () => void;
};

export default function CompanyForm({
  initialData,
  loading = false,
  submitLabel = "Guardar empresa",
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const [fantasyName, setFantasyName] = useState(initialData?.fantasyName ?? "");
  const [tradeName, setTradeName] = useState(initialData?.tradeName ?? "");
  const [cuitCuilDNI, setCuitCuilDNI] = useState(initialData?.cuitCuilDNI ?? "");
  const [cityName, setCityName] = useState(initialData?.cityName ?? "");
  const [provinceName, setProvinceName] = useState(initialData?.provinceName ?? "");
  const [countryName, setCountryName] = useState(initialData?.countryName ?? "Argentina");

  useEffect(() => {
    setFantasyName(initialData?.fantasyName ?? "");
    setTradeName(initialData?.tradeName ?? "");
    setCuitCuilDNI(initialData?.cuitCuilDNI ?? "");
    setCityName(initialData?.cityName ?? "");
    setProvinceName(initialData?.provinceName ?? "");
    setCountryName(initialData?.countryName ?? "Argentina");
  }, [
    initialData?.fantasyName,
    initialData?.tradeName,
    initialData?.cuitCuilDNI,
    initialData?.cityName,
    initialData?.provinceName,
    initialData?.countryName,
  ]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void onSubmit({
      fantasyName: fantasyName.trim(),
      tradeName: tradeName.trim(),
      cuitCuilDNI: cuitCuilDNI.trim(),
      cityName: cityName.trim(),
      provinceName: provinceName.trim(),
      countryName: countryName.trim(),
    });
  }

  const disabled =
    loading ||
    !fantasyName.trim() ||
    !tradeName.trim() ||
    !cuitCuilDNI.trim() ||
    !cityName.trim() ||
    !provinceName.trim() ||
    !countryName.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4 rounded-[1.25rem] border border-zinc-800 bg-zinc-900/45 px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Nombre de fantasía</label>
            <input
              value={fantasyName}
              onChange={(event) => setFantasyName(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: PampaDev Fitness"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Razón social</label>
            <input
              value={tradeName}
              onChange={(event) => setTradeName(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: PampaDev SRL"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">CUIT / CUIL / DNI</label>
          <input
            value={cuitCuilDNI}
            onChange={(event) => setCuitCuilDNI(event.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            placeholder="Ej: 30-12345678-9"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
            <label className="text-sm text-zinc-300">Provincia</label>
            <input
              value={provinceName}
              onChange={(event) => setProvinceName(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: La Pampa"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">País</label>
            <input
              value={countryName}
              onChange={(event) => setCountryName(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              placeholder="Ej: Argentina"
            />
          </div>
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
