// import { NavLink, Outlet } from "react-router";
// import Protected from "../lib/auth/Protected";
// import { ROLES } from "../lib/auth/roles";
// import { useCompany } from "../lib/companies/CompanyContext";
// import { useBranch } from "../lib/branches/BranchContext";

// export default function AdminLayout() {
//   const { companyId } = useCompany();
//   const { branchId } = useBranch();

//   return (
//     <Protected allowRoles={[ROLES.ADMIN, ROLES.DEVS]}>
//       <div className="space-y-6">
//         <header>
//           <h1 className="text-2xl font-semibold">🛠️ Panel Administrador</h1>

//           <div className="text-sm text-zinc-400 mt-1">
//             Company: {companyId ?? "—"} · Sucursal: {branchId ?? "—"}
//           </div>
//         </header>

//         {/* Tabs internas */}
//         <nav className="flex gap-2 border-b border-zinc-800 pb-2">
//           <NavLink
//             to="/app/admin"
//             end
//             className={({ isActive }) =>
//               [
//                 "px-3 py-1.5 rounded-lg text-sm",
//                 isActive
//                   ? "bg-zinc-900 border border-zinc-800"
//                   : "hover:bg-zinc-900/40",
//               ].join(" ")
//             }
//           >
//             Dashboard
//           </NavLink>

//           <NavLink
//             to="horarios"
//             className={({ isActive }) =>
//               [
//                 "px-3 py-1.5 rounded-lg text-sm",
//                 isActive
//                   ? "bg-zinc-900 border border-zinc-800"
//                   : "hover:bg-zinc-900/40",
//               ].join(" ")
//             }
//           >
//             Horarios
//           </NavLink>

//           <NavLink
//             to="rubros"
//             className={({ isActive }) =>
//               [
//                 "px-3 py-1.5 rounded-lg text-sm",
//                 isActive
//                   ? "bg-zinc-900 border border-zinc-800"
//                   : "hover:bg-zinc-900/40",
//               ].join(" ")
//             }
//           >
//             Rubros
//           </NavLink>

//           <NavLink
//             to="solicitudes"
//             className={({ isActive }) =>
//               [
//                 "px-3 py-1.5 rounded-lg text-sm",
//                 isActive
//                   ? "bg-zinc-900 border border-zinc-800"
//                   : "hover:bg-zinc-900/40",
//               ].join(" ")
//             }
//           >
//             Solicitudes
//           </NavLink>
//         </nav>

//         {/* Aquí renderizan las subrutas */}
//         <div>
//           <Outlet />
//         </div>
//       </div>
//     </Protected>
//   );
// }


import { Outlet } from "react-router";
import Protected from "../lib/auth/Protected";
import { ROLES } from "../lib/auth/roles";

export default function AdminLayout() {
  return (
    <Protected allowRoles={[ROLES.ADMIN, ROLES.DEVS]}>
      <Outlet />
    </Protected>
  );
}