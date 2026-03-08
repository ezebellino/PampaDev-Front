//app.admin.rubros.tsx
import { NavLink, Outlet } from "react-router";
import { useCompany } from "../lib/companies/CompanyContext";

export default function AdminRubrosLayout() {
    const { companyId } = useCompany();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">🧩 Rubros</h1>
                <div className="text-sm text-zinc-400 mt-1"></div>
                Company: {companyId ?? "—"}
            </header >
                {/* Tabs internas */}
        <Outlet />
        </div >
    );
}