import { useAuth } from "../../lib/auth/AuthContext";
import { ROLES } from "../../lib/auth/roles";
import BranchPicker from "../branches/BranchPicker";
import CompanyPicker from "../../lib/companies/CompanyPicker";

type EntitySelectorProps = {
  onPick?: () => void;
  compact?: boolean;
};

export default function EntitySelector({ onPick, compact = false }: EntitySelectorProps) {
  const { user } = useAuth();
  const role = user?.role;
  const canManageEntity = role === ROLES.ADMIN || role === ROLES.DEVS;

  if (!canManageEntity) return null;

  return (
    <div className="rounded-[1.6rem] border border-stone-200 bg-gradient-to-br from-white to-stone-50 px-3 py-3 shadow-[0_24px_40px_-34px_rgba(15,23,42,0.35)]">
      <div className="mb-3 px-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Entidad</div>
        <div className="mt-1 text-sm font-semibold tracking-tight text-slate-900">Empresa activa y sus sucursales</div>
      </div>

      <div className={compact ? "space-y-3" : "grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"}>
        <div>
          <div className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Empresa</div>
          <CompanyPicker onPick={onPick} hideIfSingle className="w-full" />
        </div>

        <div>
          <div className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Sucursales</div>
          <BranchPicker onPick={onPick} className="w-full" />
        </div>
      </div>
    </div>
  );
}
