// AppLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <div
        className={[
          "min-h-screen flex flex-col transition-all",
          "pt-16",
          collapsed ? "md:pl-20" : "md:pl-64",
        ].join(" ")}
      >
        {/* ✅ pasar collapsed */}
        <Navbar sidebarCollapsed={collapsed} />

        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}