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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="mb-3">
        <div className="text-[11px] uppercase tracking-widest text-zinc-500">Entidad</div>
        <div className="mt-1 text-sm font-medium text-zinc-200">
          Empresa activa y sus sucursales
        </div>
      </div>

      <div className={compact ? "space-y-3" : "grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"}>
        <div>
          <div className="mb-1 block text-[11px] uppercase tracking-wider text-zinc-500">Empresa</div>
          <CompanyPicker onPick={onPick} hideIfSingle className="w-full" />
        </div>

        <div>
          <div className="mb-1 block text-[11px] uppercase tracking-wider text-zinc-500">Sucursales</div>
          <BranchPicker onPick={onPick} className="w-full" />
        </div>
      </div>
    </div>
  );
}
